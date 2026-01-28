
export const ITEMS_DATABASE = {
    "dnd5e": [
        // --- ARMAS SIMPLES CORPO-A-CORPO ---
        { id: "adaga", name: "Adaga", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "2 po", weight: "0.5 kg", damage: "1d4 perfurante", properties: ["Acuidade", "Leve", "Arremesso (6/18m)"], description: "Uma lâmina curta e afiada, fácil de esconder." },
        { id: "azagaia", name: "Azagaia", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "5 pp", weight: "1 kg", damage: "1d6 perfurante", properties: ["Arremesso (9/36m)"], description: "Uma lança leve projetada para arremesso." },
        { id: "bordao", name: "Bordão", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "2 pp", weight: "2 kg", damage: "1d6 concussão", properties: ["Versátil (1d8)"], description: "Um bastão de madeira longo e resistente." },
        { id: "clava", name: "Clava", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "1 pp", weight: "1 kg", damage: "1d4 concussão", properties: ["Leve"], description: "Um pedaço de madeira grosso e pesado." },
        { id: "clava_grande", name: "Clava Grande", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "2 pp", weight: "5 kg", damage: "1d8 concussão", properties: ["Duas Mãos"], description: "Um tronco de madeira maciço." },
        { id: "foice_curta", name: "Foice Curta", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "1 po", weight: "1 kg", damage: "1d4 cortante", properties: ["Leve"], description: "Ferramenta agrícola adaptada para combate." },
        { id: "lanca", name: "Lança", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "1 po", weight: "1.5 kg", damage: "1d6 perfurante", properties: ["Arremesso (6/18m)", "Versátil (1d8)"], description: "Haste longa com ponta metálica." },
        { id: "macca", name: "Maça", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "5 po", weight: "2 kg", damage: "1d6 concussão", properties: [], description: "Bastão de metal com uma cabeça pesada e flangeada." },
        { id: "martelo_leve", name: "Martelo Leve", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "2 po", weight: "1 kg", damage: "1d4 concussão", properties: ["Leve", "Arremesso (6/18m)"], description: "Martelo de arremesso ou ferramenta." },
        { id: "machadinha", name: "Machadinha", type: "weapon", subtype: "simples_cac", rarity: "common", cost: "5 po", weight: "1 kg", damage: "1d6 cortante", properties: ["Leve", "Arremesso (6/18m)"], description: "Pequeno machado de mão." },

        // --- ARMAS SIMPLES À DISTÂNCIA ---
        { id: "arco_curto", name: "Arco Curto", type: "weapon", subtype: "simples_dist", rarity: "common", cost: "25 po", weight: "1 kg", damage: "1d6 perfurante", properties: ["Munição (24/96m)", "Duas Mãos"], description: "Um arco pequeno, fácil de manusear." },
        { id: "besta_leve", name: "Besta Leve", type: "weapon", subtype: "simples_dist", rarity: "common", cost: "25 po", weight: "2.5 kg", damage: "1d8 perfurante", properties: ["Munição (24/96m)", "Recarga", "Duas Mãos"], description: "Arma mecânica de disparo." },
        { id: "dardo", name: "Dardo", type: "weapon", subtype: "simples_dist", rarity: "common", cost: "5 pc", weight: "0.1 kg", damage: "1d4 perfurante", properties: ["Acuidade", "Arremesso (6/18m)"], description: "Pequena arma de arremesso balanceada." },
        { id: "funda", name: "Funda", type: "weapon", subtype: "simples_dist", rarity: "common", cost: "1 pp", weight: "-", damage: "1d4 concussão", properties: ["Munição (9/36m)"], description: "Tira de couro para arremessar pedras." },

        // --- ARMAS MARCIAIS CORPO-A-CORPO ---
        { id: "alabarda", name: "Alabarda", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "20 po", weight: "3 kg", damage: "1d10 cortante", properties: ["Pesada", "Alcance", "Duas Mãos"], description: "Haste longa com lâmina de machado e ponta." },
        { id: "cimitarra", name: "Cimitarra", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "25 po", weight: "1.5 kg", damage: "1d6 cortante", properties: ["Acuidade", "Leve"], description: "Espada de lâmina curva." },
        { id: "chicote", name: "Chicote", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "2 po", weight: "1.5 kg", damage: "1d4 cortante", properties: ["Acuidade", "Alcance"], description: "Tira de couro trançada." },
        { id: "espada_curta", name: "Espada Curta", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "10 po", weight: "1 kg", damage: "1d6 perfurante", properties: ["Acuidade", "Leve"], description: "Lâmina reta e leve." },
        { id: "espada_longa", name: "Espada Longa", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "15 po", weight: "1.5 kg", damage: "1d8 cortante", properties: ["Versátil (1d10)"], description: "A arma clássica do cavaleiro." },
        { id: "espada_grande", name: "Espada Larga (Greatsword)", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "50 po", weight: "3 kg", damage: "2d6 cortante", properties: ["Pesada", "Duas Mãos"], description: "Espada massiva que requer duas mãos." },
        { id: "glaive", name: "Glaive", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "20 po", weight: "3 kg", damage: "1d10 cortante", properties: ["Pesada", "Alcance", "Duas Mãos"], description: "Lâmina curva na ponta de uma haste." },
        { id: "lancca_montaria", name: "Lança de Montaria", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "10 po", weight: "3 kg", damage: "1d12 perfurante", properties: ["Alcance", "Especial"], description: "Usada por cavaleiros montados." },
        { id: "machado_batalha", name: "Machado de Batalha", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "10 po", weight: "2 kg", damage: "1d8 cortante", properties: ["Versátil (1d10)"], description: "Lâmina pesada de um ou dois gumes." },
        { id: "machado_grande", name: "Machado Grande (Greataxe)", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "30 po", weight: "3.5 kg", damage: "1d12 cortante", properties: ["Pesada", "Duas Mãos"], description: "Machado enorme capaz de partir escudos." },
        { id: "mangual", name: "Mangual", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "10 po", weight: "1 kg", damage: "1d8 concussão", properties: [], description: "Esfera de metal presa a um cabo por corrente." },
        { id: "martelo_guerra", name: "Martelo de Guerra", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "15 po", weight: "1 kg", damage: "1d8 concussão", properties: ["Versátil (1d10)"], description: "Martelo pesado para combate." },
        { id: "maul", name: "Malho (Maul)", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "10 po", weight: "5 kg", damage: "2d6 concussão", properties: ["Pesada", "Duas Mãos"], description: "Marreta de combate gigante." },
        { id: "picareta_guerra", name: "Picareta de Guerra", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "5 po", weight: "1 kg", damage: "1d8 perfurante", properties: [], description: "Picareta reforçada para perfurar armaduras." },
        { id: "rapiere", name: "Rapieira", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "25 po", weight: "1 kg", damage: "1d8 perfurante", properties: ["Acuidade"], description: "Espada fina e elegante." },
        { id: "tridente", name: "Tridente", type: "weapon", subtype: "marcial_cac", rarity: "common", cost: "5 po", weight: "2 kg", damage: "1d6 perfurante", properties: ["Arremesso (6/18m)", "Versátil (1d8)"], description: "Lança de três pontas." },

        // --- ARMAS MARCIAIS À DISTÂNCIA ---
        { id: "arco_longo", name: "Arco Longo", type: "weapon", subtype: "marcial_dist", rarity: "common", cost: "50 po", weight: "1 kg", damage: "1d8 perfurante", properties: ["Munição (45/180m)", "Pesada", "Duas Mãos"], description: "Arco grande de longo alcance." },
        { id: "besta_pesada", name: "Besta Pesada", type: "weapon", subtype: "marcial_dist", rarity: "common", cost: "50 po", weight: "9 kg", damage: "1d10 perfurante", properties: ["Munição (30/120m)", "Pesada", "Recarga", "Duas Mãos"], description: "Besta potente e pesada." },
        { id: "besta_mao", name: "Besta de Mão", type: "weapon", subtype: "marcial_dist", rarity: "common", cost: "75 po", weight: "1.5 kg", damage: "1d6 perfurante", properties: ["Munição (9/36m)", "Leve", "Recarga"], description: "Pequena besta de mão única." },
        { id: "zarabatana", name: "Zarabatana", type: "weapon", subtype: "marcial_dist", rarity: "common", cost: "10 po", weight: "0.5 kg", damage: "1 perfurante", properties: ["Munição (7/30m)", "Recarga"], description: "Tubo para disparar agulhas." },
        { id: "rede", name: "Rede", type: "weapon", subtype: "marcial_dist", rarity: "common", cost: "1 po", weight: "1.5 kg", damage: "-", properties: ["Arremesso (1.5/4.5m)", "Especial"], description: "Rede para prender oponentes." },

        // --- ARMADURAS LEVES ---
        { id: "acolchoada", name: "Acolchoada", type: "armor", subtype: "leve", rarity: "common", cost: "5 po", weight: "4 kg", ac: "11 + DES", properties: ["Desvantagem em Furtividade"], description: "Camadas de pano acolchoado." },
        { id: "couro", name: "Couro", type: "armor", subtype: "leve", rarity: "common", cost: "10 po", weight: "5 kg", ac: "11 + DES", properties: [], description: "Peitoral e ombros de couro rígido." },
        { id: "couro_batido", name: "Couro Batido", type: "armor", subtype: "leve", rarity: "common", cost: "45 po", weight: "6.5 kg", ac: "12 + DES", properties: [], description: "Couro reforçado com rebites de metal." },

        // --- ARMADURAS MÉDIAS ---
        { id: "gibao_peles", name: "Gibão de Peles", type: "armor", subtype: "media", rarity: "common", cost: "10 po", weight: "6 kg", ac: "12 + DES (máx 2)", properties: [], description: "Peles grossas e couro." },
        { id: "camisao_malha", name: "Camisão de Malha", type: "armor", subtype: "media", rarity: "common", cost: "50 po", weight: "10 kg", ac: "13 + DES (máx 2)", properties: [], description: "Aneis de metal entrelaçados." },
        { id: "brunea", name: "Brunea (Scale Mail)", type: "armor", subtype: "media", rarity: "common", cost: "50 po", weight: "20 kg", ac: "14 + DES (máx 2)", properties: ["Desvantagem em Furtividade"], description: "Escamas de metal sobrepostas." },
        { id: "peitoral", name: "Peitoral", type: "armor", subtype: "media", rarity: "common", cost: "400 po", weight: "10 kg", ac: "14 + DES (máx 2)", properties: [], description: "Peitoral de metal moldado." },
        { id: "meia_armadura", name: "Meia-Armadura", type: "armor", subtype: "media", rarity: "common", cost: "750 po", weight: "20 kg", ac: "15 + DES (máx 2)", properties: ["Desvantagem em Furtividade"], description: "Placas de metal cobrindo a maior parte do corpo." },

        // --- ARMADURAS PESADAS ---
        { id: "cota_aneis", name: "Cota de Anéis", type: "armor", subtype: "pesada", rarity: "common", cost: "30 po", weight: "20 kg", ac: "14", properties: ["Desvantagem em Furtividade"], description: "Anéis de metal costurados em couro." },
        { id: "cota_malha", name: "Cota de Malha", type: "armor", subtype: "pesada", rarity: "common", cost: "75 po", weight: "25 kg", ac: "16", properties: ["Força 13", "Desvantagem em Furtividade"], description: "Malha de metal completa." },
        { id: "cota_talas", name: "Cota de Talas", type: "armor", subtype: "pesada", rarity: "common", cost: "200 po", weight: "30 kg", ac: "17", properties: ["Força 15", "Desvantagem em Furtividade"], description: "Tiras verticais de metal rebitadas." },
        { id: "placas", name: "Armadura de Placas", type: "armor", subtype: "pesada", rarity: "common", cost: "1500 po", weight: "32 kg", ac: "18", properties: ["Força 15", "Desvantagem em Furtividade"], description: "Placas de metal intertravadas cobrindo todo o corpo." },

        // --- ESCUDOS ---
        { id: "escudo", name: "Escudo", type: "armor", subtype: "escudo", rarity: "common", cost: "10 po", weight: "3 kg", ac: "+2", properties: [], description: "Proteção de madeira ou metal." },

        // --- ITENS MÁGICOS (SELEÇÃO) ---
        { id: "pocao_cura", name: "Poção de Cura", type: "wondrous", subtype: "pocao", rarity: "common", cost: "50 po", weight: "0.2 kg", description: "Um líquido vermelho que brilha quando agitado. Cura 2d4 + 2 PV." },
        { id: "pocao_cura_maior", name: "Poção de Cura Maior", type: "wondrous", subtype: "pocao", rarity: "uncommon", cost: "100+ po", weight: "0.2 kg", description: "Cura 4d4 + 4 PV." },
        { id: "pocao_cura_superior", name: "Poção de Cura Superior", type: "wondrous", subtype: "pocao", rarity: "rare", cost: "500+ po", weight: "0.2 kg", description: "Cura 8d4 + 8 PV." },
        { id: "mochila_carga", name: "Mochila de Carga (Bag of Holding)", type: "wondrous", subtype: "maravilhoso", rarity: "uncommon", cost: "-", weight: "7 kg", description: "Esta mochila tem um espaço interior consideravelmente maior que o exterior. Pode conter até 250 kg, não excedendo um volume de 1,7 m³." },
        { id: "corda_escalada", name: "Corda de Escalada", type: "wondrous", subtype: "maravilhoso", rarity: "common", cost: "-", weight: "1.5 kg", description: "Uma corda de seda de 18m que se move ao comando do dono." },
        { id: "saco_truques", name: "Saco de Truques (Bag of Tricks)", type: "wondrous", subtype: "maravilhoso", rarity: "uncommon", cost: "-", weight: "0.2 kg", description: "Um pequeno saco contendo bolinhas de pelos que se transformam em animais." },
        { id: "bota_elfica", name: "Botas Élficas", type: "wondrous", subtype: "maravilhoso", rarity: "uncommon", cost: "-", weight: "-", description: "Seus passos não fazem barulho independentemente da superfície. Vantagem em Furtividade." },
        { id: "bota_voo", name: "Botas de Voo", type: "wondrous", subtype: "maravilhoso", rarity: "uncommon", cost: "-", weight: "-", description: "Enquanto vesti-las, você tem deslocamento de voo igual ao seu deslocamento de caminhada." },
        { id: "capa_protecao", name: "Capa de Proteção", type: "wondrous", subtype: "maravilhoso", rarity: "uncommon", cost: "-", weight: "-", description: "Concede +1 na CA e em todos os testes de resistência." },
        { id: "anel_prot", name: "Anel de Proteção", type: "wondrous", subtype: "anel", rarity: "rare", cost: "-", weight: "-", description: "Concede +1 na CA e em todos os testes de resistência." },
        { id: "anel_invis", name: "Anel de Invisibilidade", type: "wondrous", subtype: "anel", rarity: "legendary", cost: "-", weight: "-", description: "Você pode ficar invisível à vontade." },
        { id: "varinha_misseis", name: "Varinha de Mísseis Mágicos", type: "wondrous", subtype: "varinha", rarity: "uncommon", cost: "-", weight: "0.5 kg", description: "Esta varinha tem 7 cargas. Pode gastar cargas para lançar 'Mísseis Mágicos'." },
        { id: "arma_mais_um", name: "Arma +1", type: "weapon", subtype: "magico", rarity: "uncommon", cost: "-", weight: "Var", damage: "Var +1", properties: ["Mágico"], description: "Uma arma imbuída com magia. Você tem +1 nas jogadas de ataque e dano." },
        { id: "armadura_mais_um", name: "Armadura +1", type: "armor", subtype: "magico", rarity: "rare", cost: "-", weight: "Var", ac: "Var +1", properties: ["Mágico"], description: "Armadura mágica que concede +1 extra na CA." },
        { id: "escudo_mais_um", name: "Escudo +1", type: "armor", subtype: "escudo_magico", rarity: "rare", cost: "-", weight: "3 kg", ac: "+3", properties: ["Mágico"], description: "Escudo mágico que concede +1 extra na CA (total +3)." },
        { id: "oculos_noite", name: "Óculos da Noite", type: "wondrous", subtype: "maravilhoso", rarity: "uncommon", cost: "-", weight: "-", description: "Concede Visão no Escuro de 18m. Se já tiver, aumenta em 18m." },
        { id: "tiara_intelecto", name: "Tiara do Intelecto", type: "wondrous", subtype: "maravilhoso", rarity: "uncommon", cost: "-", weight: "-", description: "Sua Inteligência se torna 19 enquanto usar este item." },
        { id: "luvas_ogro", name: "Manoplas de Força do Ogro", type: "wondrous", subtype: "maravilhoso", rarity: "uncommon", cost: "-", weight: "-", description: "Sua Força se torna 19 enquanto usar este item." },
        { id: "amuleto_saude", name: "Amuleto da Saúde", type: "wondrous", subtype: "maravilhoso", rarity: "rare", cost: "-", weight: "-", description: "Sua Constituição se torna 19 enquanto usar este item." },
        { id: "pedra_ioun", name: "Pedra Ioun", type: "wondrous", subtype: "maravilhoso", rarity: "rare", cost: "-", weight: "-", description: "Uma pedra que flutua ao redor da cabeça concedendo benefícios variados." },
        { id: "deck_many", name: "Baralho das Coisas (Deck of Many Things)", type: "wondrous", subtype: "maravilhoso", rarity: "legendary", cost: "-", weight: "-", description: "Um baralho de cartas de marfim adornadas. Comprar uma carta pode alterar o destino." }
    ]
};
