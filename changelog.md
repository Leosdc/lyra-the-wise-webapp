# 📜 Registro de Alterações (Changelog)

Todas as grandes mudanças no Sanctum são registradas aqui para os historiadores futuros.


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
