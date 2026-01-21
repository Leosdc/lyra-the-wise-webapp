
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
        context.openModal('creation-wizard');
        this.wizardStep = 0;
        this.updateWizardUI();
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
            finalMsg.innerText = this.creationMode === 'ai'
                ? "Lyra irá tecer a trama final do seu herói, gerando história, ideais e laços dinâmicamente."
                : "Seu herói está pronto para ser consagrado nos anais da história.";
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

            template.attributes.str = parseInt(document.getElementById('wiz-str').value) || 10;
            template.attributes.dex = parseInt(document.getElementById('wiz-dex').value) || 10;
            template.attributes.con = parseInt(document.getElementById('wiz-con').value) || 10;
            template.attributes.int = parseInt(document.getElementById('wiz-int').value) || 10;
            template.attributes.wis = parseInt(document.getElementById('wiz-wis').value) || 10;
            template.attributes.cha = parseInt(document.getElementById('wiz-cha').value) || 10;

            const skills = Array.from(document.querySelectorAll('.skills-selection input:checked')).map(i => i.value);
            template.proficiencies_choice.skills = skills;
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
                }
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
    }
};
