
import { createCharacterWithLyra, createMonsterWithLyra, processSessionWithLyra } from '../ai.js';
import { saveCharacter, saveUserMonster, saveSession, saveTrap, getSystemData } from '../data.js';
import SystemRegistry from '../systems/system-registry.js';
import { logger } from '../logger.js';

/**
 * Wizard Module
 * Handles Character, Monster, and Session creation workflows.
 */

export const WizardModule = {

    wizardStep: 0,
    creationMode: 'ai',

    init(context) {
        this.injectHTML();
        this.bindEvents(context);
        this.initGuidanceListeners();
        this.initAutoResize();
    },

    injectHTML() {
        if (document.getElementById('creation-wizard')) return;

        const html = `
            <!-- Character Wizard -->
            <div id="creation-wizard" class="wizard-container hidden">
                <div id="char-choice-step" class="wizard-step" data-step="0">
                    <h3>Como deseja criar, viajante?</h3>
                    <div class="mode-choices">
                        <button class="choice-card" data-mode="ai">
                            <i class="fas fa-wand-magic-sparkles"></i>
                            <h4>Com Lyra</h4>
                            <p>A Magia tecerá os detalhes arcanos para você.</p>
                        </button>
                        <button class="choice-card" data-mode="manual">
                            <i class="fas fa-feather-pointed"></i>
                            <h4>Manualmente</h4>
                            <p>Você mesmo escreve cada detalhe da sua história.</p>
                        </button>
                    </div>
                </div>
                <div class="wizard-progress hidden">
                    <div class="step-indicator active" data-step="1">1</div>
                    <div class="step-indicator" data-step="2">2</div>
                    <div class="step-indicator" data-step="3">3</div>
                    <div class="step-indicator" data-step="4">4</div>
                    <div class="step-indicator" data-step="5">5</div>
                </div>
                <!-- Steps content... same as before -->
                <div class="wizard-step" data-step="1">
                    <h3>Origens</h3>
                    <div class="form-group"><label>Nome do Herói</label><input type="text" id="wiz-name"
                            placeholder="Ex: Valerius"></div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Raça</label>
                            <select id="wiz-race" class="medieval-select" required>
                                <option value="">Carregando...</option> <!-- Will be populated by JS -->
                            </select>
                            <div id="wiz-subrace-container" class="hidden" style="margin-top: 5px;">
                                <select id="wiz-subrace" class="medieval-select small">
                                    <option value="">Selecione Sub-raça</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Classe</label>
                            <select id="wiz-class" class="medieval-select" required>
                                <option value="">Carregando...</option> <!-- Will be populated by JS -->
                            </select>
                            <div id="wiz-archetype-container" class="hidden" style="margin-top: 5px;">
                                <select id="wiz-archetype" class="medieval-select small">
                                    <option value="">Selecione Arquétipo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Alinhamento</label>
                            <select id="wiz-alignment" class="medieval-select">
                                <option value="">Selecione Alinhamento...</option>
                                <option value="Leal e Bom">Leal e Bom</option>
                                <option value="Neutro e Bom">Neutro e Bom</option>
                                <option value="Caótico e Bom">Caótico e Bom</option>
                                <option value="Leal e Neutro">Leal e Neutro</option>
                                <option value="Neutro">Neutro</option>
                                <option value="Caótico e Neutro">Caótico e Neutro</option>
                                <option value="Leal e Mau">Leal e Mau</option>
                                <option value="Neutro e Mau">Neutro e Mau</option>
                                <option value="Caótico e Mau">Caótico e Mau</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Velocidade (m)</label><input type="text" id="wiz-speed"
                                value="9m"></div>
                    </div>
                    <div class="form-group"><label>Antecedente</label>
                        <select id="wiz-background" class="medieval-select">
                            <option value="">Selecione Antecedente...</option>
                        </select>
                    </div>
                </div>
                <div class="wizard-step hidden" data-step="2">
                    <h3>Atributos <i class="fas fa-book-open pointer-icon" id="open-attr-tips"
                            title="Dicas de Geração"></i></h3>
                    <div class="attributes-grid" id="wiz-attributes-grid">
                        <!-- Populado dinamicamente pelo plugin do sistema -->
                    </div>
                </div>
                <div class="wizard-step hidden" data-step="3">
                    <h3>Perícias</h3>
                    <div class="skills-selection" id="wiz-skills-selection">
                        <!-- Populado dinamicamente pelo plugin do sistema -->
                    </div>
                </div>
                <div class="wizard-step hidden" data-step="4">
                    <h3>Crônicas e Personalidade</h3>
                    <div class="form-group"><label>Traços de Personalidade</label><textarea id="wiz-traits"
                            class="medieval-textarea"
                            placeholder="Ex: Eu sempre tenho um plano para quando as coisas dão errado."></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Ideais</label><textarea id="wiz-ideals"
                                class="medieval-textarea"
                                placeholder="Ex: Respeito. As pessoas merecem ser tratadas com dignidade."></textarea>
                        </div>
                        <div class="form-group"><label>Vínculos</label><textarea id="wiz-bonds"
                                class="medieval-textarea"
                                placeholder="Ex: Tudo o que faço é pela minha família."></textarea></div>
                    </div>
                    <div class="form-group"><label>Defeitos</label><textarea id="wiz-flaws"
                            class="medieval-textarea"
                            placeholder="Ex: Eu me distraio facilmente com promessas de ouro."></textarea></div>
                    <div class="form-row">
                        <div class="form-group"><label>Maneirismos (Mestre)</label><textarea id="wiz-mannerisms"
                                class="medieval-textarea"
                                placeholder="Ex: Vive batendo os dedos na mesa ou puxando o lóbulo da orelha."></textarea>
                        </div>
                        <div class="form-group"><label>Talentos de Roleplay</label><textarea id="wiz-talents"
                                class="medieval-textarea"
                                placeholder="Ex: Sabe imitar perfeitamente o som de um pássaro regional."></textarea>
                        </div>
                    </div>
                    <div class="form-group"><label>Aparência do Personagem</label><textarea id="wiz-appearance"
                            class="medieval-textarea"
                            placeholder="Descreva traços físicos, vestimentas e itens marcantes."></textarea>
                    </div>
                    <div class="form-group"><label>História do Personagem</label><textarea id="wiz-backstory"
                            class="medieval-textarea"
                            placeholder="Sua jornada até aqui... (Lyra pode preencher se você escolher o modo Arcano)"></textarea>
                    </div>
                </div>

                <div class="wizard-step hidden" data-step="5">
                    <h3>Consagração</h3>
                    <p id="wiz-final-msg">Lyra irá tecer a trama final do seu herói.</p>
                </div>

                <div class="wizard-nav">
                    <button id="wiz-prev" class="medieval-btn small secondary hidden">Anterior</button>
                    <button id="wiz-next" class="medieval-btn small">Próximo</button>
                    <button id="wiz-finish" class="medieval-btn small hidden">Consagrar</button>
                </div>

                <!-- Lyra's Guidance (Inside Wizard) -->
                <div id="lyra-guidance" class="lyra-guidance-container hidden">
                    <img src="assets/Lyra_the_wise.png" alt="Lyra guidance" class="guidance-portrait">
                    <div class="guidance-bubble parchment">
                        <p id="guidance-text">Em que posso ajudá-lo, viajante?</p>
                        <div class="bubble-tail"></div>
                    </div>
                </div>
            </div>

            <!-- Monster Wizard -->
            <div id="monster-wizard" class="wizard-container hidden">
                <div id="mon-choice-step" class="wizard-step">
                    <h3>Origem da Criatura</h3>
                    <div class="mode-choices">
                        <div class="choice-card" data-mode="ai">
                            <i class="fas fa-dragon"></i>
                            <h4>Invocar com Lyra</h4>
                            <p>A Magia gerará as estatísticas e a descrição.</p>
                        </div>
                        <div class="choice-card" data-mode="manual">
                            <i class="fas fa-hammer"></i>
                            <h4>Forjar Manualmente</h4>
                            <p>Preencha os detalhes da criatura você mesmo.</p>
                        </div>
                    </div>
                </div>
                <div id="mon-form" class="hidden">
                    <h3><i class="fas fa-dragon"></i> Invocação de Criatura</h3>
                    <div class="form-group"><label>Nome</label><input type="text" id="mon-name"></div>
                    <div class="form-row">
                        <div class="form-group"><label>ND</label><input type="text" id="mon-cr"></div>
                        <div class="form-group"><label>Tipo</label><input type="text" id="mon-type"></div>
                    </div>
                    <div class="form-group"><label>Descrição/Prompt</label><textarea id="mon-prompt"
                            class="medieval-textarea"
                            placeholder="Ex: Um lobo das sombras com olhos flamejantes..."></textarea></div>
                    <div class="wizard-nav">
                        <button id="mon-finish-btn" class="medieval-btn small">Invocar</button>
                    </div>
                </div>
            </div>

            <!-- Session Wizard -->
            <div id="session-wizard" class="wizard-container hidden">
                <div class="wizard-step" data-step="0" id="sess-choice-step">
                    <h3>Registro da Crônica</h3>
                    <div class="mode-choices">
                        <button class="choice-card" data-mode="ai">
                            <i class="fas fa-magic"></i>
                            <h4>Oráculo</h4>
                            <p>O Oráculo tecerá a narrativa com base em suas escolhas.</p>
                        </button>
                        <button class="choice-card disabled" data-mode="ai-dm" title="Este modo está em manutenção transcendental.">
                            <i class="fas fa-dragon"></i>
                            <h4 id="sess-ai-dm-title">Contra o Oráculo</h4>
                            <p id="sess-ai-dm-desc"><strong>[EM BREVE]</strong> A IA assumirá o controle total da narrativa e das regras.</p>
                        </button>
                    </div>
                </div>

                <!-- Step 1: Base Context -->
                <div class="wizard-step hidden" data-step="1">
                    <h3>Contexto da Saga</h3>
                    <div class="form-group">
                        <label>Título da Aventura</label>
                        <input type="text" id="sess-title" placeholder="Ex: O Segredo do Templo Perdido">
                    </div>
                    <div class="form-group">
                        <label>Gancho de Abertura</label>
                        <textarea id="sess-hook" class="medieval-textarea"
                            placeholder="Como a aventura começa?"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Objetivo Principal</label>
                        <textarea id="sess-goal" class="medieval-textarea"
                            placeholder="O que os heróis precisam alcançar?"></textarea>
                    </div>
                </div>

                <!-- Step 2: World & NPCs -->
                <div class="wizard-step hidden" data-step="2">
                    <h3>Mundo e Personagens</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Localidades de Destaque</label>
                            <textarea id="sess-locations" class="medieval-textarea"
                                placeholder="Onde a ação ocorre?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>NPCs Pivotais</label>
                            <textarea id="sess-npcs" class="medieval-textarea"
                                placeholder="Quem são os aliados e informantes?"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Step 3: Threats & Combat -->
                <div class="wizard-step hidden" data-step="3">
                    <h3>Perigos e Desafios</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Ameaças e Monstros</label>
                            <textarea id="sess-threats" class="medieval-textarea"
                                placeholder="Quem ou o que se opõe aos heróis?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Encontros (3-5)</label>
                            <textarea id="sess-encounters" class="medieval-textarea"
                                placeholder="Descreva os principais desafios planejados."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Step 4: Spoils & Climax -->
                <div class="wizard-step hidden" data-step="4">
                    <h3>Clímax e Recompensas</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>O Grande Clímax</label>
                            <textarea id="sess-climax" class="medieval-textarea"
                                placeholder="Como será o confronto final?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Tesouros e Recompensas</label>
                            <textarea id="sess-treasure" class="medieval-textarea"
                                placeholder="O que os heróis ganharão?"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Step 5: Atmosphere & Resolution -->
                <div class="wizard-step hidden" data-step="5">
                    <h3>Finalização e Atmosfera</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Consequências e Resolução</label>
                            <textarea id="sess-resolution" class="medieval-textarea"
                                placeholder="O que acontece após o clímax?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Ambiente e Atmosfera</label>
                            <textarea id="sess-atmosphere" class="medieval-textarea"
                                placeholder="Cores, sons, cheiros predominantes..."></textarea>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Duração Pretendida (Linha do Tempo)</label>
                            <select id="sess-timeline" class="medieval-select">
                                <option value="1" selected>Sessão Única (One-shot)</option>
                                <option value="3">Campanha Curta (3 sessões)</option>
                                <option value="5">Campanha Média (5 sessões)</option>
                                <option value="10">Campanha Épica (10 sessões)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Cadência Narrativa</label>
                            <select id="sess-pacing" class="medieval-select">
                                <option value="short">Curta (Direta e Ágil)</option>
                                <option value="balanced" selected>Equilibrada (Misto)</option>
                                <option value="long">Longa (Imersiva e Detalhada)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="wizard-nav sess-nav hidden">
                    <button id="sess-prev" class="medieval-btn small secondary hidden">Anterior</button>
                    <button id="sess-magic-fill" class="medieval-btn small secondary"
                        title="O Oráculo preencherá as lacunas da sua narrativa.">
                        <i class="fas fa-wand-magic-sparkles"></i> Preencher com Magia
                    </button>
                    <button id="sess-next" class="medieval-btn small">Próximo</button>
                    <button id="sess-finish-btn" class="medieval-btn small hidden">Registrar Saga</button>
                </div>
            </div>
        `;
        document.getElementById('modal-body')?.insertAdjacentHTML('beforeend', html);
    },

    bindEvents(context) {
        // Choice Cards
        document.querySelectorAll('.wizard-container .choice-card').forEach(card => {
            card.onclick = () => this.handleChoiceClick(card);
        });

        // Navigation Buttons
        document.getElementById('wiz-prev')?.addEventListener('click', () => this.updateWizardStep(-1));
        document.getElementById('wiz-next')?.addEventListener('click', () => this.updateWizardStep(1));
        document.getElementById('wiz-finish')?.addEventListener('click', () => this.handleWizardFinish(context));

        document.getElementById('mon-finish-btn')?.addEventListener('click', () => this.handleMonsterFinish(context));

        document.getElementById('sess-prev')?.addEventListener('click', () => this.updateWizardStep(-1));
        document.getElementById('sess-next')?.addEventListener('click', () => this.updateWizardStep(1));
        document.getElementById('sess-finish-btn')?.addEventListener('click', () => this.handleSessionFinish(context));
        document.getElementById('sess-magic-fill')?.addEventListener('click', () => this.fillSessionBlanksWithAI(context));

        // Attr Tips
        document.getElementById('open-attr-tips')?.addEventListener('click', () => {
            document.getElementById('attribute-tips-modal')?.classList.remove('hidden');
        });

        document.getElementById('close-attr-tips')?.addEventListener('click', () => {
            document.getElementById('attribute-tips-modal')?.classList.add('hidden');
        });
    },

    wizardStep: 0,
    creationMode: 'ai',

    // --- Entry Points ---
    showCreationWizard(context) {
        if (!context.checkAuth()) return;
        logger.info("✨ Abrindo Criador de Personagem");

        this.resetCharacterWizard();
        this.updateThemeText();

        context.openModal('creation-wizard');
        this.wizardStep = 0;
        this.updateWizardUI();
        this.initAutoResize();

        // Load Dynamic Data
        this.loadSystemData(context);
    },

    resetCharacterWizard() {
        // Reset basic fields
        const fields = [
            'wiz-name', 'wiz-race', 'wiz-subrace', 'wiz-class', 'wiz-archetype',
            'wiz-background', 'wiz-alignment', 'wiz-speed', 'wiz-traits',
            'wiz-ideals', 'wiz-bonds', 'wiz-flaws', 'wiz-mannerisms',
            'wiz-talents', 'wiz-appearance', 'wiz-backstory'
        ];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = (id === 'wiz-speed' ? '9m' : '');
        });

        // Reset attributes
        document.querySelectorAll('#wiz-attributes-grid input').forEach(input => {
            input.value = 10;
        });

        // Reset Skills
        document.querySelectorAll('#wiz-skills-selection input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Hide sub-containers
        document.getElementById('wiz-subrace-container')?.classList.add('hidden');
        document.getElementById('wiz-archetype-container')?.classList.add('hidden');

        this.wizardStep = 0;
    },

    async loadSystemData(context) {
        const raceSelect = document.getElementById('wiz-race');
        const classSelect = document.getElementById('wiz-class');
        const bgSelect = document.getElementById('wiz-background');

        if (!raceSelect || !classSelect || !bgSelect) return;

        // Prevent reloading if already loaded with full data
        if (raceSelect.options.length > 30) return;

        raceSelect.innerHTML = '<option value="">Carregando...</option>';
        classSelect.innerHTML = '<option value="">Carregando...</option>';

        const currentSystem = context.currentSystem || 'dnd5e';
        const currentPlugin = SystemRegistry.get(currentSystem) || SystemRegistry.getCurrent();
        const creationData = currentPlugin?.getCreationData() || {};

        try {
            const systemData = await getSystemData(currentSystem);

            let races = systemData?.races || [];
            let classes = systemData?.classes || [];

            // Fallback usando os dados do plugin registrado se o Firestore estiver vazio
            if (races.length === 0 && creationData.races) {
                races = creationData.races.map(r => ({
                    raca: r,
                    subracas: creationData.subraces?.[r] || []
                }));
            }
            if (classes.length === 0 && creationData.classes) {
                classes = creationData.classes.map(c => ({
                    nome: c,
                    arquetipos: creationData.archetypes?.[c] || []
                }));
            }

            // Populate Races
            raceSelect.innerHTML = '<option value="">Selecione Raça...</option>';
            races.forEach(r => {
                const name = r.raca || r;
                const option = document.createElement('option');
                option.value = name;
                option.innerText = name;
                raceSelect.appendChild(option);
            });

            // Populate Classes
            classSelect.innerHTML = '<option value="">Selecione Classe...</option>';
            classes.forEach(c => {
                const name = c.nome || c;
                const option = document.createElement('option');
                option.value = name;
                option.innerText = name;
                classSelect.appendChild(option);
            });

            // Populate Backgrounds
            bgSelect.innerHTML = '<option value="">Selecione Antecedente...</option>';
            const backgrounds = creationData.backgrounds || [];
            backgrounds.forEach(bg => {
                const option = document.createElement('option');
                option.value = bg;
                option.innerText = bg;
                bgSelect.appendChild(option);
            });

            // Populate Attributes
            const attrGrid = document.getElementById('wiz-attributes-grid');
            if (attrGrid) {
                const attrs = currentPlugin?.getAttributeConfig() || [];
                attrGrid.innerHTML = attrs.map(a => `
                    <div class="attr-input" title="${a.description || ''}">
                        <span>${a.shortLabel}</span>
                        <input type="number" id="wiz-${a.id}" value="10" min="0" max="25">
                    </div>
                `).join('');
            }

            // Populate Skills
            const skillsSel = document.getElementById('wiz-skills-selection');
            if (skillsSel) {
                const skills = currentPlugin?.getSkillConfig() || [];
                skillsSel.innerHTML = skills.map(sk => `
                    <label title="${sk.description || ''}">
                        <input type="checkbox" value="${sk.id}"> ${sk.label}
                    </label>
                `).join('');
            }

            // Listeners for Sub-options
            this.bindSubOptions(races, classes);

        } catch (err) {
            logger.error("Erro ao carregar dados do sistema:", err);
            raceSelect.innerHTML = '<option value="">Erro ao carregar</option>';
            classSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    },

    bindSubOptions(races, classes) {
        const raceSelect = document.getElementById('wiz-race');
        const subraceContainer = document.getElementById('wiz-subrace-container');
        const subraceSelect = document.getElementById('wiz-subrace');

        const classSelect = document.getElementById('wiz-class');
        const archetypeContainer = document.getElementById('wiz-archetype-container');
        const archetypeSelect = document.getElementById('wiz-archetype');

        raceSelect.addEventListener('change', () => {
            const selectedName = raceSelect.value;
            const raceData = races.find(r => r.raca === selectedName);

            if (raceData && raceData.subracas && raceData.subracas.length > 0) {
                subraceSelect.innerHTML = '<option value="">Selecione Sub-raça</option>';
                raceData.subracas.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.innerText = sub;
                    subraceSelect.appendChild(opt);
                });
                subraceContainer.classList.remove('hidden');
                subraceSelect.required = true; // Enforce selection? Maybe optional? 
                // Let's make it optional for now or the user might get stuck if data is partial
            } else {
                subraceContainer.classList.add('hidden');
                subraceSelect.value = "";
                subraceSelect.required = false;
            }
        });

        classSelect.addEventListener('change', () => {
            const selectedName = classSelect.value;
            const classData = classes.find(c => c.nome === selectedName);

            if (classData && classData.arquetipos && classData.arquetipos.length > 0) {
                archetypeSelect.innerHTML = '<option value="">Selecione Arquétipo</option>';
                classData.arquetipos.forEach(arch => {
                    const opt = document.createElement('option');
                    opt.value = arch;
                    opt.innerText = arch;
                    archetypeSelect.appendChild(opt);
                });
                archetypeContainer.classList.remove('hidden');
            } else {
                archetypeContainer.classList.add('hidden');
                archetypeSelect.value = "";
            }
        });
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
                    if (p) p.innerText = "O Poder Verdadeiro forjará seu destino.";
                    if (finalMsg) finalMsg.innerText = "Damien usará seu poder para forjar o destino do seu herói. Prepare-se.";
                    if (backstoryInput) backstoryInput.placeholder = "Sua jornada até aqui... (Damien pode preencher se você escolher o modo Arcano)";
                } else if (document.body.classList.contains('eldrin-theme')) {
                    if (h4) h4.innerText = "Com Eldrin";
                    if (p) p.innerText = "O Bardo Sagaz cantará sua lenda.";
                    if (finalMsg) finalMsg.innerText = "Eldrin irá compor a balada final do seu herói, entrelaçando destino e inspiração.";
                    if (backstoryInput) backstoryInput.placeholder = "Sua jornada até aqui... (Eldrin pode preencher se você escolher o modo Arcano)";
                } else {
                    if (h4) h4.innerText = "Com Lyra";
                    if (p) p.innerText = "A Sabedoria Ancestral irá tecer sua lenda.";
                    if (finalMsg) finalMsg.innerText = "Lyra irá tecer a trama final do seu herói, gerando história, ideais e laços dinâmicamente.";
                    if (backstoryInput) backstoryInput.placeholder = "Sua jornada até aqui... (Lyra pode preencher se você escolher o modo Arcano)";
                }
            }
        }
    },

    updateSessionWizardThemeText() {
        const wizard = document.getElementById('session-wizard');
        if (!wizard) return;

        const aiCard = wizard.querySelector('.choice-card[data-mode="ai"]');
        if (!aiCard) return;

        const h4 = aiCard.querySelector('h4');
        const p = aiCard.querySelector('p');

        if (document.body.classList.contains('damien-theme')) {
            if (h4) h4.innerText = "Oráculo Damien";
            if (p) p.innerText = "O Poder Verdadeiro tecerá a narrativa com base em suas escolhas.";
        } else if (document.body.classList.contains('eldrin-theme')) {
            if (h4) h4.innerText = "Oráculo Eldrin";
            if (p) p.innerText = "O Bardo Sagaz cantará a narrativa com base em suas escolhas.";
        } else {
            if (h4) h4.innerText = "Oráculo Lyra";
            if (p) p.innerText = "A Sabedoria Ancestral tecerá a narrativa com base em suas escolhas.";
        }
    },

    showMonsterCreator(context) {
        if (!context.checkAuth()) return;
        this.resetMonsterWizard();
        const monCr = document.getElementById('mon-cr');
        if (monCr) monCr.parentElement.classList.remove('hidden');
        const monTitle = document.getElementById('monster-wizard')?.querySelector('h3');
        if (monTitle) monTitle.innerText = "Origem da Criatura";
        context.openModal('monster-wizard');
    },

    showTrapCreator(context) {
        if (!context.checkAuth()) return;
        this.resetMonsterWizard();
        const monCr = document.getElementById('mon-cr');
        if (monCr) monCr.parentElement.classList.add('hidden');
        const monTitle = document.getElementById('monster-wizard')?.querySelector('h3');
        if (monTitle) monTitle.innerText = "Criação de Armadilha";
        context.openModal('monster-wizard');
    },

    resetMonsterWizard() {
        const fields = ['mon-name', 'mon-cr', 'mon-type', 'mon-prompt'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
        document.getElementById('mon-choice-step')?.classList.remove('hidden');
        document.getElementById('mon-form')?.classList.add('hidden');
    },

    showSessionWizard(context, mode = 'manual') {
        if (!context.checkAuth()) return;

        this.creationMode = mode;
        this.wizardStep = 0;

        // Reset all session fields for a fresh start
        const sessionFields = [
            'sess-title', 'sess-hook', 'sess-goal', 'sess-locations',
            'sess-npcs', 'sess-threats', 'sess-encounters',
            'sess-climax', 'sess-treasure', 'sess-resolution', 'sess-atmosphere'
        ];
        sessionFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });

        const timelineSelect = document.getElementById('sess-timeline');
        if (timelineSelect) timelineSelect.value = "1";

        const finishBtn = document.getElementById('sess-finish-btn');
        if (finishBtn) {
            finishBtn.disabled = false;
            finishBtn.innerHTML = 'Registrar Saga';
        }

        this.updateSessionWizardThemeText();
        context.openModal('session-wizard');
        this.updateSessionWizardUI();
    },

    showSessionEditor(context) {
        // Obsolete - redirected to showSessionWizard
        this.showSessionWizard(context, 'manual');
    },

    // --- Navigation Logic ---
    handleChoiceClick(card) {
        if (card.classList.contains('disabled')) return;

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
            this.wizardStep = 1;
            this.updateSessionWizardUI();
        }
    },

    updateWizardStep(dir) {
        this.wizardStep += dir;
        const activeWizard = document.querySelector('.wizard-container:not(.hidden)');
        if (activeWizard && activeWizard.id === 'session-wizard') {
            this.updateSessionWizardUI();
        } else {
            this.updateWizardUI();
        }
    },

    updateSessionWizardUI() {
        const wizard = document.getElementById('session-wizard');
        if (!wizard) return;

        wizard.querySelectorAll('.wizard-step').forEach(s => {
            const stepNum = parseInt(s.dataset.step);
            s.classList.toggle('hidden', stepNum !== this.wizardStep);
        });

        const nav = wizard.querySelector('.sess-nav');
        if (this.wizardStep === 0) {
            nav?.classList.add('hidden');
        } else {
            nav?.classList.remove('hidden');
            const prevBtn = document.getElementById('sess-prev');
            const nextBtn = document.getElementById('sess-next');
            const finishBtn = document.getElementById('sess-finish-btn');

            if (prevBtn) prevBtn.classList.toggle('hidden', this.wizardStep === 1);
            if (nextBtn) nextBtn.classList.toggle('hidden', this.wizardStep === 5); // Hide Next on Last Step
            if (finishBtn) finishBtn.classList.toggle('hidden', this.wizardStep !== 5); // Show Finish on Last Step
        }

        // Trigger resize for visible textareas in the new step
        const activeStep = wizard.querySelector(`.wizard-step[data-step="${this.wizardStep}"]`);
        if (activeStep) {
            this.resizeVisibleTextareas(activeStep);
        }
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
            if (this.creationMode !== 'ai') {
                finalMsg.innerText = "Seu herói está pronto para ser consagrado nos anais da história.";
            } else {
                // Determine theme text via centralized updateThemeText()
                // This ensures Eldrin, Damien, and Lyra are all handled correctly.
                this.updateThemeText();
            }
        }
    },

    // --- Finish Handlers ---
    async handleWizardFinish(context) {
        if (!context.user) {
            if (!context.checkAuth()) return;
        }
        const name = document.getElementById('wiz-name').value.trim();
        const race = document.getElementById('wiz-race').value.trim();
        const className = document.getElementById('wiz-class').value;
        const alignment = document.getElementById('wiz-alignment').value;

        if (!name || !race || !className || !alignment) {
            context.showAlert("Nome, Raça, Classe e Alinhamento são obrigatórios para a jornada!", "Campos Faltando");
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
            const currentPlugin = SystemRegistry.get(context.currentSystem) || SystemRegistry.getCurrent();
            const template = currentPlugin
                ? JSON.parse(JSON.stringify(currentPlugin.getTemplate()))
                : { bio: {}, attributes: {}, stats: {}, proficiencies_choice: {}, story: {}, inventory: {}, spells: {} };

            // Mapping values
            template.bio.name = name;
            template.bio.race = race;
            template.bio.subrace = document.getElementById('wiz-subrace')?.value || "";
            template.bio.class = className;
            template.bio.archetype = document.getElementById('wiz-archetype')?.value || "";
            template.bio.background = document.getElementById('wiz-background').value;
            template.bio.alignment = document.getElementById('wiz-alignment').value;
            template.bio.level = 1;

            const attributes = {};
            const attrConfig = currentPlugin?.getAttributeConfig() || [];
            attrConfig.forEach(attr => {
                const el = document.getElementById(`wiz-${attr.id}`);
                if (el) {
                    attributes[attr.id] = Math.min(25, Math.max(0, parseInt(el.value) || 10));
                } else {
                    attributes[attr.id] = 10;
                }
            });
            template.attributes = attributes;

            const rawSkills = Array.from(document.querySelectorAll('#wiz-skills-selection input:checked')).map(i => i.value);
            template.proficiencies_choice.skills = rawSkills;
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
                const aiResult = await createCharacterWithLyra(finalData);
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
            logger.error("Erro na Wizard:", error);
            const { translateFirebaseError } = await import('./utils.js');
            context.showAlert("A convergência falhou: " + translateFirebaseError(error), "Erro Místico");
        } finally {
            context.toggleLoading(false);
        }
    },

    async handleMonsterFinish(context) {
        if (!context.user) {
            if (!context.checkAuth()) return;
        }
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
                result = await createMonsterWithLyra(monsterData);
            } else {
                result = { ...monsterData, stats: "Estatísticas manuais (em desenvolvimento)" };
            }

            if (isTrap) {
                await saveTrap(context.user.uid, context.currentSystem, result);
                if (context.refreshTraps) context.refreshTraps();
            } else {
                await saveUserMonster(context.user.uid, context.user.email, { ...result, systemId: context.currentSystem });
                if (context.refreshMonsters) context.refreshMonsters();
            }
            context.closeModal();
        } catch (error) {
            const { translateFirebaseError } = await import('./utils.js');
            context.showAlert("Falha na invocação mística: " + translateFirebaseError(error), "Contra-feitiço");
        } finally {
            context.toggleLoading(false);
        }
    },

    async handleSessionFinish(context) {
        if (!context.user) {
            if (!context.checkAuth()) return;
        }
        const finishBtn = document.getElementById('sess-finish-btn');
        if (finishBtn) {
            finishBtn.disabled = true;
            finishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tecendo...';
        }

        context.toggleLoading(true, "Tecendo a Linha do Tempo e os Destinos...");
        try {
            const { SettingsModule } = await import('./settings.js');
            const nickname = SettingsModule.currentPrefs?.nickname || context.user.displayName || 'Mestre Desconhecido';
            let sessionData = {
                title: document.getElementById('sess-title').value,
                hook: document.getElementById('sess-hook').value,
                goal: document.getElementById('sess-goal').value,
                locations: document.getElementById('sess-locations').value,
                npcs: document.getElementById('sess-npcs').value,
                threats: document.getElementById('sess-threats').value,
                encounters: document.getElementById('sess-encounters').value,
                climax: document.getElementById('sess-climax').value,
                treasure: document.getElementById('sess-treasure').value,
                resolution: document.getElementById('sess-resolution').value,
                atmosphere: document.getElementById('sess-atmosphere').value,
                timeline: document.getElementById('sess-timeline').value,
                pacing: document.getElementById('sess-pacing').value,
                masterNickname: nickname,

                // Compatibility for older fields
                summary: document.getElementById('sess-hook').value, // Use hook as summary start
                notes: document.getElementById('sess-encounters').value,

                visibility: "private",
                status: "preparing",
                started: false,
                maxPlayers: 6,
                currentPlayers: 0,
                mode: this.creationMode === 'manual' ? 'manual' : (this.creationMode === 'ai-dm' ? 'ai-dm' : 'oracle')
            };

            if (this.creationMode !== 'manual' && context.user) {
                const { generateTimelineWithLyra, generateSessionGaps } = await import('../ai.js');

                // 1. Fill Narrative Gaps (Hook, Goal, etc.) if they are blank
                const gaps = await generateSessionGaps(sessionData);
                if (gaps) {
                    Object.keys(gaps).forEach(key => {
                        const currentVal = sessionData[key];
                        const gapVal = gaps[key];
                        // Defensive: AI pode retornar arrays/objetos em vez de strings
                        const currentStr = (typeof currentVal === 'string') ? currentVal.trim() : '';
                        if (!currentStr) {
                            sessionData[key] = (typeof gapVal === 'string') ? gapVal : JSON.stringify(gapVal);
                        }
                    });
                }

                // 2. Generate Full Timeline based on the now-populated fields
                const aiResponse = await generateTimelineWithLyra(sessionData);
                if (aiResponse) {
                    sessionData.fullTimeline = aiResponse.timeline || [];
                    // Ensure summary is never undefined. Use AI intro, or fallback to hook, or empty string.
                    sessionData.summary = aiResponse.intro || sessionData.hook || "Uma aventura aguarda...";
                }
            }

            await saveSession(context.user.uid, context.currentSystem, sessionData);
            context.closeModal();
            if (context.refreshSessions) context.refreshSessions();
            context.showAlert("A Crônica foi registrada nos anais do tempo!", "Destino Selado");
        } catch (error) {
            logger.error("Erro ao registrar:", error);
            const { translateFirebaseError } = await import('./utils.js');
            context.showAlert("Erro ao registrar: " + translateFirebaseError(error), "Escriba Interrompido");
        } finally {
            context.toggleLoading(false);
        }
    },

    async fillSessionBlanksWithAI(context) {
        const title = document.getElementById('sess-title').value;
        const hook = document.getElementById('sess-hook').value;

        if (!title && !hook) {
            context.showAlert("Forneça pelo menos um Título ou Gancho para que o Oráculo possa sonhar.", "Essência Ausente");
            return;
        }

        context.toggleLoading(true, "O Oráculo está tecendo os detalhes...");
        try {
            const { generateSessionGaps } = await import('../ai.js');

            const currentData = {
                title, hook,
                goal: document.getElementById('sess-goal').value,
                locations: document.getElementById('sess-locations').value,
                npcs: document.getElementById('sess-npcs').value,
                threats: document.getElementById('sess-threats').value,
                encounters: document.getElementById('sess-encounters').value,
                climax: document.getElementById('sess-climax').value,
                treasure: document.getElementById('sess-treasure').value,
                resolution: document.getElementById('sess-resolution').value,
                atmosphere: document.getElementById('sess-atmosphere').value
            };

            const gaps = await generateSessionGaps(currentData);

            if (gaps) {
                // Mapping keys to element IDs (prefixing with 'sess-')
                Object.entries(gaps).forEach(([key, value]) => {
                    const el = document.getElementById(`sess-${key}`);
                    if (el && !el.value) {
                        el.value = value;
                        // Auto-resize only if visible, otherwise it will be handled by step change
                        if (el.offsetParent !== null) {
                            el.style.height = 'auto';
                            el.style.height = el.scrollHeight + 'px';
                        }
                    }
                });
                context.showAlert("O Oráculo preencheu as lacunas da sua narrativa.", "Visão Concedida");
            }
        } catch (error) {
            logger.error("Erro crítico no Wizard:", error);
            const { translateFirebaseError } = await import('./utils.js');
            context.showAlert("Ocorreu uma falha na visão: " + translateFirebaseError(error));
        } finally {
            context.toggleLoading(false);
        }
    },



    initAutoResize() {
        const textareas = document.querySelectorAll('#creation-wizard textarea');
        textareas.forEach(textarea => {
            textarea.setAttribute('style', 'height:auto;overflow-y:hidden;');
            textarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        });
    },

    resizeVisibleTextareas(container) {
        if (!container) return;
        requestAnimationFrame(() => {
            container.querySelectorAll('textarea').forEach(textarea => {
                if (textarea.value) {
                    textarea.style.height = 'auto';
                    textarea.style.height = (textarea.scrollHeight) + 'px';
                }
            });
        });
    },

    initGuidanceListeners() {
        const container = document.getElementById('lyra-guidance');
        const textEl = document.getElementById('guidance-text');
        const portrait = container ? container.querySelector('img') : null;
        const wizard = document.getElementById('creation-wizard');

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

        if (!wizard) return;

        const showTipForElement = (target) => {
            if (!target) return;
            const isDamien = document.body.classList.contains('damien-theme');
            const isEldrin = document.body.classList.contains('eldrin-theme');

            // Se for parte da seleção de perícias
            if (target.closest('.skills-selection') || target.closest('#wiz-skills-selection')) {
                let tip;
                if (isDamien) tip = "Do que você é capaz? Escolha o que lhe torna útil.";
                else if (isEldrin) tip = "Quais são seus talentos no palco da vida? Em que você brilha?";
                else tip = "Seus talentos aprendidos. Escolha aqueles em que seu herói é perito!";

                if (container && textEl) {
                    textEl.innerText = tip;
                    container.classList.remove('hidden');

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
                return;
            }

            // Para outros inputs mapeados por ID
            let currentTips;
            if (isDamien) currentTips = this.damienTips;
            else if (isEldrin) currentTips = this.eldrinTips;
            else currentTips = this.guidanceTips;

            const tip = currentTips[target.id];
            if (tip && container && textEl) {
                textEl.innerText = tip;
                container.classList.remove('hidden');

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

        // Delegação de focus (focusin borbulha)
        wizard.addEventListener('focusin', (e) => {
            const target = e.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
                showTipForElement(target);
            }
        });

        // Delegação de mouseover (mouseover borbulha)
        wizard.addEventListener('mouseover', (e) => {
            const target = e.target.closest('input, select, textarea, label');
            if (target) {
                if (target.tagName === 'LABEL' && target.closest('.skills-selection')) {
                    const input = target.querySelector('input');
                    showTipForElement(input || target);
                } else if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
                    showTipForElement(target);
                }
            }
        });

        // Ocultar quando clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#creation-wizard') && container) {
                container.classList.add('hidden');
            }
        });

        // Attribute Generation Tips Modal Handlers
        const openTipsBtn = document.getElementById('open-attr-tips');
        const tipsModal = document.getElementById('attribute-tips-modal');
        const closeTipsBtn = document.getElementById('close-attr-tips');

        if (openTipsBtn && tipsModal) {
            openTipsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                tipsModal.classList.remove('hidden');
            });
        }

        if (closeTipsBtn && tipsModal) {
            closeTipsBtn.addEventListener('click', () => {
                tipsModal.classList.add('hidden');
            });
        }

        // Close on backdrop click
        tipsModal?.addEventListener('click', (e) => {
            if (e.target === tipsModal) tipsModal.classList.add('hidden');
        });
    },

    closeModal(id) {
        document.getElementById(id)?.classList.add('hidden');
    }
};

window.WizardModule = WizardModule;
