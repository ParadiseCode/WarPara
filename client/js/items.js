
define(['item'], function(Item) {

    var Items = {

        Sword_00: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON0, "weapon");
                this.lootMessage = "You pick up a rusty sword";
            }
        }),
        Sword_01: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON1, "weapon");
                this.lootMessage = "You pick up an iron sword";
            }
        }),

        Sword_02: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON2, "weapon");
                this.lootMessage = "You pick up a broad sword";
            }
        }),

        Sword_03: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON3, "weapon");
                this.lootMessage = "You pick up a cleaver";
            }
        }),

        Sword_04: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON4, "weapon");
                this.lootMessage = "You pick up a rapier sword";
            }
        }),

        Sword_05: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON5, "weapon");
                this.lootMessage = "You pick up a long sword";
            }
        }),

        Sword_06: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON6, "weapon");
                this.lootMessage = "You pick up a battle axe";
            }
        }),

        Sword_07: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON7, "weapon");
                this.lootMessage = "You pick up a lamentation blade";
            }
        }),

        Sword_08: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON8, "weapon");
                this.lootMessage = "You pick up a ophidian sword";
            }
        }),

        Sword_09: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON9, "weapon");
                this.lootMessage = "You pick up a flame tongue";
            }
        }),

        Sword_10: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAPON10, "weapon");
                this.lootMessage = "You pick up a blade of carnage";
            }
        }),
		
		Armor_00F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR0F, "armor");
                this.lootMessage = "You equip a cloth armor";
            }
        }),

        Armor_00M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR0M, "armor");
                this.lootMessage = "You equip a cloth armor";
            }
        }),

        Armor_01F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR1F, "armor");
                this.lootMessage = "You equip a leather armor";
            }
        }),

        Armor_01M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR1M, "armor");
                this.lootMessage = "You equip a leather armor";
            }
        }),

        Armor_02F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR2F, "armor");
                this.lootMessage = "You equip an hide armor";
            }
        }),

        Armor_02M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR2M, "armor");
                this.lootMessage = "You equip an hide armor";
            }
        }),

        Armor_03F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR3F, "armor");
                this.lootMessage = "You equip a bronze armor";
            }
        }),

        Armor_03M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR3M, "armor");
                this.lootMessage = "You equip a bronze armor";
            }
        }),

        Armor_04F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR4F, "armor");
                this.lootMessage = "You equip an elven chain";
            }
        }),

        Armor_04M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR4M, "armor");
                this.lootMessage = "You equip an elven chain";
            }
        }),

        Armor_05F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR5F, "armor");
                this.lootMessage = "You equip a plate armor";
            }
        }),

        Armor_05M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR5M, "armor");
                this.lootMessage = "You equip a plate armor";
            }
        }),

        Armor_06F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR6F, "armor");
                this.lootMessage = "You equip a barbarian armor";
            }
        }),

        Armor_06M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR6M, "armor");
                this.lootMessage = "You equip a barbarian armor";
            }
        }),

        Armor_07F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR7F, "armor");
                this.lootMessage = "You equip a full plate armor";
            }
        }),

        Armor_07M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR7M, "armor");
                this.lootMessage = "You equip a full plate armor";
            }
        }),

        Armor_08F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR8F, "armor");
                this.lootMessage = "You equip an adamantium armor";
            }
        }),

        Armor_08M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR8M, "armor");
                this.lootMessage = "You equip an adamantium armor";
            }
        }),

        Armor_09F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR9F, "armor");
                this.lootMessage = "You equip an hellfire armor";
            }
        }),

        Armor_09M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR9M, "armor");
                this.lootMessage = "You equip an hellfire armor";
            }
        }),

        Armor_10F: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR10F, "armor");
                this.lootMessage = "You equip a leviathan armor";
            }
        }),

        Armor_10M: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ARMOR10M, "armor");
                this.lootMessage = "You equip a leviathan armor";
            }
        }),

		Key: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.KEY, "object");
            },
        }),
        
        KeyRed: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.KEYRED, "object");
                this.lootMessage = "You pick up a red key";
            },
        }),

        KeyGold: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.KEYGOLD, "object");
                this.lootMessage = "You pick up a gold key";
            },
        }),
        
        KeyGreen: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.KEYGREEN, "object");
                this.lootMessage = "You pick up a green key";
            },
        }),
        
        KeyBlue: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.KEYBLUE, "object");
                this.lootMessage = "You pick up a blue key";
            },
        }),        

        Flask: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.FLASK, "object");
                this.lootMessage = "You pick up a health potion";
            },
        }),

        Cake: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.CAKE, "object");
                this.lootMessage = "You pick up a cake";
            },
        }),

        Burger: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.BURGER, "object");
                this.lootMessage = "You can haz rat burger";
            },
        }),
		
		Warden: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.WARDEN, "object");
                this.lootMessage = "You pickup the mist warden";
            },
        }),
        
		Cloth: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.CLOTH, "object");
                this.lootMessage = "You pickup the some cloth";
            }
        }),        
		
		Book: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.BOOK, "object");
                this.lootMessage = "You pickup a dirty book";
            }
        }),

        Ring_00: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING0, "ring");
                this.lootMessage = "You pickup a magical ring";
            }
        }),

        Ring_01: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING1, "ring");
                this.lootMessage = "You pickup a sorcery ring";
            }
        }),
        
        Ring_02: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING2, "ring");
                this.lootMessage = "You pickup an emerald ring";
            }
        }),

        Ring_03: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING3, "ring");
                this.lootMessage = "You pickup a rubis ring";
            }
        }),

        Ring_04: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING4, "ring");
                this.lootMessage = "You pickup a sapphire ring";
            }
        }),

        Ring_05: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING5, "ring");
                this.lootMessage = "You pickup a golden ring";
            }
        }),

        Ring_06: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING6, "ring");
                this.lootMessage = "You pickup a savage ring";
            }
        }),

        Ring_07: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING7, "ring");
                this.lootMessage = "You pickup a haunted ring";
            }
        }),

        Ring_08: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING8, "ring");
                this.lootMessage = "You pickup a diamond ring";
            }
        }),

        Ring_09: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING9, "ring");
                this.lootMessage = "You pickup a satanic ring";
            }
        }),

        Ring_10: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RING10, "ring");
                this.lootMessage = "You pickup a zodiac ring";
            }
        }),

        Shield_00: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD0, "shield");
                this.lootMessage = "You pickup a wooden shield";
            }
        }),

        Shield_01: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD1, "shield");
                this.lootMessage = "You pickup a round shield";
            }
        }),

        Shield_02: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD2, "shield");
                this.lootMessage = "You pickup a kite shield";
            }
        }),

        Shield_03: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD3, "shield");
                this.lootMessage = "You pickup a bronze shield";
            }
        }),

        Shield_04: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD4, "shield");
                this.lootMessage = "You pickup a crystal shield";
            }
        }),

        Shield_05: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD5, "shield");
                this.lootMessage = "You pickup an heavy shield";
            }
        }),

        Shield_06: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD6, "shield");
                this.lootMessage = "You pickup a tribal shield";
            }
        }),

        Shield_07: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD7, "shield");
                this.lootMessage = "You pickup a demonic shield";
            }
        }),

        Shield_08: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD8, "shield");
                this.lootMessage = "You pickup an adamantium shield";
            }
        }),

        Shield_09: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD9, "shield");
                this.lootMessage = "You pickup an hellfire shield";
            }
        }),

        Shield_10: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELD10, "shield");
                this.lootMessage = "You pickup a abyssal shield";
            }
        }),

        Amulet_00: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET0, "amulet");
                this.lootMessage = "You pickup a magical amulet";
            }
        }),

        Amulet_01: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET1, "amulet");
                this.lootMessage = "You pickup a sorcery amulet";
            }
        }),

        Amulet_02: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET2, "amulet");
                this.lootMessage = "You pickup a serpent amulet";
            }
        }),

        Amulet_03: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET3, "amulet");
                this.lootMessage = "You pickup a silver amulet";
            }
        }),

        Amulet_04: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET4, "amulet");
                this.lootMessage = "You pickup a sapphire amulet";
            }
        }),

        Amulet_05: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET5, "amulet");
                this.lootMessage = "You pickup a golden amulet";
            }
        }),

        Amulet_06: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET6, "amulet");
                this.lootMessage = "You pickup a berzerker amulet";
            }
        }),

        Amulet_07: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET7, "amulet");
                this.lootMessage = "You pickup a haunted amulet";
            }
        }),

        Amulet_08: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET8, "amulet");
                this.lootMessage = "You pickup a diamond amulet";
            }
        }),

        Amulet_09: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET9, "amulet");
                this.lootMessage = "You pickup a satanic amulet";
            }
        }),

        Amulet_10: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.AMULET10, "amulet");
                this.lootMessage = "You pickup a zodiac amulet";
            }
        }),

		FireSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.FIRESPELL, "object");
                this.lootMessage = "You found a fireball spellbook";
            },
        }),
        
		HealSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.HEALSPELL, "object");
                this.lootMessage = "You found a heal spellbook";
            },
        }),

		IceSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.ICESPELL, "object");
                this.lootMessage = "You found a ice bolt spellbook";
            },
        }),

		TornadoSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.TORNADOSPELL, "object");
                this.lootMessage = "You found a tornado spellbook";
            },
        }),

		TerrorSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.TERRORSPELL, "object");
                this.lootMessage = "You found a terror spellbook";
            },
        }),
        
		StunSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.STUNSPELL, "object");
                this.lootMessage = "You found a stun spellbook";
            },
        }),

		BlackHoleSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.BLACKHOLESPELL, "object");
                this.lootMessage = "You found a black hole spellbook";
            },
        }),

		TransformSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.TRANSFORMSPELL, "object");
                this.lootMessage = "You found a transform spellbook";
            },
        }),

		PoisonSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.POISONSPELL, "object");
                this.lootMessage = "You found a poison spellbook";
            },
        }),

		ShieldSpell: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHIELDSPELL, "object");
                this.lootMessage = "You found a shield spellbook";
            },
        }),

		ShortBow: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.SHORTBOW, "object");
                this.lootMessage = "You pick up a shortbow";
            },
        }),
        
		PineArrow: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.PINEARROW, "object");
                this.lootMessage = "You pick up a some pine arrows";
            },
        }),          

		BombPotion: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.BOMBPOTION, "object");
                this.lootMessage = "You pick up a bomb";
            },

            onLoot: function(player) {
                // todo
            },
        }),
        
		ManaPotion: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.MANAPOTION, "object");
                this.lootMessage = "You pick up a mana potion";
            },
        }),

        HealthPotion1: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.HEALTHPOTION1, "object");
                this.lootMessage = "You pick up a small health potion";
            },
        }),

        HealthPotion2: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.HEALTHPOTION2, "object");
                this.lootMessage = "You pick up a medium health potion";
            },
        }),
        
        HealthPotion3: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.HEALTHPOTION3, "object");
                this.lootMessage = "You pick up a large health potion";
            },
        }),
        
        ManaPotion1: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.MANAPOTION1, "object");
                this.lootMessage = "You pick up a small mana potion";
            },
        }),

        ManaPotion2: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.MANAPOTION2, "object");
                this.lootMessage = "You pick up a medium mana potion";
            },
        }),
        
        ManaPotion3: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.MANAPOTION3, "object");
                this.lootMessage = "You pick up a large mana potion";
            },
        }),
        
        RestorePotion1: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RESTOREPOTION1, "object");
                this.lootMessage = "You pick up a small restorative potion";
            },
        }),
        
        RestorePotion2: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RESTOREPOTION2, "object");
                this.lootMessage = "You pick up a medium restorative potion";
            },
        }),
        
        RestorePotion3: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.RESTOREPOTION3, "object");
                this.lootMessage = "You pick up a large restorative potion";
            },
        }),
        
        HulkPotion1: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.HULKPOTION1, "object");
                this.lootMessage = "You pick up a small Hulk potion";
            },
        }),
        
        HulkPotion2: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.HULKPOTION2, "object");
                this.lootMessage = "You pick up a medium Hulk potion";
            },
        }),
        
        HulkPotion3: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.HULKPOTION3, "object");
                this.lootMessage = "You pick up a large Hulk potion";
            },
        }),

        FirePotion: Item.extend({
            init: function(id) {
                this._super(id, Types.Entities.FIREPOTION, "object");
                this.lootMessage = "You found a mysterious green potion";
            },
        })
    };

    return Items;
});
