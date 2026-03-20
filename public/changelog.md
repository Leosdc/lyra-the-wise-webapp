# 📜 Registro de Alterações (Changelog)

Todas as grandes mudanças no Sanctum são registradas aqui para os historiadores futuros.

## [3.4.0] - 2026-03-20
### 🧠 Separação dos Ecos & Polimento Arcano
- **Refatoração de Prompts (Arquitetura)**:
    - Criação do módulo dedicado `prompts.js`, extraindo todas as instruções de IA, identidades de persona, flavor texts, schemas de módulos e prompt builders do `ai.js`.
    - Separação de responsabilidades: `ai.js` agora cuida apenas de rede/proxy, enquanto `prompts.js` centraliza toda a lógica de prompts para facilitar iteração e manutenção.
- **Refinamento de Combate**:
    - Ajustes nos módulos `combat-damage.js`, `combat-engine.js` e `combat-ui.js` para maior estabilidade e fluidez no fluxo de batalha.
- **Polimento Visual & CSS**:
    - Overhaul de animações (`animations.css`) com novas transições e efeitos visuais.
    - Refinamento de estilos nos módulos: Wizard, Itens, Sessão de Combate, Palco de Sessão, Painel do GM, Dados e Dashboard.
    - Ajustes globais em `style.css`, `base.css` e `utilities.css` para consistência visual.
- **Melhorias de Módulos**:
    - Aprimoramentos no Wizard de criação de personagem, Oracle, Itens, Magias, Monstros, Gerador de Nomes e Módulos de Conteúdo.
    - Refinamento do Painel do GM e sistema de convites.
    - Correções no fluxo de chat principal (`app-chat.js`).

## [3.3.0] - 2026-03-02
### 🏛️ Ascensão do Atrium & Otimização Ancestral
- **Refatoração de Núcleo**:
    - Otimização massiva do `index.html`, reduzindo drasticamente o número de linhas para melhor performance e facilidade de manutenção.
- **Auditoria de Banco de Dados**:
    - Adição do botão de download de JSON no módulo de auditoria para facilitar a exportação e backup de dados.
- **Aprimoramento do Atrium**:
    - Integração profunda com as fichas de personagens, vinculando atributos e informações vitais.
    - Suporte a rolagens de dados diretamente no fluxo do Atrium, facilitando a interação e o combate.

## [3.2.0] - 2026-02-21
### 🏰 Fortaleza Arcaica & Nuvem Soberana
- **Migração para App Hosting**:
    - Transição completa da infraestrutura para o **Firebase App Hosting**, garantindo builds atômicas e deploy contínuo via GitHub.
- **Segurança Nível Cofre**:
    - **Secret Manager**: Chaves sensíveis (Gemini API) agora residem em cofres protegidos, eliminando riscos de vazamento em código ou ambiente.
    - **Blindagem de Entrada**: Integração do **DOMPurify** em todos os fluxos de chat e narrativa para sanitização total contra ataques XSS.
    - **Protocolos de Defesa (CSP)**: Implementação de Content Security Policy rígida via **Helmet** para proteger o navegador dos viajantes.
- **Otimização de Pulso & Sincronia**:
    - **Parallel Fetching**: Consultas paralelas ao Firestore para carregar sessões de heróis, reduzindo a latência de carregamento.
    - **Logging Centralizado**: Novo sistema de logs para diagnóstico rápido de pulso sem poluir o console de produção.
- **Refinamento de Infraestrutura**:
    - Dockerfile otimizado para a nova infraestrutura.
    - Configurações centralizadas via `apphosting.yaml`.

## [3.1.0] - 2026-02-18

### ⚒️ Forja Global & Harmonia de Combate
- **Geração Global de Conteúdo**:
    - Lançamento das ferramentas de criação instantânea de NPCs, Tramas e Masmorras via Oráculo Arcano.
- **Tipografia Híbrida**:
    - Overhaul visual completo combinando a elegância de **Eagle Lake** (títulos e botões) com a legibilidade superior de **Montserrat** (corpo de texto e chat).
- **Sincronização de Combate**:
    - **HP Unificado**: Correção de discrepância de HP e CA entre a barra lateral (Sidebar) e os cards de aliados.
    - **Multisync**: Sincronização automática de vida entre todas as coleções do sistema (`allies`, `linked_monsters`, `sessionNPCs`).
    - **Deduplicação**: Fim dos participantes fantasma/duplicados na iniciativa.
- **Correções de Bugs**:
    - **Mensagens de Ataque**: Ataques manuais agora geram blocos estruturados (Rolagem/Dano) no chat.
    - **Action Modal**: Fix de `ReferenceError: target is not defined` ao abrir ações de herói.

## [3.0.0] - 2026-02-10
### 🎲 O Mestre Digital & Interatividade Total
- **Oracle AI Master System**:
    - **Auxílio Narrativo & Imersão**: A IA agora enriquece a narrativa, provê detalhes sensoriais e sugere ganchos dramáticos sob supervisão do Mestre.
    - **Sugestão de Rolagens**: O sistema agora sugere testes de perícia pertinentes à cena (`[ROLL]`) que geram **Cards Interativos** para o Mestre decidir quando enviar aos jogadores.
- **Interatividade no Chat**:
    - **Pop-ups de Monstros**: Clicar em nomes de monstros no texto da narrativa agora abre ficha detalhada (sem precisar ir ao bestiário).
    - **Tags Inteligentes**: Suporte a tags `[COMBAT]`, `[ROLL]` e `[MONSTER]` para automação fluida.
- **Infraestrutura**:
    - Novo módulo `roll-request.js` para gerenciar solicitações de dados.
    - Refinamento do `content-parser.js` para criar links clicáveis para criaturas.

## [2.9.0] - 2026-02-09
### 🔮 Oráculo Arcano & Refinamento de Sessões

**Sistema Oracle Completo**:
- Implementação do modo Oracle para sessões com IA narrativa contextual
- Integração com fichas de personagens, NPCs, itens e conteúdo vinculado
- Sistema de mensagens com tipos (narrative, summary, error)
- Parser de conteúdo dinâmico para extrair itens e NPCs das respostas

**Correções Críticas de Sessão**:
- Fix de race condition que mostrava controles de GM para jogadores
- Correção de `items.filter is not a function` ao carregar dados de personagem
- Validação `Array.isArray()` para spells e inventory antes de usar `.filter()`
- Correção de `char.spells` → `char.spellbook` no Oracle

**Melhorias de UI**:
- Redesign completo de modais com layout centralizado e visual premium
- Correção de contraste de texto no tema Eldrin (mensagens vazias)
- Fix de botões do Oracle no tema Lyra (texto/ícone escuros em fundo dourado)
- Espaçamento adequado em mensagens do chat (timestamp separado)
- Estilização de mensagens Oracle com gradientes e sombras

**Correções de Dados**:
- Fix de parsing de datas em sessões (suporte a Firestore Timestamp)
- Formatação pt-BR para datas (DD/MM/AAAA)
- Correção de filtro de NPCs para excluir monstros do bestiário
- Criação de função `getUserNPCs()` separada de `getUserMonsters()`

**Documentação**:
- Guia de configuração do Oracle com soluções para índice Firestore e CORS

## [2.8.0] - 2026-02-07
### 🔔 Alertas da Guilda & Resiliência do Sanctum
- **Notificações da Comunidade**:
    - Implementação de um sistema de alerta visual (ícone piscante) no painel para novas mensagens na taverna global.
    - Rastreamento inteligente de mensagens lidas usando `localStorage`.
    - Auto-scroll aprimorado: o chat agora abre automaticamente nas mensagens mais recentes com transição suave.
    - Sincronização em background: notificações funcionam mesmo se você estiver em outra aba do app.
- **Resiliência do Modo de Manutenção**:
    - Otimização do carregamento de configurações globais para evitar falhas de permissão do Firebase.
    - Sistema de "Fail-safe": se o oráculo falhar ao ler as configurações, o Sanctum permanece aberto por padrão.
    - Melhoria no fluxo de autenticação para visitantes (não logados), garantindo acesso seguro ao status de manutenção.
- **Refinamento de UX**:
    - Adição de logs de diagnóstico (`🌐`, `🔔`) para monitoramento em tempo real do pulso da comunidade.

## [2.7.1] - 2026-02-06
### 📖 Biblioteca de Regras do Sistema (D&D 5e)
- **Integração de Regras Oficiais**: População completa das regras básicas de D&D 5e (Combate, Magia, Condições, etc.) no Grande Arquivo.
- **Migração Dinâmica**: Novo comando no Portal do GM para transcrever regras do tomo local para a nuvem.
- **Navegação de Sistema**: Módulo de Regras agora diferencia corretamente entre "Regras do Sistema" (Oficiais) e "Minhas Regras" (Homebrews).
- **Refinamento de DataModule**: Implementação de busca de dados específicos do sistema no Firestore.

## [2.7.0] - 2026-02-05
### 🔮 A Expansão do Oráculo & Módulos Narrativos (Alfa)
- **Módulos de Conteúdo Expandidos**: Implementação de 11 novos módulos de criação com suporte total ao Oráculo Arcano:
    - Vilões, NPCs, Campanhas, Encontros, Puzzles, Tesouros, Cenas, Tramas, Motivações, Regras e Armadilhas.
- **Invocação Dinâmica**:
    - Novo sistema de escolha (Invocação Manual vs. Arcana) padronizado para todos os módulos novos.
    - Layout de prompt unificado e compacto (5 linhas) para máxima eficiência.
    - Ícones dinâmicos nos modais de criação refletindo a natureza do conteúdo.
- **Refinamento de Dados Arcanos**:
    - Remoção de artefatos de texto (`**`) nas descrições geradas pela IA para uma leitura mais orgânica.
    - Sistema de conversão inteligente para listas e valores (adeus `[object Object]`).
- **Estabilização do Fluxo**:
    - Correção de loop infinito em event listeners de módulos de conteúdo.
    - Limpeza de ecos (logs) desnecessários no console para maior performance.
    - Substituição de runas (ícones) premium por versões universais para visibilidade total.


## [2.6.0] - 2026-02-03
### 🐉 O Despertar das Criaturas & Imersão Arcana
- **Módulo de Bestiário**: Lançamento completo do Bestiário com busca avançada, galeria de monstros e sistema de criação (Invocação Manual e Arcana).
- **Padronização Visual**:
    - Unificação de todos os modais de escolha para o tema "Pergaminho Premium".
    - Conversão de botões de div para `<button>` para melhor interatividade.
    - Proporção unificada de 5 linhas para todos os campos de prompt arcano.
- **Imersão Arcana (Zero IA)**: Purga completa do termo "IA" de toda a interface, substituído por termos temáticos como "Oráculo", "Mente Arcana" e "Vontade Superior".
- **Refinamento de UX**:
    - Standardização de larguras para modais pequenos (600px).
    - Melhoria na tipografia e espaçamento dos botões de ação em modais.
- **Correção de Bugs**:
    - Fix de dimensionamento inconsistente no prompt de monstros.
    - Correção de placeholders técnicos no wizard de personagem.
    - Ajuste de contraste e legibilidade em campos de texto.

## [2.5.0] - 2026-01-31
### 📜 A Era de Ouro: D&D 5e Completo
- **Ficha 100% Funcional**: Conclusão de todos os sistemas vitais para D&D 5ª Edição.
- **Grimório Arcano Completo**: Sistema de magias robusto com busca inteligente, ícones oficiais das escolas de magia (.png) e detalhes expandidos.
- **Mochila Inteligente**: Itens agora possuem empilhamento automático (incremento de quantidade) e detecção de duplicatas.
- **Ataques Sincronizados**: Armas adicionadas ao inventário aparecem automaticamente nos ataques. Remoção inteligente: ao descartar uma arma da mochila, o ataque correspondente é banido da ficha.
- **Interface Blindada**: 
    - Correção do bug de "Nomes Vazantes" (onde itens sobrescreviam o nome do herói).
    - Remoção de botões redundantes e limpeza visual nas janelas de detalhes.
    - Nova grade de combate com labels dinâmicos e ícones decorativos.
- **Segurança de Dados**: Sincronização reforçada entre cabeçalho, lista de personagens e banco de dados.

## [2.4.0] - 2026-01-29
### ⚒️ Forja de Relíquias & Sincronia de Visão
- **Invocação Cinemática**: Nova animação "Tecendo a Trama" (runas giratórias com brasas) para a forja de itens, substituindo alertas estáticos.
- **Arsenal Pessoal**: Implementação completa de **Editar**, **Excluir** e **Compartilhar** para itens de sistema e pessoais.
- **Visibilidade de Ação**: Botões de ação em cards agora são 60% visíveis por padrão e ficam sobrepostos corretamente no canto superior.
- **Persistência de Origem**: O sistema agora lembra se você estava visualizando itens do sistema ou pessoais após atualizações/refreshes.
- **Correção de Fluxo**: O modal de criação agora fecha automaticamente após o sucesso da forja e renderiza a lista instantaneamente.

## [2.3.1] - 2026-01-24
### 🎻 A Balada de Eldrin & Ajustes de Harmonia
- **Tema Eldrin (Beta)**: Implementação completa do tema "Eldrin, The Bard" (Azul e Dourado) com música e token dedicados.
- **Harmonia Musical**: Correção no player de música para exibir corretamente o nome da faixa em todos os temas (Lyra, Damien, Eldrin).
- **Legibilidade**: Ajuste de contraste no popup "Versão Alpha" para garantir leitura clara em fundos claros e escuros.
- **Lírica Sincronizada**: As letras da tela inicial agora respeitam a música do personagem ativo.

## [2.3.0] - 2026-01-23
### 🎭 Personas Dinâmicas & Polimento Visual
- **Wizard Duplo**: O criador de personagens agora reage ao tema. Lyra guia com sabedoria, enquanto Damien (tema roxo) oferece conselhos cínicos e voltados ao poder.
- **Cobertura Total**: Ambos os tutores agora guiam todos os campos, incluindo Alinhamento, Velocidade e a aba completa de Crônicas.
- **Refinamento de UI**:
    - Ajuste fino na posição do botão de fechar (X).
    - Fontes temáticas (*Cinzel*) aplicadas consistentemente na aba Crônicas.
    - Correção de legibilidade nos inputs do tema Damien.
    - Ícones de Saves de Morte corrigidos e coloridos no tema Damien.
- **Tradução**: Atributos da ficha forçados para PT-BR (FOR, DES, CON, INT, SAB, CAR).

### 🎨 Refinamento Visual & Unificação Estrutural
- **Novo Layout da Ficha**: Cabeçalho do personagem reestruturado em Grid de duas linhas para melhor visualização (Nome/Nível e Detalhes/Save).
- **CSS Modularizado**: Reorganização completa dos arquivos de estilo em módulos (`layout`, `components`, `sheet`, etc.) com unificação de variáveis.
- **Restauração de Funcionalidades**: Barra de Carga (Load/Encumbrance) visualmente restaurada no inventário e correção de quebra de linha nos Dados de Vida.
- **Polimento Global**: Ajuste de margens nas abas da ficha, posicionamento do nome no cabeçalho global e correção do nome da música tema de Damien.

## [2.1.0] - 2026-01-21
### ⚙️ Personalização & Suavização Arcana
- **Portal de Configurações**: Novo menu de ajustes de perfil (Apelido, WhatsApp, Bio).
- **Arsenal de Cursores**: Implementação de 12 cursores temáticos (Espadas, Cajados e Poções) com persistência local.
- **Fidelidade Computacional**: Validação do motor D&D 5e contra o "Modelo Computacional de D&D 5ª Edição" (Fórmulas exatas de HP, Modificadores e Proficiência).
- **Refinação de UX**: Suavização do modal de exclusão (adeus "Sentença de Apagamento") e layout vertical de perfil.

## [2.0.0] - 2026-01-19
### 🐉 A Ascensão da Ficha D&D 5e (Alfa 2.0)
- **Fichas Dinâmicas**: Implementação de listas editáveis para Ataques, Magias e Itens.
- **Lyra 2.0 (Identity Update)**: IA atualizada com expertise profunda em PHB e DMG (Maneirismos, Aparência e Talentos).
- **Cálculos Automáticos**: HP dinâmico (HitDie + CON), Bônus de Proficiência e Modificadores em tempo real.

## [1.0.0] - 2026-01-18
### ⚔️ Migração: O Despertar do WebApp
- **Nova Fundação**: Migração completa das funcionalidades do bot do Discord para uma Single Page Application (SPA).
- **Design System Imperial**: Implementação de uma interface medieval premium com glassmorphism, pergaminhos dinâmicos e ativos originais do projeto.
- **Infraestrutura Serverless**: Substituição do servidor EC2 por um **Google Apps Script Proxy**, tornando a IA mais rápida e barata.
- **Segurança Reforçada**: Integração com Firebase Auth para login com Google e validação de tokens no backend.
- **Libram de Heróis**: Sistema de fichas multi-tab funcional e persistente no Cloud Firestore.
- **IA Lírica**: Integração total com o modelo **Gemini 2.0 Flash** para conversas imersivas.

---
*Para mais detalhes, consulte os commits do repositório.*
