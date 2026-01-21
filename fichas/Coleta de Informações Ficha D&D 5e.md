# **Arquitetura de Dados e Especificações Sistêmicas para a Reconstrução Digital da Ficha de Personagem de Dungeons & Dragons 5ª Edição**
A reconstrução digital de uma ficha de personagem para Dungeons & Dragons 5ª Edição em um ambiente de desenvolvimento web exige uma compreensão profunda da interdependência entre variáveis estáticas e dinâmicas. O sistema, fundamentado no System Reference Document (SRD) e interpretado por comunidades especializadas como o portal Joga o D20, opera como um motor matemático onde um único dado de entrada pode desencadear uma cascata de atualizações em múltiplos campos periféricos.<sup>1</sup> Esta análise detalha a infraestrutura de dados necessária para que o Google Antigravity processe essas informações com precisão técnica e fidelidade às regras vigentes.
## **O Núcleo de Identidade e Metadados do Personagem**
A camada superior da ficha de personagem, frequentemente referida como o cabeçalho biográfico ou "Bio Header", constitui a identidade fundamental do herói dentro da narrativa e do banco de dados.<sup>3</sup> No desenvolvimento de uma interface digital, estes campos devem ser tratados como variáveis de string e inteiros que definem o acesso a outras tabelas de proficiência e recursos de classe.<sup>4</sup>
### **Estrutura do Cabeçalho e Variáveis de Identificação**
O nome do personagem atua como o rótulo primário, mas são a classe e o nível que governam a lógica de progressão. O nível do personagem é o multiplicador universal para o bônus de proficiência e a escala de pontos de vida.<sup>5</sup> Para uma implementação robusta, o campo "Classe" deve permitir a entrada de múltiplas classes para acomodar as regras de multiclasse, onde os níveis individuais são somados para determinar o nível total do personagem.<sup>7</sup>

A raça e o antecedente (background) fornecem o contexto inicial. No sistema da 5ª Edição, a raça define variáveis como o deslocamento (speed) base e bônus intrínsecos de atributos, enquanto o antecedente injeta proficiências em perícias e ferramentas, além de idiomas e recursos narrativos específicos.<sup>2</sup> O alinhamento, por sua vez, embora tenha menor peso mecânico, organiza o perfil ético-moral do personagem em eixos como Lawful Good (Ordeiro e Bom) até Chaotic Evil (Caótico e Mau).<sup>4</sup>

|**Campo de Dados (PT-BR)**|**Tipo de Dado**|**Origem/Referência**|
| :- | :- | :- |
|Nome do Personagem|String (Texto)|<sup>4</sup>|
|Classe e Nível|Objeto/Array|<sup>2</sup>|
|Antecedente|String|<sup>4</sup>|
|Nome do Jogador|String|<sup>4</sup>|
|Raça|String|<sup>2</sup>|
|Alinhamento|Enum|<sup>4</sup>|
|Pontos de Experiência (XP)|Inteiro|<sup>4</sup>|
### **O Mecanismo do Bônus de Proficiência**
O Bônus de Proficiência é um valor escalonado que representa o treinamento e a experiência acumulada do personagem. Ele deve ser calculado automaticamente com base no nível total do personagem, seguindo a lógica onde o bônus aumenta em níveis específicos.<sup>5</sup> Matematicamente, o bônus de proficiência pode ser derivado da fórmula $B\_p = \lceil \frac{L}{4} \rceil + 1$, onde $L$ representa o nível total do personagem.<sup>11</sup> Este valor é aplicado a testes de resistência, perícias em que o personagem é treinado, bônus de ataque com armas proficientes e a Dificuldade de Classe (DC) de magias.<sup>12</sup>

|**Nível Total**|**Bônus de Proficiência**|
| :- | :- |
|1º ao 4º|+2|
|5º ao 8º|+3|
|9º ao 12º|+4|
|13º ao 16º|+5|
|17º ao 20º|+6|

A análise da progressão demonstra que o bônus de proficiência é o principal equalizador entre diferentes classes, garantindo que o acerto de ataques e a eficácia de habilidades cresçam de forma previsível à medida que as ameaças se tornam mais poderosas.<sup>7</sup>
## **A Fundação Matemática: Atributos e Modificadores**
Os seis atributos centrais — Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma — formam a infraestrutura sobre a qual toda a mecânica de d20 é construída.<sup>13</sup> De acordo com o guia de criação do Joga o D20, existem três métodos principais para determinar esses valores: rolagem de dados (4d6 descartando o menor), distribuição de valores padrão (15, 14, 13, 12, 10, 8) ou o sistema de compra de pontos (point buy) com um limite de 27 pontos.<sup>2</sup>
### **Cálculo de Modificadores e Aplicação de Dados**
O valor bruto de um atributo (score) serve apenas como referência para o modificador, que é o número efetivamente adicionado às rolagens de dados.<sup>13</sup> A fórmula universal para o modificador de atributo é $M = \lfloor \frac{S - 10}{2} \rfloor$, onde $S$ é o valor do atributo.<sup>16</sup> Este cálculo deve ser a primeira função automatizada na reconstrução da ficha, pois seus resultados impactam instantaneamente a Classe de Armadura, Iniciativa, Pontos de Vida e todas as perícias.<sup>15</sup>

|**Valor de Atributo**|**Modificador**|**Implicação Mecânica**|
| :- | :- | :- |
|1|-5|Inaptidão extrema|
|2–3|-4|Deficiência severa|
|4–5|-3|Fraqueza notável|
|6–7|-2|Abaixo da média|
|8–9|-1|Levemente abaixo da média|
|10–11|+0|Média humana padrão|
|12–13|+1|Acima da média|
|14–15|+2|Talentoso|
|16–17|+3|Excepcional|
|18–19|+4|Elite/Gênio|
|20|+5|Pico da perfeição humana|

As descrições fornecidas indicam que a Força (STR) governa o poder físico bruto, impactando o Atletismo e a capacidade de carga; a Destreza (DEX) foca na agilidade, reflexos e precisão; a Constituição (CON) representa a saúde e resistência; a Inteligência (INT) cobre a lógica e o conhecimento acadêmico; a Sabedoria (WIS) lida com a percepção e intuição; e o Carisma (CHA) define a força de personalidade e influência social.<sup>9</sup>
### **Integração de Proficiências e Testes de Resistência**
Cada classe concede proficiência em dois testes de resistência (Saving Throws) específicos. Estes campos devem ser projetados como caixas de seleção que, quando marcadas, somam o bônus de proficiência ao modificador do atributo correspondente.<sup>4</sup> Por exemplo, um Guerreiro de nível 1 com Força 16 (+3) e proficiência em testes de resistência de Força terá um bônus total de $+5$ nesse teste ($+3$ do atributo e $+2$ da proficiência).<sup>4</sup>

A análise detalhada dos testes de resistência revela que eles funcionam como defesas passivas que se tornam ativas apenas quando um efeito externo (como uma magia ou armadilha) exige uma reação do personagem.<sup>11</sup> A automação correta exige que a ficha digital recalcule esses valores sempre que o bônus de proficiência ou o modificador de atributo sofrer alteração.<sup>3</sup>
## **Perícias e Sabedoria Passiva**
As perícias (Skills) são extensões especializadas dos atributos. Na 5ª Edição, existem 18 perícias padrão, cada uma vinculada a um dos seis atributos.<sup>4</sup> No desenvolvimento da interface para o Google Antigravity, é imperativo que cada perícia contenha três estados: não proficiente, proficiente e especialista (Expertise).<sup>12</sup>
### **Mapeamento de Perícias e Atributos**
A tabela abaixo organiza as perícias conforme sua associação oficial e nomenclatura traduzida para o português, essencial para o público brasileiro.<sup>10</sup>

|**Perícia (PT-BR)**|**Atributo Associado**|**Descrição Narrativa**|
| :- | :- | :- |
|Atletismo|Força|Escalar, nadar e saltar|
|Acrobacia|Destreza|Equilíbrio e manobras ágeis|
|Furtividade|Destreza|Mover-se sem ser notado|
|Prestidigitação|Destreza|Truques de mãos e roubo|
|Arcanismo|Inteligência|Conhecimento sobre magia|
|História|Inteligência|Eventos passados e reinos|
|Investigação|Inteligência|Dedução e busca minuciosa|
|Natureza|Inteligência|Flora, fauna e climas|
|Religião|Inteligência|Deuses e ritos sagrados|
|Adestrar Animais|Sabedoria|Influenciar e cuidar de bestas|
|Intuição|Sabedoria|Perceber intenções e mentiras|
|Medicina|Sabedoria|Estabilizar e tratar feridos|
|Percepção|Sabedoria|Notar detalhes e ameaças|
|Sobrevivência|Sabedoria|Rastreio e orientação|
|Atuação|Carisma|Entretenimento e performance|
|Enganação|Carisma|Mentir de forma convincente|
|Intimidação|Carisma|Coação e ameaças|
|Persuasão|Carisma|Diplomacia e etiqueta social|

O cálculo para as perícias segue a mesma lógica dos testes de resistência: ${Bônus Skill} = {Modificador de Atributo} + ({Proficiência} \times B\_p)$.<sup>11</sup> Se o personagem possuir "Especialização", o bônus de proficiência é multiplicado por dois antes de ser somado ao modificador.<sup>12</sup>
### **A Percepção Passiva e Outros Sentidos**
A Percepção Passiva é um valor estático que representa a consciência ambiental contínua do personagem sem a necessidade de uma rolagem ativa. Ela é calculada como $10 + {Bônus Total de Percepção}$.<sup>9</sup> Se o personagem possuir vantagem em testes de Percepção, adiciona-se $+5$ a esse valor; se possuir desvantagem, subtrai-se $-5$.<sup>20</sup> Este campo é vital para o Mestre de Jogo (DM) determinar se o personagem percebe emboscadas ou passagens secretas sem alertar os jogadores.<sup>9</sup>
## **Mecânicas de Combate: Defesa e Iniciativa**
A seção de combate da ficha é a mais acessada durante as sessões de jogo e requer visibilidade máxima. Os campos fundamentais incluem a Classe de Armadura (CA), a Iniciativa e o Deslocamento.<sup>3</sup>
### **Classe de Armadura (AC) e a Lógica de Equipamento**
A Classe de Armadura define a dificuldade de um ataque atingir o personagem. Sua fórmula base é $10 + {Modificador de Destreza}$ quando o personagem não veste armadura.<sup>4</sup> No entanto, a introdução de armaduras altera essa base e o limite de Destreza aplicável.<sup>4</sup>

|**Tipo de Armadura**|**Cálculo da CA**|**Penalidade de Furtividade**|
| :- | :- | :- |
|Sem Armadura|$10 + {Mod. DEX}$|Nenhuma|
|Armadura Leve|${Base da Armadura} + {Mod. DEX}$|Varia|
|Armadura Média|${Base da Armadura} + {Mod. DEX (Máx +2)}$|Frequente|
|Armadura Pesada|${Valor Fixo da Armadura}$|Sim|
|Escudo|$+2$ à CA total|Nenhuma|

Em uma ficha digital, o sistema de inventário deve ser vinculado à CA. Ao marcar um item como "Equipado", o cálculo da CA deve ser atualizado automaticamente, considerando também habilidades de classe como a "Defesa Sem Armadura" do Bárbaro ($10 + {DEX} + {CON}$) ou do Monge ($10 + {DEX} + {WIS}$).<sup>3</sup>
### **Iniciativa e Velocidade de Movimento**
A Iniciativa é essencialmente um teste de Destreza realizado no início do combate para determinar a ordem dos turnos. O bônus base é igual ao modificador de Destreza.<sup>4</sup> Itens mágicos ou talentos como "Alerta" podem adicionar bônus fixos (como $+5$) a esse valor.<sup>22</sup>

O Deslocamento (Speed) é determinado primariamente pela raça do personagem. Humanos e Elfos geralmente possuem 30 pés (9 metros), enquanto raças menores como Anões e Halflings possuem 25 pés (7,5 metros).<sup>4</sup> Habilidades de classe como "Movimento Rápido" do Bárbaro ou "Movimento Sem Armadura" do Monge podem aumentar esse valor permanentemente à medida que o personagem sobe de nível.<sup>23</sup>
## **Gestão de Vitalidade e Ciclos de Vida**
A saúde de um personagem é representada pelos Pontos de Vida (HP) e pelos Dados de Vida (Hit Dice). A compreensão correta de como esses valores crescem é vital para a automação da ficha.<sup>6</sup>
### **Cálculo de Pontos de Vida Máximos**
No primeiro nível, o HP máximo é o valor mais alto do Dado de Vida da classe somado ao modificador de Constituição.<sup>24</sup> Ao subir de nível, o jogador rola o dado de vida ou utiliza o valor fixo (média do dado arredondada para cima) e soma novamente o modificador de Constituição.<sup>5</sup>

|**Tipo de Dado**|**Valor no 1º Nível**|**Valor por Nível Adicional**|
| :- | :- | :- |
|d6 (Mago/Feiticeiro)|$6 + {Mod. CON}$|$4 + {Mod. CON}$|
|d8 (Clérigo/Ladino)|$8 + {Mod. CON}$|$5 + {Mod. CON}$|
|d10 (Guerreiro/Paladino)|$10 + {Mod. CON}$|$6 + {Mod. CON}$|
|d12 (Bárbaro)|$12 + {Mod. CON}$|$7 + {Mod. CON}$|

Uma regra crítica é que aumentos retroativos no modificador de Constituição (através de incrementos de atributo ou itens mágicos) devem aumentar o HP máximo em 1 ponto para cada nível que o personagem já possui.<sup>5</sup> Por exemplo, um personagem de nível 5 que aumenta seu modificador de CON de $+2$ para $+3$ ganha instantaneamente 5 pontos no HP máximo.<sup>7</sup>
### **O Papel dos Dados de Vida na Recuperação**
Os Dados de Vida atuam como uma reserva de cura para descansos curtos. Um personagem possui um total de dados igual ao seu nível total.<sup>26</sup>

1. **Descanso Curto (1 hora):** O jogador pode gastar dados de sua reserva para recuperar HP. Cada dado rolado recupera ${Valor do Dado} + {Mod. CON}$.<sup>27</sup>
1. **Descanso Longo (8 horas):** O personagem recupera todos os pontos de vida perdidos e metade de seus Dados de Vida totais (mínimo de 1 dado).<sup>28</sup>

Este sistema de "manutenção de energia" é fundamental para a sobrevivência em masmorras e deve ser representado na ficha digital por um contador de dados gastos e totais.<sup>3</sup>
## **O Estado Crítico: Salvaguardas Contra a Morte**
Quando os Pontos de Vida Atuais chegam a zero, o personagem cai inconsciente e começa a realizar Salvaguardas Contra a Morte (Death Saving Throws).<sup>19</sup> Este é um momento de alta tensão que exige campos de marcação específicos para Sucessos e Falhas.<sup>3</sup>
### **Regras de Estabilização e Morte**
O jogador rola um d20 sem modificadores no início de cada um de seus turnos.<sup>32</sup>

- **Sucesso (10 ou mais):** O jogador marca um sucesso. Ao acumular 3 sucessos, o personagem estabiliza, mas permanece com 0 HP e inconsciente.<sup>32</sup>
- **Falha (9 ou menos):** O jogador marca uma falha. Ao acumular 3 falhas, o personagem morre permanentemente.<sup>32</sup>
- **Rolagem Crítica (20):** O personagem recupera instantaneamente 1 PV e retoma a consciência.<sup>32</sup>
- **Falha Crítica (1):** Conta como duas falhas imediatas.<sup>32</sup>

A ficha digital deve limpar essas marcações automaticamente assim que o personagem recuperar qualquer quantidade de pontos de vida através de cura mágica ou estabilização.<sup>34</sup>
## **Inventário e Logística: Carga e Moedas**
O gerenciamento de carga é muitas vezes negligenciado, mas as regras oficiais da 5ª Edição impõem limites claros baseados na Força.<sup>20</sup> No website, o peso de cada item no inventário deve ser somado dinamicamente para informar ao jogador seu estado de carga.<sup>37</sup>
### **Capacidade de Carga e Arrastar/Empurrar**

|**Ação Física**|**Fórmula de Peso (em libras)**|
| :- | :- |
|Capacidade de Carga|${FOR} \times 15$|
|Empurrar / Arrastar / Levantar|${FOR} \times 30$|

Criaturas Grandes dobram esses valores, enquanto criaturas Miúdas (Tiny) os reduzem pela metade.<sup>36</sup> Se um personagem tentar mover algo que exceda sua capacidade de carga (mas esteja dentro do limite de arrastar), seu deslocamento cai para 5 pés.<sup>39</sup>
### **O Sistema Monetário e Pesos de Moeda**
A economia de D&D baseia-se em cinco tipos de moedas metálicas. Para a reconstrução da ficha, é vital incluir as taxas de câmbio padrão para conversão automática.<sup>40</sup>

|**Moeda (PT-BR)**|**Sigla**|**Cobre (PC)**|**Prata (PP)**|**Electro (PE)**|**Ouro (PO)**|**Platina (PL)**|
| :- | :- | :- | :- | :- | :- | :- |
|Peça de Cobre|PC|1|1/10|1/50|1/100|1/1.000|
|Peça de Prata|PP|10|1|1/5|1/10|1/100|
|Peça de Electro|PE|50|5|1|1/2|1/20|
|Peça de Ouro|PO|100|10|2|1|1/10|
|Peça de Platina|PL|1\.000|100|20|10|1|

Conforme detalhado no Joga o D20 e no SRD, as moedas são itens físicos com peso significativo. Um conjunto de 50 moedas de qualquer tipo pesa aproximadamente 1 libra (0,45 kg).<sup>37</sup> Um sistema automatizado deve calcular o peso do "tesouro" monetário e somá-lo ao encargo total do personagem.<sup>38</sup>
## **Arquitetura de Magias e Conjuração**
O sistema de magia na 5ª Edição é categorizado por Níveis de Magia (0 a 9) e Espaços de Magia (Spell Slots).<sup>44</sup> A ficha de personagem precisa de uma seção dedicada que rastreie o bônus de ataque mágico e a CD de salvaguarda de magia, além de um inventário de magias conhecidas ou preparadas.<sup>10</sup>
### **Cálculos do Conjurador**
A eficácia das magias de um personagem depende do seu Atributo de Conjuração (Spellcasting Ability), que varia conforme a classe.<sup>14</sup>

- **Bônus de Ataque Mágico:** ${Mod. Atributo Conjuração} + B\_p$.<sup>4</sup>
- **CD de Salvaguarda de Magia:** $8 + {Mod. Atributo Conjuração} + B\_p$.<sup>4</sup>
### **Gestão de Espaços de Magia por Nível**
A tabela de espaços de magia determina quantas vezes um personagem pode conjurar magias de cada nível antes de necessitar de um descanso longo.<sup>44</sup> Truques (Cantrips) são magias de nível 0 que não consomem espaços e podem ser usadas indefinidamente.<sup>44</sup>

|**Nível de Classe**|**1º**|**2º**|**3º**|**4º**|**5º**|**6º**|**7º**|**8º**|**9º**|
| :- | :- | :- | :- | :- | :- | :- | :- | :- | :- |
|1º|2|-|-|-|-|-|-|-|-|
|2º|3|-|-|-|-|-|-|-|-|
|3º|4|2|-|-|-|-|-|-|-|
|5º|4|3|2|-|-|-|-|-|-|
|9º|4|3|3|3|1|-|-|-|-|
|13º|4|3|3|3|2|1|1|-|-|
|17º|4|3|3|3|2|1|1|1|1|

Classes como o Bruxo (Warlock) seguem uma regra distinta através do recurso "Pact Magic", onde todos os seus espaços de magia têm o mesmo nível (o máximo que podem conjurar) e são recuperados em descansos curtos.<sup>46</sup>
## **Multiclasse: Complexidade e Integração de Dados**
A multiclasse permite que um personagem tenha níveis em diferentes classes, criando uma sinergia de habilidades, mas aumentando a complexidade dos cálculos de dados de vida e espaços de magia.<sup>5</sup>
### **Pré-requisitos e Saúde**
Para adotar uma nova classe, o personagem deve atender aos pré-requisitos de atributo mínimo (geralmente 13) tanto da classe atual quanto da nova.<sup>5</sup>

- **Dados de Vida na Multiclasse:** Se as classes possuem dados de tamanhos diferentes (ex: d8 e d10), eles devem ser rastreados separadamente na ficha.<sup>5</sup>
- **Pontos de Vida:** Apenas o nível 1 da primeira classe escolhida fornece o valor máximo do dado de vida. Níveis subsequentes em qualquer classe utilizam a média ou rolagem.<sup>5</sup>
### **Cálculo de Conjuradores Combinados**
Quando um personagem possui múltiplas classes com o recurso "Conjuração", os espaços de magia são determinados pela soma dos níveis.<sup>8</sup>

1. Soma total de níveis em Bardo, Clérigo, Druida, Feiticeiro e Mago.
1. Metade (arredondado para baixo) dos níveis de Paladino e Guardião (Ranger).
1. Um terço (arredondado para baixo) dos níveis de Guerreiro (Cavaleiro Místico) ou Ladino (Trapaceiro Arcano).

O total resultante é usado para consultar a tabela de espaços de magia de um conjurador de classe única daquele nível.<sup>8</sup> No entanto, as magias que o personagem "conhece" ou "prepara" são restritas ao nível individual de cada classe.<sup>8</sup>
## **Condições e Estados Debilitantes: Exaustão**
A exaustão é uma condição progressiva que representa o desgaste físico e mental extremo. Existem dois sistemas principais que a ficha deve estar preparada para suportar: o clássico de 2014 e o revisado de 2024.<sup>50</sup>
### **Exaustão Clássica (2014)**
Este sistema é punitivo e acumulativo, onde cada nível adiciona um novo efeito deletério.<sup>51</sup>

1. **Nível 1:** Desvantagem em testes de atributo.
1. **Nível 2:** Deslocamento reduzido à metade.
1. **Nível 3:** Desvantagem em jogadas de ataque e testes de resistência.
1. **Nível 4:** Pontos de vida máximos reduzidos à metade.
1. **Nível 5:** Deslocamento reduzido a 0.
1. **Nível 6:** Morte instantânea.
### **Exaustão Revisada (2024)**
O sistema de 2024 simplifica a matemática para facilitar o rastreio em fichas digitais.<sup>50</sup> Cada nível de exaustão aplica uma penalidade fixa:

- **Penalidade em d20:** Redução de $-2$ para cada nível de exaustão em todas as jogadas de ataque, testes de atributo e testes de resistência.<sup>51</sup>
- **Penalidade de Velocidade:** Redução de 5 pés (1,5m) no deslocamento para cada nível de exaustão.<sup>51</sup>
- **Morte:** Ocorre ao atingir o Nível 6 de exaustão.<sup>50</sup>

Um descanso longo com comida e água remove apenas um nível de exaustão.<sup>29</sup>
## **Ataques e Propriedades de Armas**
A seção de ataques deve detalhar as armas empunhadas pelo personagem, seus modificadores de acerto e dados de dano.<sup>3</sup> As armas possuem propriedades que ditam como a matemática é aplicada.<sup>3</sup>
### **Propriedades Matemáticas de Armas**
- **Acuidade (Finesse):** O jogador pode escolher entre Força ou Destreza para o bônus de ataque e dano.<sup>3</sup>
- **Versátil:** A arma possui dois valores de dano (ex: 1d8/1d10), dependendo se é usada com uma ou duas mãos.<sup>3</sup>
- **Pesada:** Criaturas Pequenas possuem desvantagem em ataques com estas armas (nas regras de 2014) ou exigem um valor de Força mínimo (nas regras de 2024).<sup>14</sup>
- **Alcance (Reach):** Adiciona 5 pés à distância de ataque do personagem.<sup>54</sup>
### **Cálculo de Dano e Bônus de Acerto**
O bônus de acerto é sempre ${Atributo} + B\_p$ (se proficiente).<sup>4</sup> O dano, no entanto, soma apenas o modificador de atributo, sem o bônus de proficiência (a menos que uma habilidade especial o permita).<sup>4</sup> Tipos de dano (como Cortante, Perfurante ou Concussão) são cruciais para interagir com resistências e vulnerabilidades de monstros.<sup>4</sup>
## **Personalidade, Aparência e Narrativa**
Embora a ficha seja um documento técnico, ela também serve como uma ferramenta de interpretação (roleplay). Os campos narrativos fornecem o "colorido" que humaniza os números.<sup>4</sup>
### **Traços de Personalidade, Ideais, Vínculos e Defeitos**
Estes quatro campos são fundamentais para o sistema de Inspiração da 5ª Edição.<sup>4</sup>

1. **Traços de Personalidade:** Pequenas frases que descrevem como o personagem interage com o mundo.
1. **Ideais:** As convicções morais ou éticas que guiam suas ações.
1. **Vínculos:** A conexão emocional do personagem com pessoas, lugares ou eventos.
1. **Defeitos:** Fraquezas de caráter ou vícios que podem causar problemas.
### **Outras Proficiências e Idiomas**
Este campo armazena proficiências que não se encaixam na lista de perícias, como o uso de ferramentas de artesão, instrumentos musicais, jogos ou veículos.<sup>4</sup> Também lista os idiomas conhecidos, geralmente derivados da raça e do antecedente (ex: Comum, Élfico, Dracônico).<sup>4</sup>
## **Conclusões e Recomendações para Implementação**
Para que o Google Antigravity recrie a ficha de D&D 5e de forma eficaz, a arquitetura deve priorizar a interconectividade. A análise técnica sugere que o sistema seja construído como um grafo de dependências, onde o "Nível do Personagem" e os "Valores de Atributo" são os nós raízes. Qualquer alteração nesses nós deve disparar eventos de recálculo em toda a estrutura, especialmente para o Bônus de Proficiência e o Modificador de Constituição, cujos impactos são os mais abrangentes em termos de HP e salvaguardas.<sup>3</sup>

A inclusão de um sistema de "Override" manual para cada campo é recomendada, pois D&D é um jogo de exceções onde itens mágicos e bênçãos divinas podem conceder bônus que fogem às fórmulas matemáticas padrão.<sup>3</sup> Por fim, a tradução rigorosa dos termos para o português (como visto em portais como Joga o D20) garantirá que a ferramenta seja acessível e profissional para a comunidade lusófona.<sup>2</sup>
#### **Referências citadas**
1. SRD\_CC\_v5.2.pdf - D&D Beyond, acessado em janeiro 21, 2026, <https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.pdf>
1. Entendendo sua ficha de D&D 5ª Edição! - Joga o D20, acessado em janeiro 21, 2026, <https://jogaod20.com/2020/06/01/entendendo-ficha-dnd-1/>
1. D&D 5E by Roll20, acessado em janeiro 21, 2026, <https://wiki.roll20.net/D%26D_5E_by_Roll20>
1. How to Fill Out a D&D Character Sheet | A Beginner Guide for DND 5e - Runic Dice, acessado em janeiro 21, 2026, <https://www.runicdice.com/blogs/news/how-to-fill-out-a-dnd-character-sheet>
1. Character Advancement – 5th Edition SRD, acessado em janeiro 21, 2026, <https://www.5esrd.com/tools-resources/system-reference-document-5-1-1/character-advancement/>
1. Entendendo sua ficha de D&D 5ª Edição - Parte 3 - Joga o D20, acessado em janeiro 21, 2026, <https://jogaod20.com/2020/06/04/entendendo-ficha-dnd-3/>
1. Character Advancement | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Character%20Advancement>
1. Multiclassing - 5th Edition SRD - 5thSRD, acessado em janeiro 21, 2026, <https://5thsrd.org/rules/multiclassing/>
1. How to Fill Out a D&D 5e Character Sheet (Step by Step for Beginners) - Author Ivy L. James, acessado em janeiro 21, 2026, <https://www.authorivyljames.com/blog/how-to-fill-out-a-dungeons-and-dragons-character-sheet>
1. Ficha de Personagem DND 5e Oficial Portugues | PDF - Scribd, acessado em janeiro 21, 2026, <https://fr.scribd.com/document/601884421/ficha-de-personagem-dnd-5e-oficial-portugues>
1. Proficiency Bonus - 5E : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/ldt5hv/proficiency_bonus_5e/>
1. What Is a Proficiency Bonus in D&D and How Does It Work? - Dice Dungeons, acessado em janeiro 21, 2026, <https://dicedungeons.com/blogs/inside/what-is-proficiency-bonus>
1. D&D 5e Ability Scores Guide: Optimize Your Character in 2025 - Runic Dice, acessado em janeiro 21, 2026, <https://www.runicdice.com/blogs/news/dnd-5e-ability-scores-explained>
1. Easily Fill Out Your D&D Character Sheet Like a 5e Pro With This Step - Awesome Dice, acessado em janeiro 21, 2026, <https://www.awesomedice.com/blogs/news/the-d-d-5e-character-sheet-cheat-sheet>
1. Ability Scores | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Ability%20Scores>
1. How is a modifier calculated? : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/snokda/how_is_a_modifier_calculated/>
1. What is the mathematical formula for calculating ability modifiers from ability score? - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/5kzrpm/what_is_the_mathematical_formula_for_calculating/>
1. Ability Scores and Modifiers - DnD5e.info - 5th Edition System Reference Document/5e SRD, acessado em janeiro 21, 2026, <https://dnd5e.info/using-ability-scores/ability-scores-and-modifiers/>
1. Entenda sua ficha de D&D 5ª Edição - Parte 4 - Joga o D20, acessado em janeiro 21, 2026, <https://jogaod20.com/2020/06/08/entendendo-ficha-dnd-4/>
1. Skills Index :: 5e.d20srd.org, acessado em janeiro 21, 2026, <https://5e.d20srd.org/indexes/skills.htm>
1. Effective Hit Points and the AC Scaling : r/dndnext - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/s91vrf/effective_hit_points_and_the_ac_scaling/>
1. How to Calculate Initiative in D&D 5E (For Players & DMs) - wikiHow, acessado em janeiro 21, 2026, <https://www.wikihow.com/Calculate-Initiative-5e>
1. Entendendo sua ficha de D&D 5ª Edição - Parte 2 - Joga o D20, acessado em janeiro 21, 2026, <https://jogaod20.com/2020/06/02/entendendo-ficha-dnd-2/>
1. Mastering Hit Points: Your Essential Guide to D&D 5e HP Calculation - Oreate AI Blog, acessado em janeiro 21, 2026, <http://oreateai.com/blog/mastering-hit-points-your-essential-guide-to-dd-5e-hp-calculation/6a85b141e0990ae2fd08574726afe979>
1. dnd 5e 2014 - How do you calculate your character's Maximum Hit Points?, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/62432/how-do-you-calculate-your-characters-maximum-hit-points>
1. HP Calculator 5e — For D&D 5th Edition, acessado em janeiro 21, 2026, <https://www.omnicalculator.com/other/hit-points>
1. Hit Dice in DnD 5e: A Complete Guide | D&D Rules - Dungeons & Dragons Fanatics, acessado em janeiro 21, 2026, <https://dungeonsanddragonsfan.com/hit-dice-dnd-5e-guide/>
1. Resting | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Resting>
1. How Recovering Hit Dice After Short & Long Rests Works : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/wf9x22/how_recovering_hit_dice_after_short_long_rests/>
1. Have you been using Long Rests/Hit Dice correctly? - Rules & Game Mechanics - Dungeons & Dragons Discussion - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/forums/dungeons-dragons-discussion/rules-game-mechanics/183248-have-you-been-using-long-rests-hit-dice-correctly>
1. Does your group restore all hit dice after a long rest or do you follow the players handbook rules? - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/g9dwr3/does_your_group_restore_all_hit_dice_after_a_long/>
1. Everything D&D Players Need To Know About Death Saving Throws - wikiHow, acessado em janeiro 21, 2026, <https://www.wikihow.com/Death-Saves-5e>
1. Damage and Healing - 5th Edition SRD - 5thSRD, acessado em janeiro 21, 2026, <https://5thsrd.org/combat/damage_and_healing/>
1. dnd 5e 2014 - What is considered a successful death saving throw? - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/94396/what-is-considered-a-successful-death-saving-throw>
1. If you succeed on all of your death saving throws, what happens? - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/165016/if-you-succeed-on-all-of-your-death-saving-throws-what-happens>
1. dnd 5e 2014 - Can small characters really carry that much? - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/116884/can-small-characters-really-carry-that-much>
1. [5E] Carrying Capacity and STR: How do I start using it? : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/5t4ub5/5e_carrying_capacity_and_str_how_do_i_start_using/>
1. Understanding carry capacity and your sack limit - General Discussion - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/forums/d-d-beyond-general/general-discussion/191948-understanding-carry-capacity-and-your-sack-limit>
1. D&D 5e/5.5e Rules - Encumbrance and Carrying Capacity! | Blog of Heroes, acessado em janeiro 21, 2026, <https://hill-kleerup.org/blog/heroes/2025/06/dd-5e-5-5e-rules-encumbrance-and-carrying-capacity.html>
1. [Hale's Guide] Money in D&D: How It Works - The Shop of Many Things, acessado em janeiro 21, 2026, <https://www.theshopofmanythings.com/blogs/lessons-from-the-tabletop/currencies-in-dnd-and-how-they-work>
1. Currency - DnD5e.info - 5th Edition System Reference Document/5e SRD, acessado em janeiro 21, 2026, <https://dnd5e.info/equipment/currency/>
1. D&D 5e coin converter - Stephanie Ortiz, acessado em janeiro 21, 2026, <https://stephthedev.com/dnd-exchange-rate>
1. D&D 5E - Lista de Equipamentos - Biblioteca Élfica | PDF | Moeda | Espada - Scribd, acessado em janeiro 21, 2026, <https://pt.scribd.com/document/552525680/D-D-5E-Lista-de-Equipamentos-Biblioteca-Elfica>
1. Spells | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Spells>
1. Spells - D&D Beyond Basic Rules - Dungeons & Dragons - Sources, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/sources/dnd/br-2024/spells>
1. Spell Slots in D&D 5e - All You Need To Know! | PDF | Wizards Of The Coast Games - Scribd, acessado em janeiro 21, 2026, <https://www.scribd.com/document/618593268/Spell-Slots-in-D-D-5e-All-You-Need-to-Know>
1. Spellcasting Sheet (Optional) - Print Version | PDF - Scribd, acessado em janeiro 21, 2026, <https://www.scribd.com/document/881210980/Spellcasting-Sheet-Optional-Print-Version>
1. 5e Spell Sheet explanation : r/dndnext - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/3xgq6r/5e_spell_sheet_explanation/>
1. Spell Slot Sheet for D&D 5e : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/14o49ke/spell_slot_sheet_for_dd_5e/>
1. What are the major changes from D&D 5E 2014 to 2024? - RPG Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/215477/what-are-the-major-changes-from-dd-5e-2014-to-2024>
1. The One D&D (2024) Exhaustion Rules & Changes - wikiHow, acessado em janeiro 21, 2026, <https://www.wikihow.com/One-Dnd-Exhaustion>
1. The New 2024 DnD Exhaustion Rule Explained - Dungeons & Dragons Fanatics, acessado em janeiro 21, 2026, <https://dungeonsanddragonsfan.com/new-2024-dnd-exhaustion-rule-explained/>
1. All changes to the D&D base game rules from 5.0 to 5.5 (2014 to 2024) : r/onednd - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/onednd/comments/1im0jj5/all_changes_to_the_dd_base_game_rules_from_50_to/>
1. Better rules for carrying capacity and encumbrance : r/DnDBehindTheScreen - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnDBehindTheScreen/comments/a2zye5/better_rules_for_carrying_capacity_and_encumbrance/>
1. D&D 5th Edition Proficiencies - Roll20, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Index:Proficiencies>
1. D&D 5e/5.5e Rules - Skills - Abilities, and Mixing and Matching! | Blog of Heroes, acessado em janeiro 21, 2026, <https://hill-kleerup.org/blog/heroes/2024/02/dd-5e-rules-skills-abilities-and-mixing-and-matching.html>
1. MPMB's D&D 5e Character Tools – Fully automated DnD Character Sheets, acessado em janeiro 21, 2026, <https://www.flapkan.com/>
