# O Modelo Computacional de Dungeons & Dragons 5ª Edição: Uma Análise Sistêmica de Algoritmos e Fórmulas para Desenvolvimento de Aplicações

A arquitetura matemática de Dungeons & Dragons 5ª Edição (5e) é fundamentada no princípio de design conhecido como _Bounded Accuracy_ (Precisão Limitada). Este paradigma busca mitigar a inflação numérica observada em edições anteriores, garantindo que os bônus aplicados aos testes de dados permaneçam dentro de uma faixa controlada ao longo da progressão do personagem do nível 1 ao 20.<sup>1</sup> Para desenvolvedores que buscam implementar estas regras em aplicações web ou ferramentas digitais, a compreensão do sistema não exige apenas a transcrição de tabelas, mas a modelagem de uma rede complexa de dependências onde variáveis base, como os atributos, propagam atualizações em tempo real para módulos de combate, exploração e economia de recursos.<sup>3</sup>

## 1\. A Estrutura de Atributos e a Lógica de Modificadores

No centro de qualquer criatura no ecossistema de 5e estão os seis valores de habilidade: Força (Strength), Destreza (Dexterity), Constituição (Constitution), Inteligência (Intelligence), Sabedoria (Wisdom) e Carisma (Charisma). Embora o valor bruto (score) varie geralmente de 1 a 30, a unidade funcional utilizada na quase totalidade dos cálculos do sistema é o Modificador de Habilidade.<sup>5</sup>

### 1.1 O Algoritmo de Derivação do Modificador

A relação entre um valor de habilidade e seu modificador é linear e governada por uma função de arredondamento para baixo, aplicada universalmente no sistema. Para um desenvolvedor, esta fórmula deve ser tratada como a função raiz de qualquer motor de regras de D&D.<sup>7</sup>

A fórmula matemática para determinar o modificador é:

\$\$\\text{Modificador} = \\lfloor (\\text{Valor} - 10) / 2 \\rfloor\$\$

Esta fórmula estabelece que um valor de 10 ou 11 (a média humana) resulta em um modificador de +0. Cada aumento de dois pontos no valor bruto resulta em um incremento de +1 no modificador, enquanto cada redução de dois pontos resulta em um decréscimo de -1.<sup>6</sup>

| **Valor de Habilidade** | **Modificador** | **Valor de Habilidade** | **Modificador** |
| --- | --- | --- | --- |
| 1   | \-5 | 16-17 | +3  |
| --- | --- | --- | --- |
| 2-3 | \-4 | 18-19 | +4  |
| --- | --- | --- | --- |
| 4-5 | \-3 | 20-21 | +5  |
| --- | --- | --- | --- |
| 6-7 | \-2 | 22-23 | +6  |
| --- | --- | --- | --- |
| 8-9 | \-1 | 24-25 | +7  |
| --- | --- | --- | --- |
| 10-11 | +0  | 26-27 | +8  |
| --- | --- | --- | --- |
| 12-13 | +1  | 28-29 | +9  |
| --- | --- | --- | --- |
| 14-15 | +2  | 30  | +10 |
| --- | --- | --- | --- |

Ao implementar este modelo em um webapp, é essencial que a mudança no valor bruto dispare um observador que atualize todos os valores derivados, pois o modificador impacta diretamente bônus de ataque, classes de armadura, testes de resistência e perícias.<sup>5</sup>

### 1.2 Mapeamento de Perícias e Dependências de Atributos

As perícias (skills) são extensões dos atributos básicos. Cada uma das 18 perícias padrão está vinculada a um atributo específico, embora o mestre possa permitir variações em contextos específicos (como um teste de Força para Intimidação).<sup>8</sup> No entanto, para a lógica padrão de uma aplicação, o mapeamento é estático.

| **Atributo** | **Perícias Associadas** |
| --- | --- |
| Força | Atletismo |
| --- | --- |
| Destreza | Acrobacia, Furtividade, Prestidigitação |
| --- | --- |
| Inteligência | Arcanismo, História, Investigação, Natureza, Religião |
| --- | --- |
| Sabedoria | Adestrar Animais, Intuição, Medicina, Percepção, Sobrevivência |
| --- | --- |
| Carisma | Atuação, Enganação, Intimidação, Persuasão |
| --- | --- |
| Constituição | Nenhuma (focada em saúde e concentração) |
| --- | --- |

## 2\. O Motor de Proficiência e Escalonamento Global

O Bônus de Proficiência (PB) é a principal variável de escalonamento horizontal em 5e. Diferente de sistemas onde o bônus de ataque ou bônus de perícia aumentam de forma independente por classe, em 5e o PB é estritamente vinculado ao nível total do personagem, independentemente de como os níveis são distribuídos em multiclasse.<sup>6</sup>

### 2.1 Progressão do Bônus de Proficiência por Nível

O PB começa em +2 no nível 1 e aumenta em +1 a cada quatro níveis (nos níveis 5, 9, 13 e 17). Esta progressão é idêntica para todas as classes, monstros (usando o ND - Nível de Desafio) e NPCs.<sup>12</sup>

| **Nível Total do Personagem** | **Bônus de Proficiência** | **Experiência Total (XP)** |
| --- | --- | --- |
| 1-4 | +2  | 0 - 2.700 |
| --- | --- | --- |
| 5-8 | +3  | 6.500 - 34.000 |
| --- | --- | --- |
| 9-12 | +4  | 48.000 - 100.000 |
| --- | --- | --- |
| 13-16 | +5  | 120.000 - 195.000 |
| --- | --- | --- |
| 17-20 | +6  | 225.000 - 355.000 |
| --- | --- | --- |

Para uma aplicação web, o Bônus de Proficiência deve ser uma variável global calculada com base no Sum(ClassLevels). Este bônus é aplicado a qualquer teste onde o personagem possua proficiência, incluindo ataques com armas, testes de resistência e perícias específicas.<sup>6</sup>

### 2.2 Modificadores de Proficiência: Especialização e Meia-Proficiência

O sistema introduz variações matemáticas sobre o PB para certas classes e talentos. Duas implementações críticas são:

- **Especialização (Expertise):** Comumente disponível para Ladinos e Bardos, esta regra dobra o valor do bônus de proficiência para perícias escolhidas: \$PB_{final} = PB \\times 2\$.<sup>6</sup>
- **Pau para Toda Obra (Jack of All Trades):** Recurso de Bardo que permite adicionar metade do bônus de proficiência (arredondado para baixo) a testes de habilidade nos quais o personagem não é proficiente: \$PB_{final} = \\lfloor PB / 2 \\rfloor\$.<sup>15</sup>

## 3\. Dinâmicas de Combate: Defesa, Ataque e Dano

O combate em D&D 5e é resolvido através de um sistema binário de sucesso ou falha, onde o atacante tenta igualar ou superar um valor alvo definido pelo defensor.<sup>16</sup>

### 3.1 Cálculo da Classe de Armadura (CA)

A Classe de Armadura representa a dificuldade de atingir uma criatura. O sistema oferece múltiplos métodos de cálculo, mas eles são geralmente mutuamente exclusivos. Uma aplicação deve permitir que o usuário escolha o método de cálculo ou selecione automaticamente o mais vantajoso, a menos que uma regra específica (como uma armadura equipada) force um método.<sup>18</sup>

#### 3.1.1 Defesa Sem Armadura

Existem várias fórmulas para personagens que não vestem armadura:

- **Padrão:** \$10 + \\text{Modificador de Destreza}\$.<sup>18</sup>
- **Defesa Sem Armadura (Bárbaro):** \$10 + \\text{Mod. Destreza} + \\text{Mod. Constituição}\$. Permite o uso de escudo.<sup>18</sup>
- **Defesa Sem Armadura (Monge):** \$10 + \\text{Mod. Destreza} + \\text{Mod. Sabedoria}\$. Não permite o uso de escudo.<sup>18</sup>
- **Resiliência Dracônica (Feiticeiro):** \$13 + \\text{Mod. Destreza}\$.<sup>20</sup>
- **Armadura Natural:** Algumas raças como Lizardfolk têm base 13 + Destreza, enquanto Tortles têm um valor fixo de 17 que ignora o bônus de Destreza.<sup>18</sup>

#### 3.1.2 Armaduras Equipadas

As armaduras são divididas em três categorias que alteram a forma como a Destreza interage com a CA.<sup>16</sup>

| **Categoria** | **Fórmula de CA** | **Limite de Destreza** |
| --- | --- | --- |
| Armadura Leve | \$Base + \\text{Mod. Destreza}\$ | Sem limite |
| --- | --- | --- |
| Armadura Média | \$Base + \\text{Mod. Destreza}\$ | Máximo de +2 |
| --- | --- | --- |
| Armadura Pesada | \$Base\$ | Ignora Destreza (positiva ou negativa) |
| --- | --- | --- |

O uso de um Escudo adiciona um bônus fixo de +2 à CA, independentemente do tipo de armadura usada, desde que o personagem tenha proficiência.<sup>16</sup>

### 3.2 Algoritmos de Ataque e Rolagens de Dano

O sucesso de um ataque é determinado pela comparação do resultado final com a CA do alvo. A regra de ouro é: "Igualou, acertou" (Meets it, beats it).<sup>16</sup>

#### 3.2.1 Bônus de Ataque

A fórmula para o bônus de ataque é:

\$\$\\text{Bônus de Ataque} = \\text{Modificador de Atributo} + \\text{Bônus de Proficiência} + \\text{Bônus Mágicos/Outros}\$\$

- **Armas de Combate Próximo:** Utilizam Força por padrão.<sup>22</sup>
- **Armas à Distância:** Utilizam Destreza por padrão.<sup>22</sup>
- **Propriedade Acuidade (Finesse):** Permite ao atacante escolher entre Força ou Destreza para ambos os cálculos (ataque e dano).<sup>22</sup>
- **Ataques de Magia:** Utilizam o modificador de conjuração da classe (Inteligência, Sabedoria ou Carisma) + PB.<sup>12</sup>

#### 3.2.2 Cálculo de Dano

Diferente do ataque, o dano raramente inclui o bônus de proficiência.<sup>23</sup>

\$\$\\text{Resultado do Dano} = \\text{Dado da Arma} + \\text{Modificador de Atributo} + \\text{Bônus Mágicos}\$\$

Em casos de combate com duas armas, o modificador de atributo não é adicionado ao dano do ataque realizado com a ação bônus, a menos que o modificador seja negativo ou o personagem possua o Estilo de Luta correspondente.<sup>17</sup>

### 3.3 A Matemática dos Acertos Críticos

Um acerto crítico ocorre quando o dado natural de 20 (d20) é rolado, resultando em um sucesso automático e dano extra.<sup>28</sup> A regra padrão estipula:

- Dobre todos os dados de dano associados ao ataque.
- Mantenha os modificadores fixos inalterados.<sup>28</sup>

Exemplo computacional: Um ataque de um Ladino com uma adaga (1d4 + 3) e Sneak Attack (2d6). Em um crítico, a aplicação deve rolar \$2d4 + 4d6 + 3\$. Dados extras de magias como _Hex_ ou _Hunter's Mark_ também são dobrados, mas danos que dependem de testes de resistência subsequentes (como venenos) geralmente não são.<sup>28</sup>

## 4\. Vitalidade, Cura e Mecânicas de Morte

A gestão de Pontos de Vida (PV) é um dos aspectos mais dinâmicos de uma aplicação web para D&D, exigindo um sistema que suporte aumentos retroativos baseados em alterações de atributos.<sup>33</sup>

### 4.1 Progressão de Pontos de Vida por Nível

No 1º nível, o personagem recebe o valor máximo do seu Dado de Vida + seu Modificador de Constituição. A partir do 2º nível, o ganho de vida por nível segue a fórmula 33:

\$\$\\text{Ganho de PV} = (\\text{Dado de Vida} / 2 + 1) + \\text{Mod. Constituição}\$\$

| **Dado de Vida** | **HP no Nível 1** | **HP nos Níveis Seguinte (Fixo)** | **Classes Exemplo** |
| --- | --- | --- | --- |
| d6  | 6 + Con | 4 + Con | Mago, Feiticeiro |
| --- | --- | --- | --- |
| d8  | 8 + Con | 5 + Con | Clérigo, Ladino, Druida |
| --- | --- | --- | --- |
| d10 | 10 + Con | 6 + Con | Guerreiro, Paladino, Patrulheiro |
| --- | --- | --- | --- |
| d12 | 12 + Con | 7 + Con | Bárbaro |
| --- | --- | --- | --- |

**Ajuste Retroativo de Constituição:** Se o modificador de Constituição de um personagem aumentar (através de um aumento no valor de atributo ou item mágico), o HP máximo aumenta em 1 para cada nível que o personagem possui. O mesmo se aplica a reduções.<sup>33</sup>

### 4.2 Recuperação em Descansos

- **Descanso Curto (1 hora):** O personagem pode gastar Dados de Vida. Cada dado gasto recupera \$1d(\\text{face}) + \\text{Mod. Constituição}\$. O total de Dados de Vida disponíveis é igual ao nível do personagem.<sup>34</sup>
- **Descanso Longo (8 horas):** Recupera todos os PV perdidos e metade do total máximo de Dados de Vida (arredondado para baixo, mínimo de 1).<sup>35</sup>

### 4.3 Testes de Resistência contra a Morte

Ao chegar a 0 PV, o personagem não morre imediatamente (a menos que o dano excedente seja \$\\geq\$ seu HP máximo). Em vez disso, ele realiza testes de morte no início de cada um de seus turnos.<sup>37</sup>

- **Sucesso:** Rolagem de 10 ou mais.
- **Falha:** Rolagem de 9 ou menos.
- **Dano enquanto está com 0 PV:** Conta como uma falha automática. Se for um acerto crítico, conta como duas falhas.<sup>37</sup>
- **Rolagem de 20:** O personagem recupera 1 PV imediatamente e fica consciente.
- **Rolagem de 1:** Conta como duas falhas automáticas.

## 5\. A Matriz Arcana: Magias e Slots

O sistema de conjuração em 5e utiliza uma estrutura de "slots" de magia que funcionam como uma bateria finita de energia, recarregada principalmente em descansos longos.<sup>39</sup>

### 5.1 Fórmulas de Conjuração

Cada classe conjuradora possui atributos específicos para seus cálculos.

- **CD de Resistência de Magia (Spell Save DC):** \$8 + PB + \\text{Mod. do Atributo de Conjuração} + \\text{Bônus Especiais}\$.<sup>12</sup>
- **Bônus de Ataque de Magia:** \$PB + \\text{Mod. do Atributo de Conjuração} + \\text{Bônus Especiais}\$.<sup>12</sup>

### 5.2 Matemática da Multiclasse de Conjuradores

Quando um personagem possui níveis em múltiplas classes conjuradoras (exceto Bruxo), seus slots de magia são combinados em uma única tabela progressiva. O "Nível de Conjurador" é calculado pela soma das frações de cada classe <sup>11</sup>:

- **Conjuradores Totais (Bardo, Clérigo, Druida, Feiticeiro, Mago):** Adicione 100% dos níveis da classe.
- **Meio-Conjuradores (Paladino, Patrulheiro):** Adicione 50% dos níveis (arredondado para baixo).<sup>39</sup>
- **Terço-Conjuradores (Guerreiro Cavaleiro Arcano, Ladino Trapaceiro Arcano):** Adicione 33,3% dos níveis (arredondado para baixo).<sup>39</sup>
- **Artífice:** Adicione 50% dos níveis (arredondado para CIMA).<sup>39</sup>

**Regra de Ouro da Multiclasse:** Magias conhecidas e preparadas são determinadas individualmente para cada classe como se o personagem fosse de classe única, mas os slots para conjurá-las vêm do pool total.<sup>40</sup> Bruxos (Pact Magic) mantêm seus slots totalmente separados e recarregam em descansos curtos, embora possam usar seus slots de Bruxo para magias de outras classes e vice-versa.<sup>39</sup>

## 6\. Física Espacial e Locomoção

A movimentação em 5e é tratada como um recurso quantificável, não apenas em combate, mas em exploração e logística de carga.<sup>46</sup>

### 6.1 Saltos e Verticalidade

A capacidade de salto é estritamente vinculada ao valor e modificador de Força.<sup>46</sup>

#### 6.1.1 Salto em Distância (Horizontal)

- **Com Corrida (mínimo 3m/10ft):** A distância saltada é igual ao valor total do atributo de Força em pés.<sup>46</sup>
- **Salto Estático (sem corrida):** A distância é cortada pela metade: \$\\text{Força} / 2\$.<sup>46</sup>

#### 6.1.2 Salto em Altura (Vertical)

- **Com Corrida (mínimo 3m/10ft):** \$3 + \\text{Modificador de Força}\$ (em pés).<sup>46</sup>
- **Salto Estático (sem corrida):** Metade da distância acima: \$(3 + \\text{Mod. Força}) / 2\$.<sup>46</sup>

Computacionalmente, cada pé saltado consome um pé do deslocamento total do personagem no turno. Se o personagem tiver deslocamento de 30ft e realizar um salto de 20ft após correr 10ft, ele exauriu seu movimento.<sup>46</sup>

### 6.2 Capacidade de Carga e Variantes de Sobrecarga

O sistema padrão é simplificado para facilitar o jogo fluído, mas a variante de Encumbramento (Encumbrance) é frequentemente preferida em webapps de simulação.<sup>52</sup>

#### 6.2.1 Regras Padrão

- **Capacidade de Carga:** \$\\text{Valor de Força} \\times 15\$ libras.<sup>52</sup>
- **Empurrar, Arrastar ou Levantar:** \$\\text{Valor de Força} \\times 30\$ libras. Acima da carga normal, o deslocamento cai para 5 pés.<sup>52</sup>

#### 6.2.2 Variante: Encumbramento (Encumbrance)

Esta variante introduz penalidades progressivas <sup>52</sup>:

- **Encumbreado:** Peso carregado \$> \\text{Força} \\times 5\$. Perda de 10 pés de deslocamento.
- **Pesadamente Encumbreado:** Peso carregado \$> \\text{Força} \\times 10\$. Perda de 20 pés de deslocamento e desvantagem em testes de Força, Destreza e Constituição.<sup>52</sup>

### 6.3 Queda e Dano de Impacto

A regra para danos de queda é linear: \$1d6\$ de dano de concussão para cada 10 pés (aprox. 3 metros) de queda, até um máximo de \$20d6\$.<sup>51</sup> Em termos de física de jogo, uma criatura cai instantaneamente até 500 pés em seu turno.<sup>57</sup>

## 7\. Ritmo de Viagem e Exploração

Para cálculos de overland travel, o sistema define velocidades baseadas no ritmo da marcha.<sup>47</sup>

| **Ritmo** | **Minuto** | **Hora** | **Dia (8h)** | **Efeito Penalizador** |
| --- | --- | --- | --- | --- |
| Rápido | 400 pés | 4 milhas | 30 milhas | \-5 na Percepção Passiva |
| --- | --- | --- | --- | --- |
| Normal | 300 pés | 3 milhas | 24 milhas | Nenhum |
| --- | --- | --- | --- | --- |
| Lento | 200 pés | 2 milhas | 18 milhas | Permite usar Furtividade |
| --- | --- | --- | --- | --- |

**Terreno Difícil:** Dobra o custo de movimento. Cada 1 pé movido custa 2 pés de deslocamento.<sup>47</sup>

## 8\. Matemática de Design: Encontros e Dificuldade

Para desenvolvedores de ferramentas de DM, o cálculo de dificuldade de encontro é um algoritmo de dois passos que envolve bônus virtuais baseados na "economia de ações".<sup>61</sup>

### 8.1 Limiares de XP por Nível

A dificuldade é medida somando os limiares de XP de cada personagem do grupo.<sup>61</sup>

| **Nível do Personagem** | **Fácil** | **Médio** | **Difícil** | **Mortal** |
| --- | --- | --- | --- | --- |
| 1º  | 25  | 50  | 75  | 100 |
| --- | --- | --- | --- | --- |
| 5º  | 250 | 500 | 750 | 1.100 |
| --- | --- | --- | --- | --- |
| 10º | 600 | 1.200 | 1.900 | 2.800 |
| --- | --- | --- | --- | --- |
| 20º | 2.800 | 5.700 | 8.500 | 12.700 |
| --- | --- | --- | --- | --- |

### 8.2 O Multiplicador de XP Ajustado

O sistema de 5e reconhece que enfrentar múltiplos inimigos é exponencialmente mais difícil do que um único inimigo, mesmo que o XP total seja o mesmo. O "XP Ajustado" é usado apenas para medir a dificuldade, não para a premiação final.<sup>61</sup>

| **Número de Monstros** | **Multiplicador** |
| --- | --- |
| 1   | x1  |
| --- | --- |
| 2   | x1,5 |
| --- | --- |
| 3 a 6 | x2  |
| --- | --- |
| 7 a 10 | x2,5 |
| --- | --- |
| 11 a 14 | x3  |
| --- | --- |
| 15 ou mais | x4  |
| --- | --- |

**Ajuste por tamanho de grupo:** Se o grupo tiver menos de 3 personagens, use o próximo multiplicador mais alto na tabela. Se o grupo tiver 6 ou mais personagens, use o próximo multiplicador mais baixo.<sup>61</sup>

## 9\. Durabilidade de Objetos e Estruturas

Objetos inanimados seguem regras de durabilidade baseadas em seu material e tamanho.<sup>65</sup>

### 9.1 Classe de Armadura por Material

| **Substância** | **CA** |
| --- | --- |
| Pano, Papel, Corda | 11  |
| --- | --- |
| Cristal, Vidro, Gelo | 13  |
| --- | --- |
| Madeira, Osso | 15  |
| --- | --- |
| Pedra | 17  |
| --- | --- |
| Ferro, Aço | 19  |
| --- | --- |
| Mithral | 21  |
| --- | --- |
| Adamante | 23  |
| --- | --- |

### 9.2 Pontos de Vida por Tamanho do Objeto

| **Tamanho** | **Frágil HP** | **Resiliente HP** |
| --- | --- | --- |
| Miúdo (Vaso, Frasco) | 2 (\$1d4\$) | 5 (\$2d4\$) |
| --- | --- | --- |
| Pequeno (Cadeira) | 3 (\$1d6\$) | 10 (\$3d6\$) |
| --- | --- | --- |
| Médio (Barril, Mesa) | 4 (\$1d8\$) | 18 (\$4d8\$) |
| --- | --- | --- |
| Grande (Carroça, Parede de 3m) | 5 (\$1d10\$) | 27 (\$5d10\$) |
| --- | --- | --- |

**Limiar de Dano (Damage Threshold):** Objetos grandes como cascos de navios ou muralhas de castelo podem ter um limiar. Se um ataque causar menos dano que o limiar, o objeto sofre zero dano. Se igualar ou superar, sofre o dano total.<sup>66</sup>

## 10\. Estatística e Probabilidade: Vantagem e Desvantagem

A mecânica de Vantagem e Desvantagem substitui modificadores fixos em 5e. Computacionalmente, isso altera a curva de probabilidade de uma distribuição linear (plana) para uma curva inclinada.<sup>1</sup>

- **Vantagem:** Role \$2d20\$, use o maior valor.
- **Desvantagem:** Role \$2d20\$, use o menor valor.

Matematicamente, a Vantagem aumenta a média de um dado de 20 faces de 10,5 para 13,82, enquanto a Desvantagem a reduz para 7,17. Em termos de bônus efetivo, a Vantagem equivale a aproximadamente \$+3\$ a \$+5\$ na jogada, sendo mais poderosa quando o valor necessário para o sucesso está no centro da escala do d20.<sup>1</sup>

## 11\. Condições e Exaustão

A exaustão é uma condição cumulativa que deve ser modelada como uma máquina de estados com seis níveis, onde cada nível subsequente inclui os efeitos dos anteriores.<sup>38</sup>

| **Nível** | **Efeito** |
| --- | --- |
| 1   | Desvantagem em testes de habilidade |
| --- | --- |
| 2   | Deslocamento reduzido à metade |
| --- | --- |
| 3   | Desvantagem em jogadas de ataque e testes de resistência |
| --- | --- |
| 4   | Máximo de Pontos de Vida reduzido à metade |
| --- | --- |
| 5   | Deslocamento reduzido a 0 |
| --- | --- |
| 6   | Morte |
| --- | --- |

## 12\. Conclusões e Estratégia de Implementação Digital

Ao projetar um webapp para D&D 5e, a maior dificuldade reside na gestão de estados interdependentes. A recomendação técnica é a criação de um grafo de dependências onde:

- **Nodos de Atributos:** Quando um valor de Força muda, ele dispara atualizações para Atletismo, Carga, Saltos e ataques com armas pesadas.
- **Sistema de Arredondamento:** Implementar uma função global DND_ROUND(value) que execute o Math.floor() por padrão, garantindo que o comportamento seja consistente com o sistema de "arredondar para baixo" que permeia as regras de 5e.<sup>2</sup>
- **Fórmulas Alternativas de CA:** Manter um array de objetos de cálculo de CA para o personagem e retornar sempre Math.max() das opções válidas, respeitando as restrições de cada uma (ex: restrição de escudo para Monges).<sup>20</sup>

D&D 5e é um sistema elegantemente matemático, projetado para que o d20 seja sempre relevante. Ao capturar esses cálculos com precisão, um desenvolvedor pode criar ferramentas que eliminam a sobrecarga aritmética e permitem que os jogadores foquem na narrativa e na estratégia de jogo.

#### Referências citadas

- Fundamental Math in D&D 5e and Baldur's Gate 3 - Aestus Guides, acessado em janeiro 21, 2026, <https://aestusguides.com/articles/5e-bg3-fundamental-math/>
- Very simple multiclass spell slot calculator I made : r/dndnext - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/11rhymb/very_simple_multiclass_spell_slot_calculator_i/>
- lvclark/dd5Echarsheet: Dungeons & Dragons 5e Stat and Roll Mod Calculator - GitHub, acessado em janeiro 21, 2026, <https://github.com/lvclark/dd5Echarsheet>
- FoundryVTT dnd5e Active Effects Examples - HackMD, acessado em janeiro 21, 2026, <https://hackmd.io/@foundryvtt-dnd5e/active-effects>
- Ability Scores | Level Up - A5E.tools, acessado em janeiro 21, 2026, <https://a5e.tools/rules/ability-scores>
- Ability Scores | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Ability%20Scores>
- Ability Scores and Modifiers - DnD5e.info - 5th Edition System Reference Document/5e SRD, acessado em janeiro 21, 2026, <https://dnd5e.info/using-ability-scores/ability-scores-and-modifiers/>
- Abilities - BG3 Wiki, acessado em janeiro 21, 2026, <https://bg3.wiki/wiki/Abilities>
- DND Ability Scores: Here's Everything You Need to Know - Young Dragonslayers, acessado em janeiro 21, 2026, <https://www.youngdragonslayers.com/d-and-d-video-blog/ability-scores>
- Passive Perception 5e: What It Is and How to Calculate It - Awesome Dice, acessado em janeiro 21, 2026, <https://www.awesomedice.com/blogs/news/guide-passive-perception-5e-calculation>
- Multiclassing | D&D 2024 | Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Rules:Multiclassing>
- How to Calculate Spell Save DC in D&D 5e (Explained & Charts), acessado em janeiro 21, 2026, <https://geektogeekmedia.com/geekery/tabletop-gaming/how-to-calculate-spell-save-dc-dnd-5e/>
- How do you calculate Spellcasting Ability, Spell Save DC, and Spell Attack Bonus - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/4wmfew/how_do_you_calculate_spellcasting_ability_spell/>
- Character Advancement | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Character%20Advancement>
- dnd 5e 2014 - How to calculate passive perception? - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/162226/how-to-calculate-passive-perception>
- How to calculate armor class in DnD 5e - Modular Realms, acessado em janeiro 21, 2026, <https://www.modularrealms.com/blogs/news/how-to-calculate-armor-class-in-dnd-5e>
- Making an Attack - DnD5e.info - 5th Edition System Reference Document/5e SRD, acessado em janeiro 21, 2026, <https://dnd5e.info/combat/making-an-attack/>
- How to Calculate AC in D&D 5E: A Complete Guide - wikiHow, acessado em janeiro 21, 2026, <https://www.wikihow.com/Calculate-Ac-5e>
- AC Numbers - Rules & Game Mechanics - Dungeons & Dragons Discussion - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/forums/dungeons-dragons-discussion/rules-game-mechanics/45881-ac-numbers>
- How do you calculate a warforged barbarian's AC? - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/130452/how-do-you-calculate-a-warforged-barbarians-ac>
- \[5e\] I Have a Question About Calculating Unarmored Defense and Draconic Resilience, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/2dutlw/5e_i_have_a_question_about_calculating_unarmored/>
- How do I figure the dice and bonuses for attack rolls and damage rolls?, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/72910/how-do-i-figure-the-dice-and-bonuses-for-attack-rolls-and-damage-rolls>
- Weapon damage and attack in 2024 rules : r/dndnext - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/1l23h6w/weapon_damage_and_attack_in_2024_rules/>
- D&D 5E (2014) - Missile weapons atk and dmg., acessado em janeiro 21, 2026, <https://www.enworld.org/threads/missile-weapons-atk-and-dmg.358710/>
- Weapons | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Weapons>
- Calculating Wizard spell casting ability and spell attack bonus - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/96539/calculating-wizard-spell-casting-ability-and-spell-attack-bonus>
- Formula Cheat Sheet : r/DMAcademy - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DMAcademy/comments/am6cbs/formula_cheat_sheet/>
- So, how EXACTLY do critical hits work? - Giant in the Playground Forums, acessado em janeiro 21, 2026, <https://forums.giantitp.com/showthread.php?606675-So-how-EXACTLY-do-critical-hits-work>
- Critical Hit Mechanics - Rules & Game Mechanics - Dungeons & Dragons Discussion, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/forums/dungeons-dragons-discussion/rules-game-mechanics/198254-critical-hit-mechanics>
- How to calculate the added expected damage from critical hits? - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/200447/how-to-calculate-the-added-expected-damage-from-critical-hits>
- dnd 5e 2014 - What is the standard ruling for critical hits? - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/158539/what-is-the-standard-ruling-for-critical-hits>
- Critical Calculation : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/1k1lctv/critical_calculation/>
- How do hit dice work? : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/1f5pm40/how_do_hit_dice_work/>
- Really really simple explanation of how hit die works? : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/1hzl7fz/really_really_simple_explanation_of_how_hit_die/>
- Hit Dice in DnD 5e: A Complete Guide | D&D Rules - Dungeons & Dragons Fanatics, acessado em janeiro 21, 2026, <https://dungeonsanddragonsfan.com/hit-dice-dnd-5e-guide/>
- dnd 5e 2014 - How do you calculate your character's Maximum Hit Points?, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/62432/how-do-you-calculate-your-characters-maximum-hit-points>
- Death saving throws: a quick house rule for 5e and all editions - Methods & Madness, acessado em janeiro 21, 2026, <http://methodsetmadness.blogspot.com/2015/04/death-saving-throws-quick-house-rule.html>
- Conditions | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Conditions>
- D&D 5E - Multiclass Spellcasting - Dungeon Master Assistance, acessado em janeiro 21, 2026, <https://olddungeonmaster.com/2020/03/06/dd-5e-multiclass-spellcasting/>
- Multiclassing - 5th Edition SRD - 5thSRD, acessado em janeiro 21, 2026, <https://5thsrd.org/rules/multiclassing/>
- Calculations Cheat Sheet : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/11lci58/calculations_cheat_sheet/>
- How do you calculate spell ability and spell save dc? \[duplicate\] - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/107477/how-do-you-calculate-spell-ability-and-spell-save-dc>
- How do I determine how many spell slots I have when multiclassing? - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/167040/how-do-i-determine-how-many-spell-slots-i-have-when-multiclassing>
- How does spell slots work when you multi class? : r/DnD5e - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD5e/comments/11d84t6/how_does_spell_slots_work_when_you_multi_class/>
- Your Quick Guide to Multiclass 5e - Norse Foundry, acessado em janeiro 21, 2026, <https://www.norsefoundry.com/blogs/game-systems/your-quick-guide-to-multiclass-5e>
- Jump Distance in D&D 5e: Rules, How to Calculate It & More - wikiHow, acessado em janeiro 21, 2026, <https://www.wikihow.com/Jump-Distance-5e>
- Movement | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Movement>
- spells - How does Jump work? - Role-playing Games Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/213854/how-does-jump-work>
- Jumping distances combos : r/dndnext - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/7phrnt/jumping_distances_combos/>
- D&D 5e Jump Calculator - fexlabs, acessado em janeiro 21, 2026, <https://fexlabs.com/5ejump/>
- You don't know Jump. D&D 5e Rules - Long Jump and High Jump Explained - YouTube, acessado em janeiro 21, 2026, <https://www.youtube.com/watch?v=n6JGmiuYoHE>
- \[5e\] Carrying capacity, How do I calculate it? : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/7jmt8n/5e_carrying_capacity_how_do_i_calculate_it/>
- Tips about carrying capacity X Encumbrance. - Tips & Tactics - Dungeons & Dragons Discussion - D&D Beyond Forums, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/forums/dungeons-dragons-discussion/tips-tactics/5718-tips-about-carrying-capacity-x-encumbrance>
- Carrying capacity rules and running/jumping/tackling/grappling in combat : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/9n7nah/carrying_capacity_rules_and/>
- D&D 5e/5.5e Rules - Encumbrance and Carrying Capacity! | Blog of Heroes, acessado em janeiro 21, 2026, <https://hill-kleerup.org/blog/heroes/2025/06/dd-5e-5-5e-rules-encumbrance-and-carrying-capacity.html>
- Falling isn't dangerous enough! - Rules & Game Mechanics - Dungeons & Dragons Discussion - D&D Beyond Forums, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/forums/dungeons-dragons-discussion/rules-game-mechanics/193964-falling-isnt-dangerous-enough>
- D&D 5e/5.5E Rules - Falling! | Blog of Heroes - hill-kleerup.org, acessado em janeiro 21, 2026, <https://hill-kleerup.org/blog/heroes/2023/05/dd-5e-rules-falling.html>
- D&D5e: Time & Travel - EpicSavingThrow.com - A Grognard's Notebook, acessado em janeiro 21, 2026, <https://epicsavingthrow.com/dd5e-time-travel/>
- Chapter 8: Adventuring - Basic Rules - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/sources/dnd/basic-rules-2014/adventuring>
- World Bonuses, Penalties, and Cover | Level Up - A5E.tools, acessado em janeiro 21, 2026, <https://a5e.tools/rules/world-bonuses-penalties-and-cover>
- Chapter 13: Building Combat Encounters - DnDBeyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/sources/dnd/basic-rules-2014/building-combat-encounters>
- A Quick Primer on Encounter Mathematics | DM's Workshop for Dungeons & Dragons Fifth Edition - DMDave Publishing, acessado em janeiro 21, 2026, <https://dmdave.com/encounter-building-math/>
- Page 82 - Dungeon Master's Guide - AnyFlip, acessado em janeiro 21, 2026, <https://online.anyflip.com/tqblu/sfae/files/basic-html/page82.html>
- \[5e\] Can someone help explain XP modifiers for encounters? : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/40iwcf/5e_can_someone_help_explain_xp_modifiers_for/>
- Objects | Level Up - A5E.tools, acessado em janeiro 21, 2026, <https://a5e.tools/rules/objects>
- Objects | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Objects>
- Chapter 15: Running the Game - Basic Rules for Dungeons and Dragons (D&D) Fifth Edition (5e) - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/sources/dnd/basic-rules-2014/running-the-game>
- Object AC and Health | Feat | Dungeons & Dragons 5e | Statblocks & Sheets - World Anvil, acessado em janeiro 21, 2026, <https://www.worldanvil.com/block/692466>