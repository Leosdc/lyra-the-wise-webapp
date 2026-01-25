
import { createCharacterWithLyra, createMonsterWithLyra, processSessionWithLyra } from '../ai.js';
import { saveCharacter, saveMonster, saveSession, saveTrap } from '../data.js';
import { SYSTEM_TEMPLATES } from '../constants.js';

/**
 * Wizard Module
 * Handles Character, Monster, and Session creation workflows.
 */

export const WizardModule = {

    wizardStep: 0,
    creationMode: 'ai',

    // --- Entry Points ---
    showCreationWizard(context) {
        if (!context.checkAuth()) return;
        console.log("✨ Abrindo Criador de Personagem");

        this.updateThemeText();

        context.openModal('creation-wizard');
        this.wizardStep = 0;
        this.updateWizardUI();
    },

    updateThemeText() {
        const wizardContainer = document.getElementById('creation-wizard');
        if (wizardContainer) {
            const aiCard = wizardContainer.querySelector('.choice-card[data-mode="ai"]');

            if (aiCard) {
                const h4 = aiCard.querySelector('h4');
                const p = aiCard.querySelector('p');

                const finalMsg = wizardContainer.querySelector('#wiz-final-msg');
                const backstoryInput = wizardContainer.querySelector('#wiz-backstory');

                if (document.body.classList.contains('damien-theme')) {
                    if (h4) h4.innerText = "Com Damien";
                    if (p) p.innerText = "O Conquistador forjará seu destino com poder.";
                    if (finalMsg) finalMsg.innerText = "Damien irá forjar a trama final do seu herói.";
                    if (backstoryInput) backstoryInput.placeholder = "Sua jornada até aqui... (Damien pode preencher se você escolher o modo IA)";
                } else if (document.body.classList.contains('eldrin-theme')) {
                    if (h4) h4.innerText = "Com Eldrin";
                    if (p) p.innerText = "O Bardo Sagaz cantará sua lenda.";
                    if (finalMsg) finalMsg.innerText = "Eldrin irá compor a balada final do seu herói.";
                    if (backstoryInput) backstoryInput.placeholder = "Sua jornada até aqui... (Eldrin pode preencher se você escolher o modo IA)";
                } else {
                    if (h4) h4.innerText = "Com Lyra";
                    if (p) p.innerText = "A Sabedoria Ancestral irá tecer sua lenda.";
                    if (finalMsg) finalMsg.innerText = "Lyra irá tecer a trama final do seu herói.";
                    if (backstoryInput) backstoryInput.placeholder = "Sua jornada até aqui... (Lyra pode preencher se você escolher o modo IA)";
                }
            }
        }
    },

    showMonsterCreator(context) {
        if (!context.checkAuth()) return;
        console.log("🐉 Abrindo Invocador de Monstros");
        const monCr = document.getElementById('mon-cr');
        if (monCr) monCr.parentElement.classList.remove('hidden');
        const monTitle = document.getElementById('monster-wizard')?.querySelector('h3');
        if (monTitle) monTitle.innerText = "Origem da Criatura";
        context.openModal('monster-wizard');
    },

    showTrapCreator(context) {
        if (!context.checkAuth()) return;
        console.log("💀 Abrindo Invocador de Armadilhas");
        const monCr = document.getElementById('mon-cr');
        if (monCr) monCr.parentElement.classList.add('hidden');
        const monTitle = document.getElementById('monster-wizard')?.querySelector('h3');
        if (monTitle) monTitle.innerText = "Criação de Armadilha";
        context.openModal('monster-wizard');
    },

    showSessionEditor(context) {
        if (!context.checkAuth()) return;
        console.log("📝 Abrindo Diário de Sessão");
        context.openModal('session-wizard');
    },

    // --- Navigation Logic ---
    handleChoiceClick(card) {
        this.isDeleteMode = false;
        this.chatHistory = [];
        this.triviaIndex = 0;
        this.isWaitingForAI = false;


        const mode = card.dataset.mode;
        this.creationMode = mode;
        const wizardContainer = card.closest('.wizard-container');
        if (!wizardContainer) return;

        const wizardId = wizardContainer.id;

        if (wizardId === 'creation-wizard') {
            this.wizardStep = 1;
            this.updateWizardUI();
        } else if (wizardId === 'monster-wizard') {
            document.getElementById('mon-choice-step').classList.add('hidden');
            document.getElementById('mon-form').classList.remove('hidden');
        } else if (wizardId === 'session-wizard') {
            document.getElementById('sess-choice-step').classList.add('hidden');
            document.getElementById('sess-form').classList.remove('hidden');
        }
    },

    updateWizardStep(dir) {
        this.wizardStep += dir;
        this.updateWizardUI();
    },

    updateWizardUI() {
        // Enforce theme text update on every UI refresh
        this.updateThemeText();

        document.querySelectorAll('.wizard-step').forEach(s => {
            const stepNum = parseInt(s.dataset.step);
            s.classList.toggle('hidden', stepNum !== this.wizardStep);
        });

        const progress = document.querySelector('.wizard-progress');
        const nav = document.querySelector('.wizard-nav');

        if (this.wizardStep === 0) {
            progress?.classList.add('hidden');
            nav?.classList.add('hidden');
        } else {
            progress?.classList.remove('hidden');
            nav?.classList.remove('hidden');
            document.querySelectorAll('.step-indicator').forEach(ind => {
                const indStep = parseInt(ind.dataset.step);
                ind.classList.toggle('active', indStep === this.wizardStep);
                ind.classList.toggle('completed', indStep < this.wizardStep);
            });

            document.getElementById('wiz-prev')?.classList.toggle('hidden', this.wizardStep === 1);
            document.getElementById('wiz-next')?.classList.toggle('hidden', this.wizardStep === 5);
            document.getElementById('wiz-finish')?.classList.toggle('hidden', this.wizardStep !== 5);
        }

        const finalMsg = document.getElementById('wiz-final-msg');
        if (finalMsg) {
            const isDamien = document.body.classList.contains('damien-theme');
            if (this.creationMode === 'ai') {
                finalMsg.innerText = isDamien
                    ? "Damien usará seu poder para forjar o destino do seu herói. Prepare-se."
                    : "Lyra irá tecer a trama final do seu herói, gerando história, ideais e laços dinâmicamente.";
            } else {
                finalMsg.innerText = "Seu herói está pronto para ser consagrado nos anais da história.";
            }

            // Update Start Screen Choice Card
            const aiCard = document.querySelector('.choice-card[data-mode="ai"]');
            if (aiCard) {
                const title = aiCard.querySelector('h4');
                const p = aiCard.querySelector('p');
                if (title) title.innerText = isDamien ? "Com Damien" : "Com Lyra";
                if (p) p.innerText = isDamien
                    ? "O Poder Verdadeiro forjará seu destino."
                    : "A Sabedoria Ancestral irá tecer sua lenda.";
            }
        }
    },

    // --- Finish Handlers ---
    async handleWizardFinish(context) {
        const name = document.getElementById('wiz-name').value.trim();
        const race = document.getElementById('wiz-race').value.trim();
        const className = document.getElementById('wiz-class').value;

        if (!name || !race || !className) {
            context.showAlert("Nome, Raça e Classe são obrigatórios para a jornada!", "Campos Faltando");
            return;
        }

        // Security Validation
        if (name.length > 50) {
            context.showAlert("O nome é muito longo (máximo 50 caracteres).", "Nome Inválido");
            return;
        }
        // Allow letters, spaces, apostrophes and hyphens (common in fantasy names)
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
            context.showAlert("O nome contém caracteres proibidos pelos deuses.", "Nome Inválido");
            return;
        }

        context.toggleLoading(true);
        try {
            const template = JSON.parse(JSON.stringify(SYSTEM_TEMPLATES[context.currentSystem] || SYSTEM_TEMPLATES['dnd5e']));

            // Mapping values
            template.bio.name = name;
            template.bio.race = race;
            template.bio.class = className;
            template.bio.background = document.getElementById('wiz-background').value;
            template.bio.alignment = document.getElementById('wiz-alignment').value;
            template.bio.level = 1;

            template.attributes.str = Math.min(25, Math.max(0, parseInt(document.getElementById('wiz-str').value) || 10));
            template.attributes.dex = Math.min(25, Math.max(0, parseInt(document.getElementById('wiz-dex').value) || 10));
            template.attributes.con = Math.min(25, Math.max(0, parseInt(document.getElementById('wiz-con').value) || 10));
            template.attributes.int = Math.min(25, Math.max(0, parseInt(document.getElementById('wiz-int').value) || 10));
            template.attributes.wis = Math.min(25, Math.max(0, parseInt(document.getElementById('wiz-wis').value) || 10));
            template.attributes.cha = Math.min(25, Math.max(0, parseInt(document.getElementById('wiz-cha').value) || 10));

            // Skill Normalization Map
            const skillMap = {
                "Acrobacia": "acrobacia",
                "Adestramento de Animais": "adestrar_animais",
                "Arcanismo": "arcanismo",
                "Atletismo": "atletismo",
                "Atuação": "atuacao",
                "Blefar": "enganacao",
                "Furtividade": "furtividade",
                "História": "historia",
                "Intimidação": "intimidacao",
                "Intuição": "intuicao",
                "Investigação": "investigacao",
                "Medicina": "medicina",
                "Natureza": "natureza",
                "Percepção": "percepcao",
                "Persuasão": "persuasao",
                "Prestidigitação": "prestidigitacao",
                "Religião": "religiao",
                "Sobrevivência": "sobrevivencia"
            };

            const rawSkills = Array.from(document.querySelectorAll('.skills-selection input:checked')).map(i => i.value);
            template.proficiencies_choice.skills = rawSkills.map(s => skillMap[s] || s.toLowerCase());
            template.stats.speed = document.getElementById('wiz-speed').value || "9m";

            // Story
            template.story.traits = document.getElementById('wiz-traits').value;
            template.story.ideals = document.getElementById('wiz-ideals').value;
            template.story.bonds = document.getElementById('wiz-bonds').value;
            template.story.flaws = document.getElementById('wiz-flaws').value;
            template.story.mannerisms = document.getElementById('wiz-mannerisms').value;
            template.story.talents = document.getElementById('wiz-talents').value;
            template.story.appearance = document.getElementById('wiz-appearance')?.value || '';
            template.story.backstory = document.getElementById('wiz-backstory').value;
            template.story.notes = template.story.backstory;

            let finalData = { name: name, ...template };

            if (this.creationMode === 'ai') {
                const idToken = await context.user.getIdToken();
                const aiResult = await createCharacterWithLyra(finalData, idToken);
                if (aiResult) {
                    // Merge AI results
                    const fieldMap = {
                        traits: ['traits', 'Personalidade', 'Tracos'],
                        ideals: ['ideals', 'Ideais'],
                        bonds: ['bonds', 'Vínculos', 'Vinculos'],
                        flaws: ['flaws', 'Defeitos'],
                        mannerisms: ['mannerisms', 'Maneirismos'],
                        talents: ['talents', 'Talentos'],
                        appearance: ['appearance', 'Aparência', 'Aparencia'],
                        backstory: ['backstory', 'História', 'Historia', 'background'],
                        notes: ['notes', 'História', 'Historia']
                    };

                    Object.keys(fieldMap).forEach(key => {
                        const possibleKeys = fieldMap[key];
                        const foundKey = possibleKeys.find(pk => aiResult[pk]);
                        if (foundKey) {
                            finalData.story[key] = aiResult[foundKey];
                            if (key === 'backstory') finalData.story.notes = aiResult[foundKey];
                        }
                    });
                    // Explicit Fix for Appearance
                    if (aiResult.appearance || aiResult['Aparência'] || aiResult['Aparencia']) {
                        finalData.story.appearance = aiResult.appearance || aiResult['Aparência'] || aiResult['Aparencia'];
                    }
                }
            }

            // Apply Background Bonuses (DnD 5e automation)
            if (context.currentSystem === 'dnd5e' && finalData.story.background) {
                const ListModule = (await import('./lists.js')).ListModule;
                ListModule.applyBackgroundBonuses(finalData, finalData.story.background);
            }

            // Run Engine (Dependency)
            if (context.calculateStats) context.calculateStats(finalData);

            finalData.stats.hp_current = finalData.stats.hp_max;

            await saveCharacter(context.user.uid, context.currentSystem, finalData);
            context.closeModal();
            if (context.refreshList) context.refreshList();
            context.showAlert(`${name} acaba de ser invocado no multiverso!`, "Herói Criado");
        } catch (error) {
            console.error("Erro na Wizard:", error);
            context.showAlert("A convergência falhou: " + error.message, "Erro Místico");
        } finally {
            context.toggleLoading(false);
        }
    },

    async handleMonsterFinish(context) {
        context.toggleLoading(true);
        try {
            const isTrap = document.getElementById('monster-wizard').querySelector('h3').innerText.includes("Armadilha");
            const monsterData = {
                name: document.getElementById('mon-name').value,
                cr: isTrap ? "Trap" : document.getElementById('mon-cr').value,
                type: document.getElementById('mon-type').value,
                prompt: document.getElementById('mon-prompt').value
            };

            let result;
            if (this.creationMode === 'ai') {
                const idToken = await context.user.getIdToken();
                result = await createMonsterWithLyra(monsterData, idToken);
            } else {
                result = { ...monsterData, stats: "Estatísticas manuais (em desenvolvimento)" };
            }

            if (isTrap) {
                await saveTrap(context.user.uid, context.currentSystem, result);
                if (context.refreshTraps) context.refreshTraps();
            } else {
                await saveMonster(context.user.uid, context.currentSystem, result);
                if (context.refreshMonsters) context.refreshMonsters();
            }
            context.closeModal();
        } catch (error) {
            context.showAlert("Falha na invocação mística: " + error.message, "Contra-feitiço");
        } finally {
            context.toggleLoading(false);
        }
    },

    async handleSessionFinish(context) {
        context.toggleLoading(true);
        try {
            let sessionData = {
                title: document.getElementById('sess-title').value,
                summary: document.getElementById('sess-summary').value,
                notes: document.getElementById('sess-notes').value
            };

            if (this.creationMode === 'ai' && context.user) {
                const idToken = await context.user.getIdToken();
                const aiResponse = await processSessionWithLyra(sessionData, idToken);
                if (aiResponse) sessionData.summary = aiResponse;
            }

            await saveSession(context.user.uid, context.currentSystem, sessionData);
            context.closeModal();
            if (context.refreshSessions) context.refreshSessions();
        } catch (error) {
            context.showAlert("Erro ao registrar: " + error.message, "Escriba Interrompido");
        } finally {
            context.toggleLoading(false);
        }
    },

    initGuidanceListeners() {
        console.log("🧚 Lyra (e Damien) estão prontos para guiar...");
        const inputs = document.querySelectorAll('#creation-wizard input, #creation-wizard select, #creation-wizard textarea');
        const container = document.getElementById('lyra-guidance');
        const textEl = document.getElementById('guidance-text');
        const portrait = container ? container.querySelector('img') : null;

        const isDamien = document.body.classList.contains('damien-theme');

        // Damien's Tips
        this.damienTips = {
            'wiz-name': "Um nome é poder. Não escolha algo medíocre.",
            'wiz-race': "Sua herança sanguínea traz vantagens. Não desperdice seu potencial.",
            'wiz-class': "Como você esmagará seus inimigos? Magia, lâmina ou subterfúgio?",
            'wiz-str': "Força é útil para os brutos. Necessária, mas não elegante.",
            'wiz-dex': "Velocidade mata. E evita que você seja morto.",
            'wiz-con': "Resistência. A capacidade de suportar a dor é... admirável.",
            'wiz-int': "A mente afiada é a arma mais perigosa de todas.",
            'wiz-wis': "Perceber o que os outros ignoram é a chave para a sobrevivência.",
            'wiz-cha': "Manipular os fracos requer presença. Liderança natural ou imposta.",
            'wiz-background': "Seu passado o moldou. Use suas cicatrizes como armas.",
            'wiz-appearance': "Aparência importa. Faça com que tremam ao vê-lo.",
            'wiz-backstory': "Diga-me suas origens. Eu julgarei se sua história tem valor.",
            'wiz-alignment': "Moralidade é uma corrente. Mas escolha de que lado você está.",
            'wiz-speed': "Quem hesita, morre. Mantenha-se móvel.",
            'wiz-traits': "Seus hábitos. Pequenos vícios que definem quem você é.",
            'wiz-ideals': "Pelo que você morreria? Ou melhor, pelo que você mataria?",
            'wiz-bonds': "Quem você protege? Ou quem é sua fraqueza?",
            'wiz-flaws': "Sua ruína. Admita-a antes que eu a descubra.",
            'wiz-mannerisms': "Tiques nervosos. Revelam insegurança.",
            'wiz-talents': "Truques de salão. Úteis para distrair tolos."
        };

        // Lyra's Tips (Updated)
        this.guidanceTips = {
            'wiz-name': "Escolha um nome que ecoe pelas tavernas de Sword Coast, viajante!",
            'wiz-race': "Sua linhagem define seus traços ancestrais. Humanos são versáteis, Elfos são graciosos...",
            'wiz-class': "Sua vocação! Magos dominam o arcano, Guerreiros a lâmina, e Bardos... bem, a música!",
            'wiz-str': "Força bruta! Importante para empunhar machados pesados e saltar abismos.",
            'wiz-dex': "Agilidade! Vital para evitar flechas e arrombar trincas de baús antigos.",
            'wiz-con': "Constituição é sua vitalidade. Quanto mais alta, mais golpes você suportará.",
            'wiz-int': "Inteligência rege o estudo e a magia arcana. Conhecimento é poder!",
            'wiz-wis': "Sabedoria é percepção e sintonia com o divino. Escute o que o mundo diz.",
            'wiz-cha': "Carisma é sua força de presença. Ótimo para convencer guardas ou intimidar orcs!",
            'wiz-background': "Sua vida antes da aventura. Pode te conceder perícias e segredos automáticos!",
            'wiz-appearance': "Descreva suas cicatrizes e aura mística. Eu usarei isso para te tecer na história!",
            'wiz-backstory': "Sua jornada até aqui. Se escolher meu auxílio, expandirei seus contos misticamente.",
            'wiz-alignment': "Seu compasso moral. Você segue a lei, o caos, ou apenas sua própria vontade?",
            'wiz-speed': "Quão rápido você cruza o campo de batalha?",
            'wiz-traits': "Pequenos detalhes que te tornam único. Uma risada alta, um olhar distante?",
            'wiz-ideals': "O que te move? Justiça? Ganância? Liberdade?",
            'wiz-bonds': "Quem importa para você? Família, amigos ou uma promessa?",
            'wiz-flaws': "Ninguém é perfeito. Qual é o seu vício ou medo?",
            'wiz-mannerisms': "Algum gesto que você faz sem pensar?",
            'wiz-talents': "Seus talentos aprendidos além do combate."
        };

        // Eldrin's Tips
        this.eldrinTips = {
            'wiz-name': "Um nome digno de uma balada épica! Como os bardos cantarão sobre você?",
            'wiz-race': "De onde vem o seu povo? Das florestas cantantes ou das montanhas de eco profundo?",
            'wiz-class': "Qual será o instrumento do seu destino? A espada, o grimório ou a lira?",
            'wiz-str': "A força para erguer o mundo... ou pelo menos um bom barril de hidromel!",
            'wiz-dex': "A dança da batalha exige pés ligeiros e mãos ágeis.",
            'wiz-con': "Para aguentar longas jornadas e festas ainda mais longas!",
            'wiz-int': "A mente é o palco onde as maiores histórias são escritas.",
            'wiz-wis': "Saber ouvir o silêncio entre as notas é uma virtude rara.",
            'wiz-cha': "O brilho que atrai olhares e inspira corações. A alma de um herói!",
            'wiz-background': "Toda lenda tem um começo humilde... ou trágico. Qual é o seu?",
            'wiz-appearance': "Descreva-se com cores vivas! Deixe-me visualizar sua glória.",
            'wiz-backstory': "Ah, o prólogo da sua saga! Não economize nos detalhes dramáticos.",
            'wiz-alignment': "Onde seu coração vibra na canção do cosmos? Ordem ou caos?",
            'wiz-speed': "O ritmo da sua marcha. Allegro ou Adagio?",
            'wiz-traits': "Aquelas peculiaridades que tornam um personagem inesquecível.",
            'wiz-ideals': "A melodia que guia sua alma. Por que você luta?",
            'wiz-bonds': "Os laços que nos prendem são mais fortes que correntes de ferro.",
            'wiz-flaws': "Uma falha trágica torna o herói mais humano... e a história mais interessante.",
            'wiz-mannerisms': "Gestos que falam mais que mil palavras.",
            'wiz-talents': "Pequenos truques para impressionar a plateia!"
        };

        inputs.forEach(input => {
            // Also handle checkboxes for Skills/Proficiencies generic tip
            if (input.closest('.skills-selection')) {
                input.addEventListener('mouseenter', () => {
                    const isDamien = document.body.classList.contains('damien-theme');
                    const isEldrin = document.body.classList.contains('eldrin-theme');

                    let tip;
                    if (isDamien) tip = "Do que você é capaz? Escolha o que lhe torna útil.";
                    else if (isEldrin) tip = "Quais são seus talentos no palco da vida? Em que você brilha?";
                    else tip = "Seus talentos aprendidos. Escolha aqueles em que seu herói é perito!";

                    if (container && textEl) {
                        textEl.innerText = tip;
                        container.classList.remove('hidden');

                        // Icon Swap Logic
                        if (portrait) {
                            if (isDamien) {
                                portrait.src = 'assets/Damien_Kael.png';
                                portrait.style.borderColor = 'var(--damien-purple)';
                            } else if (isEldrin) {
                                portrait.src = 'assets/Eldrin_the_Bard.png';
                                portrait.style.borderColor = 'var(--eldrin-blue)';
                            } else {
                                portrait.src = 'assets/Lyra_the_wise.png';
                                portrait.style.borderColor = 'var(--gold)';
                            }
                        }
                    }
                });
                return;
            }

            const showTip = () => {
                const isDamien = document.body.classList.contains('damien-theme');
                const isEldrin = document.body.classList.contains('eldrin-theme');

                let currentTips;
                if (isDamien) currentTips = this.damienTips;
                else if (isEldrin) currentTips = this.eldrinTips;
                else currentTips = this.guidanceTips;

                const tip = currentTips[input.id];
                if (tip && container && textEl) {
                    textEl.innerText = tip;
                    container.classList.remove('hidden');

                    // Icon Swap Logic
                    if (portrait) {
                        if (isDamien) {
                            portrait.src = 'assets/Damien_Kael.png';
                            portrait.style.borderColor = 'var(--damien-purple)';
                        } else if (isEldrin) {
                            portrait.src = 'assets/Eldrin_the_Bard.png';
                            portrait.style.borderColor = 'var(--eldrin-blue)';
                        } else {
                            portrait.src = 'assets/Lyra_the_wise.png';
                            portrait.style.borderColor = 'var(--gold)';
                        }
                    }
                }
            };
            input.addEventListener('focus', showTip);
            input.addEventListener('mouseenter', showTip);
        });

        // Hide when not focused on wizard inputs
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#creation-wizard') && container) {
                container.classList.add('hidden');
            }
        });
    }
};
