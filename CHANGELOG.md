# Changelog

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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
