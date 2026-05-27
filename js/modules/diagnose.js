import SystemRegistry from '../systems/system-registry.js';
import '../systems/dnd5e.js';
import '../systems/vampire.js';
import { sanitizeHTML as escapeHTML } from './utils.js';

const DiagnoseModule = {
    init() {
        this.renderSystemsList();
    },

    renderSystemsList() {
        const container = document.getElementById('diagnose-systems-list');
        if (!container) return;

        const allSystems = SystemRegistry.getAll();
        if (allSystems.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum sistema registrado no Grande Arquivo.</p>';
            return;
        }

        const requiredMethods = [
            'getTemplate', 'getCreationData', 'getAttributeConfig', 'getSkillConfig', 'getSaveConfig',
            'calculateStats', 'renderSheetScores', 'renderSheetSaves', 'renderSheetSkills', 
            'renderSheetCombatTab', 'getPromptContext', 'getEntityPrompt', 'getCharacterPrompt', 
            'getCombatConfig', 'calculateInitiativeBonus'
        ];

        const optionalMethods = [
            'getModifier', 'formatModifier', 'renderSheetMagicTab', 'getSheetTabs', 
            'renderSheetHeader', 'getItemPrompt', 'getSpellPrompt', 'getAbilityPrompt', 
            'getNamesPrompt', 'getWizardSteps', 'renderWizardStep', 'gatherWizardData'
        ];

        container.innerHTML = allSystems.map(system => {
            const audit = {
                requiredOk: 0,
                requiredFail: 0,
                optionalOk: 0,
                optionalFail: 0,
                details: []
            };

            requiredMethods.forEach(method => {
                const ok = typeof system[method] === 'function';
                if (ok) {
                    audit.requiredOk++;
                    audit.details.push({ method, type: 'required', status: 'ok' });
                } else {
                    audit.requiredFail++;
                    audit.details.push({ method, type: 'required', status: 'fail' });
                }
            });

            optionalMethods.forEach(method => {
                const ok = typeof system[method] === 'function';
                if (ok) {
                    audit.optionalOk++;
                    audit.details.push({ method, type: 'optional', status: 'ok' });
                } else {
                    audit.optionalFail++;
                    audit.details.push({ method, type: 'optional', status: 'fail' });
                }
            });

            const totalRequired = requiredMethods.length;
            
            let statusText = 'Excelente';
            let statusClass = 'success';
            if (audit.requiredFail > 0) {
                statusText = 'Incompleto';
                statusClass = 'danger';
            } else if (!system.implemented) {
                statusText = 'Em Desenvolvimento';
                statusClass = 'silver';
            } else if (audit.optionalFail > 0) {
                statusText = 'Operacional';
                statusClass = 'gold';
            }

            const iconClass = system.icon || 'fa-dice-d20';

            return `
                <div class="system-audit-card theme-aware" id="system-card-${system.id}">
                    <div class="system-card-header">
                        <div class="system-title-block">
                            <i class="fa-solid ${iconClass} system-card-icon"></i>
                            <div class="system-meta">
                                <span class="system-name">${escapeHTML(system.name)}</span>
                                <span class="system-id-ver">Mecanismo v${escapeHTML(system.version || '1.0.0')} (ID: ${escapeHTML(system.id)})</span>
                            </div>
                        </div>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>

                    <div class="modules-integrity-grid">
                        <div class="integrity-group">
                            <span class="integrity-group-title">Módulos Críticos (${audit.requiredOk}/${totalRequired})</span>
                            <div class="integrity-badges">
                                ${audit.details.filter(d => d.type === 'required').map(d => {
                                    const isOk = d.status === 'ok';
                                    const cls = isOk ? 'ok' : 'error';
                                    const dot = isOk ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-triangle-exclamation"></i>';
                                    return `<span class="integrity-badge ${cls}" title="${d.method}: ${isOk ? 'Operacional' : 'FALTANTE/INVÁLIDO'}">${dot} ${d.method}</span>`;
                                }).join('')}
                            </div>
                        </div>

                        <div class="integrity-group" style="margin-top: 0.3rem;">
                            <span class="integrity-group-title">Extensões Opcionais (${audit.optionalOk}/${optionalMethods.length})</span>
                            <div class="integrity-badges">
                                ${audit.details.filter(d => d.type === 'optional').map(d => {
                                    const isOk = d.status === 'ok';
                                    const cls = isOk ? 'optional' : 'missing-optional';
                                    const dot = isOk ? '<i class="fas fa-circle-check"></i>' : '<i class="fas fa-circle-minus"></i>';
                                    return `<span class="integrity-badge ${cls}" title="${d.method}: ${isOk ? 'Extensão ativa' : 'Não suportado'}">${dot} ${d.method}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    </div>

                    <button class="medieval-btn small gold-pulse diagnose-trigger" data-system-id="${system.id}">
                        <i class="fas fa-play"></i> Iniciar Auditoria
                    </button>
                </div>
            `;
        }).join('');

        // Bind events for triggers
        container.querySelectorAll('.diagnose-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const systemId = e.currentTarget.dataset.systemId;
                this.runDiagnostics(systemId);
            });
        });
    },

    async runDiagnostics(systemId) {
        const system = SystemRegistry.get(systemId);
        if (!system) return;

        // Atualizar estilos dos cards na esquerda
        document.querySelectorAll('.system-audit-card').forEach(c => c.classList.remove('active-run'));
        const activeCard = document.getElementById(`system-card-${systemId}`);
        if (activeCard) activeCard.classList.add('active-run');

        const visualizerContainer = document.getElementById('diagnose-visualizer-panel');
        if (!visualizerContainer) return;

        // Limpar placeholder ou workspace antigo
        visualizerContainer.innerHTML = `
            <div class="diagnostic-workspace">
                <div class="diagnostic-main-layout">
                    <div class="diagnostic-steps-panel">
                        <h3 class="panel-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Ritos de Validação</h3>
                        <ul class="diagnostic-steps-list" id="diagnostic-steps-list"></ul>
                    </div>
                    
                    <div class="diagnostic-code-panel">
                        <div class="code-panel-header">
                            <span class="terminal-dot red"></span>
                            <span class="terminal-dot yellow"></span>
                            <span class="terminal-dot green"></span>
                            <span class="terminal-title">console-arcanum.js</span>
                        </div>
                        <div class="code-panel-body" id="diagnostic-code-display"></div>
                    </div>
                </div>
                
                <div class="diagnostic-footer hidden" id="diagnostic-footer">
                    <div class="diagnostic-summary" id="diagnostic-summary"></div>
                </div>
            </div>
        `;

        const stepsListEl = document.getElementById('diagnostic-steps-list');
        const codeDisplayEl = document.getElementById('diagnostic-code-display');
        const footerEl = document.getElementById('diagnostic-footer');
        const summaryEl = document.getElementById('diagnostic-summary');

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        const appendCodeLine = (text, type = 'normal') => {
            const line = document.createElement('div');
            line.className = `code-line ${type}`;
            
            if (type === 'comment') {
                line.innerHTML = `<span class="code-comment">${escapeHTML(text)}</span>`;
            } else if (type === 'js') {
                let html = escapeHTML(text)
                    .replace(/\b(const|let|var|function|return|if|typeof|throw|new|import)\b/g, '<span class="code-keyword">$1</span>')
                    .replace(/\b(getTemplate|calculateStats|calculateInitiativeBonus|renderSheetScores|renderSheetSaves|renderSheetSkills|renderSheetCombatTab)\b/g, '<span class="code-func">$1</span>');
                line.innerHTML = html;
            } else if (type === 'output') {
                line.innerHTML = `<span class="code-output">${escapeHTML(text)}</span>`;
            } else if (type === 'error') {
                line.innerHTML = `<span class="code-error">${escapeHTML(text)}</span>`;
            } else {
                line.innerText = text;
            }
            
            codeDisplayEl.appendChild(line);
            codeDisplayEl.scrollTop = codeDisplayEl.scrollHeight;
        };

        const formatJSONDump = (obj) => {
            if (obj === "Sucesso") return "Sucesso (UI Renderizada)";
            if (obj === "Ignorado (Opcional)") return "Ignorado (Método Opcional não implementado)";
            try {
                const str = JSON.stringify(obj);
                if (str.length > 60) {
                    return str.substring(0, 57) + "... }";
                }
                return str;
            } catch {
                return String(obj);
            }
        };

        // Passos da Auditoria
        const steps = [
            {
                id: 'template',
                label: 'Inicializar Runa de Template',
                comment: '// Carregando a matriz base do sistema (getTemplate)',
                code: `const template = system.getTemplate();`,
                run: () => {
                    if (typeof system.getTemplate !== 'function') throw new Error("Método 'getTemplate' não implementado.");
                    const template = system.getTemplate();
                    if (!template || typeof template !== 'object') throw new Error("'getTemplate' não retornou um objeto de template válido.");
                    return template;
                }
            },
            {
                id: 'stats',
                label: 'Calibrar Motor de Cálculos',
                comment: '// Computando modificadores e atributos derivados (calculateStats)',
                code: `const stats = system.calculateStats(template);`,
                run: (ctx) => {
                    if (typeof system.calculateStats !== 'function') throw new Error("Método 'calculateStats' não implementado.");
                    const stats = system.calculateStats(ctx.template);
                    if (!stats || typeof stats !== 'object') throw new Error("'calculateStats' não retornou um objeto de estatísticas válido.");
                    return stats;
                }
            },
            {
                id: 'initiative',
                label: 'Modular Iniciativa',
                comment: '// Calculando o bônus de reação padrão (calculateInitiativeBonus)',
                code: `const initBonus = system.calculateInitiativeBonus(template);`,
                run: (ctx) => {
                    if (typeof system.calculateInitiativeBonus !== 'function') throw new Error("Método 'calculateInitiativeBonus' não implementado.");
                    const initBonus = system.calculateInitiativeBonus(ctx.template);
                    if (typeof initBonus !== 'number') throw new Error("'calculateInitiativeBonus' não retornou um número.");
                    return initBonus;
                }
            },
            {
                id: 'render_scores',
                label: 'Dry-run: Renderizar Scores de Atributos',
                comment: '// Testando projeção visual de atributos (renderSheetScores)',
                code: `system.renderSheetScores(template, stats, helpers);`,
                run: (ctx, helpers) => {
                    if (typeof system.renderSheetScores === 'function') {
                        system.renderSheetScores(ctx.template, ctx.stats, helpers);
                        return "Sucesso";
                    }
                    return "Ignorado (Opcional)";
                }
            },
            {
                id: 'render_saves',
                label: 'Dry-run: Renderizar Salvamentos',
                comment: '// Testando projeção visual de testes de resistência (renderSheetSaves)',
                code: `system.renderSheetSaves(template, stats, helpers);`,
                run: (ctx, helpers) => {
                    if (typeof system.renderSheetSaves === 'function') {
                        system.renderSheetSaves(ctx.template, ctx.stats, helpers);
                        return "Sucesso";
                    }
                    return "Ignorado (Opcional)";
                }
            },
            {
                id: 'render_skills',
                label: 'Dry-run: Renderizar Perícias',
                comment: '// Testando projeção visual de perícias (renderSheetSkills)',
                code: `system.renderSheetSkills(template, stats, helpers);`,
                run: (ctx, helpers) => {
                    if (typeof system.renderSheetSkills === 'function') {
                        system.renderSheetSkills(ctx.template, ctx.stats, helpers);
                        return "Sucesso";
                    }
                    return "Ignorado (Opcional)";
                }
            },
            {
                id: 'render_combat',
                label: 'Dry-run: Renderizar Aba de Combate',
                comment: '// Testando projeção visual de ataques e armas (renderSheetCombatTab)',
                code: `system.renderSheetCombatTab(template, stats, helpers);`,
                run: (ctx, helpers) => {
                    if (typeof system.renderSheetCombatTab === 'function') {
                        system.renderSheetCombatTab(ctx.template, ctx.stats, helpers);
                        return "Sucesso";
                    }
                    return "Ignorado (Opcional)";
                }
            },
            {
                id: 'render_magic',
                label: 'Dry-run: Renderizar Aba de Magia',
                comment: '// Testando aba mística opcional de magias (renderSheetMagicTab)',
                code: `system.renderSheetMagicTab(template, stats, helpers);`,
                run: (ctx, helpers) => {
                    if (typeof system.renderSheetMagicTab === 'function') {
                        const res = system.renderSheetMagicTab(ctx.template, ctx.stats, helpers);
                        if (!res) throw new Error("'renderSheetMagicTab' retornou um resultado nulo.");
                        return res;
                    }
                    return "Ignorado (Opcional)";
                }
            },
            {
                id: 'wizard_steps',
                label: 'Verificar Passos do Wizard de Criação',
                comment: '// Validando a jornada opcional de criação do Wizard (getWizardSteps)',
                code: `system.getWizardSteps();`,
                run: (ctx) => {
                    if (typeof system.getWizardSteps === 'function') {
                        const steps = system.getWizardSteps();
                        if (!Array.isArray(steps)) throw new Error("'getWizardSteps' não retornou um array de passos.");
                        return steps;
                    }
                    return "Ignorado (Opcional)";
                }
            },
            {
                id: 'wizard_render',
                label: 'Dry-run: Renderizar Primeiro Passo do Wizard',
                comment: '// Validando renderização visual do primeiro passo do Wizard (renderWizardStep)',
                code: `system.renderWizardStep(firstStep, template);`,
                run: (ctx) => {
                    if (typeof system.renderWizardStep === 'function') {
                        if (typeof system.getWizardSteps !== 'function') throw new Error("renderWizardStep requer getWizardSteps implementado.");
                        const steps = system.getWizardSteps();
                        const firstStep = steps[0]?.id || 'step1';
                        const html = system.renderWizardStep(firstStep, ctx.template);
                        if (typeof html !== 'string' || html.trim() === '') throw new Error("'renderWizardStep' não retornou uma string HTML válida.");
                        return "Sucesso (HTML OK)";
                    }
                    return "Ignorado (Opcional)";
                }
            },
            {
                id: 'ai_prompts',
                label: 'Validar Prompts Arcanos da IA',
                comment: '// Validando geração de prompts de suporte da IA (getItemPrompt, getSpellPrompt, etc.)',
                code: `system.getItemPrompt("Espada", "Forte");`,
                run: (ctx) => {
                    const promptTests = [];
                    if (typeof system.getItemPrompt === 'function') {
                        const p = system.getItemPrompt("Espada", "Teste");
                        if (!p || typeof p !== 'string') throw new Error("getItemPrompt não retornou string válida.");
                        promptTests.push("ItemPrompt OK");
                    }
                    if (typeof system.getSpellPrompt === 'function') {
                        const p = system.getSpellPrompt("Bola de Fogo", "Teste");
                        if (!p || typeof p !== 'string') throw new Error("getSpellPrompt não retornou string válida.");
                        promptTests.push("SpellPrompt OK");
                    }
                    if (typeof system.getAbilityPrompt === 'function') {
                        const p = system.getAbilityPrompt("Fúria", "Teste");
                        if (!p || typeof p !== 'string') throw new Error("getAbilityPrompt não retornou string válida.");
                        promptTests.push("AbilityPrompt OK");
                    }
                    if (typeof system.getNamesPrompt === 'function') {
                        const p = system.getNamesPrompt("Humano", "Guerreiro", "Masculino");
                        if (!p || typeof p !== 'string') throw new Error("getNamesPrompt não retornou string válida.");
                        promptTests.push("NamesPrompt OK");
                    }
                    return promptTests.length > 0 ? promptTests.join(', ') : "Ignorado (Opcional)";
                }
            }
        ];

        let context = {
            template: null,
            stats: null,
            initBonus: null
        };
        const mockHelpers = {
            mkInput: (val) => `<input value="${val}">`,
            isInspection: false
        };

        let overallSuccess = true;
        let logsCompleted = 0;

        appendCodeLine(`// --- AUDITORIA DE SISTEMA INICIADA ---`, 'comment');
        appendCodeLine(`// Sintonizando com o multiverso RPG...`);
        appendCodeLine(`// Alvo: ${system.name} v${system.version || '1.0.0'}`);
        await sleep(600);

        for (const step of steps) {
            const li = document.createElement('li');
            li.id = `step-run-${step.id}`;
            li.className = 'diagnostic-step-item pending';
            li.innerHTML = `
                <span class="step-icon" id="step-icon-${step.id}"><i class="fas fa-quill fa-spin"></i></span>
                <span class="step-text" id="step-text-${step.id}">Iniciando: <strong>${step.label}</strong>...</span>
            `;
            stepsListEl.appendChild(li);
            stepsListEl.scrollTop = stepsListEl.scrollHeight;

            appendCodeLine(step.comment, 'comment');
            appendCodeLine(step.code, 'js');

            await sleep(400 + Math.random() * 300);

            try {
                const result = step.run(context, mockHelpers);
                
                if (step.id === 'template') context.template = result;
                else if (step.id === 'stats') context.stats = result;
                else if (step.id === 'initiative') context.initBonus = result;

                li.className = 'diagnostic-step-item success';
                const iconSpan = document.getElementById(`step-icon-${step.id}`);
                const textSpan = document.getElementById(`step-text-${step.id}`);
                if (iconSpan) iconSpan.innerHTML = '<i class="fas fa-check-circle check"></i>';
                if (textSpan) textSpan.innerHTML = `Rito OK: <strong>${step.label}</strong>`;

                appendCodeLine(`// > Retornou: ${formatJSONDump(result)}`, 'output');
                logsCompleted++;
            } catch (err) {
                overallSuccess = false;

                li.className = 'diagnostic-step-item failed';
                const iconSpan = document.getElementById(`step-icon-${step.id}`);
                const textSpan = document.getElementById(`step-text-${step.id}`);
                if (iconSpan) iconSpan.innerHTML = '<i class="fas fa-circle-exclamation cross"></i>';
                if (textSpan) textSpan.innerHTML = `Falha: <strong>${step.label}</strong>`;

                appendCodeLine(`// ❌ ERRO DE FLUXO: ${err.message}`, 'error');
                break;
            }

            await sleep(200);
        }

        await sleep(300);
        
        let summaryHTML = "";
        if (overallSuccess) {
            summaryHTML = `
                <i class="fa-solid fa-circle-check diagnostic-summary-icon success"></i>
                <div class="diagnostic-summary-text">
                    <h4>Runas Harmonizadas!</h4>
                    <p>Todos os motores e sub-renderizadores arcanos estão operando em perfeita sincronia.</p>
                </div>
            `;
            appendCodeLine(`// --- ALINHAMENTO CONFIRMADO EM 100% ---`, 'comment');
            appendCodeLine(`// Concluído com sucesso absoluto.`);
        } else {
            summaryHTML = `
                <i class="fa-solid fa-triangle-exclamation diagnostic-summary-icon failed"></i>
                <div class="diagnostic-summary-text">
                    <h4>Desarmonia Detectada!</h4>
                    <p>Um erro de motor foi retido na auditoria. Verifique a sintaxe do motor.</p>
                </div>
            `;
            appendCodeLine(`// --- AUDITORIA ENCERRADA COM FALHA ---`, 'error');
            appendCodeLine(`// Por favor, corrija as dependências e tente novamente.`);
        }

        summaryEl.innerHTML = summaryHTML;
        footerEl.classList.remove('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => DiagnoseModule.init());
export default DiagnoseModule;
