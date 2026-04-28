**Data:** 2026-04-28 | **Agente:** [/executor]
- Corrigido caminho de busca de magias para `systems/{systemId}/spells`.
- Implementada normalização exaustiva de dados (`name`, `level`, `school`, `castingTime`, `range`, `duration`, `components`, `classes`) para unificar o esquema legível pela UI.
- Corrigido crash de `localeCompare` adicionando filtros de segurança e fallbacks em `spells.js`.
- Implementada lógica de **Retry com Exponential Backoff** no proxy de IA para mitigar erros 429 (Limite de Taxa) do modelo Gemini 2.0 Flash.
- Corrigido bug de exibição onde campos de detalhe e tags de classe apareciam vazios ou com "-".
- Estabilizada conectividade de IA através do modelo `gemini-2.5-flash-lite` com sistema de fallback e retries automáticos.
- Sistema de Grimório e Wizard agora operacionais com 100% de normalização de dados.
