//ar inherits = require('util').inherits;
//var Inventory = require('inventory');

define(['character', 'exceptions', 'inventory'], function(Character, Exceptions, Inventory) {

    var Player = Character.extend({
        MAX_LEVEL: 50,

        init: function(id, name, pw, kind, guild) {
            this._super(id, kind);

            this.name = name;
			this.showName = name; // don't think this is used, should be removed
            this.pw = pw;
            this.spells = null;
            this.inventory = new Inventory();

            if (typeof guild !== 'undefined') {
				this.setGuild(guild);
			}

            // Renderer
            this.nameOffsetY = -15;
			this.image = "";

            // sprites
            this.spriteName = "Armor_00M";
            this.weaponName = "Sword_00";
            this.shieldName = "Shield_00";
            this.ringName = "Ring_00";
            this.amuletName = "Amulet_00";
            this.gender = Types.GENDER.MALE;

            // modes
            this.isLootMoving = false;
            this.isSwitchingWeapon = true;
            this.isSwitchingShield = true;

            // PVP Flag
            this.pvpFlag = false;
			this.pvpKills = 0;
			this.friendsBonus = 1;
			
			this.arenaPvp = false;
			this.arenaCrystalWin = 0;
			this.arenaCrystalSpend = 0;
            this.accountName = $("#char-netname").text();
            this.accountAvatar = $("#profile_menu #player-image").attr('src');
        },
        
        animate: function(animation, speed, count, onEndCount) {
            var oriented = ['atk', 'walk', 'idle'],
            o = this.orientation;

	        if(!(this.currentAnimation && this.currentAnimation.name === "death")) { // don't change animation if the character is dying
	            this.flipSpriteX = false;
	            this.flipSpriteY = false;
	
	            if(_.indexOf(oriented, animation) >= 0) {
	                animation += "_" + (o === Types.Orientations.RIGHT ? "left" : Types.getOrientationAsString(o));
	                this.flipSpriteX = (this.orientation === Types.Orientations.RIGHT) ? true : false;
	            }
	            
	            this.setAnimation(animation, speed, count, onEndCount);
	        }
	    },

        getGuild: function() {
			return this.guild;
		},
		
		setGuild: function(guild) {
			this.guild = guild;
			$('#guild-population').addClass("visible");
			$('#guild-name').html(guild.name);
		},
		
		unsetGuild: function(){
			delete this.guild;
			$('#guild-population').removeClass("visible");
		},
		
        hasGuild: function(){
			return (typeof this.guild !== 'undefined');
		},
		
			
		addInvite: function(inviteGuildId){
			this.invite = {time:new Date().valueOf(), guildId: inviteGuildId};
		},
		
		deleteInvite: function(){
			delete this.invite;
		},
		
		checkInvite: function(){
			if(this.invite && ( (new Date().valueOf() - this.invite.time) < 595000)){
				return this.invite.guildId;
			}
			else{
				if(this.invite){
					this.deleteInvite();
					return -1;
				}
				else{
					return false;
				}
			}
		},

        loot: function(item) {
            if(item) {
                var rank, currentRank, msg = "", currentArmorName;


                currentArmorName = this.spriteName;
                

                if(item.type === "armor") {
                    var isSuit = item.itemKind[item.itemKind.length - 1] == this.getGender();

                    if (!isSuit)
                        throw new Exceptions.LootException("This armor is not for you gender.");
                    rank = Types.getArmorRank(item.kind, this.getGender());
                    currentRank = Types.getArmorRank(Types.getKindFromString(currentArmorName), this.getGender());
                    msg = "You are wearing a better armor";
                } else if(item.type === "weapon") {
                    rank = Types.getWeaponRank(item.kind);
                    currentRank = Types.getWeaponRank(Types.getKindFromString(this.weaponName));
                    msg = "You are wielding a better weapon";
                } else if(item.type === "ring") {
                    rank = Types.getRingRank(item.kind);
                    currentRank = Types.getRingRank(Types.getKindFromString(this.ringName));
                    msg = "You already got a better ring";
                } else if(item.type === "shield") {
                    rank = Types.getShieldRank(item.kind);
                    currentRank = Types.getShieldRank(Types.getKindFromString(this.shieldName));
                    msg = "You already got a better shield";
                } else if(item.type === "amulet") {
                    rank = Types.getAmuletRank(item.kind);
                    currentRank = Types.getAmuletRank(Types.getKindFromString(this.amuletName));
                    msg = "You already got a better amulet";
                }

                if(rank !== undefined && currentRank !== undefined) {
                	if(rank === currentRank) {
                        throw new Exceptions.LootException("You already have this "+item.type);
                    } else if(rank <= currentRank) {
                        throw new Exceptions.LootException(msg);
                    }
                }

                log.info('Player '+this.id+' has looted '+item.id);
                item.onLoot(this);
            }
        },

        /**
      ringeturns true if the character is currently walking towards an item in order to loot it.
         */
        isMovingToLoot: function() {
            return this.isLootMoving;
        },

        getSpriteName: function() {
            return this.spriteName;
        },

        setSpriteName: function(name) {
            this.spriteName = name;
        },

        getArmorName: function() {
            return this.sprite.id;
        },

        setArmorName: function(name){
            this.armorName = name;
        },

        getEquippedWeaponName: function() {
            var currentRank = Types.getWeaponRank(Types.getKindFromString(this.weaponName));

            return $('#inventory0').hasClass('inventoryitem-weapon'+currentRank)
                ? this.weaponName
                : null;
        },

        getWeaponName: function() {
            return this.weaponName;
        },
        
        getShieldName: function() {
            return this.shieldName;
        },

        getGender: function() {
            return this.gender;
        },
        
        setWeaponName: function(name) {
            this.weaponName = name;
        },
        
        setShieldName: function(name) {
            this.shieldName = name;
        },

        setRingName: function(name){
            this.ringName = name;
        },

        getRingName: function(){
            return this.ringName;
        },

        setAmuletName: function(name) {
            this.amuletName = name;
        },

        setGender: function(gender) {
            this.gender = gender;
        },

        getAmuletName: function(){
            return this.amuletName;
        },
        
        hasWeapon: function() {
            return this.weaponName !== null;
        },
        
        hasShield: function() {
            return this.shieldName !== null;
        },
        
        hasAmulet: function() {
            return this.amuletName !== null;
        },
        
        hasRing: function() {
            return this.ringName !== null;
        },
        
        equipFromInventory: function(type, inventoryNumber, sprites){
            var itemString = Types.getKindAsString(this.inventory[inventoryNumber]);

            if(itemString){
                var itemSprite = sprites[itemString];
                if(itemSprite){
                    if(type === "armor"){
                        this.inventory[inventoryNumber] = Types.getKindFromString(this.getArmorName());
                        this.setSpriteName(itemString);
                        this.setSprite(itemSprite);
                        this.setArmorName(itemString);
                    } else if(type === "avatar"){
                        this.inventory[inventoryNumber] = null;
                        this.setSpriteName(itemString);
                        this.setSprite(itemSprite);
                    }
                }
            }
        },
		// 2 switchArmor? Don't think this is used
        switchArmor: function(armorName, sprite){
            this.setSpriteName(armorName);
            this.setSprite(sprite);
            this.setArmorName(armorName);
            if(this.switch_callback) {
              this.switch_callback();
            }
        },
        switchWeapon: function(newWeaponName) {
            var count = 14,
                value = false,
                self = this;

            var toggle = function() {
                value = !value;
                return value;
            };

            if(newWeaponName !== this.getWeaponName()) {
                if(this.isSwitchingWeapon) {
                    clearInterval(blanking);
                }

                this.switchingWeapon = true;
                var blanking = setInterval(function() {
                    if(toggle()) {
                        self.setWeaponName(newWeaponName);
                    } else {
                        self.setWeaponName(null);
                    }

                    count -= 1;
                    if(count === 1) {
                        clearInterval(blanking);
                        self.switchingWeapon = false;

                        if(self.switch_callback) {
                            self.switch_callback();
                        }
                    }
                }, 90);
            }
        },
        
        switchShield: function(newShieldName) {
            var count = 14,
                value = false,
                self = this;

            var toggle = function() {
                value = !value;
                return value;
            };

            if(newShieldName !== this.getShieldName()) {
                if(this.isSwitchingShield) {
                    clearInterval(blanking);
                }

                this.switchingShield = true;
                var blanking = setInterval(function() {
                    if(toggle()) {
                        self.setShieldName(newShieldName);
                    } else {
                        self.setShieldName(null);
                    }

                    count -= 1;
                    if(count === 1) {
                        clearInterval(blanking);
                        self.switchingShield = false;

                        if(self.switchshield_callback) {
                            self.switchshield_callback();
                        }
                    }
                }, 90);
            }
        },

        switchArmor: function(newArmorSprite) {
            var count = 14,
                value = false,
                self = this;

            var toggle = function() {
                value = !value;
                return value;
            };

            newArmorSprite.id = newArmorSprite.id.slice(0,-1) + this.getGender();

            if(newArmorSprite && newArmorSprite.id !== this.getSpriteName()) {
                if(this.isSwitchingArmor) {
                    clearInterval(blanking);
                }

                this.isSwitchingArmor = true;
                self.setSprite(newArmorSprite);
                self.setSpriteName(newArmorSprite.id);
                var blanking = setInterval(function() {
                    self.setVisible(toggle());

                    count -= 1;
                    if(count === 1) {
                        clearInterval(blanking);
                        self.isSwitchingArmor = false;

                        if(self.switch_callback) {
                            self.switch_callback();
                        }
                    }
                }, 90);
            }
        },
        
        swithRing: function(newRingName) {
        	var self = this;
        	self.setRingName(newRingName);
        	
        	if(self.switchring_callback) {
                self.switchring_callback(newRingName);
            }
        },
        
        swithAmulet: function(newAmuletName) {
        	var self = this;
        	self.setAmuletName(newAmuletName);
        	
        	if(self.switchamulet_callback) {
                self.switchamulet_callback(newAmuletName);
            }
        },

        changeGender: function(sprites) {
        	var gender = this.getGender() == Types.GENDER.MALE ? Types.GENDER.FEMALE : Types.GENDER.MALE;
            this.setGender(gender);
            var armor = this.getArmorName();
            armor = armor.slice(0, -1) + this.getGender();
            this.switchArmor(sprites[armor]);
        },

        onArmorLoot: function(callback) {
            this.armorloot_callback = callback;
        },

        onSwitchItem: function(callback) {
            this.switch_callback = callback;
        },
        
        onSwitchRing: function(callback) {
            this.switchring_callback = callback;
        },
        
        onSwitchAmulet: function(callback) {
            this.switchamulet_callback = callback;
        },
        
        onSwitchShield: function(callback) {
            this.switchshield_callback = callback;
        },
        
        flagPVP: function(pvpFlag){
            this.pvpFlag = pvpFlag;
       },

        onWeaponChange: function(callback) {
            this.weaponChangeCallback = callback;
        },

        isSpellEquip: function(kind){
            for(var index in this.spells){
                var spellId = this.spells[index][0];
                if(spellId == kind)
                    return true;
            }
            return false;
        },

        loadInventory: function(inventory){
            this.inventory.load(inventory);
        },

        getInventory: function(inventory){
            return this.inventory;
        }
    });

    return Player;
});

