
define(['mob' , 'items', 'collectionItem', 'npcs', 'warrior', 'chest', 'trap', 'rockwall', 'hiddenwall', 'litbomb', 'lever', 'lockeddoor', 'statics', '../../shared/js/gametypes'], function(Mob, Items, CollectionItem, NPCs, Warrior, Chest, Trap, RockWall, HiddenWall, LitBomb, Lever, LockedDoor, Statics) {

    var EntityFactory = {};

    EntityFactory.createEntity = function(kind, id, name, data) {
        if(!kind) {
            log.info("kind is undefined", true);
            return;
        }

        if(MobList.isMob(kind)) // temporary solution, wait when all items was add in db
            return new Mob(id, kind, data);

        if(Types.isCollectionItem(kind)) // temporary solution, wait when all items was add in db
            return new CollectionItem(id, kind, data);

        if(!_.isFunction(EntityFactory.builders[kind])) {
            throw Error(kind + " is not a valid Entity type");
        }
        
        return EntityFactory.builders[kind](id, name);
    };

    //===== mobs ======

    EntityFactory.builders = [];

    EntityFactory.builders[Types.Entities.WARRIOR] = function(id, name) {
        return new Warrior(id, name);
    };

	// Minions
	
	EntityFactory.builders[Types.Entities.FIREBALL] = function(id) {
        return new Mobs.Fireball(id);
    };

    //===== items ======


    EntityFactory.builders[Types.Entities.WEAPON0] = function(id) {
        return new Items.Sword_00(id);
    };

    EntityFactory.builders[Types.Entities.WEAPON1] = function(id) {
        return new Items.Sword_01(id);
    };

    EntityFactory.builders[Types.Entities.WEAPON2] = function(id) {
        return new Items.Sword_02(id);
    };

    EntityFactory.builders[Types.Entities.WEAPON3] = function(id) {
        return new Items.Sword_03(id);
    };

    EntityFactory.builders[Types.Entities.WEAPON4] = function(id) {
        return new Items.Sword_04(id);
    };
    EntityFactory.builders[Types.Entities.WEAPON5] = function(id) {
        return new Items.Sword_05(id);
    };
    EntityFactory.builders[Types.Entities.WEAPON6] = function(id) {
        return new Items.Sword_06(id);
    };
    EntityFactory.builders[Types.Entities.WEAPON7] = function(id) {
        return new Items.Sword_07(id);
    };
    EntityFactory.builders[Types.Entities.WEAPON8] = function(id) {
        return new Items.Sword_08(id);
    };
    EntityFactory.builders[Types.Entities.WEAPON9] = function(id) {
        return new Items.Sword_09(id);
    };
    EntityFactory.builders[Types.Entities.WEAPON10] = function(id) {
        return new Items.Sword_10(id);
    };
	
	EntityFactory.builders[Types.Entities.ARMOR0M] = function(id) {
        return new Items.Armor_00M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR0F] = function(id) {
        return new Items.Armor_00F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR1M] = function(id) {
        return new Items.Armor_01M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR1F] = function(id) {
        return new Items.Armor_01F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR2M] = function(id) {
        return new Items.Armor_02M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR2F] = function(id) {
        return new Items.Armor_02F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR3M] = function(id) {
        return new Items.Armor_03M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR3F] = function(id) {
        return new Items.Armor_03F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR4M] = function(id) {
        return new Items.Armor_04M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR4F] = function(id) {
        return new Items.Armor_04F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR5F] = function(id) {
        return new Items.Armor_05F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR5M] = function(id) {
        return new Items.Armor_05M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR6M] = function(id) {
        return new Items.Armor_06M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR6F] = function(id) {
        return new Items.Armor_06F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR7F] = function(id) {
        return new Items.Armor_07F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR7M] = function(id) {
        return new Items.Armor_07M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR8M] = function(id) {
        return new Items.Armor_08M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR8F] = function(id) {
        return new Items.Armor_08F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR9M] = function(id) {
        return new Items.Armor_09M(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR9F] = function(id) {
        return new Items.Armor_09F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR10F] = function(id) {
        return new Items.Armor_10F(id);
    };

    EntityFactory.builders[Types.Entities.ARMOR10M] = function(id) {
        return new Items.Armor_10M(id);
    };

    EntityFactory.builders[Types.Entities.RING0] = function(id) {
        return new Items.Ring_00(id);
    };
    
    EntityFactory.builders[Types.Entities.RING1] = function(id) {
        return new Items.Ring_01(id);
    };
    
    EntityFactory.builders[Types.Entities.RING2] = function(id) {
        return new Items.Ring_02(id);
    };

    EntityFactory.builders[Types.Entities.RING3] = function(id) {
        return new Items.Ring_03(id);
    };
    
    EntityFactory.builders[Types.Entities.RING4] = function(id) {
        return new Items.Ring_04(id);
    };
    
    EntityFactory.builders[Types.Entities.RING5] = function(id) {
        return new Items.Ring_05(id);
    };

    EntityFactory.builders[Types.Entities.RING6] = function(id) {
        return new Items.Ring_06(id);
    };

    EntityFactory.builders[Types.Entities.RING7] = function(id) {
        return new Items.Ring_07(id);
    };

    EntityFactory.builders[Types.Entities.RING8] = function(id) {
        return new Items.Ring_08(id);
    };

    EntityFactory.builders[Types.Entities.RING9] = function(id) {
        return new Items.Ring_09(id);
    };

    EntityFactory.builders[Types.Entities.RING10] = function(id) {
        return new Items.Ring_10(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD0] = function(id) {
        return new Items.Shield_00(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD1] = function(id) {
        return new Items.Shield_01(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD2] = function(id) {
        return new Items.Shield_02(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD3] = function(id) {
        return new Items.Shield_03(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD4] = function(id) {
        return new Items.Shield_04(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD5] = function(id) {
        return new Items.Shield_05(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD6] = function(id) {
        return new Items.Shield_06(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD7] = function(id) {
        return new Items.Shield_07(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD8] = function(id) {
        return new Items.Shield_08(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD9] = function(id) {
        return new Items.Shield_09(id);
    };

    EntityFactory.builders[Types.Entities.SHIELD10] = function(id) {
        return new Items.Shield_10(id);
    };

    EntityFactory.builders[Types.Entities.AMULET0] = function(id) {
        return new Items.Amulet_00(id);
    };

    EntityFactory.builders[Types.Entities.AMULET1] = function(id) {
        return new Items.Amulet_01(id);
    };

    EntityFactory.builders[Types.Entities.AMULET2] = function(id) {
        return new Items.Amulet_02(id);
    };

    EntityFactory.builders[Types.Entities.AMULET3] = function(id) {
        return new Items.Amulet_03(id);
    };

    EntityFactory.builders[Types.Entities.AMULET4] = function(id) {
        return new Items.Amulet_04(id);
    };

    EntityFactory.builders[Types.Entities.AMULET5] = function(id) {
        return new Items.Amulet_05(id);
    };

    EntityFactory.builders[Types.Entities.AMULET6] = function(id) {
        return new Items.Amulet_06(id);
    };

    EntityFactory.builders[Types.Entities.AMULET7] = function(id) {
        return new Items.Amulet_07(id);
    };

    EntityFactory.builders[Types.Entities.AMULET8] = function(id) {
        return new Items.Amulet_08(id);
    };

    EntityFactory.builders[Types.Entities.AMULET9] = function(id) {
        return new Items.Amulet_09(id);
    };

    EntityFactory.builders[Types.Entities.AMULET10] = function(id) {
        return new Items.Amulet_10(id);
    };

	EntityFactory.builders[Types.Entities.KEY] = function(id) {
        return new Items.Key(id);
    };
    
    EntityFactory.builders[Types.Entities.KEYRED] = function(id) {
        return new Items.KeyRed(id);
    };
    
    EntityFactory.builders[Types.Entities.KEYGOLD] = function(id) {
        return new Items.KeyGold(id);
    };

    EntityFactory.builders[Types.Entities.KEYGREEN] = function(id) {
        return new Items.KeyGreen(id);
    };       

    EntityFactory.builders[Types.Entities.KEYBLUE] = function(id) {
        return new Items.KeyBlue(id);
    };
    
    EntityFactory.builders[Types.Entities.FLASK] = function(id) {
        return new Items.Flask(id);
    };

    EntityFactory.builders[Types.Entities.BOMBPOTION] = function(id) {
        return new Items.BombPotion(id);
    };
	
    EntityFactory.builders[Types.Entities.FIREPOTION] = function(id) {
        return new Items.FirePotion(id);
    };
    
    EntityFactory.builders[Types.Entities.MANAPOTION] = function(id) {
        return new Items.ManaPotion(id);
    };
    
    EntityFactory.builders[Types.Entities.HEALTHPOTION1] = function(id) {
        return new Items.HealthPotion1(id);
    };

    EntityFactory.builders[Types.Entities.HEALTHPOTION2] = function(id) {
        return new Items.HealthPotion2(id);
    };
    
    EntityFactory.builders[Types.Entities.HEALTHPOTION3] = function(id) {
        return new Items.HealthPotion3(id);
    };
    
    EntityFactory.builders[Types.Entities.MANAPOTION1] = function(id) {
        return new Items.ManaPotion1(id);
    };
    
    EntityFactory.builders[Types.Entities.MANAPOTION2] = function(id) {
        return new Items.ManaPotion2(id);
    };
    
    EntityFactory.builders[Types.Entities.MANAPOTION3] = function(id) {
        return new Items.ManaPotion3(id);
    };
    
    EntityFactory.builders[Types.Entities.RESTOREPOTION1] = function(id) {
        return new Items.RestorePotion1(id);
    };
    
    EntityFactory.builders[Types.Entities.RESTOREPOTION2] = function(id) {
        return new Items.RestorePotion2(id);
    };
    
    EntityFactory.builders[Types.Entities.RESTOREPOTION3] = function(id) {
        return new Items.RestorePotion3(id);
    };
    
    EntityFactory.builders[Types.Entities.HULKPOTION1] = function(id) {
        return new Items.HulkPotion1(id);
    };
    
    EntityFactory.builders[Types.Entities.HULKPOTION2] = function(id) {
        return new Items.HulkPotion2(id);
    };
    
    EntityFactory.builders[Types.Entities.HULKPOTION3] = function(id) {
        return new Items.HulkPotion3(id);
    };    

    EntityFactory.builders[Types.Entities.BURGER] = function(id) {
        return new Items.Burger(id);
    };

    EntityFactory.builders[Types.Entities.CAKE] = function(id) {
        return new Items.Cake(id);
    };

    EntityFactory.builders[Types.Entities.CHEST] = function(id) {
        return new Chest(id);
    };
	
    EntityFactory.builders[Types.Entities.TRAP] = function(id) {
        return new Trap(id);
    };
	
    EntityFactory.builders[Types.Entities.LEVER] = function(id) {
        return new Lever(id);
    };
	
	EntityFactory.builders[Types.Entities.LOCKEDDOOR] = function(id) {
        return new LockedDoor(id);
    };
	
	EntityFactory.builders[Types.Entities.ROCKWALL] = function(id) {
        return new RockWall(id);
    };
    
	EntityFactory.builders[Types.Entities.HIDDENWALL] = function(id) {
        return new HiddenWall(id);
    };
    
	EntityFactory.builders[Types.Entities.LITBOMB] = function(id) {
        var bomb = new LitBomb(id);
        bomb.initTime = new Date();
		
		return bomb;
    };
	
	EntityFactory.builders[Types.Entities.WARDEN] = function(id) {
        return new Items.Warden(id);
    };
    
	EntityFactory.builders[Types.Entities.CLOTH] = function(id) {
        return new Items.Cloth(id);
    };    
	
	EntityFactory.builders[Types.Entities.BOOK] = function(id) {
        return new Items.Book(id);
    };
    
	EntityFactory.builders[Types.Entities.FIRESPELL] = function(id) {
        return new Items.FireSpell(id);
    };
    
	EntityFactory.builders[Types.Entities.HEALSPELL] = function(id) {
        return new Items.HealSpell(id);
    };   

	EntityFactory.builders[Types.Entities.ICESPELL] = function(id) {
        return new Items.IceSpell(id);
    };
    
	EntityFactory.builders[Types.Entities.TORNADOSPELL] = function(id) {
        return new Items.TornadoSpell(id);
    };
    
	EntityFactory.builders[Types.Entities.TERRORSPELL] = function(id) {
        return new Items.TerrorSpell(id);
    };
    
	EntityFactory.builders[Types.Entities.STUNSPELL] = function(id) {
        return new Items.StunSpell(id);
    };
    
	EntityFactory.builders[Types.Entities.BLACKHOLESPELL] = function(id) {
        return new Items.BlackHoleSpell(id);
    };
    
	EntityFactory.builders[Types.Entities.TRANSFORMSPELL] = function(id) {
        return new Items.TransformSpell(id);
    };
    
	EntityFactory.builders[Types.Entities.POISONSPELL] = function(id) {
        return new Items.PoisonSpell(id);
    };
    
	EntityFactory.builders[Types.Entities.SHIELDSPELL] = function(id) {
        return new Items.ShieldSpell(id);
    };
    
	EntityFactory.builders[Types.Entities.SHORTBOW] = function(id) {
        return new Items.ShortBow(id);
    };
    
	EntityFactory.builders[Types.Entities.PINEARROW] = function(id) {
        return new Items.PineArrow(id);
    };
	
	//====== Static Entity ======
	
	EntityFactory.builders[Types.Entities.PORTAL] = function(id) {
        return new Statics.Portal(id);
    };

    //====== NPCs ======

    EntityFactory.builders[Types.Entities.GUARD] = function(id) {
        return new NPCs.Guard(id);
    };

    EntityFactory.builders[Types.Entities.KING] = function(id) {
        return new NPCs.King(id);
    };

    EntityFactory.builders[Types.Entities.PRIEST] = function(id) {
        return new NPCs.Priest(id);
    };

    EntityFactory.builders[Types.Entities.SORCERER] = function(id) {
        return new NPCs.Sorcerer(id);
    };

    EntityFactory.builders[Types.Entities.OCTOCAT] = function(id) {
        return new NPCs.Octocat(id);
    };
	
	EntityFactory.builders[Types.Entities.FAIRY3] = function(id) {
        return new NPCs.Fairy3(id);
    };
	
	EntityFactory.builders[Types.Entities.FAIRYQUEEN] = function(id) {
        return new NPCs.Fairyqueen(id);
    };
	
	EntityFactory.builders[Types.Entities.BANDAGED] = function(id) {
        return new NPCs.Bandaged(id);
    };
	
	EntityFactory.builders[Types.Entities.BLINDWOMAN] = function(id) {
        return new NPCs.Blindwoman(id);
    };
	
	EntityFactory.builders[Types.Entities.CARETAKER] = function(id) {
        return new NPCs.Caretaker(id);
    };
	
	EntityFactory.builders[Types.Entities.DIRTYKID] = function(id) {
        return new NPCs.Dirtykid(id);
    };
	
	EntityFactory.builders[Types.Entities.FORTUNETELLER] = function(id) {
        return new NPCs.Fortuneteller(id);
    };
	
	EntityFactory.builders[Types.Entities.GHOSTKING] = function(id) {
        return new NPCs.Ghostking(id);
    };
	
	EntityFactory.builders[Types.Entities.HERMIT] = function(id) {
        return new NPCs.Hermit(id);
    };
	
	EntityFactory.builders[Types.Entities.JESTER] = function(id) {
        return new NPCs.Jester(id);
    };
	
	EntityFactory.builders[Types.Entities.WEAVER] = function(id) {
        return new NPCs.Weaver(id);
    };
	
	EntityFactory.builders[Types.Entities.WOUNDED] = function(id) {
        return new NPCs.Wounded(id);
    };
	
	EntityFactory.builders[Types.Entities.FAUN] = function(id) {
        return new NPCs.Faun(id);
    };
	
	EntityFactory.builders[Types.Entities.PRINCESS] = function(id) {
        return new NPCs.Princess(id);
    };
	
	EntityFactory.builders[Types.Entities.QUEEN] = function(id) {
        return new NPCs.Queen(id);
    };
	
	EntityFactory.builders[Types.Entities.WITCHESSON] = function(id) {
        return new NPCs.WitchesSon(id);
    };
	
	EntityFactory.builders[Types.Entities.MATILDA] = function(id) {
        return new NPCs.Matilda(id);
    };
	
	EntityFactory.builders[Types.Entities.DWARF1] = function(id) {
        return new NPCs.Dwarf1(id);
    };
	
	EntityFactory.builders[Types.Entities.DWARF3] = function(id) {
        return new NPCs.Dwarf3(id);
    };
	
	EntityFactory.builders[Types.Entities.DWARF5] = function(id) {
        return new NPCs.Dwarf5(id);
    };
	
	EntityFactory.builders[Types.Entities.DWARF8] = function(id) {
        return new NPCs.Dwarf8(id);
    };
	
	EntityFactory.builders[Types.Entities.WRITER] = function(id) {
        return new NPCs.Writer(id);
    };
    
	EntityFactory.builders[Types.Entities.VENDOR1] = function(id) {
        return new NPCs.Vendor1(id);
    };
    
 	EntityFactory.builders[Types.Entities.VENDOR2] = function(id) {
        return new NPCs.Vendor2(id);
    };
    
 	EntityFactory.builders[Types.Entities.VENDOR3] = function(id) {
        return new NPCs.Vendor3(id);
    };
    
	EntityFactory.builders[Types.Entities.VENDOR4] = function(id) {
        return new NPCs.Vendor4(id);
    };
    
	EntityFactory.builders[Types.Entities.MORTY] = function(id) {
        return new NPCs.Morty(id);
    };
	
	EntityFactory.builders[Types.Entities.GUARD2] = function(id) {
        return new NPCs.Guard2(id);
    };

    return EntityFactory;
});
