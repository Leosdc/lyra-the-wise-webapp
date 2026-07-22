# Changelog

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Unreleased / Dev] - 2026-07-22

### Adicionado
- **Atualização do VTT Lyra (v0.0.7D2)** — Integração da nova build exportada do motor GDevelop VTT em `public/vtt/app/` com suporte a novas máscaras de sprites, botões e extensões de sistema.
- **Documentação de Dev Mode** — Atualização completa do `README.md` na branch `dev` com guia rápido para execução em ambiente de desenvolvimento, Firebase Local Emulator Suite e ferramentas de auditoria/diagnóstico.

### Alterado / Manutenção
- **Limpeza de Arquivos de Sistema** — Exclusão recursiva de arquivos `desktop.ini` do Windows em todo o repositório e consolidação das regras de bloqueio no `.gitignore`.
- **Sincronização da Branch `dev`** — Rebase e alinhamento do repositório local e remoto (`origin/dev`).

---

## [3.6.0] - 2026-05-26

### Adicionado
- **Portal de Auditoria e Diagnósticos Dedicado** — Criação de página dedicada `diagnose.html` em tela cheia com console simulado que exibe códigos e logs de teste em tempo real.
- **Múltiplos Sistemas RPG (Arquitetura de Plugins)** — Implementação de interfaces estruturadas de controle (`system-interface.js`, `system-registry.js`, `system-migrator.js`).
- **Plugin Vampire: The Masquerade V5** — Novo módulo nativo de regras e visualização adaptada de fichas em `vampire.js` ao lado do D&D 5e original.
- **Guia de Colaboração Local** — Criação de `firebase-colaborativo.md` com instruções completas para emulador do Firebase local e offline.

### Corrigido
- **Vazamento de Estado entre Sistemas** — SPA recarrega dados (`window.location.reload()`) limpando cache do wizard e datalists ao alternar sistemas RPG.
- **Ícones Orbitando e Giratórios no Diagnóstico** — Remoção da classe redundante `.spinning` nos ícones após finalização dos ritos.
- **Proteção do Histórico do Git** — Atualização do `.gitignore` para bloquear rastreamento de logs e histórico da IA de agentes.
- **Limpeza Recursiva do Sistema** — Eliminação completa de arquivos indesejados `desktop.ini` no repositório.

---

## [3.5.0] - 2026-05-13

### Adicionado
- **Convocador Unificado** — Novo modal centralizado (`combat-prep.js`) que unifica criação e convocação de Monstros e NPCs em um único fluxo
- **Campo de Disposição para NPCs** — Seletor de Aliado/Vilão/Neutro ao convocar NPCs existentes e ao criar novos via Forja Rápida
- **Persistência de Disposição** — Campo `disposition` adicionado ao schema de entidades (`data.js`) e propagado via `createLiteEntity`
- **Concluir Convocação funcional** — `finishStaging()` agora persiste entidades na sessão do Firestore, separando aliados (`allies`) e adversários (`linked_monsters`)
- **Extração de code fences no parser AI** — `safeParseJSON` (`ai.js`) agora extrai conteúdo de blocos ` ```json ``` ` antes de detectar delimitadores JSON

### Corrigido
- **Hover cortando texto nos cards da Arena** — Substituído `card-delete` com `position: absolute` por layout flexbox inline (`card-header-row`)
- **X e Cancelar redundantes** — Removido botão X do header; Cancelar no footer é o único ponto de saída
- **Gerador de Nomes falhando** — A IA retornava preamble como `[ACT AS]:` antes do JSON; o parser confundia com início de array
- **MagicWrite (Escrever com Magia) — erro 500** — Refatorado para usar `callProxy` com `systemInstruction` em vez de `callGeminiAPI` com token desnecessário
- **Ícone inexistente `fa-portal-enter`** — Substituído por `fa-dungeon` (Font Awesome 6.5.1 Free)

### Alterado
- **Tabs do Convocador simplificadas** — Colapsadas de 3 tabs (Bestiário/Monstros/NPCs) para 2 (Monstros/NPCs)
- **Botão de ação renomeado** — "Adicionar Entidade" → "Convocar Entidade" com ícone temático
- **CSS da Arena de Combate** — Novos estilos para `.card-header-row`, `.card-delete-inline`, `.disposition-select-mini`, `.entity-card-actions`, `.cancel-summon-btn`

---

## [3.4.3] - 2026-04-29

### Corrigido
- Alinhamento e truncagem de PV/CA nos cards do bestiário
- Estrutura de estatísticas do card de monstro refatorada
