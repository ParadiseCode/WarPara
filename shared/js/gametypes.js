// General note: entity (instance) id prefixes:
// used when generating instance ids
// listed here for reservation purposes

// PROJECTILE: 5
// MINION: 6
// MOB: 7
// NPC: 8
// ITEM: 9

Types = {
    Messages: {
        CREATE: 0,
        LOGIN: 1,
        WELCOME: 2,
        SPAWN: 3,
        DESPAWN: 4,
        MOVE: 5,
        LOOTMOVE: 6,
        AGGRO: 7,
        ATTACK: 8,
        HIT: 9,
        HURT: 10,
        HEALTH: 11,
        CHAT: 12,
        LOOT: 13,
        EQUIP: 14,
        DROP: 15,
        TELEPORT: 16,
        DAMAGE: 17,
        POPULATION: 18,
        KILL: 19,
        LIST: 20,
        WHO: 21,
        ZONE: 22,
        DESTROY: 23,
        HP: 24,
        BLINK: 25,
        OPEN: 26,
        CHECK: 27,
        PVP: 28,
        GUILD: 29,
        GUILDERROR: 30,
        GUILDERRORTYPE: {
            DOESNOTEXIST: 1,
            BADNAME: 2,
            ALREADYEXISTS: 3,
            NOLEAVE: 4,
            BADINVITE: 5,
            GUILDRULES: 6,
            IDWARNING: 7
        },
        GUILDACTION: {
            CONNECT: 8,
            ONLINE: 9,
            DISCONNECT: 10,
            INVITE: 11,
            LEAVE: 12,
            CREATE: 13,
            TALK: 14,
            JOIN: 15,
            POPULATION: 16
        },
        SWITCH: 32,
        SWITCHCHANGE: 33,
        UPDATE_INVENTORY: 34,
        RETREAT: 35,
        HITBOMB: 36,
        REMORT: 37,
        CASTSPELL: 38,
        PROJECT: 39,
        CONVERT: 40,
        RELOAD: 41,
        INVENTORYUSE: 42,
        HITHEAL: 43,
        MANA: 44,
        MP: 45,
        PROFILE: 46,
        EXP: 47,
        LOCAL: 48,
        PVPLEADER: 49,
        PVPKILL: 50,
        DETAIL: 51,
        NPC_LOOT: 52,
        MAPCHANGE: 53,
        USEDOORTOMAP: 54,
        ACTIVATETRAP: 55,
        HITWORLDPROJECTILE: 56,
        ADMINMSG: 57,
        HITRANGED: 58,
		INVENTORYSORT: 59,
		LEADERBOARDS: 60,
		GETCHECKOUT: 61,
        ACHIEVEMENT: 62,
		UPDATEFRIENDS: 63,
		PRIVATEMESSAGE: 64,
        STOREPURCHASE: 65,
        SERVER_CLIENT_STAT_PUSH: 66,
		IDNETTOKEN: 67,
        PREAUTH: 68,
        CHARACTERS: 69,
        ARENAPURCHASE: 70,
        ARENAWIN: 71,
        ARENAEXIT: 72,
        DELETECHARACTER: 73,
        BUFF_ENABLE: 74,
        BUFF_DISABLE: 75,
        DISPLACE: 76,
        DEBUG_MSG: 77,
        WAYPOINT_ENTER: 78,
        WAYPOINTS_UPDATE: 79,
        SPELLS: 80,
		AGGRORANGED: 81,
		RANGED_TARGET_CHANGED: 82,
		KEY: 83,
        DROPBOMB: 84,
		REQUEST_MOB_PROJECTILE: 85,
		PROJECT_WITH_ENTITIES: 86,
		SPEED:87,
		PLAYERS_STAT_REQUEST:88,
		SPEEDPOTION:89
    },
    
    PushStats: {
        GOLD: 1,
        CASH: 2,
        CRYSTALS: 3,
        EXP: 4,
        HP: 5,
        MANA: 6,
        KILLS: 7,
        ARENASPEND: 8,
        ARENAWIN: 9
    },
    
    Currencies: {
        GOLD: 1,
        CASH: 2,
        CRYSTALS: 3
    },

    GENDER: {
        MALE:   "M",
        FEMALE: "F"
    },


Buffs: {
        // buffs
        SHIELDED: 1,
        BLESSED: 2,
        INVISIBLE: 3,
        HULK: 4,
        INFERNO: 5,
		ENRAGED: 6,
        
        // debuffs
        CURSED: 501,
        FROZEN: 502,
        STUNNED: 503,
        POISONED: 504,
        TERRIFIED: 505,
        CONTROLLED: 506,
        TAUNTED: 507,
        BANISHED: 508,
        SLOWED: 509,
        RABBIT: 510

    },
        
    Projectiles: {
    
        // player>mob
        FIREBALL: 1,
        ICEBALL: 2,
        PINEARROW: 3,
        TORNADO: 4,
        TERROR: 5,
        BANISH: 6,
        BLACKHOLE: 7,
        TRANSFORM: 8,
        POISON: 9,
        BLESS: 10,
        CURSE: 11,
        STUN: 12,
        CONTROL: 13,
        TAUNT: 14,
        // possibly superfluous:
        INFERNO: 15,
        SHIELD: 16,
        INVISIBILITY: 17,
        SUMMONGOLEM: 18,
        POISONED: 19, // tick invoked from owning client

        // mob/trap > player
        LAVABALL: 101,
        DRAGONBALL: 102,
        BOULDER: 103,
		MOB6ARROW: 104,
        
        // player healing
        HEALBALL1: 201
        
    
    },

    Entities: {
        WARRIOR: 1,

        // Mobs
        MOB0: 1526,
        MOB1: 1527,
        MOB2: 1528,
        MOB3: 1529,
        MOB4: 1530,
        MOB5: 1531,
        MOB6: 1532,
        MOB7: 1533,
        MOB8: 1534,
        MOB9: 1535,
        MOB10: 1536,
        MOB11: 1537,
        MOB12: 1538,
        MOB13: 1539,
        MOB14: 1540,
        MOB15: 1541,
        MOB16: 1542,
        MOB17: 1543,
        MOB18: 1544,
        MOB19: 1545,
        MOB20: 1546,
        MOB21: 1547,
        MOB22: 1548,
        MOB23: 1549,
        MOB24: 1550,
        MOB25: 1551,
        MOB26: 1552,
        MOB27: 1553,
        MOB28: 1554,
        MOB29: 1555,
		MOB30: 1556,
        MOB31: 1557,
        MOB32: 1558,
        MOB33: 1559,
        MOB34: 1560,
        MOB35: 1561,
        MOB36: 1562,
        MOB37: 1563,
        MOB38: 1564,
        MOB39: 1565,
        MOB40: 1566,

        // Armors
        ARMOR0M: 326,
        ARMOR0F: 327,
        ARMOR1M: 328,
        ARMOR1F: 329,
        ARMOR2M: 330,
        ARMOR2F: 347,
        ARMOR3M: 331,
        ARMOR3F: 332,
        ARMOR4M: 333,
        ARMOR4F: 334,
        ARMOR5M: 335,
        ARMOR5F: 336,
        ARMOR6M: 337,
        ARMOR6F: 338,
        ARMOR7M: 339,
        ARMOR7F: 340,
        ARMOR8M: 341,
        ARMOR8F: 342,
        ARMOR9M: 343,
        ARMOR9F: 344,
        ARMOR10M: 345,
        ARMOR10F: 346,


        // Rings
        RING0: 460,
        RING1: 461,
        RING2: 462,
        RING3: 463,
        RING4: 464,
        RING5: 465,
        RING6: 466,
        RING7: 467,
        RING8: 468,
        RING9: 469,
        RING10: 470,

        // Objects
        BOOK: 37,
        WARDEN: 38,
        CLOTH: 381,
        LOCKEDDOOR: 39,
        ROCKWALL: 40,
        HIDDENWALL: 1041,
        FIRESPELL: 1042,
        HEALSPELL: 1043,
        ICESPELL: 1044,
        TORNADOSPELL: 1045,
        SHORTBOW: 1046,
        PINEARROW: 1047,
        TERRORSPELL: 1048,
        STUNSPELL: 1049,
        BLACKHOLESPELL: 1050,
        TRANSFORMSPELL: 1051,
        POISONSPELL: 1052,
        SHIELDSPELL: 1053,
        LITBOMB: 41,
        BOMBPOTION: 42,
        LEVER: 43,
        KEY: 44,
        KEYRED: 441,
        KEYGOLD: 442,
        KEYGREEN: 443,
        KEYBLUE: 444,
        BURGER: 46,
        CHEST: 47,
        FIREPOTION: 48,
        HEALTHPOTION1: 481,
        HEALTHPOTION2: 482,
        HEALTHPOTION3: 483,
        MANAPOTION1: 484,
        MANAPOTION2: 485,
        MANAPOTION3: 486,
        RESTOREPOTION1: 487,
        RESTOREPOTION2: 488,
        RESTOREPOTION3: 489,
        HULKPOTION1: 490,
        HULKPOTION2: 491,
        HULKPOTION3: 492,
        CAKE: 49,
        TRAP: 143,

        // NPCs
        GUARD: 50,
        KING: 51,
        OCTOCAT: 52,
        FAUN: 53,
        PRINCESS: 54,
        QUEEN: 55,
        WITCHESSON: 56,
        MATILDA: 57,
        SORCERER: 58,
        DWARF3: 59,
        DWARF5: 60,
        DWARF8: 61,
        WRITER: 62,
        PRIEST: 63,
        EMPTY3: 64,
        EMPTY4: 65,
        FAIRY3: 66,
        FAIRYQUEEN: 67,
        BANDAGED: 68,
        BLINDWOMAN: 69,
        CARETAKER: 70,
        DIRTYKID: 71,
        FORTUNETELLER: 72,
        GHOSTKING: 73,
        HERMIT: 74,
        JESTER: 75,
        WEAVER: 76,
        WOUNDED: 77,
        GUARD2: 78,
		DWARF1: 79,
        VENDOR1: 701,
        VENDOR2: 702,
        VENDOR3: 703,
        VENDOR4: 704,
        MORTY: 705,

        // Weapons
        AXE: 79,
        WEAPON0: 80,
        WEAPON1: 81,
        WEAPON2: 82,
        WEAPON3: 83,
        WEAPON4: 84,
        WEAPON5: 85,
        WEAPON6: 86,
        WEAPON7: 87,
        WEAPON8: 88,
        WEAPON9: 89,
        WEAPON10: 90,

        // minions
        FIREBALL: 99,
        
        HULK: 130,
        ARMOR8: 131,
        ARMOR9: 132,
        ARMOR10: 133,
        
        //static objects (complex animations)
        PORTAL: 150,
        
        // shields
        SHIELD0: 160,
        SHIELD1: 161,
        SHIELD2: 162,
        SHIELD3: 163,
        SHIELD4: 164,
        SHIELD5: 165,
        SHIELD6: 166,
        SHIELD7: 167,
        SHIELD8: 168,
        SHIELD9: 169,
        SHIELD10: 170,
        
        // amulets
        AMULET0: 180,
        AMULET1: 181,
        AMULET2: 182,
        AMULET3: 183,
        AMULET4: 184,
        AMULET5: 185,
        AMULET6: 186,
        AMULET7: 187,
        AMULET8: 188,
        AMULET9: 189,
        AMULET10: 190
    },

    Action: {
        SOCIAL_STATE: 191
    },

    Orientations: {
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
    },

    Keys: {
        ENTER: 13,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        W: 87,
        A: 65,
        B: 66,
        E: 69,
        S: 83,
        D: 68,
        G: 71,
        SPACE: 32,
        I: 73,
        H: 72,
        M: 77,
        P: 80,
        L: 76,
        KEY_0: 48,
        KEY_1: 49,
        KEY_2: 50,
        KEY_3: 51,
        KEY_4: 52,
        KEY_5: 53,
        KEY_6: 54,
        KEY_7: 55,
        KEY_8: 56,
        KEY_9: 57,
        KEYPAD_4: 100,
        KEYPAD_6: 102,
        KEYPAD_8: 104,
        KEYPAD_2: 98
    }
};
// name: [kind, type, exp, level]
var kinds = {
    warrior: [Types.Entities.WARRIOR, "player"],

    // weapon
    Sword_00: [Types.Entities.WEAPON0, "weapon"],
    Sword_01: [Types.Entities.WEAPON1, "weapon"],
    Sword_02: [Types.Entities.WEAPON2, "weapon"],
    Sword_03: [Types.Entities.WEAPON3, "weapon"],
    Sword_04: [Types.Entities.WEAPON4, "weapon"],
    Sword_05: [Types.Entities.WEAPON5, "weapon"],
    Sword_06: [Types.Entities.WEAPON6, "weapon"],
    Sword_07: [Types.Entities.WEAPON7, "weapon"],
    Sword_08: [Types.Entities.WEAPON8, "weapon"],
    Sword_09: [Types.Entities.WEAPON9, "weapon"],
    Sword_10: [Types.Entities.WEAPON10, "weapon"],

    // armor
    hulk: [Types.Entities.HULK, "armor"],
    Armor_00F: [Types.Entities.ARMOR0F, "armor"],
    Armor_00M: [Types.Entities.ARMOR0M, "armor"],
    Armor_01F: [Types.Entities.ARMOR1F, "armor"],
    Armor_01M: [Types.Entities.ARMOR1M, "armor"],
    Armor_02F: [Types.Entities.ARMOR2F, "armor"],
    Armor_02M: [Types.Entities.ARMOR2M, "armor"],
    Armor_03F: [Types.Entities.ARMOR3F, "armor"],
    Armor_03M: [Types.Entities.ARMOR3M, "armor"],
    Armor_04F: [Types.Entities.ARMOR4F, "armor"],
    Armor_04M: [Types.Entities.ARMOR4M, "armor"],
    Armor_05F: [Types.Entities.ARMOR5F, "armor"],
    Armor_05M: [Types.Entities.ARMOR5M, "armor"],
    Armor_06F: [Types.Entities.ARMOR6F, "armor"],
    Armor_06M: [Types.Entities.ARMOR6M, "armor"],
    Armor_07F: [Types.Entities.ARMOR7F, "armor"],
    Armor_07M: [Types.Entities.ARMOR7M, "armor"],
    Armor_08F: [Types.Entities.ARMOR8F, "armor"],
    Armor_08M: [Types.Entities.ARMOR8M, "armor"],
    Armor_09F: [Types.Entities.ARMOR9F, "armor"],
    Armor_09M: [Types.Entities.ARMOR9M, "armor"],
    Armor_10F: [Types.Entities.ARMOR10F, "armor"],
    Armor_10M: [Types.Entities.ARMOR10M, "armor"],

    lever: [Types.Entities.LEVER, "object"],
    key: [Types.Entities.KEY, "object"],
    keyred: [Types.Entities.KEYRED, "object"],
    keygold: [Types.Entities.KEYGOLD, "object"],
    keygreen: [Types.Entities.KEYGREEN, "object"],
    keyblue: [Types.Entities.KEYBLUE, "object"],
    cake: [Types.Entities.CAKE, "object"],
    burger: [Types.Entities.BURGER, "object"],
    chest: [Types.Entities.CHEST, "object"],
    trap: [Types.Entities.TRAP, "object"],
    firepotion: [Types.Entities.FIREPOTION, "object"],
    manapotion: [Types.Entities.MANAPOTION, "object"],
    
    healthpotion1: [Types.Entities.HEALTHPOTION1, "object"],
    healthpotion2: [Types.Entities.HEALTHPOTION2, "object"],
    healthpotion3: [Types.Entities.HEALTHPOTION3, "object"],
    manapotion1: [Types.Entities.MANAPOTION1, "object"],
    manapotion2: [Types.Entities.MANAPOTION2, "object"],
    manapotion3: [Types.Entities.MANAPOTION3, "object"],
    restorepotion1: [Types.Entities.RESTOREPOTION1, "object"],
    restorepotion2: [Types.Entities.RESTOREPOTION2, "object"],
    restorepotion3: [Types.Entities.RESTOREPOTION3, "object"],
    hulkpotion1: [Types.Entities.HULKPOTION1, "object"],
    hulkpotion2: [Types.Entities.HULKPOTION2, "object"],
    hulkpotion3: [Types.Entities.HULKPOTION3, "object"],
    
    rockwall: [Types.Entities.ROCKWALL, "object"],
    hiddenwall: [Types.Entities.HIDDENWALL, "object"],
    litbomb: [Types.Entities.LITBOMB, "object"],
    bombpotion: [Types.Entities.BOMBPOTION, "object"],
    lockeddoor: [Types.Entities.LOCKEDDOOR, "object"],
    warden: [Types.Entities.WARDEN, "object"],
    book: [Types.Entities.BOOK, "object"],
    
    Ring_00: [Types.Entities.RING0, "ring"],
    Ring_01: [Types.Entities.RING1, "ring"],
    Ring_02: [Types.Entities.RING2, "ring"],
    Ring_03: [Types.Entities.RING3, "ring"],
    Ring_04: [Types.Entities.RING4, "ring"],
    Ring_05: [Types.Entities.RING5, "ring"],
    Ring_06: [Types.Entities.RING6, "ring"],
    Ring_07: [Types.Entities.RING7, "ring"],
    Ring_08: [Types.Entities.RING8, "ring"],
    Ring_09: [Types.Entities.RING9, "ring"],
    Ring_10: [Types.Entities.RING10, "ring"],
    
    cloth: [Types.Entities.CLOTH, "object"],    
    firespell: [Types.Entities.FIRESPELL, "object"],
    healspell: [Types.Entities. HEALSPELL, "object"],
    icespell: [Types.Entities.ICESPELL, "object"],
    tornadospell: [Types.Entities.TORNADOSPELL, "object"],
    terrorspell: [Types.Entities.TERRORSPELL, "object"],
    stunspell: [Types.Entities.STUNSPELL, "object"],
    blackholespell: [Types.Entities.BLACKHOLESPELL, "object"],
    transformspell: [Types.Entities.TRANSFORMSPELL, "object"],
    poisonspell: [Types.Entities.POISONSPELL, "object"],
    shieldspell: [Types.Entities.SHIELDSPELL, "object"],
    shortbow: [Types.Entities.SHORTBOW, "object"],
    pinearrow: [Types.Entities.PINEARROW, "object"],
    
    portal: [Types.Entities.PORTAL, "object"],

    social_state: [Types.Action.SOCIAL_STATE, "action"],

    guard: [Types.Entities.GUARD, "npc"],
    priest: [Types.Entities.PRIEST, "npc"],
    king: [Types.Entities.KING, "npc"],
    sorcerer: [Types.Entities.SORCERER, "npc"],
    octocat: [Types.Entities.OCTOCAT, "npc"],
    fairy3: [Types.Entities.FAIRY3, "npc"],
    fairyqueen: [Types.Entities.FAIRYQUEEN, "npc"],
    bandaged: [Types.Entities.BANDAGED, "npc"],
    blindwoman: [Types.Entities.BLINDWOMAN, "npc"],
    caretaker: [Types.Entities.CARETAKER, "npc"],
    dirtykid: [Types.Entities.DIRTYKID, "npc"],
    fortuneteller: [Types.Entities.FORTUNETELLER, "npc"],
    ghostking: [Types.Entities.GHOSTKING, "npc"],
    hermit: [Types.Entities.HERMIT, "npc"],
    jester: [Types.Entities.JESTER, "npc"],
    weaver: [Types.Entities.WEAVER, "npc"],
    wounded: [Types.Entities.WOUNDED, "npc"],
    faun: [Types.Entities.FAUN, "npc"],
    princess: [Types.Entities.PRINCESS, "npc"],
    queen: [Types.Entities.QUEEN, "npc"],
    witchesson: [Types.Entities.WITCHESSON, "npc"],
    matilda: [Types.Entities.MATILDA, "npc"],
	dwarf1: [Types.Entities.DWARF1, "npc"],
    dwarf3: [Types.Entities.DWARF3, "npc"],
    dwarf5: [Types.Entities.DWARF5, "npc"],
    dwarf8: [Types.Entities.DWARF8, "npc"],
    writer: [Types.Entities.WRITER, "npc"],
    guard2: [Types.Entities.GUARD2, "npc"],
    vendor1: [Types.Entities.VENDOR1, "npc"],
    vendor2: [Types.Entities.VENDOR2, "npc"],
    vendor3: [Types.Entities.VENDOR3, "npc"],
    vendor4: [Types.Entities.VENDOR4, "npc"],
    morty: [Types.Entities.MORTY, "npc"],
    
    Shield_00: [Types.Entities.SHIELD0, "shield"],
    Shield_01: [Types.Entities.SHIELD1, "shield"],
    Shield_02: [Types.Entities.SHIELD2, "shield"],
    Shield_03: [Types.Entities.SHIELD3, "shield"],
    Shield_04: [Types.Entities.SHIELD4, "shield"],
    Shield_05: [Types.Entities.SHIELD5, "shield"],
    Shield_06: [Types.Entities.SHIELD6, "shield"],
    Shield_07: [Types.Entities.SHIELD7, "shield"],
    Shield_08: [Types.Entities.SHIELD8, "shield"],
    Shield_09: [Types.Entities.SHIELD9, "shield"],
    Shield_10: [Types.Entities.SHIELD10, "shield"],

    Amulet_00: [Types.Entities.AMULET0, "amulet"],
    Amulet_01: [Types.Entities.AMULET1, "amulet"],
    Amulet_02: [Types.Entities.AMULET2, "amulet"],
    Amulet_03: [Types.Entities.AMULET3, "amulet"],
    Amulet_04: [Types.Entities.AMULET4, "amulet"],
    Amulet_05: [Types.Entities.AMULET5, "amulet"],
    Amulet_06: [Types.Entities.AMULET6, "amulet"],
    Amulet_07: [Types.Entities.AMULET7, "amulet"],
    Amulet_08: [Types.Entities.AMULET8, "amulet"],
    Amulet_09: [Types.Entities.AMULET9, "amulet"],
    Amulet_10: [Types.Entities.AMULET10, "amulet"],

    getType: function(kind) {
        try {
            return Types.isCollectionItem(kind) ? Types.ITEM_TYPE.COLLECTION_ITEM : kinds[Types.getKindAsString(kind)][1];
        } catch(e) {
            console.error("No found type for entity: "+kind);
            console.error('Error stack: ' + e.stack);
        }
    },
    getMobExp: function(kind){
        return kinds[Types.getKindAsString(kind)][2];
    },
    getMobLevel: function(kind){
        return kinds[Types.getKindAsString(kind)][3];
    }

};

Types.Stores = {
    STORE1: {
                "inventory": []
    },
    STORE2: {
                "inventory": [
                    {"item": Types.Entities.RESTOREPOTION1, "cost": 50, "image": "img/3/item-restorepotion1.png"},
                    {"item": Types.Entities.RESTOREPOTION2, "cost": 100, "image": "img/3/item-restorepotion2.png"},
                    {"item": Types.Entities.RESTOREPOTION3, "cost": 200, "image": "img/3/item-restorepotion3.png"},
                    {"item": Types.Entities.BOMBPOTION, "cost": 25, "image": "img/3/item-bombpotion.png"}
                ]
    }
};

Types.waypoints = [
	["The Castle",         "centralarea",     99,  199, null      ],
    ["Dungeon 1",          "dungeon1",   	 183,    9,  null     ],
    ["Matilda`s Forest",   "forest",          68,  171, "Mob_002" ],
    ["Dungeon 2",          "dungeon2",       127,   33, "Mob_003" ],
    ["The Desert",         "desert",     	 157,   39, "Mob_004" ],
    ["Dungeon 3",		   "dungeon3", 	     127,  117, null	  ],
    ["Fairyland",		   "fairyland",      155,   32, null      ],
    ["Dungeon 4",		   "dungeon4",       183,    9, null      ],
    ["Death Valley",	   "baronsvalley",   126,  118, null      ],
    ["Dungeon 5", 		   "dungeon5",  	  43,  165, null      ],
    ["Dwarven Kingdom",    "dwarvenkingdom",  71,  287, null      ],
    ["Dungeon 6",		   "dungeon6", 		 267,    9, null	  ],
    ["Ghost Realm", 	   "centralarea",    462,  210, null      ],
    ["Dungeon 7",		   "dungeon7",    	  43,   93, null	  ],
	["The Beach", 		   "beach", 		 154,   29, null      ],
    ["Dungeon 8",		   "dungeon8", 	 	  15,  117, null	  ],
    ["Lavaland",		   "lavaland", 		 71,  136, null      ],
    ["Dungeon 9",		   "dungeon9",		 294,  261, null	  ],
    ["The Island", 		   "island", 		 186,   31, null      ],
    ["Dungeon 10",		   "dungeon10",		  15,    9, null	  ],
	["Test",               "test1",          135,  45,    null ],
    ["Arena",          "centralarea",       216,   66, "Mob_003" ]
];

Types.rankedWeapons = [
    Types.Entities.WEAPON0,
    Types.Entities.WEAPON1,
    Types.Entities.WEAPON2,
    Types.Entities.WEAPON3,
    Types.Entities.WEAPON4,
    Types.Entities.WEAPON5,
    Types.Entities.WEAPON6,
    Types.Entities.WEAPON7,
    Types.Entities.WEAPON8,
    Types.Entities.WEAPON9,
    Types.Entities.WEAPON10
];

Types.maleRankedArmors = [
    Types.Entities.ARMOR0M,
    Types.Entities.ARMOR1M,
    Types.Entities.ARMOR2M,
    Types.Entities.ARMOR3M,
    Types.Entities.ARMOR4M,
    Types.Entities.ARMOR5M,
    Types.Entities.ARMOR6M,
    Types.Entities.ARMOR7M,
    Types.Entities.ARMOR8M,
    Types.Entities.ARMOR9M,
    Types.Entities.ARMOR10M
];

Types.femaleRankedArmors = [
    Types.Entities.ARMOR0F,
    Types.Entities.ARMOR1F,
    Types.Entities.ARMOR2F,
    Types.Entities.ARMOR3F,
    Types.Entities.ARMOR4F,
    Types.Entities.ARMOR5F,
    Types.Entities.ARMOR6F,
    Types.Entities.ARMOR7F,
    Types.Entities.ARMOR8F,
    Types.Entities.ARMOR9F,
    Types.Entities.ARMOR10F
];

Types.rankedShields = [
    Types.Entities.SHIELD0,
    Types.Entities.SHIELD1,
    Types.Entities.SHIELD2,
    Types.Entities.SHIELD3,
    Types.Entities.SHIELD4,
    Types.Entities.SHIELD5,
    Types.Entities.SHIELD6,
    Types.Entities.SHIELD7,
    Types.Entities.SHIELD8,
    Types.Entities.SHIELD9,
    Types.Entities.SHIELD10
];

Types.rankedAmulets = [
    Types.Entities.AMULET0,
    Types.Entities.AMULET1,
    Types.Entities.AMULET2,
    Types.Entities.AMULET3,
    Types.Entities.AMULET4,
    Types.Entities.AMULET5,
    Types.Entities.AMULET6,
    Types.Entities.AMULET7,
    Types.Entities.AMULET8,
    Types.Entities.AMULET9,
    Types.Entities.AMULET10
];

Types.rankedRings = [
	Types.Entities.RING0,
	Types.Entities.RING1,
	Types.Entities.RING2,
	Types.Entities.RING3,
	Types.Entities.RING4,
	Types.Entities.RING5,
	Types.Entities.RING6,
	Types.Entities.RING7,
	Types.Entities.RING8,
	Types.Entities.RING9,
	Types.Entities.RING10
];

Types.emitterSpellLevel = function(map) 
{
	if(map=="island" || map=="dungeon10")
	{
		return 10;
	}
	else if(map=="lavaland" || map=="dungeon9")
	{
		return 9;
	}
	else if(map=="beach" || map=="dungeon8")
	{
		return 8;
	}
	else if(map=="centralarea" || map=="dungeon7")
	{
		return 7;
	}
	else if(map=="dwarvenkingdom" || map=="dungeon6")
	{
		return 6;
	}
	else if(map=="baronsvalley" || map=="dungeon5")
	{
		return 5;
	}
	else if(map=="fairyland" || map=="dungeon4")
	{
		return 4;
	}
	else if(map=="desert" || map=="dungeon3")
	{
		return 3;
	}
	else if(map=="forest" || map=="dungeon2")
	{
		return 2;
	}
	else
	{
		return 1;
	}
};

Types.expForLevel = function(level) {
    return Types.expList[level-1];
};

// array of exp total required for level 1,2,3 etc
// e.g level 1 requires 0 exp
Types.expList = [
 // level 1 to 100
0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000,
55000, 66000, 78000, 91000, 105000, 120000, 136000, 153000, 171000, 190000,
210000, 231000, 253000, 276000, 300000, 325000, 351000, 378000, 406000, 435000,
465000, 496000, 528000, 561000, 595000, 630000, 666000, 703000, 741000, 780000,
820000, 861000, 903000, 946000, 990000, 1035000, 1081000, 1128000, 1176000, 1225000,
1275000, 1326000, 1378000, 1431000, 1485000, 1540000, 1596000, 1653000, 1711000, 1770000,
1830000, 1891000, 1953000, 2016000, 2080000, 2145000, 2211000, 2278000, 2346000, 2415000,
2485000, 2556000, 2628000, 2701000, 2775000, 2850000, 2926000, 3003000, 3081000, 3160000,
3240000, 3321000, 3403000, 3486000, 3570000, 3655000, 3741000, 3828000, 3916000, 4005000,
4095000, 4186000, 4278000, 4371000, 4465000, 4560000, 4656000, 4753000, 4851000, 4950000,

// level 101 to 200
5050000, 5151000, 5253000, 5356000, 5460000, 5565000, 5671000, 5778000, 5886000, 5995000,
6105000, 6216000, 6328000, 6441000, 6555000, 6670000, 6786000, 6903000, 7021000, 7140000,
7260000, 7381000, 7503000, 7626000, 7750000, 7875000, 8001000, 8128000, 8256000, 8385000,
8515000, 8646000, 8778000, 8911000, 9045000, 9180000, 9316000, 9453000, 9591000, 9730000,
9870000, 10011000, 10153000, 10296000, 10440000, 10585000, 10731000, 10878000, 11026000, 11175000,
11325000, 11476000, 11628000, 11781000, 11935000, 12090000, 12246000, 12403000, 12561000, 12720000,
12880000, 13041000, 13203000, 13366000, 13530000, 13695000, 13861000, 14028000, 14196000, 14365000,
14535000, 14706000, 14878000, 15051000, 15225000, 15400000, 15576000, 15753000, 15931000, 16110000,
16290000, 16471000, 16653000, 16836000, 17020000, 17205000, 17391000, 17578000, 17766000, 17955000,
18145000, 18336000, 18528000, 18721000, 18915000, 19110000, 19306000, 19503000, 19701000, 19900000,

// level 201 to 300
20100000, 20301000, 20503000, 20706000, 20910000, 21115000, 21321000, 21528000, 21736000, 21945000,
22155000, 22366000, 22578000, 22791000, 23005000, 23220000, 23436000, 23653000, 23871000, 24090000,
24310000, 24531000, 24753000, 24976000, 25200000, 25425000, 25651000, 25878000, 26106000, 26335000,
26565000, 26796000, 27028000, 27261000, 27495000, 27730000, 27966000, 28203000, 28441000, 28680000,
28920000, 29161000, 29403000, 29646000, 29890000, 30135000, 30381000, 30628000, 30876000, 31125000,
31375000, 31626000, 31878000, 32131000, 32385000, 32640000, 32896000, 33153000, 33411000, 33670000,
33930000, 34191000, 34453000, 34716000, 34980000, 35245000, 35511000, 35778000, 36046000, 36315000,
36585000, 36856000, 37128000, 37401000, 37675000, 37950000, 38226000, 38503000, 38781000, 39060000,
39340000, 39621000, 39903000, 40186000, 40470000, 40755000, 41041000, 41328000, 41616000, 41905000,
42195000, 42486000, 42778000, 43071000, 43365000, 43660000, 43956000, 44253000, 44551000, 44850000,

// level 301 to 400
45150000, 45451000, 45753000, 46056000, 46360000, 46665000, 46971000, 47278000, 47586000, 47895000,
48205000, 48516000, 48828000, 49141000, 49455000, 49770000, 50086000, 50403000, 50721000, 51040000,
51360000, 51681000, 52003000, 52326000, 52650000, 52975000, 53301000, 53628000, 53956000, 54285000,
54615000, 54946000, 55278000, 55611000, 55945000, 56280000, 56616000, 56953000, 57291000, 57630000,
57970000, 58311000, 58653000, 58996000, 59340000, 59685000, 60031000, 60378000, 60726000, 61075000,
61425000, 61776000, 62128000, 62481000, 62835000, 63190000, 63546000, 63903000, 64261000, 64620000,
64980000, 65341000, 65703000, 66066000, 66430000, 66795000, 67161000, 67528000, 67896000, 68265000,
68635000, 69006000, 69378000, 69751000, 70125000, 70500000, 70876000, 71253000, 71631000, 72010000,
72390000, 72771000, 73153000, 73536000, 73920000, 74305000, 74691000, 75078000, 75466000, 75855000,
76245000, 76636000, 77028000, 77421000, 77815000, 78210000, 78606000, 79003000, 79401000, 79800000,

// level 401 to 500
80200000, 80601000, 81003000, 81406000, 81810000, 82215000, 82621000, 83028000, 83436000, 83845000,
84255000, 84666000, 85078000, 85491000, 85905000, 86320000, 86736000, 87153000, 87571000, 87990000,
88410000, 88831000, 89253000, 89676000, 90100000, 90525000, 90951000, 91378000, 91806000, 92235000,
92665000, 93096000, 93528000, 93961000, 94395000, 94830000, 95266000, 95703000, 96141000, 96580000,
97020000, 97461000, 97903000, 98346000, 98790000, 99235000, 99681000, 100128000, 100576000, 101025000,
101475000, 101926000, 102378000, 102831000, 103285000, 103740000, 104196000, 104653000, 105111000, 105570000,
106030000, 106491000, 106953000, 107416000, 107880000, 108345000, 108811000, 109278000, 109746000, 110215000,
110685000, 111156000, 111628000, 112101000, 112575000, 113050000, 113526000, 114003000, 114481000, 114960000,
115440000, 115921000, 116403000, 116886000, 117370000, 117855000, 118341000, 118828000, 119316000, 119805000,
120295000, 120786000, 121278000, 121771000, 122265000, 122760000, 123256000, 123753000, 124251000, 124750000, 
];

Types.getLevel = function(exp){
    var level = 1;
    for(var i=1; i<=Types.expList.length; i++){
        if(exp >= Types.expForLevel(i)){
            level = i;
        } else {
            break;
        }
    }
    return level;
};
Types.getWeaponRank = function(weaponKind) {
    return _.indexOf(Types.rankedWeapons, weaponKind);
};

Types.getArmorRank = function(armorKind, gender) {
    if(gender == this.GENDER.MALE)
        return _.indexOf(Types.maleRankedArmors, armorKind);

    if(gender == this.GENDER.FEMALE)
        return _.indexOf(Types.femaleRankedArmors, armorKind);
};

Types.getArmorByRank = function(rank, gender) {
    var result = Types.femaleRankedArmors[rank];

    if(gender == this.GENDER.MALE)
        result = Types.maleRankedArmors[rank];

    return result;
};

Types.getShieldRank = function(shieldKind) {
    return _.indexOf(Types.rankedShields, shieldKind);
};

Types.getAmuletRank = function(amuletKind) {
    return _.indexOf(Types.rankedAmulets, amuletKind);
};

Types.getRingRank = function(ringKind) {
    return _.indexOf(Types.rankedRings, ringKind);
};

Types.getMobExp = function(mobKind){
    return kinds.getMobExp(mobKind);
};
Types.getMobLevel = function(mobKind){
    return kinds.getMobLevel(mobKind);
};

Types.isPlayer = function(kind) {
    return kinds.getType(kind) === "player";
};

Types.isMob = function(kind) {
    return kinds.getType(kind) === "mob";
};

Types.isNpc = function(kind) {
    return kinds.getType(kind) === "npc";
};

Types.isCharacter = function(kind) {
    return Types.isMob(kind) || Types.isNpc(kind) || Types.isPlayer(kind);
};

Types.isArmor = function(kind) {
    return kinds.getType(kind) === "armor";
};

Types.isWeapon = function(kind) {
    return kinds.getType(kind) === "weapon";
};

Types.isShield = function(kind) {
    return kinds.getType(kind) === "shield";
};

Types.isAmulet = function(kind) {
    return kinds.getType(kind) === "amulet";
};

Types.isRing = function(kind) {
    return kinds.getType(kind) === "ring";
};

Types.isSpell = function(kind) {
	return (Types.isAttackItem(kind) && !Types.isWeapon(kind) && kind !== Types.Entities.SHORTBOW) || Types.isDefenseItem(kind);
};

Types.isObject = function(kind) {
    return kinds.getType(kind) === "object";
};

Types.isChest = function(kind) {
    return kind === Types.Entities.CHEST;
};

Types.isTrap = function(kind) {
    return kind === Types.Entities.TRAP;
};

Types.isLitBomb = function(kind) {
    return kind === Types.Entities.LITBOMB;
};

Types.isBombPotion = function(kind) {
    return kind === Types.Entities.BOMBPOTION;
};

Types.isLever = function(kind) {
    return kind === Types.Entities.LEVER;
};

Types.isLockedDoor = function(kind) {
    return kind === Types.Entities.LOCKEDDOOR;
};

Types.isCollectionItem = function(name) {
    return name == undefined ? false : name.toString().substr(0, 3) == "CIA";
}

Types.isItem = function(kind) {
    if (kind == undefined)
        return false;
    return Types.isCollectionItem(kind)
        || Types.isWeapon(kind)
        || Types.isArmor(kind)
        || Types.isShield(kind)
        || Types.isRing(kind)
        || Types.isAmulet(kind)
        || (Types.isObject(kind) && !Types.isChest(kind) && !Types.isTrap(kind) && !Types.isLitBomb(kind) && !Types.isLever(kind) && !Types.isLockedDoor(kind));
};

Types.isHealingItem = function(kind) {
    return kind === Types.Entities.FLASK
        || kind === Types.Entities.BURGER;
};

Types.isPotion = function(kind) {
    return kind == Types.Entities.FLASK      ||
           kind == Types.Entities.FIREPOTION ||
           kind == Types.Entities.MANAPOTION ||
          (kind >= Types.Entities.HEALTHPOTION1 && kind <= Types.Entities.HULKPOTION3);
};

Types.isExpendableItem = function(kind) {
    return Types.isHealingItem(kind)
        || kind === Types.Entities.FIREPOTION
        || kind === Types.Entities.CAKE;
};

// items you should only have one of
Types.isSingularItem = function(kind) {
    if (kind === Types.Entities.FIRESPELL) return true;
    if (kind === Types.Entities.ICESPELL) return true;
    if (kind === Types.Entities.HEALSPELL) return true;
    if (kind === Types.Entities.TORNADOSPELL) return true;
    if (kind === Types.Entities.TERRORSPELL) return true;
    if (kind === Types.Entities.STUNSPELL) return true;
    if (kind === Types.Entities.BLACKHOLESPELL) return true;
    if (kind === Types.Entities.TRANSFORMSPELL) return true;
    if (kind === Types.Entities.POISONSPELL) return true;
    if (kind === Types.Entities.SHIELDSPELL) return true;
    if (kind === Types.Entities.SHORTBOW) return true;
    if (kind === Types.Entities.CLOTH) return true;
    if (kind === Types.Entities.BOOK) return true;
    if (kind === Types.Entities.WARDEN) return true;
    return false;
};

Types.isAttackItem = function(kind) {
    if (kind === Types.Entities.FIRESPELL) return true;
    if (kind === Types.Entities.ICESPELL) return true;
    if (kind === Types.Entities.TORNADOSPELL) return true;
    if (kind === Types.Entities.TERRORSPELL) return true;
    if (kind === Types.Entities.STUNSPELL) return true;
    if (kind === Types.Entities.BLACKHOLESPELL) return true;
    if (kind === Types.Entities.TRANSFORMSPELL) return true;
    if (kind === Types.Entities.POISONSPELL) return true;
    if (kind === Types.Entities.SHORTBOW) return true;
    return false;
};

Types.isDefenseItem = function(kind) {
    if (kind === Types.Entities.HEALSPELL) return true;
    if (kind === Types.Entities.SHIELDSPELL) return true;
    return false;
};

Types.getBombDamage = function(){
    return 90;
};


Types.getProjectileForSpell = function(spellKind){
    var spells = {};

    spells[Types.Entities.SHORTBOW      ] = Types.Projectiles.PINEARROW;
    spells[Types.Entities.TORNADOSPELL  ] = Types.Projectiles.TORNADO;
    spells[Types.Entities.TERRORSPELL   ] = Types.Projectiles.TERROR;
    spells[Types.Entities.POISONSPELL   ] = Types.Projectiles.POISON;
    spells[Types.Entities.BLACKHOLESPELL] = Types.Projectiles.BLACKHOLE;
    spells[Types.Entities.TRANSFORMSPELL] = Types.Projectiles.TRANSFORM;
    spells[Types.Entities.STUNSPELL     ] = Types.Projectiles.STUN;
    spells[Types.Entities.ICESPELL      ] = Types.Projectiles.ICEBALL;
    spells[Types.Entities.FIRESPELL     ] = Types.Projectiles.FIREBALL;

    return spells[spellKind];
};


Types.getProjectileDamage = function(kind) {
    if (kind === Types.Projectiles.FIREBALL) return 50;
    if (kind === Types.Projectiles.ICEBALL) return 100;
    if (kind === Types.Projectiles.LAVABALL) return 200;
    if (kind === Types.Projectiles.PINEARROW) return 25;
	if (kind === Types.Projectiles.MOB6ARROW) return 1;
    if (kind === Types.Projectiles.BOULDER) return 75;
    if (kind === Types.Projectiles.TORNADO) return 50; // each tile change deals this amount to any mob within 2 tile range
    if (kind === Types.Projectiles.POISON) return 10; // initial
    if (kind === Types.Projectiles.POISONED) return 5; // per second
    if (kind === Types.Projectiles.BLACKHOLE) return 0;
    if (kind === Types.Projectiles.TRANSFORM) return 0;
	if (kind === Types.Projectiles.STUN) return 0;
};

Types.getProjectileManaCost = function(kind) {
    if (kind === Types.Projectiles.FIREBALL) return 10;
    if (kind === Types.Projectiles.ICEBALL) return 15;
    if (kind === Types.Projectiles.TORNADO) return 20;
    if (kind === Types.Projectiles.HEALBALL1) return 10;
    if (kind === Types.Projectiles.SHIELD) return 15;
    if (kind === Types.Projectiles.TERROR) return 5;
    if (kind === Types.Projectiles.STUN) return 10;
    if (kind === Types.Projectiles.POISON) return 15;
    if (kind === Types.Projectiles.TRANSFORM) return 15;
    if (kind === Types.Projectiles.BLACKHOLE) return 20;
};

Types.getProjectileName = function(kind) {
    if (kind === Types.Projectiles.FIREBALL) return 'fireball';
    if (kind === Types.Projectiles.ICEBALL) return 'iceball';
    if (kind === Types.Projectiles.TORNADO) return 'tornado';
    if (kind === Types.Projectiles.HEALBALL1) return 'healboll';
    if (kind === Types.Projectiles.SHIELD) return 'shield';
    if (kind === Types.Projectiles.TERROR) return 'terror';
    if (kind === Types.Projectiles.STUN) return 'stun';
    if (kind === Types.Projectiles.POISON) return 'POISON';
    if (kind === Types.Projectiles.TRANSFORM) return 'transform';
    if (kind === Types.Projectiles.BLACKHOLE) return 'blackhole';
};

Types.getProjectileKindFromString = function(name){
    if (name == 'fireball') return Types.Projectiles.FIREBALL;
    if (name == 'iceball') return Types.Projectiles.ICEBALL;
    if (name == 'lavaball') return Types.Projectiles.LAVABALL;
    if (name == 'pinearrow') return Types.Projectiles.PINEARROW;
	if (name == 'mob6arrow') return Types.Projectiles.MOB6ARROW;
    if (name == 'boulder') return Types.Projectiles.BOULDER;
};

Types.getKindFromString = function(kind) {
    if(kind in kinds) {
        return kinds[kind][0];
    }
};

Types.getKindAsString = function(kind) {

    for(var k in kinds) {
        if(kinds[k][0] === kind) {
            return k;
        }
    }

    if(this.isCollectionItem(kind))
        return kind;
};

// remove this after removing inspector
Types.getProperName = function(targetName) {
    // override variable names
    if(targetName == 'fairyqueen'){ return 'Fairy Queen'; }
    if(targetName == 'witchesson'){ return 'Rupert'; }
    if(targetName == 'blindwoman'){ return 'Blind Woman'; }
    if(targetName == 'dirtykid'){ return 'Peasant Boy'; }
    if(targetName == 'fortuneteller'){ return 'Fortune Teller'; }
    if(targetName == 'ghostking'){ return "King's Ghost"; }
	if(targetName == 'dwarf1'){ return 'Dwarven Guard'; }
    if(targetName == 'dwarf3'){ return 'Dwarven King'; }
    if(targetName == 'dwarf8'){ return 'Dwarven Girl'; }
    if(targetName == 'minotaur1'){ return 'Minotaur'; }
    if(targetName == 'minotaur2'){ return 'Minotaur'; }
    if(targetName == 'minotaur3'){ return 'Minotaur'; }
    if(targetName == 'guard2'){ return 'Arena Guard'; }
	
	// todo add swords and armor here for player page
    return targetName;
};

Types.forEachKind = function(callback) {
    for(var k in kinds) {
        callback(kinds[k][0], k);
    }
};

Types.forEachArmor = function(callback) {
    Types.forEachKind(function(kind, kindName) {
        if(Types.isArmor(kind)) {
            callback(kind, kindName);
        }
    });
};

Types.forEachMobOrNpcKind = function(callback) {
    Types.forEachKind(function(kind, kindName) {
        if(Types.isMob(kind) || Types.isNpc(kind)) {
            callback(kind, kindName);
        }
    });
};

Types.forEachArmorKind = function(callback) {
    Types.forEachKind(function(kind, kindName) {
        if(Types.isArmor(kind)) {
            callback(kind, kindName);
        }
    });
};
Types.forEachWeaponKind = function(callback) {
    Types.forEachKind(function(kind, kindName) {
        if(Types.isWeapon(kind)) {
            callback(kind, kindName);
        }
    });
};

Types.getOrientationAsString = function(orientation) {
    switch(orientation) {
        case Types.Orientations.LEFT: return "left"; break;
        case Types.Orientations.RIGHT: return "right"; break;
        case Types.Orientations.UP: return "up"; break;
        case Types.Orientations.DOWN: return "down"; break;
    }
};

Types.getRandomItemKind = function(item) {
    var all = _.union(this.rankedWeapons, this.maleRankedArmors),
        forbidden = [Types.Entities.WEAPON0, Types.Entities.ARMOR0M],
        itemKinds = _.difference(all, forbidden),
        i = Math.floor(Math.random() * _.size(itemKinds));

    return itemKinds[i];
};

Types.getMessageTypeAsString = function(type) {
    var typeName;
    _.each(Types.Messages, function(value, name) {
        if(value === type) {
            typeName = name;
        }
    });
    if(!typeName) {
        typeName = "UNKNOWN";
    }
    return typeName;
};

Types.getBuffTypeAsString = function(type) {
    var typeName;
    _.each(Types.Buffs, function(value, name) {
        if(value === type) {
            typeName = name;
        }
    });
    if(!typeName) {
        typeName = "UNKNOWN";
    }
    return typeName;
};

Types.getStoreItemCost = function(kind,currency) {
    var cost = null;
    if (currency === Types.Currencies.CRYSTALS) {
        var inv = Types.Stores.STORE2.inventory;
        for (var i=0;i<=inv.length-1;i++) {
            if (inv[i].item == kind) {
                cost = inv[i].cost;
            }
        }
    }
    return cost;
};

Types.getXPBonus = function(friendsNum) {
	var bonusvalue = 1; //base value
	bonusStep=0.05; // 5% base bonus
	bonusDegress=0.98; // -2% degressif bonus
	
	if(friendsNum > 0)
	{
		bonusvalue += bonusStep;
		for (var i = 0; i < (friendsNum-1); i++)
		{
			bonusStep *= bonusDegress;
			bonusvalue += bonusStep;
		}
	}
	
	return bonusvalue;
};

Types.getArenaCost = function(currency) {
	var cost = 0;
    if (currency === Types.Currencies.CRYSTALS) {
        cost = 100;
    }
    return cost;
};

Types.getWinRevard = function(winerLevel, loserLevel) 
{
	var winReward = 0;
	if(winerLevel && loserLevel)
	{	
		// coef for level difference to calcul xp
		if(loserLevel <= winerLevel)
		{
			var CoefLoser = 5;
			var CoefWiner = winerLevel - loserLevel + 5;
		}
		else 
		{
			var CoefLoser = loserLevel - winerLevel + 5;
			var CoefWiner = 5;
		}
		winReward = Math.round(CoefLoser / CoefWiner * 100);
	}	
	return winReward;
};

Types.ITEM_TYPE = {
    ITEM: 'item',
    COLLECTION_ITEM: 'partOfCollection'
};

// xp that we will record for the player when he kill a mob
//xptoadd=Math.round(xpofthemob*bonusvalue);

if(!(typeof exports === 'undefined')) {
    module.exports = Types;
}
