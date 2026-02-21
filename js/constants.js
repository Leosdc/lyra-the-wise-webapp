export const APP_VERSION = "2.8.0";

export const RPG_TRIVIA = [
    "Dungeons & Dragons foi criado por Gary Gygax e Dave Arneson em 1974.",
    "O primeiro RPG comercializado foi o D&D original, vindo de um jogo de guerra chamado 'Chainmail'.",
    "Dados de 20 lados (d20) existem desde a Roma Antiga, mas não eram usados para RPGs.",
    "O nome 'Vecna' é um anagrama de Jack Vance, escritor que inspirou o sistema de magia do D&D.",
    "Tasha, do feitiço Riso Incontrolável, era o nome da filha de uma das jogadoras de Gygax.",
    "O cenário de 'Forgotten Realms' foi criado por Ed Greenwood quando ele tinha apenas 8 anos.",
    "Os Beholders e Mind Flayers são propriedade intelectual exclusiva da Wizards of the Coast.",
    "O d6 é o dado mais antigo do mundo, com exemplares datados de 5.000 anos atrás.",
    "Gary Gygax trabalhava como sapateiro enquanto escrevia as regras de D&D.",
    "A classe Bardo foi originalmente uma 'classe de prestígio' que exigia níveis em Lutador e Ladrão.",
    "O dragão Bahamut é inspirado na mitologia árabe, onde é um peixe gigante que sustenta a Terra.",
    "A primeira edição de D&D vinha em uma modesta caixa de madeira com três livretes.",
    "A 'Gygaxian Naturalism' é o termo para mundos de RPG que funcionam como ecossistemas reais.",
    "O primeiro personagem de Gary Gygax foi um mago chamado Mordenkainen.",
    "A TSR (empresa do D&D) quase faliu em 1982 devido a uma linha de agulhas de crochê tematizadas.",
    "Stephen King quase escreveu um suplemento oficial para o sistema GURPS nos anos 80.",
    "O RPG 'Cyberpunk 2020' previu corretamente o uso de videochamadas e interfaces neurais.",
    "Em 'Vampiro: A Máscara', o termo 'Kindred' foi escolhido para soar mais elegante que 'vampiro'.",
    "O sistema 'Pathfinder' surgiu de uma edição de D&D (3.5) que os fãs se recusaram a abandonar.",
    "A revista 'Dragon Magazine' publicou mais de 400 edições de conteúdo oficial de D&D.",
    "O termo 'Critical Hit' foi introduzido pela primeira vez em um jogo chamado 'Empire of the Petal Throne'.",
    "O primeiro cenário de campanha publicado foi Blackmoor, de Dave Arneson.",
    "O conceito de Pontos de Vida (HP) foi adaptado de jogos navais para simular a resistência de heróis.",
    "O Mímico foi criado por Gygax para impedir que jogadores saíssem abrindo baús sem checar armadilhas.",
    "A aventura 'Tumba dos Horrores' foi feita especificamente para desafiar jogadores de níveis muito altos.",
    "Vin Diesel joga D&D há mais de 30 anos e tem o nome de seu personagem tatuado no peito.",
    "A cena inicial de 'E.T.: O Extraterrestre' mostra os personagens jogando D&D em casa.",
    "O termo 'Dungeon Master' é uma marca registrada da Wizards of the Coast.",
    "A deusa Tiamat, embora baseada na Babilônia, teve sua forma de 5 cabeças inventada para o RPG.",
    "No início, os jogadores ganhavam experiência (XP) encontrando ouro, e não derrotando monstros.",
    "A classe Paladino foi inspirada nos Doze Pares de França da literatura medieval.",
    "O 'D20 System' foi lançado sob uma licença aberta (OGL), permitindo que qualquer um criasse jogos compatíveis.",
    "A 'Sessão Zero' é considerada a regra não escrita mais importante para alinhar expectativas no grupo.",
    "A Sanidade foi introduzida como mecânica principal no RPG 'Chamado de Cthulhu' em 1981.",
    "A maior campanha contínua de RPG do mundo está ativa há mais de 40 anos com o mesmo mestre.",
    "O RPG brasileiro 'Tormenta' nasceu como um encarte para a revista Dragão Brasil em 1999.",
    "O d10 é o único dado comum de RPG que não é um sólido platônico regular.",
    "A primeira tradução oficial de D&D para o português foi lançada pela Grow em 1992.",
    "Existem dados de RPG feitos de pedras preciosas, metal, ossos e até meteoritos reais.",
    "O termo 'Tank' veio do RPG de mesa para descrever o personagem que protege o resto do grupo.",
    "O primeiro RPG de terror foi 'Bunnies & Burrows', onde você jogava com coelhos tentando sobreviver.",
    "A 'Maldição dos Dados' é a superstição de que dados podem ter 'sorte' ou 'azar' acumulados.",
    "O sistema GURPS é famoso por ter suplementos tão detalhados que são usados como referência histórica.",
    "No cenário 'Dark Sun', a magia é tão poderosa que drena a vida das plantas ao redor do conjurador.",
    "O Alinhamento original de D&D tinha apenas três opções: Ordeiro, Neutro e Caótico.",
    "A classe Monge foi inspirada nos filmes de artes marciais dos anos 70 que Gygax adorava.",
    "Muitos nomes em Greyhawk são anagramas dos nomes dos amigos de Gary Gygax.",
    "O 'X-Card' é uma ferramenta de segurança moderna usada para pular temas sensíveis na mesa.",
    "O Beholder foi ideia de Terry Kuntz, irmão de um dos jogadores originais de Gary.",
    "O RPG é hoje reconhecido por psicólogos como uma ferramenta eficaz para desenvolver empatia e socialização."
];

export const SUPPORTED_SYSTEMS = [
    { id: "dnd5e", name: "D&D 5ª Edição" },
    { id: "dnd35", name: "D&D 3.5" },
    { id: "pathfinder", name: "Pathfinder 2ª Edição" },
    { id: "pathfinder1e", name: "Pathfinder 1ª Edição" },
    { id: "vampire", name: "Vampire: The Masquerade (V5)" },
    { id: "werewolf", name: "Werewolf: The Apocalypse" },
    { id: "mage", name: "Mage: The Ascension" },
    { id: "cofd", name: "Chronicles of Darkness" },
    { id: "cyberpunkred", name: "Cyberpunk RED" },
    { id: "cyberpunk2020", name: "Cyberpunk 2020" },
    { id: "blades", name: "Blades in the Dark" },
    { id: "cthulhu", name: "Call of Cthulhu 7ª Edição" },
    { id: "7thsea", name: "7th Sea 2ª Edição" },
    { id: "apocalypse", name: "Apocalypse World" },
    { id: "ars_magica", name: "Ars Magica 5ª Edição" },
    { id: "champions", name: "Champions / Hero System" },
    { id: "cortex", name: "Cortex Prime" },
    { id: "deadlands", name: "Deadlands (Savage Worlds)" },
    { id: "dungeon_world", name: "Dungeon World" },
    { id: "eclipse", name: "Eclipse Phase 2ª Edição" },
    { id: "exalted", name: "Exalted 3ª Edição" },
    { id: "fate_accelerated", name: "FATE Accelerated" },
    { id: "fate_core", name: "FATE Core" },
    { id: "fiasco", name: "Fiasco" },
    { id: "gurps", name: "GURPS 4ª Edição" },
    { id: "ironkingdoms", name: "Iron Kingdoms" },
    { id: "l5r", name: "Legend of the Five Rings (L5R)" },
    { id: "faserip", name: "Marvel Super Heroes (FASERIP)" },
    { id: "microlite20", name: "Microlite20" },
    { id: "monster_week", name: "Monster of the Week" },
    { id: "mutants", name: "Mutants & Masterminds 3ª Edição" },
    { id: "numenera", name: "Numenera (Cypher System)" },
    { id: "pendragon", name: "Pendragon (King Arthur)" },
    { id: "risus", name: "Risus: The Anything RPG" },
    { id: "savage", name: "Savage Worlds" },
    { id: "shadowdemon", name: "Shadow of the Demon Lord" },
    { id: "shadowrun", name: "Shadowrun 5ª/6ª Edição" },
    { id: "startrek", name: "Star Trek Adventures (Modiphius)" },
    { id: "starwars_ffg", name: "Star Wars RPG (FFG)" },
    { id: "starwars_d20", name: "Star Wars RPG (d20/Saga)" },
    { id: "tiny_dungeon", name: "Tiny Dungeon 2ª Edição" },
    { id: "victoriana", name: "Victoriana 3ª Edição" },
    { id: "wfrp1e", name: "Warhammer Fantasy 1ª Edição" },
    { id: "wfrp4e", name: "Warhammer Fantasy 4ª Edição" },
    { id: "13thage", name: "13th Age" }
];

/**
 * @typedef {Object} Character
 * @property {Object} bio - Informações biográficas
 * @property {string} bio.name
 * @property {string} bio.class
 * @property {number} bio.level
 * @property {Object} attributes - Atributos D&D (str, dex, con, int, wis, cha)
 * @property {Object} stats - Estatísticas de combate (hp_current, hp_max, ac, etc.)
 * @property {Object} inventory - Inventário e moedas
 * @property {Object} spells - Magias e slots
 */

export const SYSTEM_TEMPLATES = {
    "dnd5e": {
        bio: {
            name: "",
            class: "",
            archetype: "",
            level: 1,
            race: "",
            subrace: "",
            background: "",
            alignment: "",
            xp: 0,
            playerName: ""
        },
        attributes: {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10
        },
        stats: {
            hp_current: 0,
            hp_max: 0,
            hp_temp: 0,
            ac: 10,
            initiative: 0,
            speed: "9m",
            proficiency_bonus: 2,
            passive_perception: 10,
            hit_dice_total: "1d8",
            hit_dice_current: 1
        },
        proficiencies_choice: {
            saving_throws: [], // ["str", "con"]
            skills: [], // ["athletics", "perception"]
            expertise: [] // ["stealth"]
        },
        death_saves: {
            successes: 0,
            failures: 0
        },
        attacks: [], // { name, bonus, damage, type, range, properties }
        spells: {
            ability: "int",
            save_dc: 8,
            attack_bonus: 0,
            slots: {
                l1: { total: 0, used: 0 },
                l2: { total: 0, used: 0 },
                l3: { total: 0, used: 0 },
                l4: { total: 0, used: 0 },
                l5: { total: 0, used: 0 },
                l6: { total: 0, used: 0 },
                l7: { total: 0, used: 0 },
                l8: { total: 0, used: 0 },
                l9: { total: 0, used: 0 }
            },
            list: [] // { name, level, prepared, description }
        },
        inventory: {
            coins: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
            items: [], // { name, weight, quantity, equipped, description }
            encumbrance: { current: 0, limit: 150 }
        },
        story: {
            traits: "",
            ideals: "",
            bonds: "",
            flaws: "",
            appearance: "",
            mannerisms: "",
            talents: "",
            languages: "",
            other_proficiencies: "",
            notes: ""
        },
        conditions: [] // ["exhaustion_1"]
    }
};

export const RACES = [
    "Aasimar", "Anão", "Aranha-do-Mar", "Bugbear", "Centauro", "Changeling", "Draconato", "Duende", "Elfo", "Fada", "Firbolg", "Forjado Bélico", "Genasi", "Githyanki", "Githzerai", "Gnomo", "Goblin", "Golias", "Hobgoblin", "Humano", "Kenku", "Kobold", "Leonino", "Lizardfolk (Povo Lagarto)", "Loxodonte", "Meio-Elfo", "Meio-Orc", "Minotauro", "Orc", "Pequenino", "Sátiro", "Tabaxi", "Tiferino", "Tortuga", "Tritão", "Yuan-ti"
];

export const CLASSES = [
    "Artífice", "Bárbaro", "Bardo", "Bruxo", "Clérigo", "Druida", "Feiticeiro", "Guerreiro", "Ladino", "Lançador de Runas", "Mago", "Monge", "Paladino", "Patrulheiro", "Sangue de Dragão"
];

export const ALIGNMENTS = [
    "Leal e Bom", "Neutro e Bom", "Caótico e Bom",
    "Leal e Neutro", "Neutro", "Caótico e Neutro",
    "Leal e Mau", "Neutro e Mau", "Caótico e Mau"
];

export const SUBRACES = {
    "Elfo": ["Alto Elfo", "Elfo da Floresta", "Drow", "Eladrin", "Marinho", "Shadar-kai"],
    "Anão": ["Anão da Colina", "Anão da Montanha", "Duergar"],
    "Pequenino": ["Pés-Leves", "Robusto", "Fantasma"],
    "Draconato": ["Cromático (Preto)", "Cromático (Azul)", "Cromático (Verde)", "Cromático (Vermelho)", "Cromático (Branco)", "Metálico (Latão)", "Metálico (Bronze)", "Metálico (Cobre)", "Metálico (Ouro)", "Metálico (Prata)", "Gemado (Ametista)", "Gemado (Cristal)", "Gemado (Esmeralda)", "Gemado (Safira)", "Gemado (Topázio)"],
    "Gnomo": ["Gnomo da Floresta", "Gnomo das Rochas", "Gnomo das Profundezas (Svirfneblin)"],
    "Humano": ["Padrão", "Variante"],
    "Tiferino": ["Linhagem de Asmodeus", "Linhagem de Baalzebul", "Linhagem de Dispater", "Linhagem de Fierna", "Linhagem de Glasya", "Linhagem de Levistus", "Linhagem de Mammon", "Linhagem de Mephistopheles", "Linhagem de Zariel", "Variante Alado"],
    "Aasimar": ["Protetor", "Flagelo", "Caído", "D&D 2024 (Etereal)"],
    "Genasi": ["Ar", "Terra", "Fogo", "Água"],
    "Githyanki": ["Padrão"],
    "Githzerai": ["Padrão"],
    "Golias": ["Padrão"],
    "Orc": ["Padrão"],
    "Changeling": ["Padrão"],
    "Forjado Bélico": ["Integrado", "Batedor", "Titã"],
    "Meio-Elfo": ["Padrão", "Variante (Drow)", "Variante (Aquático)", "Variante (Floresta)", "Variante (Alto Elfo)"]
};

export const ARCHETYPES = {
    "Bárbaro": ["Caminho do Berserker", "Caminho do Guerreiro Totêmico", "Caminho do Elo Ancestral", "Caminho do Arauto da Tempestade", "Caminho do Fanático", "Caminho da Magia Selvagem", "Caminho da Besta"],
    "Bardo": ["Colégio do Conhecimento", "Colégio da Bravura", "Colégio do Glamour", "Colégio das Espadas", "Colégio dos Sussurros", "Colégio da Eloquência", "Colégio da Criação"],
    "Bruxo": ["O Corruptor (The Fiend)", "O Arquifada", "O Grande Antigo", "A Lâmina Maldita (Hexblade)", "O Celestial", "O Gênio", "O Morto-Vivo"],
    "Clérigo": ["Domínio do Conhecimento", "Domínio da Vida", "Domínio da Luz", "Domínio da Natureza", "Domínio da Tempestade", "Domínio do Truque", "Domínio da Guerra", "Domínio da Forja", "Domínio da Sepultura", "Domínio da Ordem", "Domínio da Paz", "Domínio do Crepúsculo"],
    "Druida": ["Círculo da Terra", "Círculo da Lua", "Círculo dos Sonhos", "Círculo do Pastor", "Círculo dos Esporos", "Círculo das Estrelas", "Círculo do Incêndio"],
    "Guerreiro": ["Campeão", "Mestre de Batalha", "Cavaleiro Arcano", "Arqueiro Arcano", "Cavaleiro (Cavalier)", "Samurai", "Eco Cavaleiro (Echo Knight)", "Guerreiro Psíquico", "Cavaleiro Rúnico"],
    "Monge": ["Caminho da Mão Aberta", "Caminho da Sombra", "Caminho dos Quatro Elementos", "Caminho do Mestre da Embriaguez", "Caminho do Kensei", "Caminho da Alma Radiante", "Caminho da Misericórdia", "Caminho do Eu Astral"],
    "Paladino": ["Juramento de Devoção", "Juramento dos Anciões", "Juramento de Vingança", "Juramento de Conquista", "Juramento de Redenção", "Juramento de Glória", "Juramento da Vigilância", "Quebrador de Juramento"],
    "Patrulheiro": ["Caçador", "Mestre das Bestas", "Perseguidor Sombrio (Gloom Stalker)", "Caçador de Monstros", "Andarilho do Horizonte", "Guardião das Sombras (Fey Wanderer)", "Guardião do Enxame"],
    "Ladino": ["Ladrão", "Assassino", "Trapaceiro Arcano", "Mestre de Tática (Mastermind)", "Inquisitivo", "Batedor (Scout)", "Estratagema (Swashbuckler)", "Lâmina Psíquica (Soulknife)", "Fantasma"],
    "Feiticeiro": ["Linhagem Dracônica", "Magia Selvagem", "Magia da Tempestade", "Magia Sombria", "Alma Divina", "Mente Aberrante", "Alma do Relógio"],
    "Mago": ["Escola de Abjuração", "Escola de Conjuração", "Escola de Adivinhação", "Escola de Encantamento", "Escola de Evocação", "Escola de Ilusão", "Escola de Necromancia", "Escola de Transmutação", "Canto da Lâmina (Bladesinging)", "Escriba Manifestado", "Cronurgia", "Graviturgia"],
    "Artífice": ["Alquimista", "Armeiro", "Artilheiro", "Ferreiro de Batalha"],
    "Lançador de Runas": ["Caminho da Runa Escarlate", "Caminho da Runa Gélida"],
    "Sangue de Dragão": ["Herança de Fogo", "Herança de Gelo"]
};

export const BACKGROUNDS = [
    "Acólito", "Andarilho", "Artesão", "Artista", "Charlatão", "Criminoso", "Eremita", "Escriba", "Fazendeiro", "Guarda", "Guia", "Marinheiro", "Mercador", "Nobre", "Sábio", "Soldado"
];


