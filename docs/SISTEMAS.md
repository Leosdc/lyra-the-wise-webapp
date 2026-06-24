# Guia de Desenvolvimento de Sistemas RPG (SystemPlugin)

Este pergaminho documenta formalmente o contrato de desenvolvimento exigido para criar e integrar novos sistemas de RPG (como *Vampire: The Masquerade*, *Tormenta20*, *Cthulhu*, etc.) no ecossistema do **Lyra the Wise WebApp**.

A interface está estruturada de forma altamente modularizada e orientada a plugins, definida tecnicamente em [`js/systems/system-interface.js`](file:///c:/Users/PC/Documents/Bots/Lyra%20the%20Wise%20WebApp/js/systems/system-interface.js).

---

## 🧭 Metadados do Sistema

Todo plugin de sistema deve ser registrado no `SystemRegistry` e exportar o seguinte objeto contendo os metadados base:

| Propriedade | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` *(obrigatório)* | `string` | Identificador único textual em minúsculas (ex: `'dnd5e'`, `'vampire'`). |
| `name` *(obrigatório)* | `string` | Nome de exibição nas tavernas e seleções do portal (ex: `'D&D 5ª Edição'`). |
| `implemented` *(obrigatório)* | `boolean` | Flag indicando se o motor está operacional (`true`) ou em rascunho (`false`). |
| `version` *(opcional)* | `string` | Versão técnica do plugin (ex: `'1.0.0'`). |
| `icon` *(opcional)* | `string` | Ícone de FontAwesome correspondente (ex: `'fa-dragon'`, `'fa-bat'`). |

---

## 📁 1. Módulos de Dados (Obrigatórios)

Esses métodos definem a estrutura óssea do seu personagem. Devem ser síncronos e retornar estruturas limpas.

### `getTemplate()`
Retorna um objeto com a ficha de personagem vazia e todos os campos iniciais.
```javascript
getTemplate() {
    return {
        bio: { name: "", class: "", race: "", level: 1 },
        attributes: { str: 10, dex: 10 },
        stats: { hp_max: 10, hp_current: 10, ac: 10 },
        inventory: { items: [] },
        story: { backstory: "" }
    };
}
```

### `getCreationData()`
Dropdowns dinâmicos consumidos no criador de personagens (Wizard).
```javascript
getCreationData() {
    return {
        races: ["Humano", "Elfo"],
        classes: ["Guerreiro", "Mago"],
        backgrounds: ["Acólito", "Nobre"],
        alignments: ["Neutro"],
        subraces: { "Elfo": ["Alto Elfo"] },
        archetypes: { "Guerreiro": ["Campeão"] }
    };
}
```

### `getAttributeConfig()`
Configuração dos atributos fundamentais do jogo (exibidos no painel e no Wizard).
```javascript
getAttributeConfig() {
    return [
        { id: 'str', label: 'Força', shortLabel: 'FOR', description: 'Potência física' }
    ];
}
```

### `getSkillConfig()` e `getSaveConfig()`
Configurações de perícias e salvamentos (testes de resistência), vinculando cada um ao atributo base.
```javascript
getSkillConfig() {
    return [
        { id: 'atletismo', label: 'Atletismo (For)', attribute: 'str', description: 'Escalar ou correr' }
    ];
}
```

---

## 🧮 2. Módulos de Cálculos (Obrigatórios)

### `calculateStats(character)`
É o cérebro das regras. Recebe o objeto do personagem e retorna um objeto computado contendo modificadores derivados, atributos finais e estatísticas calculadas de forma determinística.
*   **Importante:** Nunca modifique a ficha do banco diretamente aqui; retorne estatísticas derivadas prontas para exibição dinâmica.

### `calculateInitiativeBonus(character)`
Retorna estritamente o valor numérico que deve ser adicionado ao dado de 20 faces para resolver combates e ordens de turnos.

---

## 🎨 3. Módulos de Interface Visual (Obrigatórios)

Esses métodos constroem as frações HTML dinâmicas exibidas na ficha. Recebem os dados originais do personagem, as estatísticas calculadas e um objeto `helpers` com atalhos de inputs controlados (`helpers.mkInput` e flag `helpers.isInspection`).

*   `renderSheetScores(char, stats, helpers)`: HTML dos cards de atributos.
*   `renderSheetSaves(char, stats, helpers)`: HTML da coluna de jogadas de salvamento.
*   `renderSheetSkills(char, stats, helpers)`: HTML da listagem de perícias.
*   `renderSheetCombatTab(char, stats, helpers)`: HTML específico da aba de combate (como death-saves em D&D).

---

## 🔮 4. Módulos de Inteligência Artificial (Obrigatórios)

Esses prompts servem para treinar a IA do portal para tecer histórias condizentes com a atmosfera do seu jogo.

*   `getPromptContext()`: Retorna o contexto em string rápida (ex: `"Vampire: The Masquerade 5ª Edição"`).
*   `getEntityPrompt(entityType, prompt, flavor)`: Retorna o prompt mestre de sistema focado na geração estruturada de Monstros (`monster`) ou NPCs (`npc`) em formato JSON válido.
*   `getCharacterPrompt()`: Retorna o prompt mestre instruindo a IA a tecer crônicas, defeitos, laços e aparências do personagem em pt-BR.

---

## 🌟 5. Extensões Opcionais (Dry-runs no Auditor de Sistemas)

Estes métodos opcionais são exibidos na aba de **Auditoria de Sistemas**. Se declarados, o motor de auditoria executará testes rigorosos (dry-runs) para garantir compatibilidade sintática e estrutural.

| Método Opcional | Categoria | Descrição |
| :--- | :--- | :--- |
| `renderSheetMagicTab` | **UI** | Retorna o bloco HTML da aba de magia (ou `'supported'`). |
| `getSheetTabs` | **UI** | Altera e redefine a ordem/ícones das abas principais da ficha. |
| `renderSheetHeader` | **UI** | Adiciona campos e cabeçalhos customizados no topo da ficha. |
| `getWizardSteps` | **Wizard** | Retorna os passos lógicos sequenciais do Wizard de criação. |
| `renderWizardStep` | **Wizard** | Cospe a fração HTML específica de um passo do Wizard customizado. |
| `gatherWizardData` | **Wizard** | Varre e agrupa os dados coletados na interface do Wizard do sistema. |
| `getItemPrompt` | **AI Prompt** | Constrói o Prompt Arcano para a IA forjar itens temáticos. |
| `getSpellPrompt` | **AI Prompt** | Constrói o Prompt Arcano para a IA tecer magias temáticas. |
| `getAbilityPrompt` | **AI Prompt** | Constrói o Prompt Arcano para a IA criar talentos ou habilidades. |
| `getNamesPrompt` | **AI Prompt** | Solicita que a IA gere sugestões de nomes condizentes com raça/classe. |

---

## 🛠️ Como Registrar Seu Sistema

Uma vez implementado o objeto que satisfaz a interface acima, basta importá-lo e registrá-lo utilizando o seguinte rito:

```javascript
import SystemRegistry from './system-registry.js';

export const MeuNovoRPGPlugin = {
    id: 'meu_rpg',
    name: 'Meu RPG Customizado',
    implemented: true,
    // ... implementar funções críticas e opcionais ...
};

// Registro automático ao carregar
SystemRegistry.register(MeuNovoRPGPlugin);
```
