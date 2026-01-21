# **Arquitetura de Sistemas de Regras e Governança de Conteúdo para Aplicações de Dungeons & Dragons 5ª Edição: Um Estudo Técnico do Guia do Mestre**
O desenvolvimento de uma aplicação web voltada para o ecossistema de Dungeons & Dragons 5ª Edição (D&D 5e) exige uma compreensão profunda e granular do Guia do Mestre (Dungeon Master's Guide - DMG). Este documento não atua apenas como um manual de instruções narrativas, mas sim como a especificação técnica de um motor de jogo analógico cujas variáveis, tabelas e algoritmos de probabilidade formam a espinha dorsal de qualquer automação digital. A transição normativa entre a edição original de 2014 e a revisão de 2024 introduziu mudanças estruturais significativas na forma como a informação é apresentada e processada, movendo-se de uma abordagem centrada na filosofia do "Worldbuilding" para uma estrutura mais utilitária e modular, ideal para o desenvolvimento de ferramentas de software.<sup>1</sup>

A análise a seguir disseca os componentes fundamentais do DMG sob a ótica de um desenvolvedor de sistemas, tratando cada capítulo como uma especificação de banco de dados ou um módulo lógico. A integração dessas regras em um webapp requer não apenas o armazenamento de dados estáticos, como listas de itens mágicos, mas a implementação de motores de cálculo para níveis de desafio (CR), orçamentos de experiência (XP), gerenciamento de ambientes e sistemas de "downtime" que garantam a fidelidade à experiência de jogo de mesa.<sup>3</sup>
## **Estrutura Sistêmica do Livro do Mestre: 2014 vs. 2024**
Para o desenvolvedor, a primeira decisão arquitetural reside em qual versão das regras apoiar ou se deve implementar um sistema híbrido. O DMG de 2014 é dividido em três partes principais: "Master of Worlds" (focada em cosmologia e criação de cenários), "Master of Adventures" (focada na estrutura de jogo e encontros) e "Master of Rules" (focada em variantes mecânicas e adjudicação).<sup>2</sup> Já a edição de 2024 reorganizou esses dados para priorizar a acessibilidade imediata, movendo as regras básicas e a caixa de ferramentas do mestre para os primeiros capítulos e introduzindo sistemas novos como os Bastiões no Capítulo 8.<sup>1</sup>
### **Mapeamento de Capítulos e Funcionalidades de Software**
A tabela abaixo correlaciona a estrutura do DMG 2024 com os módulos funcionais necessários em um webapp de alta performance para jogadores e mestres.

|**Capítulo (DMG 2024)**|**Conteúdo Primário**|**Implementação em Webapp**|
| :- | :- | :- |
|Cap. 1: O Básico|Fluxo de jogo, adjudicação, tipos de jogadores.|Definição de perfis de usuário e lógica de permissões de Mestre.|
|Cap. 2: Conduzindo o Jogo|Testes de habilidade, combate, exploração, interações sociais.|Motor de resolução de ações e log de eventos de jogo.|
|Cap. 3: Caixa de Ferramentas|Alinhamento, perigos, venenos, doenças, criação de monstros/itens.|Banco de dados de efeitos de status e geradores de NPCs.|
|Cap. 4: Criando Aventuras|Estrutura de encontros, ganchos de trama, recompensas.|Algoritmos de balanceamento de combate e geradores procedurais.|
|Cap. 5: Criando Campanhas|Lore de Greyhawk, eventos mundiais, estilos de jogo.|Sistema de gestão de lore e linha do tempo da campanha.|
|Cap. 6: Cosmologia|Planos de existência, viagem planar, perigos planares.|Configurações de estado de mundo e efeitos globais de ambiente.|
|Cap. 7: Tesouro|Itens mágicos, arte, gemas, tabelas de loot.|Inventário inteligente, gerador de tesouros e gestão de attunement.|
|Cap. 8: Bastiões|Construção de bases, ordens de bastião, recursos.|Módulo de simulação de base e gerenciamento de recursos.|

Esta reorganização sugere que uma aplicação moderna deve ser construída de forma modular, onde o Capítulo 2 fornece a lógica de execução e o Capítulo 7 fornece o banco de dados de ativos.<sup>1</sup> A inclusão de um glossário de lore e folhas de rastreamento no Apêndice A e C da versão de 2024 reforça a necessidade de interfaces de usuário (UI) que permitam a consulta rápida de termos técnicos sem interromper o fluxo narrativo.<sup>1</sup>
## **O Mestre de Mundos: Worldbuilding e Escalas Cartográficas**
A criação de um cenário de campanha é a base sobre a qual todas as outras mecânicas repousam. O DMG fornece diretrizes para a criação de divindades, alinhamentos e, crucialmente para desenvolvedores de ferramentas de mapas, escalas hexais padronizadas.<sup>7</sup> A implementação de um sistema de mapas em um webapp deve respeitar a hierarquia de escalas proposta para permitir o "zoom" funcional entre diferentes níveis de detalhamento.<sup>9</sup>
### **Implementação de Escalas de Mapa e Hexágonos**
O manual sugere três escalas principais que influenciam diretamente a lógica de viagem e o consumo de recursos (comida, água, forragem). Para um desenvolvedor, isso significa que o sistema de coordenadas do mapa deve ser capaz de converter distâncias entre hexágonos de província, reino e continente de forma síncrona.<sup>8</sup>

|**Escala de Mapa**|**Tamanho do Hexágono**|**Uso Recomendado**|**Lógica de Viagem (Ritmo Normal)**|
| :- | :- | :- | :- |
|Província|1 milha|Exploração local de vilarejos e pequenas masmorras.|24 hexágonos por dia.|
|Reino|6 milhas|Viagem entre cidades e regiões fronteiriças.|4 hexágonos por dia.|
|Continente|60 milhas|Visão global de impérios e grandes massas de terra.|1 hexágono a cada 2.5 dias.|

A lógica matemática por trás do hexágono de 6 milhas é fundamental: ele representa a área que um grupo de aventureiros pode cobrir em cerca de duas horas de caminhada em terreno fácil, o que facilita o rastreamento de encontros aleatórios e a gestão do ciclo de dia e noite.<sup>8</sup> Um webapp que automatiza a viagem deve considerar modificadores de terreno (estrada, floresta densa, montanha) que alteram o custo de movimento por hexágono, aplicando as regras de terreno difícil do Player's Handbook (PHB) em conjunto com as diretrizes do DMG.<sup>8</sup>
### **Cosmologia e Estados de Existência**
O multiverso de D&D é estruturado no modelo da "Grande Roda" (Great Wheel). Para o desenvolvimento de software, cada plano de existência pode ser tratado como um "ambiente de execução" com variáveis globais específicas.<sup>14</sup> O Plano Etéreo e o Plano Astral servem como camadas de transporte (Planos de Transição), enquanto os Planos Exteriores aplicam modificadores de alinhamento e efeitos de status baseados na moralidade e ética.<sup>14</sup>

Ao transitar para o Plano de Shadowfell, por exemplo, o sistema deve ser capaz de aplicar automaticamente a variante de regra "Desespero de Shadowfell", exigindo testes de resistência periódicos dos personagens para evitar debuffs de iniciativa e velocidade.<sup>18</sup> Da mesma forma, nos Planos Interiores (Fogo, Terra, Ar, Água), o webapp deve monitorar a necessidade de proteção mágica contra danos ambientais contínuos, automatizando as rolagens de dano para personagens sem resistência a elementos específicos.<sup>15</sup>
## **O Mestre de Aventuras: Design de Encontros e Balanço de XP**
Uma das funcionalidades mais críticas para um webapp é o calculador de encontros. O DMG estabelece um framework matemático rigoroso para determinar a dificuldade de um combate com base no Nível de Desafio (CR) das criaturas e no Nível Médio do Grupo (APL).<sup>3</sup> A implementação desta lógica exige um entendimento claro da diferença entre o XP Real (concedido após o combate) e o XP Ajustado (usado apenas para cálculo de dificuldade).<sup>3</sup>
### **Algoritmo de Cálculo de Dificuldade de Combate**
O cálculo de dificuldade não é uma simples soma de XP. Ele deve levar em conta a economia de ações. Quando múltiplos monstros são adicionados a um encontro, a dificuldade cresce exponencialmente devido ao número de ataques que os inimigos podem realizar contra os jogadores no mesmo turno.<sup>3</sup>

A fórmula de XP Ajustado deve ser implementada da seguinte forma:

1. Calcule o XP total base somando o valor de cada monstro individual.
1. Aplique um multiplicador baseado no número de monstros no encontro.

|**Quantidade de Monstros**|**Multiplicador de XP Ajustado**|
| :- | :- |
|1|x1|
|2|x1.5|
|3 a 6|x2|
|7 a 10|x2.5|
|11 a 14|x3|
|15 ou mais|x4|

O sistema deve então comparar o resultado deste cálculo com as tabelas de limiar de dificuldade para o nível dos personagens (Fácil, Médio, Difícil, Mortal).<sup>3</sup> É vital que a aplicação permita ajustes manuais, pois o DMG observa que fatores como terreno vantajoso ou surpresa podem alterar a dificuldade real de um encontro para além do que os números sugerem.<sup>4</sup>
### **Criação de Personagens Não-Jogadores (NPCs) e Vilões**
O DMG 2014 oferece uma vasta gama de tabelas para a criação rápida de NPCs, o que é ideal para geradores procedurais em webapps. Essas tabelas cobrem desde traços físicos e talentos até ideais, vínculos e falhas.<sup>18</sup> Para um desenvolvedor, cada uma dessas tabelas pode ser tratada como um array de strings que o sistema seleciona aleatoriamente para compor a ficha de um NPC "on-the-fly".

|**Atributo de NPC**|**Exemplos de Dados (Tabelas do DMG)**|**Utilidade para o Webapp**|
| :- | :- | :- |
|Aparência|Cicatriz pronunciada, joias baratas, tatuagem de guilda.|Visualização de avatar ou descrição textual.|
|Maneirismos|Sussurra, usa palavras longas incorretamente, assobia.|Notas de interpretação para o Mestre.|
|Talento|Pinta lindamente, sabe vários idiomas, excelente jogador.|Definição de perícias e ferramentas de bônus.|
|Ideal|Tradição, Caridade, Ganância, Equilíbrio.|Determinação de alinhamento e comportamento lógico.|
|Vínculo|Protege um segredo, leal a um soberano, busca vingança.|Ganchos para missões e interações sociais.|
|Falha ou Segredo|Vício em jogos, medo de aranhas, inimigo influente.|Vulnerabilidades para interações sociais (Persuasão/Intimidação).|

Para vilões, o manual vai além, oferecendo métodos para esquemas, fraquezas e até opções de classes de vilão (como o Paladino Quebrador de Juramentos e o Clérigo da Morte), que devem ser tratadas como subclasses restritas no gerenciador de fichas de personagens do webapp.<sup>2</sup>
## **O Mestre de Regras: Mecânicas de Ambiente e Sobrevivência**
A exploração de masmorras e terras selvagens é governada por regras de fadiga, clima e perigos naturais. Muitas vezes, essas regras são ignoradas por serem difíceis de rastrear manualmente, o que torna sua implementação em um webapp um diferencial de valor extremo para jogadores que buscam uma experiência de "survival" mais autêntica.<sup>19</sup>
### **Clima Extremo e Perigos Ambientais**
O DMG define CDs (Dificuldade de Classe) específicas para a exposição a elementos. O rastreamento de exaustão é o principal mecanismo de penalidade nestes casos.<sup>19</sup> O sistema deve disparar notificações ou testes automáticos de resistência de Constituição baseados no tempo de jogo decorrido.

- **Frio Extremo (Abaixo de 0° F):** CD 10 de Con por hora ou ganha 1 nível de exaustão. Personagens com resistência a frio ou roupas adequadas são imunes.<sup>19</sup>
- **Calor Extremo (Acima de 100° F):** CD 5 (+1 por hora adicional) ou exaustão. Desvantagem em testes para quem usa armadura média ou pesada.<sup>27</sup>
- **Altitude Elevada:** Acima de 10.000 pés, o tempo de viagem conta como o dobro para fins de fadiga, a menos que o personagem esteja aclimatado.<sup>27</sup>
- **Vento Forte:** Desvantagem em ataques à distância e testes de Percepção auditiva; extingue chamas expostas.<sup>27</sup>
- **Água Gélida:** O personagem pode resistir um número de minutos igual ao seu valor de Constituição; depois disso, CD 10 de Con a cada minuto ou ganha exaustão.<sup>27</sup>
### **Armadilhas e Riscos Mecânicos vs. Mágicos**
Armadilhas são componentes essenciais de masmorras e o DMG as divide em mecânicas (baseadas em gatilhos físicos) e mágicas (baseadas em magias como *Glifo de Guarda*).<sup>30</sup> Para um desenvolvedor, o sistema de armadilhas deve ser escalável. O DMG fornece uma tabela de severidade que correlaciona o nível dos personagens com o dano esperado, permitindo que o app gere armadilhas balanceadas para qualquer tier de jogo.<sup>30</sup>

|**Tier de Personagem**|**Dano de Revés (Setback)**|**Dano Perigoso**|**Dano Mortal**|
| :- | :- | :- | :- |
|1º a 4º|$1d10$|$2d10$|$4d10$|
|5º a 10º|$2d10$|$4d10$|$10d10$|
|11º a 16º|$4d10$|$10d10$|$18d10$|
|17º a 20º|$10d10$|$18d10$|$24d10$|

A implementação de armadilhas complexas exige que o sistema suporte uma ordem de iniciativa para a armadilha, permitindo que ela realize ações durante o combate, como disparar lâminas giratórias ou liberar gás venenoso em turnos específicos.<sup>30</sup>
## **Gestão de Tesouros e Itens Mágicos**
O banco de dados de itens mágicos é o componente mais consultado em qualquer aplicação de D&D. O DMG fornece não apenas as descrições, mas as regras de sintonização (attunement), raridade e tabelas de distribuição aleatória.<sup>1</sup>
### **Sintonização e Limites de Poder**
Um webapp de gerenciamento de ficha deve aplicar rigidamente o limite de sintonização. A maioria dos personagens pode se sintonizar com apenas três itens mágicos ao mesmo tempo.<sup>22</sup> O sistema deve verificar se o item exige sintonização e se o personagem atende aos pré-requisitos (como ser um conjurador de uma classe específica).<sup>22</sup>

A identificação de itens mágicos também possui regras específicas: um personagem pode descobrir as propriedades de um item durante um descanso curto, ou através da magia *Identificar*. O webapp deve ter estados de "Item Desconhecido" e "Item Identificado" para manter o mistério para os jogadores até que o processo seja concluído.<sup>35</sup>
### **Tabelas de Tesouro Aleatório**
Para automatizar o loot, o desenvolvedor deve implementar as Tabelas de Itens Mágicos de A a I. Essas tabelas são ponderadas por raridade e utilidade.<sup>38</sup>

|**Tabela**|**Tipo de Conteúdo Predominante**|**Raridade Comum**|
| :- | :- | :- |
|Tabela A|Consumíveis de baixo nível (poções, pergaminhos).|Comum / Incomum|
|Tabela B|Itens utilitários leves e poções de cura média.|Incomum|
|Tabela C|Poções poderosas e itens raros menores.|Rara|
|Tabela D|Itens muito raros consumíveis e munição mágica.|Muito Rara|
|Tabela E|Pergaminhos de nível 9 e poções lendárias.|Lendária|
|Tabela F|Armas e armaduras incomuns permanentes (+1).|Incomum|
|Tabela G|Itens raros permanentes, armas +2.|Rara|
|Tabela H|Itens muito raros permanentes, armas +3.|Muito Rara|
|Tabela I|Artefatos e itens lendários permanentes.|Lendária|

O sistema de geração de tesouro deve permitir ao mestre rolar "Tesouros Individuais" para encontros rápidos ou "Hordas de Tesouro" para o clímax de uma aventura, onde gemas, objetos de arte e itens mágicos são combinados com grandes quantidades de moedas.<sup>18</sup>
## **Atividades de Entre-Aventuras (Downtime)**
O período de inatividade entre missões é onde o desenvolvimento do personagem ocorre fora do combate. O DMG fornece regras para construção de fortalezas, farra, pesquisa e artesanato.<sup>41</sup> No entanto, um webapp deve estar atento à evolução dessas regras, já que o livro *Xanathar's Guide to Everything* (XGtE) e o DMG 2024 revisaram profundamente esses sistemas para torná-los mais interessantes mecanicamente.<sup>5</sup>
### **Evolução das Regras de Downtime**
Para um desenvolvedor, é recomendável suportar tanto as regras "legadas" do DMG 2014 quanto as versões atualizadas. Enquanto o DMG 2014 foca no custo diário e progresso linear (ex: 25gp de progresso por dia para itens mágicos), as versões mais recentes introduzem complicações e resoluções baseadas em testes de perícia semanais.<sup>41</sup>

As atividades essenciais a serem codificadas incluem:

1. **Artesanato:** Requer proficiência em ferramentas e custo de materiais (metade do valor de mercado). O webapp deve rastrear o progresso em GP/dia ou GP/semana.<sup>29</sup>
1. **Farra (Carousing):** Envolve gastos em estilo de vida aristocrático e rolagens em tabelas de eventos aleatórios que podem resultar em aliados, inimigos ou dívidas.<sup>41</sup>
1. **Compra e Venda de Itens Mágicos:** Um processo complexo que exige testes de Persuasão para encontrar compradores/vendedores e determinar o preço final com base na raridade do item.<sup>44</sup>
1. **Pesquisa:** Custo de ouro por semana para obter informações sobre o lore da campanha ou segredos de vilões.<sup>29</sup>
1. **Bastiões (DMG 2024):** Um sistema completo de gestão de base que permite aos jogadores emitir ordens a subordinados. Este módulo requer uma interface de gerenciamento separada na aplicação, similar a um jogo de estratégia em turnos.<sup>1</sup>
## **O Mestre das Regras: Variantes e Customização do Motor**
O Capítulo 9 do DMG introduz regras variantes que podem mudar drasticamente a dificuldade e o tom do jogo. Um webapp deve tratar essas variantes como "toggles" de configuração que alteram a lógica de outras partes do sistema.<sup>2</sup>
### **Variantes de Pacing e Descanso**
As regras de descanso são o acelerador do jogo. O app deve permitir configurar:

- **Realismo Árduo (Gritty Realism):** Descanso curto = 8 horas; Descanso longo = 7 dias. Esta configuração altera o rastreamento de tempo e a recuperação de magias e HP.<sup>13</sup>
- **Heroísmo Épico:** Descanso curto = 5 minutos; Descanso longo = 1 hora. Ideal para campanhas de alta ação onde o app deve permitir a recuperação quase instantânea de recursos.<sup>13</sup>
### **Regras de Combate e Saúde**
Variantes como "Flanqueamento" (Vantagem para quem cerca o inimigo) exigem integração com o grid de combate digital para detectar automaticamente a posição relativa dos tokens.<sup>47</sup> Outras regras, como "Lesões Duradouras" e "Dano Massivo", exigem que o sistema monitore a perda repentina de grandes quantidades de vida e solicite testes de resistência de Choque Sistêmico.<sup>2</sup>

A variante de "Pontos de Mana" (Spell Points) em vez de espaços de magia (Slots) é uma mudança profunda no banco de dados de magias, exigindo que o gerenciador de magias do personagem converta o custo de cada nível de magia em uma reserva numérica única.<sup>2</sup>
## **O Framework Legal para Desenvolvedores de Aplicações**
Um ponto de falha comum para desenvolvedores de webapps de D&D é a negligência das restrições legais da Wizards of the Coast (WotC). Para publicar uma ferramenta legalmente, é preciso entender o uso do SRD (System Reference Document) sob as licenças OGL ou Creative Commons.<sup>6</sup>
### **OGL vs. Creative Commons (CC-BY-4.0)**
Até 2023, a maioria das ferramentas usava a OGL (Open Game License), que permitia o uso do conteúdo do SRD 5.1 mas exigia a inclusão de textos legais específicos e proibia o uso de "Identidade de Produto" (PI).<sup>50</sup> Após uma controvérsia pública, a WotC liberou o SRD 5.1 sob a licença Creative Commons Attribution 4.0 International (CC-BY-4.0), que é muito mais permissiva, irrevogável e permite o uso comercial com apenas a necessidade de atribuição de crédito.<sup>6</sup>

O novo SRD 5.2 (revisão de 2024) foi lançado exclusivamente sob Creative Commons. Esta versão removeu referências a personagens protegidos como Strahd e Orcus e renomeou itens icônicos (ex: "Deck of Many Things" virou "Mysterious Deck") para que criadores de ferramentas possam usá-los sem infringir marcas registradas.<sup>6</sup>
### **O que NÃO pode ser incluído (Identidade de Produto)**
A menos que a aplicação seja publicada via DMsGuild (que exige uma fatia de 50% dos lucros), o desenvolvedor NÃO pode incluir:

- **Monstros Específicos:** Beholder, Mind Flayer (Illithid), Gauth, Carrion Crawler, Displacer Beast, Umber Hulk e Yuan-ti.<sup>50</sup>
- **Personagens Nomeados:** Qualquer menção a Mordenkainen, Tasha, Vecna ou Bigby nos nomes de magias ou itens (ex: *Tasha's Hideous Laughter* deve ser referenciada apenas como *Hideous Laughter*).<sup>6</sup>
- **Cenários de Campanha:** Forgotten Realms, Ravenloft, Eberron e Dark Sun são protegidos. O app deve focar no conteúdo genérico de fantasia medieval ou permitir que o usuário insira seus próprios nomes.<sup>50</sup>
### **Implicações para Construtores de Personagens**
Ferramentas digitais como o D&D Beyond ou o Charactermancer do Roll20 operam sob licenças privadas diretas com a WotC, o que lhes permite usar todo o conteúdo do PHB, DMG e Monster Manual.<sup>59</sup> Para um desenvolvedor independente, o webapp deve, por padrão, oferecer apenas o conteúdo do SRD (uma subclasse por classe, uma raça por espécie, etc.). Para incluir o restante, o app deve oferecer uma funcionalidade de "Homebrew" onde o próprio usuário insere os dados dos livros que comprou, ou suportar a importação de arquivos de dados de terceiros, transferindo a responsabilidade da posse do conteúdo para o usuário final.<sup>61</sup>
## **Conclusão e Diretrizes de Engenharia**
O Guia do Mestre de D&D 5e é um repositório exaustivo de sistemas interconectados. Para um desenvolvedor de webapp, o desafio não é apenas armazenar esses dados, mas entender a interdependência entre as escalas de mapa e o consumo de recursos, entre a raridade dos itens e a economia de sintonização, e entre o nível de desafio e o orçamento de XP.

A implementação técnica deve começar pela lógica central do d20 e evoluir para módulos de ambiente e tesouro. Ao adotar o SRD 5.2 sob Creative Commons, o desenvolvedor garante uma base legal sólida e moderna, permitindo a criação de uma ferramenta que não apenas auxilia o jogo, mas automatiza a complexidade matemática do DMG, deixando o Mestre e os jogadores livres para se focarem na narrativa e na diversão. A transição para a edição de 2024, com seus novos sistemas de Bastiões e regras de exploração refinadas, representa a fronteira atual para ferramentas digitais de RPG, oferecendo novas camadas de simulação que eram impraticáveis de gerenciar manualmente no passado.
#### **Referências citadas**
1. Dungeon Master's Guide (2024) - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/sources/dnd/dmg-2024>
1. Dungeon Master's Guide (5e) - Dungeons & Dragons Lore Wiki - Fandom, acessado em janeiro 21, 2026, <https://dungeonsdragons.fandom.com/wiki/Dungeon_Master%27s_Guide_(5e)>
1. Building Encounters in Fifth Edition Dungeons & Dragons: SlyFlourish.com, acessado em janeiro 21, 2026, <https://slyflourish.com/5e_encounter_building.html>
1. D&D 5E (2014) - Creating combat encounters: looking for tips, acessado em janeiro 21, 2026, <https://www.enworld.org/threads/creating-combat-encounters-looking-for-tips.484403/>
1. How Downtime Rules Evolved and Left the PH and DMG Behind | Alphastream, acessado em janeiro 21, 2026, <https://alphastream.org/index.php/2019/11/14/how-downtime-rules-evolved-and-left-the-ph-and-dmg-behind/>
1. SRD v5.2.1 - System Reference Document - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/srd>
1. TTRPG Worldbuilding Guide: Create Your Universe - Flutes Loot, acessado em janeiro 21, 2026, <https://www.flutesloot.com/creating-your-own-universe/>
1. dnd 5e 2014 - Do the map scales suggested in the DMG tie into any rules?, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/130599/do-the-map-scales-suggested-in-the-dmg-tie-into-any-rules>
1. D&D 5E (2014) - Mapping tool--what's the current state of the art?, acessado em janeiro 21, 2026, <https://www.enworld.org/threads/mapping-tool-whats-the-current-state-of-the-art.405223/>
1. How big are your hexes, anyway? - Scroll for Initiative, acessado em janeiro 21, 2026, <https://scrollforinitiative.com/2021/10/31/how-big-are-your-hexes-anyway/>
1. blank province, kingdom, and continent hex maps for 5e - Blog of Holding, acessado em janeiro 21, 2026, <https://www.blogofholding.com/?p=6751>
1. Is there a generally accepted norm for Hex grid size for world maps? : r/DnD - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/10o6njk/is_there_a_generally_accepted_norm_for_hex_grid/>
1. Ability Check - 5etools, acessado em janeiro 21, 2026, <https://5e.tools/variantrules.html>
1. Great Wheel cosmology | Forgotten Realms Wiki - Fandom, acessado em janeiro 21, 2026, <https://forgottenrealms.fandom.com/wiki/Great_Wheel_cosmology>
1. Plane (Dungeons & Dragons) - Wikipedia, acessado em janeiro 21, 2026, <https://en.wikipedia.org/wiki/Plane_(Dungeons_%26_Dragons)>
1. The Planes - DMG 2024 : r/planescapesetting - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/planescapesetting/comments/1gp6dyw/the_planes_dmg_2024/>
1. Appendix D: The Planes of Existence - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/sources/dnd/basic-rules-2014/appendix-d-the-planes-of-existence>
1. Random Tables of the Dungeons and Dragons 5th Edition Dungeon Master's Guide, acessado em janeiro 21, 2026, <https://slyflourish.com/random_tables_of_the_dmg.html>
1. The DMG has rules for Extreme Cold, but what about less extreme cold effects?, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/154728/the-dmg-has-rules-for-extreme-cold-but-what-about-less-extreme-cold-effects>
1. Designing Encounters | Level Up - A5E.tools, acessado em janeiro 21, 2026, <https://a5e.tools/rules/designing-encounters>
1. DMG-Errata.pdf - DUNGEON MASTER'S GUIDE - Wizards of the Coast, acessado em janeiro 21, 2026, <https://media.wizards.com/2018/dnd/downloads/DMG-Errata.pdf>
1. Dungeon Master's Guide (2014) - Sage Advice & Errata - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/sources/dnd/sae/dungeon-masters-guide-2014>
1. Creating Adventures The DMG Way : r/dndnext - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/spqatc/creating_adventures_the_dmg_way/>
1. List of All Personality Traits, Ideals, Bonds & Flaws, acessado em janeiro 21, 2026, <https://www.enworld.org/threads/list-of-all-personality-traits-ideals-bonds-flaws.469002/>
1. Roll an Adventure Using the 5e Dungeon Master's Guide — Part I - GeekDad, acessado em janeiro 21, 2026, <https://geekdad.com/2014/12/5e-dungeon-masters-guide-1/>
1. Dungeon Master's Guide D&D 5, acessado em janeiro 21, 2026, <http://solternion.pbworks.com/w/file/fetch/112990231/D%26D%205E%20-%20DMG.pdf>
1. Environmental Effects | D&D 2024 | Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Rules:Environmental%20Effects>
1. RAW Review: Extreme Cold Terrain in D&D 5E - Rules and Tips - Bjarke the Bard, acessado em janeiro 21, 2026, <https://www.bjarkethebard.com/blog/raw-review-cold-terrain-dnd5e>
1. The Environment - 5th Edition SRD, acessado em janeiro 21, 2026, <https://www.5esrd.com/gamemastering/the-environment/>
1. Traps | D&D 5th Edition on Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Traps>
1. Chapter 15: Running the Game - Basic Rules for Dungeons and Dragons (D&D) Fifth Edition (5e) - D&D Beyond, acessado em janeiro 21, 2026, <https://www.dndbeyond.com/sources/dnd/basic-rules-2014/running-the-game>
1. Unearthed Arcana: Traps Revisited - Wizards of the Coast, acessado em janeiro 21, 2026, <https://media.wizards.com/2017/dnd/downloads/0227_UATraps.pdf>
1. Magic Item Tables | Level Up - A5E.tools, acessado em janeiro 21, 2026, <https://a5e.tools/rules/magic-item-tables>
1. Magic Items by Type - 5th Edition SRD, acessado em janeiro 21, 2026, <https://5thsrd.com/Gamemaster_Rules/magic_item_indices/items_by_type/>
1. Magic Items | D&D 2024 | Roll20 Compendium, acessado em janeiro 21, 2026, <https://roll20.net/compendium/dnd5e/Rules:Magic%20Items?expansion=33335>
1. Magic Items (Alphabetical) - DnD5e.info - 5th Edition System Reference Document/5e SRD, acessado em janeiro 21, 2026, <https://dnd5e.info/magic-items/item/>
1. D&D 5e - Magic Item Guide - Tribality, acessado em janeiro 21, 2026, <https://www.tribality.com/2015/11/02/dd-5e-magic-item-guide/>
1. 5e Dungeon Master Tables, acessado em janeiro 21, 2026, <https://dungeonmastertools.github.io/>
1. Individual Treasure: Challenge 0-4 - 5e Dungeon Master Tables, acessado em janeiro 21, 2026, <https://dungeonmastertools.github.io/treasure.html>
1. Updated Magic Item Tables for all released D&D books : r/dndnext - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/p92680/updated_magic_item_tables_for_all_released_dd/>
1. More Downtime Activities, acessado em janeiro 21, 2026, <https://media.wizards.com/2014/downloads/dnd/DMG_128.pdf>
1. D&D 5E Downtime Activities Guide | PDF | Dungeons & Dragons | Leisure - Scribd, acessado em janeiro 21, 2026, <https://www.scribd.com/document/369097118/D-D-5E-Downtime-Rules>
1. Downtime Activities (from Xanathar's Guide to Everything) | Roll20: Online virtual tabletop, acessado em janeiro 21, 2026, <https://app.roll20.net/forum/post/5859115/downtime-activities-from-xanathars-guide-to-everything>
1. D&D 5E Downtime Activities: A Historical Deep Dive and Analysis - Bjarke the Bard, acessado em janeiro 21, 2026, <https://www.bjarkethebard.com/blog/dnd5e-downtime-activities-history-analysis>
1. DnD 5E downtime activities (I/II) - orkerhulen.dk, acessado em janeiro 21, 2026, <https://orkerhulen.dk/onewebmedia/DOWNTIME%20ACTIVITIES.pdf>
1. What Downtime Activity from Xanathar's Guide to Everything Yields the Greatest Profit?, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/207191/what-downtime-activity-from-xanathars-guide-to-everything-yields-the-greatest-p>
1. Know Your Options: 5E Variant Rules Guide - Tabletop Builds, acessado em janeiro 21, 2026, <https://tabletopbuilds.com/know-your-options-5e-variant-rules-guide/>
1. D&D 5E (2014) - What are your favorite optional rules?, acessado em janeiro 21, 2026, <https://www.enworld.org/threads/what-are-your-favorite-optional-rules.698273/>
1. Top 5 Optional Rules in D&D 5E : r/dndnext - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/lrg9n9/top_5_optional_rules_in_dd_5e/>
1. SRD-OGL\_V5.1.pdf - Wizards of the Coast, acessado em janeiro 21, 2026, <https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf>
1. Open Game License - Wikipedia, acessado em janeiro 21, 2026, <https://en.wikipedia.org/wiki/Open_Game_License>
1. D&D - System Reference Document v5.2 - Tribality, acessado em janeiro 21, 2026, <https://www.tribality.com/2025/04/23/dd-system-reference-document-v5-2/>
1. Dungeons & Dragons SRD 5.2 Is Officially Live, acessado em janeiro 21, 2026, <https://www.enworld.org/threads/dungeons-dragons-srd-5-2-is-officially-live.713038/>
1. 5E24 Product Identity | EN World D&D & Tabletop RPG News & Reviews, acessado em janeiro 21, 2026, <https://www.enworld.org/threads/5e24-product-identity.714324/>
1. D&D 5E (2014) - OGL / SRD 5.1 | EN World D&D & Tabletop RPG News & Reviews, acessado em janeiro 21, 2026, <https://www.enworld.org/threads/ogl-srd-5-1.570862/>
1. Can I legally include official spell names (outside the SRD) in my homebrew rulebook? : r/dndnext - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/dndnext/comments/1n0ykgj/can_i_legally_include_official_spell_names/>
1. Dungeon Masters Guild Licensing Information, acessado em janeiro 21, 2026, <https://help.dmsguild.com/hc/en-us/articles/12776887523479-Dungeon-Masters-Guild-Licensing-Information>
1. Wizards of the Coast's Fan Content Policy : r/UnearthedArcana - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/UnearthedArcana/comments/7z1hre/wizards_of_the_coasts_fan_content_policy/>
1. Educator Resources - D&D, acessado em janeiro 21, 2026, <https://dnd-support.wizards.com/hc/en-us/articles/9485614877588-Educator-Resources>
1. D&D Beyond - Official Digital Toolset for Dungeons & Dragons Fifth Edition rules - Tribality, acessado em janeiro 21, 2026, <https://www.tribality.com/2017/03/13/dd-beyond-official-digital-toolset-for-dungeons-dragons-fifth-edition-rules/>
1. What's the legality of making a character editor? - Role-playing Games Stack Exchange, acessado em janeiro 21, 2026, <https://rpg.stackexchange.com/questions/92567/whats-the-legality-of-making-a-character-editor>
1. D&D 5e Character Creator on Roll20: Beginner's Guide, acessado em janeiro 21, 2026, <https://pages.roll20.net/dnd/character-creator-guide>
1. Do you need approval from WOTC to design a digital tool for playing dnd 5e? - Reddit, acessado em janeiro 21, 2026, <https://www.reddit.com/r/DnD/comments/fo5i45/do_you_need_approval_from_wotc_to_design_a/>
