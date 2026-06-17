# Modelo de Mensagens de Commit

Este arquivo serve como instrução e padrão para a elaboração de mensagens de commit informativa e estruturada ao final de cada etapa de desenvolvimento.

## Estrutura Recomendada

A mensagem de commit deve seguir a estrutura baseada em Conventional Commits, mas contendo um corpo detalhado em português que liste as alterações por arquivo:

```text
<tipo>(<escopo>): <título curto em português>

- <Descrição geral do que foi feito nesta etapa>
- Modificações por arquivo:
  - [NOVO] <caminho/do/arquivo>: <descrição das novidades implementadas no arquivo>
  - [MODIFICAR] <caminho/do/arquivo>: <detalhamento das alterações realizadas em código existente>
  - [DELETE] <caminho/do/arquivo>: <motivo da exclusão do arquivo>
```

## Tipos de Commit Comuns

- **feat**: Uma nova funcionalidade ou componente.
- **fix**: Correção de algum bug ou comportamento inadequado.
- **refactor**: Alterações que não corrigem bugs nem adicionam funcionalidades, mas melhoram a qualidade do código.
- **style**: Ajustes de formatação, estilos CSS, sem impacto na lógica.
- **docs**: Atualização de documentações ou comentários.

## Exemplo Real (Etapa 1)

```text
feat(wizard): estruturar layout e estilos para as habilidades do vampiro (V20)

- Organização visual das Habilidades divididas em três categorias (Talentos, Perícias, Conhecimentos).
- Modificações por arquivo:
  - [NOVO] js/modules/wizardVampire/renderVampAbilityRow.js: Componente para renderizar linhas individuais de habilidade com controle de bolinhas ativas e limite inicial de nível 3.
  - [NOVO] js/modules/wizardVampire/renderVampireAbilitiesGrid.js: Layout principal do grid de habilidades com seletores de prioridade por coluna.
  - [MODIFICAR] css/modules/wizard.css: Inclusão de regras css para desativação visual e cursor não permitido para a 4ª e 5ª bolinhas.
  - [MODIFICAR] js/modules/wizardVampire/wizardVampireMain.js: Registro e exportação das novas funções de habilidades.
  - [NOVO] js/modules/wizardVampire/bindVampireAbilityEvents.js: Estrutura temporária para eventos de cliques e mudanças de prioridade.
  - [NOVO] js/modules/wizardVampire/updateVampireAbilityPoints.js: Estrutura temporária para cálculo de pontos.
```
