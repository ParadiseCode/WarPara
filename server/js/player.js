
var cls = require("./lib/class"),
    _ = require("underscore"),
    Character = require('./character'),
    Chest = require('./chest'),
    Trap = require('./trap'),
	Lever = require('./lever'),
    Messages = require("./message"),
    Utils = require("./utils"),
    Properties = require("./properties"),
    Formulas = require("./formulas"),
    check = require("./format").check,
    Types = require("../../shared/js/gametypes"),
    MobList = require("../../shared/js/mobManager"),
	Crypto = require("crypto-js"),
    bcrypt = require('bcrypt'),
	request = require('request');

module.exports = Player = Character.extend({

    setWorld: function(worldServer) {
        this.server = worldServer;
        log.info("setWorld: " + worldServer.id);
        this.server.connect_callback(this);
    },
    
    init: function(connection, worlds, worldIndex, databaseHandler) {
        var self = this;

        this.worlds = worlds;
        this.worldIndex = worldIndex;
        this.server = worlds[worldIndex];
        this.connection = connection;
        this.collections = {};

        this._super(this.connection.id, "player", Types.Entities.WARRIOR, 0, 0, "");

        this.hasEnteredGame = false;
        this.isDead = false;
        this.arenaPvp = false;
		this.haters = {};
        this.lastCheckpoint = null;
        this.formatChecker = new FormatChecker();
        this.disconnectTimeout = null;
		
		this.pid = 0;
		this.token = '';
		this.friends = {};// pid: {n: ingame name, p: pending 1 or 0, o: online 1 or 0, ni: idnet nickname, t: thumbnail}
        this.waypoints = [];
        this.pvpFlag = false;
        this.bannedTime = 0;
        this.banUseTime = 0;
        this.experience = 0;
        this.remortexp = 0;
        this.level = 0;
        this.lastWorldChatMinutes=99;
		this.pvpKills = 0;
		this.winCrystals =  0;
		this.spendCrystals =  0;
		this.friendsBonus = 1;
		this.lastMessage = new Date().getTime();

        this.inventory = [];
        //this.inventoryCount = [];
		//this.maxInventory = 20
		/*for(var i = 0; i < this.maxInventory; i++){
			this.inventory[i] = null;
			this.inventoryCount[i] = 0;
		}*/
        this.achievement = [];

        this.chatBanEndTime = 0;
		
		this.isGuest = false;

        this.connection.listen(function(message) {
            var action = parseInt(message[0]);
            //log.info("ACTION: " + action);
            log.debug("Received: "+message);
            if(!check(message)) {
                self.connection.close("Invalid "+Types.getMessageTypeAsString(action)+" message format: "+message);
                return;
            }
            
            if(action === Types.Messages.PREAUTH) {
                var pid = Utils.sanitize(message[1]);
                databaseHandler.getCharacters(pid, function(characters){
                    log.info("PREAUTH:"+pid+" "+JSON.stringify(characters));

                    self.send([Types.Messages.CHARACTERS, JSON.stringify(characters)]);

                });
            }

            if(!self.hasEnteredGame && action !== Types.Messages.CREATE && action !== Types.Messages.LOGIN  && action !== Types.Messages.PREAUTH && action !== Types.Messages.DELETECHARACTER) { // PREAUTH CREATE or LOGIN must be the first message
                self.connection.close("Invalid handshake message: "+message);
                return;
            }
            

            //allow repeat not dead for map change
            if(self.hasEnteredGame && !self.isDead && (action === Types.Messages.CREATE || action === Types.Messages.LOGIN)) { // CREATE/LOGIN can be sent only once
                self.connection.close("Cannot initiate handshake twice: "+message);
                return;
            }

			
			if(action != Types.Messages.UPDATEFRIENDS){
				self.resetTimeout();
				self.lastMessage = new Date().getTime();
			}

            if(action === Types.Messages.CREATE || action === Types.Messages.LOGIN) {
				var name = Utils.sanitize(message[1]);
                var pw = Utils.sanitize(message[2]);
				self.pid = pw;
				if(message[4] && (message[4]==="F" || message[4]==="M"))
				{
					self.gender = message[4];					
				}
				else
				{
					self.gender = "M";
				}				
				if(action === Types.Messages.LOGIN){
                    // regular id.net pid based login
                    if (name == 'pid') {
                        databaseHandler.usernameFromId(self.pid, function(username){
                            self.loginWithUsername(username);
                        });
					} else {
                        // username explicitly supplied multichar login
                                                
                        self.loginWithUsername(name);
                        databaseHandler.setActiveUsernameForPid(self.pid,name);
                        
                    }
				}       


                if(action === Types.Messages.CREATE) {
					self.name = name.substr(0, 12).trim()
					// Validate the username
					if(!self.checkName(self.name)){
						self.connection.sendUTF8("invalidusername");
						self.connection.close("Invalid name " + self.name);
						return;
					}
					if(name.charAt(0) == '_'){
						self.isGuest = true;
					}else{
						self.isGuest = false;
					}
                self.pw = pw.substr(0, 15);
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(self.pw, salt, function(err, hash) {
                            log.info("CREATE: " + self.name);
                            self.email = Utils.sanitize(message[3]);
                            self.pw = hash;
                            databaseHandler.createPlayer(self);
                        })
                    });
                }

            }
			else if(action === Types.Messages.CONVERT) {
				var guestName = Utils.sanitize(message[1]);
				var username = Utils.sanitize(message[2]);
                var pw = Utils.sanitize(message[3]);
				var email = Utils.sanitize(message[4]);
				var pid = pw;
				
				username = username.substr(0, 12).trim()
				// Validate the username
				if(!self.checkName(username)){
					self.connection.sendUTF8("invalidusername");
					return;
				}
				pw = pw.substr(0, 15);
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(pw, salt, function(err, hash) {
                        log.info("CONVERT: " + guestName + ' to '+ username);
                        databaseHandler.convertPlayer(self, guestName, username, hash, email, pid);
                    })
                });
			}
			else if(action === Types.Messages.LOCAL) {
                log.info("LOCAL: " + self.name);
				var data = message[1];
				databaseHandler.saveLocal(self.name, data);
            }
			else if(action === Types.Messages.DELETECHARACTER) {
				var username = message[1];
                var pid = message[2];
                log.info("DELETECHARACTER: "+username+' , '+pid);
				databaseHandler.deleteCharacter(username, pid);
            }            
            else if(action === Types.Messages.WHO) {
                log.info("WHO: " + self.name);
                var uid = Utils.sanitize(message[1]);
                self.server.pushSpawnsToPlayer(self, message);
            }
			else if(action === Types.Messages.IDNETTOKEN) {
                log.info("IDNETTOKEN: " + self.name);
                self.token = message[1];
				if(self.token){
					self.loadPendingFriends();
					self.loadFriends();
					self.sortFriends();
				}
            }
			else if(action === Types.Messages.PROFILE) {
                log.info("PROFILE: " + self.name);
                var uname = Utils.sanitize(message[1]);
				var clientDisplay = Utils.sanitize(message[2]);
				var uplayer = self.server.getPlayerByName(uname);

				// call local memory instead of database (might be useful later for getting offline player data)
                //databaseHandler.getProfile(self, uname, clientDisplay,);
				if(uplayer){
					self.sendProfile(uname, uplayer.armor, uplayer.weapon, uplayer.experience, uplayer.shield, uplayer.amulet, uplayer.ring, uplayer.hitPoints,
                        uplayer.maxHitPoints, uplayer.manaPoints, uplayer.maxManaPoints, uplayer.pid, uplayer.remortCrystals, uplayer.remortexp );
				}
            }
			else if(action === Types.Messages.UPDATEFRIENDS) {
                log.info("UPDATEFRIENDS: " + self.name);
				if(self.token){
					self.loadPendingFriends();
					self.loadFriends();
					self.sortFriends();
				}
            }
			else if(action === Types.Messages.DETAIL) {
                //log.info("DETAIL: " + self.name);
                var uname = Utils.sanitize(message[1]);
				var uplayer = self.server.getPlayerByName(uname);
				if(uplayer){
					self.sendDetail(uplayer.id, uplayer.level, uplayer.hitPoints, uplayer.maxHitPoints );
				}
            }
			else if(action === Types.Messages.PVPLEADER) {
                self.server.getOnlineLeader(self);
            }
			else if(action === Types.Messages.LEADERBOARDS) {
                self.sendLeaderboards(databaseHandler.leaderData);
            }
            else if(action === Types.Messages.PLAYERS_STAT_REQUEST) {
                //var statistic        = {};
                //
                //statistic.players    = self.server.statistic.getOnlinePlayersData();
                //statistic.guestCount = self.server.statistic.getGuestCount();
                //statistic.friends    = self.friends;
                //
                //this.send([Types.Messages.PLAYERS_STAT_REQUEST, statistic]);
            }
			else if(action === Types.Messages.GETCHECKOUT) {
				log.info("GETCHECKOUT: " + self.name);
				var id = message[1];
                var timestamp = Math.floor(Date.now() / 1000);
				if(id == 0){
					var amount = 1000, currency = 'USD', usage = 'test';
				}
				// TODO save transactionID to verify later
				//var transactionID = Crypto.SHA3(self.name+timestamp, { outputLength: 224 });
				var transactionID = 123;
				var merchantID = '53e34133031ee0c9dd000ee8';
				var secret = '93f7214cb70398c2473e461d6dc21d2932e44edda5ae7657c8d6653a3e3e9a5b';
				var hmac = Crypto.algo.HMAC.create(Crypto.algo.SHA1, secret);

				hmac.update('amount='+amount);
				hmac.update('currency='+currency);
				hmac.update('merchant_id='+merchantID);
				hmac.update('timestamp='+timestamp);
				hmac.update('transaction_id='+transactionID);
				hmac.update('usage='+usage);

				var hash = hmac.finalize();
				var checkoutLink = 'https://www.id.net/checkout?merchant_id='+merchantID+'&transaction_id='+transactionID+'&amount='+amount+'&currency='+currency+'&usage='+usage+'&timestamp='+timestamp+'&hmac='+hash;
				this.send([Types.Messages.GETCHECKOUT, checkoutLink]);   
            }
            else if(action === Types.Messages.ZONE) {
                log.info("ZONE: " + self.name);
                self.zone_callback();
            }
            else if(action === Types.Messages.NPC_LOOT) {
            
                var flagName = message[1];
                log.info("NPC_LOOT: " + self.name + "(" + flagName + ")");
                
                if (flagName == 'cloth'){
                    var itemKind = Types.Entities.CLOTH;
                    if (!self.inventoryContains(itemKind,1)){
                        self.addToInventory(itemKind,1);
                    }
                }
                
                if (flagName == 'doorkey'){
                    var itemKind = Types.Entities.KEY;
                    if (!self.inventoryContains(itemKind, 1)){
                        self.addToInventory(itemKind, 1);
                    }
                }                
            
            }
            else if(action === Types.Messages.USEDOORTOMAP) {
            
                var mapName = message[1];
                var x = message[2];
                var y = message[3];
                log.info("USEDOORTOMAP: " + self.name + "(" + mapName + ")");
                
                // store in redis so will persist through reconnect
                databaseHandler.saveMap(self.name,mapName,x,y);                    
                self.isDead = true;
                this.send([Types.Messages.MAPCHANGE,mapName]);   
            
            }
            else if(action === Types.Messages.DROPBOMB) {
                self.deductFromInventory(Types.Entities.BOMBPOTION, 1);
                self.sendInventory();
                var newBomb = self.server.createItem(Types.Entities.LITBOMB, message[1], message[2]);
                newBomb.owner = self.id;
                self.server.addItem(newBomb);
            }
            else if(action === Types.Messages.INVENTORYUSE) {
            
                var itemKind = message[1];
                log.info("INVENTORYUSE: " + self.name + "(" + itemKind + ")");
                
                if (self.deductFromInventory(itemKind,1)){
                        
                    if (self.hulkTimeout == null && (itemKind === Types.Entities.FIREPOTION || itemKind === Types.Entities.HULKPOTION1 || itemKind === Types.Entities.HULKPOTION2 || itemKind === Types.Entities.HULKPOTION3)) {                    
                       
						// the hulk potion will now give extra speed so i do some test
                        self.sendInventory();
                        //self.updateHitPoints();
                        var duration = 5000;
						var speedBoost = 70;
                        if (itemKind === Types.Entities.HULKPOTION2) 
						{
							duration = 7500;
							speedBoost = 60;
						}
                        if (itemKind === Types.Entities.HULKPOTION3) 
						{
							duration = 10000;
							speedBoost = 50;
						}
                        //if (itemKind === Types.Entities.FIREPOTION) duration = 15000;
						this.send([Types.Messages.SPEEDPOTION, speedBoost, 100]);
                        //self.broadcast(self.equip(Types.Entities.HULK),false); // broadcast to self too...
						
                        self.hulkTimeout = setTimeout(function() {
                            //self.broadcast(self.equip(self.armor),false); // broadcast to self too...
                            self.hulkTimeout = null;
							self.send([Types.Messages.SPEEDPOTION, 100, speedBoost]);
                        }, duration);
                        //self.send(new Messages.HitPoints(self.maxHitPoints).serialize());						

                    }
                    
                    if (itemKind === Types.Entities.MANAPOTION) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = 100;
                        if(!self.hasFullMana()) {
                            self.regenManaBy(amount);
                            self.server.pushToPlayer(self, self.mana());
                        }                    
                    }
                    
                    if (itemKind === Types.Entities.HEALTHPOTION1) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = self.maxHitPoints / 3;
                        if(!self.hasFullHealth()) {
                            self.regenHealthBy(amount);
                            self.server.pushToPlayer(self, self.health());
                        }                    
                    }
                    if (itemKind === Types.Entities.HEALTHPOTION2) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = self.maxHitPoints / 3 * 2;
                        if(!self.hasFullHealth()) {
                            self.regenHealthBy(amount);
                            self.server.pushToPlayer(self, self.health());
                        }                    
                    }
                    if (itemKind === Types.Entities.HEALTHPOTION3) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = self.maxHitPoints;
                        if(!self.hasFullHealth()) {
                            self.regenHealthBy(amount);
                            self.server.pushToPlayer(self, self.health());
                        }                    
                    }                    
                    if (itemKind === Types.Entities.MANAPOTION1) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = self.maxManaPoints / 3;
                        if(!self.hasFullMana()) {
                            self.regenManaBy(amount);
                            self.server.pushToPlayer(self, self.mana());
                        }                    
                    }
                    if (itemKind === Types.Entities.MANAPOTION2) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = self.maxManaPoints / 3 * 2;
                        if(!self.hasFullMana()) {
                            self.regenManaBy(amount);
                            self.server.pushToPlayer(self, self.mana());
                        }                    
                    }
                    if (itemKind === Types.Entities.MANAPOTION3) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = self.maxManaPoints;
                        if(!self.hasFullMana()) {
                            self.regenManaBy(amount);
                            self.server.pushToPlayer(self, self.mana());
                        }                    
                    }
                    if (itemKind === Types.Entities.RESTOREPOTION1) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = self.maxHitPoints / 3;
                        if(!self.hasFullHealth()) {
                            self.regenHealthBy(amount);
                            self.server.pushToPlayer(self, self.health());
                        }
                        amount = self.maxManaPoints / 3;
                        if(!self.hasFullMana()) {
                            self.regenManaBy(amount);
                            self.server.pushToPlayer(self, self.mana());
                        }                 
                    }
                    if (itemKind === Types.Entities.RESTOREPOTION2) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = self.maxHitPoints / 3 * 2;
                        if(!self.hasFullHealth()) {
                            self.regenHealthBy(amount);
                            self.server.pushToPlayer(self, self.health());
                        }
                        amount = self.maxManaPoints / 3 * 2;
                        if(!self.hasFullMana()) {
                            self.regenManaBy(amount);
                            self.server.pushToPlayer(self, self.mana());
                        }                 
                    }
                    if (itemKind === Types.Entities.RESTOREPOTION3) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        var amount = self.maxHitPoints;
                        if(!self.hasFullHealth()) {
                            self.regenHealthBy(amount);
                            self.server.pushToPlayer(self, self.health());
                        }
                        amount = self.maxManaPoints;
                        if(!self.hasFullMana()) {
                            self.regenManaBy(amount);
                            self.server.pushToPlayer(self, self.mana());
                        }                 
                    }                       

                    if (itemKind === Types.Entities.CLOTH || itemKind === Types.Entities.BOOK || itemKind === Types.Entities.WARDEN) {                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        // does nothing but consumed by NPC
                    }                         
                
                    if (Types.isHealingItem(itemKind)){
                    
                        //self.deductFromInventory(itemKind,1);
                        self.sendInventory();
                        
                        var amount;

                        switch(itemKind) {
                            case Types.Entities.FLASK:
                                amount = 40;
                                break;
                            case Types.Entities.BURGER:
                                amount = 100;
                                break;
                        }

                        if(!self.hasFullHealth()) {
                            self.regenHealthBy(amount);
                            self.server.pushToPlayer(self, self.health());
                        }
                        
                    }
                
                }
            
            }
			else if(action === Types.Messages.INVENTORYSORT) {
                log.info("INVENTORYSORT: " + self.name);
				var inventory = JSON.parse(message[1]);
				var items1 = inventory.items.slice(0);
				var items2 = self.inventory.slice(0);
				items1.sort();
				items2.sort();
				var count1 = 0;
				var count2 = 0;
				var invMatch = true;
                for(var i = 0; i < this.maxInventory; i++){
					count1 = count1 + inventory.quantities[i];
					count2 = count2 + inventoryCount[i];
					if(items1[i] != items2[i]){
						invMatch = false;
						break;
					}
				}
				if(invMatch && count1 == count2){
					self.inventory = inventory.items;
					self.inventoryCount = inventory.quantities;
					databaseHandler.saveInventory(self.name,self.inventory,self.inventoryCount);
				}
            }
            else if(action === Types.Messages.CHAT) {
                var msg = Utils.sanitize(message[1]);
                var toMeOnly = false;
                log.info("CHAT: " + self.name + ": " + msg);
                self.sendDebugMsg(msg);
                
               // cleanup (eddie only)
               if (msg == '!clean' && self.pid == '549e2360031ee0571b048f06') {
                   databaseHandler.cleanUp();
               }
				
				// test world
				if(msg !== ''){
					var msgParts = msg.split(' ');
					if(msgParts[0] == "!test") {
						if(msgParts[1] == '6kVSX8FQcViL' || self.pid == '53e40c45145932145a0084be'){
							// store in db so will persist through reconnect
							databaseHandler.saveMap(self.name,'test1',5,5);                    
							self.isDead = true;
							this.send([Types.Messages.MAPCHANGE,'test1']);
							msg = ''; // keep secret ssshhh!
						}
					}
					
					// cheat for crystals
	                if(msgParts[0] == "!cheat") {
	                    var crystalNum = parseInt(msgParts[1]);
	                    var crystalWin = parseInt(msgParts[2]);
	                    var crystalSpend = parseInt(msgParts[3]);
	                    
	                    if(crystalNum) {
	                    	databaseHandler.addremortCrystals(self, crystalNum);
	                    }
	                    
	                    if(crystalWin) {
	                    	databaseHandler.addWinCrystals(self, crystalWin);
	                    }
	                    
                    	if(crystalSpend) {
	                    	databaseHandler.addSpendCrystals(self, crystalSpend);
                    	}
	                		
	                    	self.pushStat(Types.PushStats.CRYSTALS, self.remortCrystals);
	                
	                    msg = '';
	                }
	                
	                if(msgParts[0] == "!setLevel") {
	                    var levelNum = parseInt(msgParts[1]);
	                    
	                    if(levelNum && levelNum <= 501 && levelNum > 0) {
	                    	self.experience = Types.expList[levelNum - 1];
	                    	
	                    	databaseHandler.setExp(self);
	                        var origLevel = self.level;
	                        self.level = Types.getLevel(self.experience);
	                        if(origLevel !== self.level) {
	                        	self.updateHitPoints();
	                        	self.updateManaPoints();
	                        	self.send(new Messages.HitPoints(self.maxHitPoints).serialize());
	                        	self.send(new Messages.ManaPoints(self.maxManaPoints).serialize());
	                        }
	                        
	                        self.server.pushToPlayer(self, new Messages.Exp(self.level, self.experience));
                    	}
	                		
	                    msg = '';
	                }
	                
	                if(msgParts[0] == "!setExp") {
	                    var setExp = parseInt(msgParts[1]);
	                    var newRemExp = parseInt(msgParts[2]);
	                    
	                    if(setExp) {
	                    	var firstChar = msgParts[1][0];
	                    	if (firstChar == "+" || firstChar == "-") {
	                    		self.experience = self.experience + setExp;
        					} else {
        						self.experience = setExp;
        					}
	                    	
	                    	databaseHandler.setExp(self);
	                        var origLevel = self.level;
	                        self.level = Types.getLevel(self.experience);
	                        if(origLevel !== self.level) {
	                        	self.updateHitPoints();
	                        	self.updateManaPoints();
	                        	self.send(new Messages.HitPoints(self.maxHitPoints).serialize());
	                        	self.send(new Messages.ManaPoints(self.maxManaPoints).serialize());
	                        }
	                        
	                        self.server.pushToPlayer(self, new Messages.Exp(self.level, self.experience));
                    	}
	                    
	                    if(newRemExp) {
	                    	var firstRemChar = msgParts[2][0];
	                    	if (firstRemChar == "+" || firstRemChar == "-") {
                                
        					} else {
        						
        					}
                    	}
	                		
	                    msg = '';
	                } //!setArmor !setSword !setShield
	                
	                if(msgParts[0] == "!setArmor") {
	                    var armorNum = parseInt(msgParts[1]);
	                    	
	                    if(armorNum && armorNum >= 0 && armorNum < Types.maleRankedArmors.length) {
	                    	var armorKind = Types.getArmorByRank(armorNum, self.gender);
	                    	self.equipItem(armorKind);
	                    	self.broadcast(self.equip(armorKind), false);
	                        msg = '';
                    	} else {
							var armorKind = Types.getArmorByRank(0, self.gender);
	                    	self.equipItem(armorKind);
	                    	self.broadcast(self.equip(armorKind), false);
                    		toMeOnly = true;
                    		msg = 'armor '+msgParts[1]+' does not exist so you get the armor 0';
                    	}
	                }
	                
	                if(msgParts[0] == "!setSword") {
	                    var swordNum = parseInt(msgParts[1]);
	                    
	                    if(swordNum && swordNum >= 0 && swordNum < Types.rankedWeapons.length) {
	                    	var swordKind = Types.rankedWeapons[swordNum];
	                    	self.equipItem(swordKind);
	                    	self.broadcast(self.equip(swordKind), false);
	                    	msg = '';
                    	} else {
							var swordKind = Types.rankedWeapons[0];
	                    	self.equipItem(swordKind);
	                    	self.broadcast(self.equip(swordKind), false);
                    		toMeOnly = true;
                    		msg = 'sword '+msgParts[1]+' does not exist so you get the sword 0';
                    	}
	                }
	                
	                if(msgParts[0] == "!setShield") {
	                    var shieldNum = parseInt(msgParts[1]);
	                    
	                    if(shieldNum && shieldNum >= 0 && shieldNum < Types.rankedShields.length) {
	                    	var shieldKind = Types.rankedShields[shieldNum];
	                    	self.equipItem(shieldKind);
	                    	self.broadcast(self.equip(shieldKind), false);
	                    	msg = '';
                    	} else {
							var shieldKind = Types.rankedShields[0];
	                    	self.equipItem(shieldKind);
	                    	self.broadcast(self.equip(shieldKind), false);
                    		toMeOnly = true;
                    		msg = 'shield '+msgParts[1]+' does not exist so you get the shield 0';
                    	}
	                }
	                
	                if(msgParts[0] == "!setRing") {
	                    var ringNum = parseInt(msgParts[1]);
	                    
	                    if(ringNum && ringNum >= 0 && ringNum < Types.rankedRings.length) {
	                    	var ringKind = Types.rankedRings[ringNum];
	                    	self.equipItem(ringKind);
	                    	self.broadcast(self.equip(ringKind), false);
	                    	msg = '';
                    	} else {
							var ringKind = Types.rankedRings[0];
	                    	self.equipItem(ringKind);
	                    	self.broadcast(self.equip(ringKind), false);
                    		toMeOnly = true;
                    		msg = 'ring '+msgParts[1]+' does not exist so you get the ring 0';
                    	}
	                }
	                
	                if(msgParts[0] == "!setAmulet") {
	                    var amuletNum = parseInt(msgParts[1]);
	                    
	                    if(amuletNum && amuletNum >= 0 && amuletNum < Types.rankedAmulets.length) {
	                    	var amuletKind = Types.rankedAmulets[amuletNum];
	                    	self.equipItem(amuletKind);
	                    	self.broadcast(self.equip(amuletKind), false);
	                    	msg = '';
                    	} else {
							var amuletKind = Types.rankedAmulets[0];
	                    	self.equipItem(amuletKind);
	                    	self.broadcast(self.equip(amuletKind), false);
                    		toMeOnly = true;
                    		msg = 'amulet '+msgParts[1]+' does not exist so you get the amulet 0';
                    	}
	                }
	                
	                if(msgParts[0] == "!getItem") {
	                    var itemName = msgParts[1];
	                    
	                    if(itemName) {
	                    	
                    	}
	                		
	                    msg = '';
	                }
	                
	                if(msgParts[0] == "!spawn") {
	                    var mobName = msgParts[1];
	                    var kind = parseInt(msgParts[1]);
	                    
	                    if(mobName || kind) {
	                    	if(mobName) {
	                    		kind = MobList.getMobIdByName(mobName);
	                    	}
	                    	
	                    	if(MobList.isMob(kind)) {
	                    		self.server.spawnMob(kind, self.x, self.y);
	                        }
                    	}
	                    
	                    log.info("try to spawn test mob "+msgParts[1]+" mobName: "+mobName+" kind: "+kind+" isMob: "+MobList.isMob(kind));
	                		
	                    msg = '';
	                }
					
					// test speed
					if(msgParts[0] == "!speed") 
					{
						var newmoveSpeed = msgParts[1];
						this.send([Types.Messages.SPEED, newmoveSpeed]);
					}
									
					// teleport on the map 
					if(msgParts[0] == "!tp") 
					{
						var mapName = self.map;
						databaseHandler.saveMap(self.name, mapName,parseInt(msgParts[1]),parseInt(msgParts[2]));
						self.isDead = true;
						this.send([Types.Messages.MAPCHANGE, mapName]);
					}
				}
                				
				
								
                // teleport back to castle (area 1)
                if(msg == "!castle" || msg == "!area1") {
                    var mapName = 'centralarea';
                    databaseHandler.saveMap(self.name, mapName,99,199);
                    self.isDead = true;
                    this.send([Types.Messages.MAPCHANGE, mapName]);
                }
				
				// teleport dungeon 1
                if(msg == "!dungeon1") {
                    var mapName = 'centralarea';
                    databaseHandler.saveMap(self.name, mapName,352,79);
                    self.isDead = true;
                    this.send([Types.Messages.MAPCHANGE, mapName]);
                }
				
				// teleport test
                if(msg == "!test1") {
                    var mapName = 'test1';
                    databaseHandler.saveMap(self.name, mapName,133,45);
                    self.isDead = true;
                    this.send([Types.Messages.MAPCHANGE, mapName]);
                }
							
				// teleport area 2
                if(msg == "!area2") {
                    var mapName = 'forest';
                    databaseHandler.saveMap(self.name, mapName,68,171);
                    self.isDead = true;
                    this.send([Types.Messages.MAPCHANGE, mapName]);
                }
				
				// teleport dungeon 2
                if(msg == "!dungeon2") {
                    var mapName = 'forest';
                    databaseHandler.saveMap(self.name, mapName,173,26);
                    self.isDead = true;
                    this.send([Types.Messages.MAPCHANGE, mapName]);
                }

				// admin message
				// #TODO figure out how to message all players
				if(msg !== ''){
					var msgParts = msg.split(' ');
					if(msgParts[0] == "!admin") {
						if(msgParts[1] == '6kVSX8FQcViL'){
							msgParts.shift();
							msgParts.shift();
							var adminMessage = msgParts.join(' ');
							for (var w=0;w<self.worlds.length;w++){
								self.worlds[w].pushBroadcast(new Messages.AdminMessage(adminMessage), 0);
							}
							log.info('ADMIN MSG: '+adminMessage);
							msg = '';
						}
					}
				}
				
				// reset player positions
				if(msg !== ''){
					var msgParts = msg.split(' ');
					if(msgParts[0] == "!resetpos") {
						if(msgParts[1] == '6kVSX8FQcViL'){
							databaseHandler.resetAllPositions();  
							msg = '';
						}
					}
				}
				
				// private messages
				if(msg !== ''){
					var msgParts = msg.split(' ');
					if(msgParts[0] == "!pm" && msgParts.length >= 3) {
						var toName = msgParts[1];
						msgParts.shift();
						msgParts.shift();
						var message = msgParts.join(' ');
						message = Utils.sanitize(message);
						message = message.substr(0, 60);
						for (var w=0;w<self.worlds.length;w++){
							var toId = self.worlds[w].getPlayerByName(toName);
							if(toId){
								self.worlds[w].pushToPlayer(toId, new Messages.PrivateMessage(self, message, self.name));
								self.server.pushToPlayer(self, new Messages.PrivateMessage(self, '['+toName+'] '+message, self.name));
								break;
							}
						}
						msg = '';
					}
				}

                // Sanitized messages may become empty. No need to broadcast empty chat messages.
                if(msg && msg !== "" && !adminMessage && !toMeOnly) {
                    msg = msg.substr(0, 120); // Enforce maxlength of chat input
					self.server.pushBroadcast(new Messages.Chat(self, msg), 0);
					//self.broadcast(new Messages.Chat(self, msg), false);
                } else if(msg && msg !== "" && toMeOnly) {
                	self.send(new Messages.Chat(self, msg));
                }
            }
            else if(action === Types.Messages.MOVE) {
				// fills up logs way to quick
                //log.info("MOVE: " + self.name + "(" + message[1] + ", " + message[2] + ")");
                if(self.move_callback) {
                    var x = message[1],
                        y = message[2];

                    if(self.server.isValidPosition(x, y)) {
                        self.setPosition(x, y);
                        self.clearTarget();

                        self.broadcast(new Messages.Move(self));
                        self.move_callback(self.x, self.y);
                    }
                }
            }
            else if(action === Types.Messages.STOREPURCHASE) {
                log.info("STOREPURCHASE: " + self.name + "(" + message[1] + ", " + message[2] + ", " + message[3] + ")");
                
                var kind = parseInt(message[1]);
                var quantity = parseInt(message[2]);
                var currency = parseInt(message[3]);
                
                var inv = Types.Stores.STORE2.inventory;
                
                // crystal store
                if (currency === Types.Currencies.CRYSTALS) {
                
                    var cost = Types.getStoreItemCost(kind,currency);
                    
                    if (cost != null) {
                        var totalcost = cost * quantity;
                        if (self.remortCrystals >= totalcost) {
                        
                            databaseHandler.addremortCrystals(self,-totalcost);
                            self.addToInventory(kind,quantity);
                            
                            // push update of remort points (crystals) to client
                            self.pushStat(Types.PushStats.CRYSTALS,self.remortCrystals);
                            
                        }
                    }
                                       
                }
                
            }
            else if(action === Types.Messages.ARENAPURCHASE) {
                log.info("ARENAPURCHASE: " + self.name + "(" + message[1] + ", " + message[2] + ")");
                
                var quantity = parseInt(message[1]);
                var currency = parseInt(message[2]);
                
                // crystal store
                if (currency === Types.Currencies.CRYSTALS) {
                
                    var cost = Types.getArenaCost(currency);
                    
                    if (cost != null) {
                        var totalcost = cost * quantity;
                        if (self.remortCrystals >= totalcost) {
                        
                            databaseHandler.addremortCrystals(self,-totalcost);
                            self.arenaPvp = true;
                            
                            databaseHandler.addSpendCrystals(self, totalcost);
                            
                            // push update of remort points (crystals) to client
                            self.pushStat(Types.PushStats.CRYSTALS,self.remortCrystals);
                            self.pushArenaSpendStat(Types.PushStats.ARENASPEND, self.spendCrystals);
                        } else {
                        	log.info("ARENAPURCHASE ERROR: " + self.name + " remortCrystals(" + self.remortCrystals + ") < totalcost(" + totalcost + ")");
                        }
                    }
                }
            }
            else if(action === Types.Messages.ARENAEXIT) {
                log.info("ARENAEXIT: " + self.name );
                
                self.arenaPvp = false;
                self.pushArenaExit();
            }
            else if(action === Types.Messages.REQUEST_MOB_PROJECTILE) {
				// client informing server of mob firing on them
                log.debug("REQUEST_MOB_PROJECTILE: " + self.name + "(" + message[1] + ", " + message[2] + ")");
				var mob = self.server.getEntityById(message[1]);
				var target = self.server.getEntityById(message[2]);

                if (!mob || !target) // if target dead while projectile fly
                    return;
				
				// cooldown and range check was done client side
				
				// server manages ids but does not keep track of projectiles
				var projectileId = '5'+self.server.projectileCount++;
				
				// id, sourceentityid, targetentityid
				self.broadcast(new Messages.Generic(Types.Messages.PROJECT_WITH_ENTITIES,[projectileId, mob.id, target.id]),false); // to us as well
				
			}
            else if(action === Types.Messages.CASTSPELL) {
                log.info("CASTSPELL: " + self.name + "(" + message[1] + ", " + message[2] + ", " + message[3] + ", " + message[4] + ", " + message[5] + ")");

                var kind = parseInt(message[1]);
                var target = self.server.getEntityById(message[6]);
                var isTryingBuffInPvp = (target != self && (self.pvpFlag == true || self.arenaPvp == true));
                if ((kind == Types.Projectiles.HEALBALL1 || kind == Types.Projectiles.SHIELD) && isTryingBuffInPvp)
                    return;

                var fromPos = { x: parseInt(message[2]),
                                y: parseInt(message[3])};
                var targetPos = { x: parseInt(message[4]),
                                  y: parseInt(message[5])};
                var manaReq = Types.getProjectileManaCost(kind) || 10;
                // arrows don't use mana
                if (kind == Types.Projectiles.PINEARROW) {
                    manaReq = 0;
                    
                    if (self.inventoryContains(Types.Entities.PINEARROW,1)) {
                        self.deductFromInventory(Types.Entities.PINEARROW,1);
                        self.sendInventory(); // too expensive?
                    } else {
                        // todo: msg to client out of ammo
                        //just for test return; // no arrows to fire..
                    }
                }
                
                // tornado has fixed travel distance along cast direction
                if (kind == Types.Projectiles.TORNADO) {
                    var tornadoDistance = 30 * 16; // 30 tiles i.e more than 1 screen
                    var dx = targetPos.x - fromPos.x;
                    var dy = targetPos.y - fromPos.y;
                    var dLength = Math.sqrt(dx * dx + dy * dy);
                    var ratio = tornadoDistance / dLength;
                    // scale to tornadoDistance
                    targetPos.x = fromPos.x + dx * ratio;
                    targetPos.y = fromPos.y + dy * ratio; 
                }
                
                //todo: cooldown check
                if (self.manaPoints >= manaReq) {
                
                    if (manaReq > 0) {
                        self.manaPoints-=manaReq;
                        self.server.pushToPlayer(self,self.mana());
                    }
                    
                    if (kind == Types.Projectiles.SHIELD) {
                        var target = self.server.getEntityById(message[6]);
                        // set buff on char
                        self.setBuff(Types.Buffs.SHIELDED, 10, self.server, target.id);
                        
                        return;
                    }                      
                
                    // server manages ids but does not keep track of projectiles
                    var projectileId = '5'+self.server.projectileCount++;
                    
                    // id, projectile type, sourcex, sourcey, destx, desty, owner id
                    self.broadcast(new Messages.Project(projectileId,kind,fromPos.x,fromPos.y,targetPos.x,targetPos.y,self.id),false); // send to casting player too
                    
                }

            }            
            else if(action === Types.Messages.LOOTMOVE) {
                log.info("LOOTMOVE: " + self.name + "(" + message[1] + ", " + message[2] + ")");
                if(self.lootmove_callback) {
                    self.setPosition(message[1], message[2]);

                    var item = self.server.getEntityById(message[3]);
                    if(item) {
                        self.clearTarget();

                        self.broadcast(new Messages.LootMove(self, item));
                        self.lootmove_callback(self.x, self.y);
                    }
                }
            }
            else if(action === Types.Messages.AGGRO) {
                log.info("AGGRO: " + self.name + " " + message[1]);
                if(self.move_callback) {
                    self.server.handleMobHate(message[1], self.id, 5);
                }
            }
            else if(action === Types.Messages.AGGRORANGED) {
                log.debug("AGGRORANGED: " + self.name + " " + message[1]);
				// schedule emit
				var mob = self.server.getEntityById(message[1]);
				if(mob && !self.isDead) {
					
					log.debug("AGGRORANGED: mob.rangedTarget=" + mob.rangedTarget);

					if (mob.rangedTarget == null) {
						// store this mob in this players server side attackers list
						// we need to do this to clear down rangetarget link on player death/quit
						self.addAttacker(mob);
						
						// let everyone know mob is now ranged attacking this player
						mob.rangedTarget = self.id;
						self.broadcast(new Messages.Generic(Types.Messages.RANGED_TARGET_CHANGED,[mob.id, self.id]),false);
					}
					
                }
				
            }			
            else if(action === Types.Messages.ATTACK) {
                log.info("ATTACK: " + self.name + " " + message[1]);
                var mob = self.server.getEntityById(message[1]);

                if(mob) {
                    self.setTarget(mob);
                    self.server.broadcastAttacker(self);
                }
            }
            else if(action === Types.Messages.HIT) {
                // player (self) hit mob or player !
                var mob = self.server.getEntityById(message[1]);
				
                if(mob) {
					log.info("HIT: " + self.name + " " + message[1]);
					
					if(mob.type !== "player")
					{
						// when attacking mob
                        var defenderLevel = mob.Level;
						var defenderShieldLevel = mob.Shield;
                    }
					else
					{
						// when attacking player
						var defenderLevel = mob.level;
						var defenderShieldLevel = mob.shieldLevel;
					}
					
					// coef for level difference between attacker and defender
					if(defenderLevel <= self.level)
					{
						var CoefDefender = 5;
						var CoefAttacker = self.level - defenderLevel + 5;
					}
					else 
					{
						var CoefDefender = defenderLevel - self.level + 5;
						var CoefAttacker = 5;
					}
										
					// shield test
					var block = Math.round((10 * (defenderShieldLevel+1)) / ((10 * (defenderShieldLevel+1)) + (10 * (self.weaponLevel+1))) * 20 * (CoefDefender-4) / (CoefAttacker-4));
					var blockrand = Math.floor(Math.random() * 100); 	
					if(block < blockrand)
					{
						var dmg = Math.ceil((Formulas.dmg(self.weaponLevel, mob.armorLevel)+5+(self.level*0.5))*CoefAttacker/CoefDefender);	
						
						if(mob.type !== "player")
						{
							log.info('player has attacked kind '+mob.kind );	
							// if we hit a leader, aggro all followers nearby
							//if (mob.followers > 0)
							//{
							//	log.info('player has attacked a leader');
							//	// foreach agro
							//	var playerGroupId = self.group;
							//	self.server.forEachMob(function(m){
							//		if (m.group == playerGroupId) {
							//			if (m.kind == mob.followers) {
							//				log.info('followers follow the leader '+m.id);
							//				self.server.handleMobHate(m.id,self.id,1);
							//				// enraged for 1 min
							//				m.setBuff(Types.Buffs.ENRAGED,10,self.server,self.id);
							//			}
							//		}
							//	});
							//}
						}	
						else
						{
							log.info('player has attacked another player');
						}						
					}
					else
					{
						var dmg = 0;
					}	
					
					if(dmg > mob.hitPoints)
					{
						dmg = mob.hitPoints;
					}
					
                    if(dmg > 0) {
						// player absorb hp with ring when physicaly damage a mob (not magically)
						var hpSteal = Math.ceil((10 + (self.ringLevel * 10)) * dmg / 100);	
						if(!self.hasFullHealth()) 
						{
							self.regenHealthBy(hpSteal);
							self.server.pushToPlayer(self, self.health());							
						}
						
                      if(mob.type !== "player"){
                        mob.applyDamage(dmg);
                        self.server.handleMobHate(mob.id, self.id, dmg);
                      }
					  self.server.handleHurtEntity(mob, self, dmg);
                    }
                }
            }
            else if(action === Types.Messages.HITBOMB) {
                // bomb damage to mobs
                log.info("HITBOMB: " + self.name + " " + message[1]);
                var mob = self.server.getEntityById(message[1]);
                if(mob) {               
				
					// I consider that the bombs are level 1 with weapon level 1					
					var fakeBombLevel = 1;
					var fakeBombWeaponLevel = 1;
					
					// coef for level difference between attacker and defender
					if(mob.Level <= fakeBombLevel)
					{
						var CoefDefender = 5;
						var CoefAttacker = fakeBombLevel - mob.Level + 5;
					}
					else 
					{
						var CoefDefender = mob.Level - fakeBombLevel + 5;
						var CoefAttacker = 5;
					}
					
					// shield test
					var block = Math.round((10 * (mob.Shield+1)) / ((10 * (mob.Shield+1)) + (10 * fakeBombWeaponLevel)) * 20 * (CoefDefender-4) / (CoefAttacker-4));
					var blockrand = Math.floor(Math.random() * 100); 		
					
					if(block < blockrand)
					{
						var dmg = Math.ceil(Types.getBombDamage()*CoefAttacker/CoefDefender);					
					}
					else
					{
						var dmg = 0;
					}	

                      if(mob.type !== "player"){
                        mob.applyDamage(dmg);
                        self.server.handleHurtEntity(mob, self, dmg);
                        self.server.handleMobHate(mob.id, self.id, dmg);
                      }
                    
                }
            }
            else if(action === Types.Messages.HITRANGED) {
                // ranged damage to mobs
				
                log.info("HITRANGED: " + self.name + " " + message[1] + " " + message[2] + " " + message[3] + " " + message[4]);
                var mob = self.server.getEntityById(message[1]);
                var kind = parseInt(message[2]);
                var originX = parseInt(message[3]);
                var originY = parseInt(message[4]);
		
                if(mob) {
										
					// I consider that spell are level 1 but player will be able to boost spell later					
					var fakeSpellLevel = 1;
					
					// coef for level difference between attacker and defender
					if(mob.Level <= self.level)
					{
						var CoefDefender = 5;
						var CoefAttacker = self.level - mob.Level + 5;
					}
					else 
					{
						var CoefDefender = mob.Level - self.level + 5;
						var CoefAttacker = 5;
					}
					
					// shield test
					var block = Math.round((10 * (mob.Shield+1)) / ((10 * (mob.Shield+1)) + (10 * fakeSpellLevel)) * 20 * (CoefDefender-4) / (CoefAttacker-4));	
					var blockrand = Math.floor(Math.random() * 100); 		
					
					if(block < blockrand)
					{
					
						// if we hit a leader, aggro all followers nearby
						//if (mob.followers > 0)
						//{
						//	log.info('player has attacked a leader');
						//	// foreach agro
						//	var playerGroupId = self.group;
						//	self.server.forEachMob(function(m){
						//		if (m.group == playerGroupId) {
						//			if (m.kind == mob.followers) {
						//				log.info('followers follow the leader '+m.id);
						//				self.server.handleMobHate(m.id,self.id,1);
						//				// enraged for 1 min
						//				m.setBuff(Types.Buffs.ENRAGED,10,self.server,self.id);
						//			}
						//		}
						//	});
						//}
						if (kind === Types.Projectiles.TERROR) {
							//mob.forgetPlayer(self.id,10000);
							self.server.handleMobRetreat(mob);
							return;
						}
						
						if (kind === Types.Projectiles.STUN) {
							mob.setBuff(Types.Buffs.STUNNED,10,self.server,self.id);
							// movement suppression client side only
							return;
						}
						
						if (kind === Types.Projectiles.BLACKHOLE) {                        
							// movement suppression client side
							mob.setBuff(Types.Buffs.STUNNED,3,self.server,self.id);
													
							// lets do the displacement logic server side on impact too
							self.server.applyBlackHoleDisplacement(self,mob,originX,originY);
							return;
						}     
						
						if (kind === Types.Projectiles.TRANSFORM) {
							mob.setBuff(Types.Buffs.RABBIT,10,self.server,self.id);
							return;
						}
						
						if (kind === Types.Projectiles.POISON) {
							mob.setBuff(Types.Buffs.POISONED,10,self.server,self.id);
							//return;						
						}
												
						var dmg = Math.ceil(Types.getProjectileDamage(kind)*CoefAttacker*fakeSpellLevel/CoefDefender/(mob.armorLevel+1));
						
						if(mob.type !== "player"){
							mob.applyDamage(dmg);
							self.server.handleHurtEntity(mob, self, dmg);
							// todo: reachability precheck
							self.server.handleMobHate(mob.id, self.id, dmg);
						}					
					}
                }
            }            
            else if(action === Types.Messages.HITHEAL) {
                // player hit by heal spell
                var projectiletype = message[1];
                log.info("HITHEAL: " + self.name + " " + projectiletype);
                if(projectiletype === Types.Projectiles.HEALBALL1) {                    
                      var amount = 200;
                      if(!self.hasFullHealth()) {
                            self.regenHealthBy(amount);
                            self.server.pushToPlayer(self, self.health());
                      }                    
                }
            }
            else if(action === Types.Messages.HITWORLDPROJECTILE) {
			
                // player hit by world, pvp projectile, pvp bomb	
                var projectiletype = message[1];				
                var owner = self.server.getEntityById(message[2]);					
								
                log.info("HITWORLDPROJECTILE: " + self.name + " " + projectiletype + " , " + message[2]);
                								
                // PVP bomb dmg
                if(projectiletype === Types.Entities.LITBOMB) {
						
					// I consider that the bombs are level 1 with weapon level 1					
					var fakeBombLevel = 1;
					var fakeBombWeaponLevel = 1;
					
					// coef for level difference between attacker and defender
					if(self.level <= fakeBombLevel)
					{
						var CoefDefender = 5;
						var CoefAttacker = fakeBombLevel - self.level + 5;
					}
					else 
					{
						var CoefDefender = self.level - fakeBombLevel + 5;
						var CoefAttacker = 5;
					}
					
					// shield test
					var block = Math.round((10 * (self.shieldLevel+1)) / ((10 * (self.shieldLevel+1)) + (10 * fakeBombWeaponLevel)) * 20 * (CoefDefender-4) / (CoefAttacker-4));
					var blockrand = Math.floor(Math.random() * 100); 	
										
					if(block < blockrand)
					{	
						var dmg = Math.ceil(Types.getBombDamage()*CoefAttacker/CoefDefender);	
						self.applyDamage(dmg);
						self.server.handleHurtEntity(self, owner, dmg);
						if(self.hitPoints <= 0) 
						{
							self.isDead = true;
						}	
					}
					
                } else {
					// test if owner of the spell is a player to search his level and spell level 
					//later i will need also the level + weapon level (we will consider weapon level as the spell level) for mobs 
					// and for the emiters, we will need something too (maybe considering emiter level as 10X area number and emiter spell level as area number) that would make an emiter area 10 level 100 with a spell level 10
					
					if(owner)
					{
						
						if(owner.type == "player")
						{						
							// I consider that the spells are level 1 (later we will need to use the level of the spell in the db)	
							var fakeSpellLevel = 1;
							
							// coef for level difference between attacker and defender
							if(self.level <= owner.level)
							{
								var CoefDefender = 5;
								var CoefAttacker = owner.level - self.level + 5;
							}
							else 
							{
								var CoefDefender = self.level - owner.level + 5;
								var CoefAttacker = 5;
							}
							
							// shield test
							var block = Math.round((10 * (self.shieldLevel+1)) / ((10 * (self.shieldLevel+1)) + (10 * fakeSpellLevel)) * 20 * (CoefDefender-4) / (CoefAttacker-4));
							var blockrand = Math.floor(Math.random() * 100); 	
																							
							if(block < blockrand)
							{	
								var dmg = Math.floor(Types.getProjectileDamage(projectiletype)*CoefAttacker*fakeSpellLevel/CoefDefender/(self.armorLevel+1));	
							}
							else
							{
								var dmg = 0;
							}
						}
						else
						{												
							// coef for level difference between attacker and defender
							
							if(self.level <= owner.Level)
							{
								var CoefDefender = 5;
								var CoefAttacker = owner.Level - self.level + 5;
							}
							else 
							{
								var CoefDefender = self.level - owner.Level + 5;
								var CoefAttacker = 5;
							}
							
							// shield test
							var block = Math.round((10 * (self.shieldLevel+1)) / ((10 * (self.shieldLevel+1)) + (10 * (owner.weaponLevel+1))) * 20 * (CoefDefender-4) / (CoefAttacker-4));
							var blockrand = Math.floor(Math.random() * 100); 	
																							
							if(block < blockrand)
							{	
								var dmg = Math.ceil((Formulas.dmg(owner.weaponLevel, self.armorLevel)+5+(owner.Level*0.5))*CoefAttacker/CoefDefender); 
							}
							else
							{
								var dmg = 0;
							}
						}
						
					}
					else
					{
						// level and spell level of emmiter (based on the map location)					
						var emmiterSpellLevel = Types.emitterSpellLevel(self.map);
						var emmiterLevel = emmiterSpellLevel*10;
						
						// coef for level difference between attacker and defender
						if(self.level <= emmiterLevel)
						{
							var CoefDefender = 5;
							var CoefAttacker = emmiterLevel - self.level + 5;
						}
						else 
						{
							var CoefDefender = self.level - emmiterLevel + 5;
							var CoefAttacker = 5;
						}
					
						// shield test
						var block = Math.round((10 * (self.shieldLevel+1)) / ((10 * (self.shieldLevel+1)) + (10 * emmiterSpellLevel)) * 20 * (CoefDefender-4) / (CoefAttacker-4));	
						var blockrand = Math.floor(Math.random() * 100); 		
						
						if(block < blockrand)
						{		
							var dmg = Math.floor(Math.round(self.maxHitPoints/4)*CoefAttacker*emmiterSpellLevel/CoefDefender/(self.armorLevel+1));
						}   
						else
						{
							var dmg = 0;
						}
					}
                    self.applyDamage(dmg);
                    
                    if(self.hitPoints <= 0) {
                        self.isDead = true;

						// clear rangedTarget on attackers if any
						_.each(self.attackers, function(mob) {
							mob.clearTarget();
						});
						
                    }
					
					// note: handleHurtEntity destroys attacker list so cleartarget code above
					// must run prior and synchronously
					self.server.handleHurtEntity(self, owner, dmg);
					
                }
                

            }            
            else if(action === Types.Messages.HURT) {
                // mob or player hits player(self) !
                log.info("HURT: " + self.name + " " + message[1]);
                var mob = self.server.getEntityById(message[1]);				
                if(mob && self.hitPoints > 0) {
                               
					if(mob.type !== "player")
					{
						// when attacking mob
                        var attackerLevel = mob.Level;
                    }
					else
					{
						// when attacking player
						var attackerLevel = mob.level;
					}
							   
					// coef for level difference between attacker and defender
					if(self.level <= attackerLevel)
					{
						var CoefDefender = 5;
						var CoefAttacker = attackerLevel - self.level + 5;
					}
					else 
					{
						var CoefDefender = self.level - attackerLevel + 5;
						var CoefAttacker = 5;
					}
									
					// shield test
					var block = Math.round((10 * (self.shieldLevel+1)) / ((10 * (self.shieldLevel+1)) + (10 * (mob.weaponLevel+1))) * 20 * (CoefDefender-4) / (CoefAttacker-4));
					var blockrand = Math.floor(Math.random() * 100); 
					if(block < blockrand)
					{				  
						var dmg = Math.ceil((Formulas.dmg(mob.weaponLevel, self.armorLevel)+5+(attackerLevel*0.5))*CoefAttacker/CoefDefender); 
						// player absorb mp with amulet when get physicaly hit (not magically)
						
						var mpSteal = Math.ceil((10 + (self.amuletLevel * 10)) * dmg / 100);	
						if(!self.hasFullMana()) {
						self.regenManaBy(mpSteal);                 
						self.server.pushToPlayer(self, self.mana());
						}
					}
					else
					{
						var dmg = 0;
					}					
					// rabbit debuff nullifies dmg
					if (mob.hasBuff(Types.Buffs.RABBIT)) {
						dmg = Math.round(dmg * 0.5);
					}
					
					// enraged buff adding 50% dmg
					if (mob.hasBuff(Types.Buffs.ENRAGED)) {
						dmg = Math.round(dmg * 1.5);
					}
                    					  
					self.applyDamage(dmg);
					self.server.handleHurtEntity(self, mob, dmg);
					

                    if(self.hitPoints <= 0) {
                        self.isDead = true;
                        if(self.hulkTimeout) {
                            clearTimeout(self.hulkTimeout);
                        }
                    }
                }
            }
            else if(action === Types.Messages.LOOT) {
                log.info("LOOT: " + self.name + " " + message[1]);
                var item = self.server.getEntityById(message[1]);

                if(item) {
                    var kind = item.kind;

                    if(Types.isItem(kind)) {
                        self.broadcast(item.despawn());
                        self.server.removeEntity(item);
                        
                        if(Types.isArmor(kind) || Types.isWeapon(kind) || Types.isShield(kind) || Types.isAmulet(kind) || Types.isRing(kind)) {
                            self.equipItem(item.kind);
                            self.broadcast(self.equip(kind));
                        } else {
                            // everything not handled above (like weapon/armor/shield/amulet/ring) goes into inventory
                            
                            var quantity = 1;
                            // pick up arrows 12 at a time
                            if (kind == Types.Entities.PINEARROW) {
                                quantity = 12;
                            }

                            self.addToInventory(kind,quantity);
                        }
                    }
                } else {
                	log.error("Item "+message[1]+" nof found");
                }
            }
            else if(action === Types.Messages.KEY) {
                var keyId = message[1];
                self.addKey(keyId);
            }
            else if(action === Types.Messages.TELEPORT) {
                log.info("TELEPORT: " + self.name + "(" + message[1] + ", " + message[2] + ")");
                var x = message[1],
                    y = message[2];

                if(self.server.isValidPosition(x, y)) {
                    self.setPosition(x, y);
                    self.clearTarget();

                    self.broadcast(new Messages.Teleport(self));

                    self.server.handlePlayerVanish(self);
                    self.server.pushRelevantEntityListTo(self);
                }
            }
            else if(action === Types.Messages.WAYPOINT_ENTER) {
                log.info("WP: (" + message[1]+")");
                var waypointId = message[1];

                var mapName = Types.waypoints[waypointId][1],
                    x = Types.waypoints[waypointId][2],
                    y = Types.waypoints[waypointId][3];

                databaseHandler.saveMap(self.name, mapName, x, y);
                self.isDead = true;
                this.send([Types.Messages.MAPCHANGE, mapName]);
            }
            else if(action === Types.Messages.OPEN) {
                log.info("OPEN: " + self.name + " " + message[1]);
                var chest = self.server.getEntityById(message[1]);
                if(chest && chest instanceof Chest) {
                    self.server.handleOpenedChest(chest, self);
                }
            }
            else if(action === Types.Messages.ACTIVATETRAP) {
                var trap = self.server.getEntityById(message[1]);
                log.info("ACTIVATETRAP: " + self.name + " " + message[1]);
                if(trap && trap instanceof Trap) {
                    if(self.hitPoints > 0) {
					
						var dmg = Math.ceil(Formulas.dmg(trap.damageLevel, self.armorLevel)*trap.damageLevel/self.level);
						self.applyDamage(dmg);
						log.info("TRAP HURT: " + self.name + " " + self.hitPoints + " " + dmg);
						self.server.handleActivateTrap(trap, self);		
					
                        if(self.hitPoints <= 0) {
                            self.isDead = true;
                            if(self.hulkTimeout) {
                                clearTimeout(self.hulkTimeout);
                            }
                        }
                    }
                }
            }
			else if(action === Types.Messages.SWITCH) {
                log.info("SWITCH: " + self.name + " " + message[1]);
                var lever = self.server.getEntityById(message[1]);
                if(lever && lever instanceof Lever) {
                    self.server.handleLeverSwitch(lever, self);
                }
            }
			else if(action === Types.Messages.RETREAT) {
                log.info("RETREAT: " + self.name + " " + message[1]);
                var mob = self.server.getEntityById(message[1]);
                if(mob) {
                    self.server.handleMobRetreat(mob);
                }
            }
			else if(action === Types.Messages.REMORT){
				log.info("REMORT: " + self.name + " " + message[1]);
                
                var newName = null;
                
                var pw = self.pid.substr(0, 15);
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(pw, salt, function(err, hash) {
                        newName = databaseHandler.remort(self,new Player(self.connection,self.worlds,0,databaseHandler),hash);
                    })
                });
                                
                self.isDead = true;
                self.inventory = [];
                self.inventoryCount = [];
                self.sendReload(newName);
			}
            else if(action === Types.Messages.CHECK) {
                log.info("CHECK: " + self.name + " " + message[1]);
                var checkpoint = self.server.map.getCheckpoint(message[1]);
                if(checkpoint) {
                    self.lastCheckpoint = checkpoint;
                    databaseHandler.setCheckpoint(self.name, self.x, self.y);
                }
            }
            else if(action === Types.Messages.UPDATE_INVENTORY){
                log.info("UPDATE_INVENTORY: " + self.name + " " + message[1] + " " + message[2] + " " + message[3]);
                var inventoryNumber = message[2],
                    count = message[3];

                if(inventoryNumber !== 0 && inventoryNumber !== 1){
                    return;
                }

                var itemKind = self.inventory[inventoryNumber];
                if(itemKind){
                    if(message[1] === "avatar" || message[1] === "armor"){
                        if(message[1] === "avatar"){
                            self.inventory[inventoryNumber] = null;
                            self.inventoryCount[inventoryNumber] = 0;
                            //databaseHandler.makeEmptyInventory(self.name, inventoryNumber);
                            databaseHandler.saveInventory(self.name,self.inventory,self.inventoryCount);
                            self.equipItem(itemKind, true);
                        } else{
                            self.inventory[inventoryNumber] = self.armor;
                            self.inventoryCount[inventoryNumber] = 1;
                            //databaseHandler.setInventory(self.name, self.armor, inventoryNumber, 1);
                            databaseHandler.saveInventory(self.name,self.inventory,self.inventoryCount);
                            self.equipItem(itemKind, false);
                        }
                        self.broadcast(self.equip(itemKind));
                    } else if(message[1] === "empty"){
                        //var item = self.server.addItem(self.server.createItem(itemKind, self.x, self.y));
                        var item = self.server.addItemFromChest(itemKind, self.x, self.y);
                        if(Types.isHealingItem(item.kind)){
                            if(count < 0)
                                count = 0;
                            else if(count > self.inventoryCount[inventoryNumber])
                                count = self.inventoryCount[inventoryNumber];
                            item.count = count;
                        }

                        if(item.count > 0) {
                            self.server.handleItemDespawn(item);

                            if(Types.isHealingItem(item.kind)) {
                                
                                if(item.count === self.inventoryCount[inventoryNumber]) {
                                    self.inventory[inventoryNumber] = null;
                                    self.inventoryCount[inventoryNumber] = 0;
                                    //databaseHandler.makeEmptyInventory(self.name, inventoryNumber);
                                } else {
                                    self.inventoryCount[inventoryNumber] -= item.count;
                                    //databaseHandler.setInventory(self.name, self.inventory[inventoryNumber], inventoryNumber, self.inventoryCount[inventoryNumber]);
                                }
                                
                                databaseHandler.saveInventory(self.name,self.inventory,self.inventoryCount);
                            } else {
                                self.inventory[inventoryNumber] = null;
                                self.inventoryCount[inventoryNumber] = 0;
                                //databaseHandler.makeEmptyInventory(self.name, inventoryNumber);
                                databaseHandler.saveInventory(self.name,self.inventory,self.inventoryCount);
                            }
                        }
                    } else if(message[1] === "eat"){
                        var amount;

                        switch(itemKind) {
                            case Types.Entities.FLASK:
                                amount = 80;
                                break;
                            case Types.Entities.BURGER:
                                amount = 200;
                                break;
                        }

                        if(!self.hasFullHealth()) {
                            self.regenHealthBy(amount);
                            self.server.pushToPlayer(self, self.health());
                        }
                        self.inventoryCount[inventoryNumber] -= 1;
                        if(self.inventoryCount[inventoryNumber] <= 0){
                            self.inventory[inventoryNumber] = null;
                        }
                        //databaseHandler.setInventory(self.name, self.inventory[inventoryNumber], inventoryNumber, self.inventoryCount[inventoryNumber]);
                        databaseHandler.saveInventory(self.name,self.inventory,self.inventoryCount);
                    }
                }
            }
            else if(action === Types.Messages.ACHIEVEMENT) {
                log.info("ACHIEVEMENT: " + self.name + " " + message[1] + " " + message[2]);
                databaseHandler.addremortCrystals(self,1000);
                // push update of remort points (crystals) to client
                self.pushStat(Types.PushStats.CRYSTALS,self.remortCrystals);                
            }
            else if(action === Types.Messages.GUILD) {
                if(message[1] === Types.Messages.GUILDACTION.CREATE) {
                    var guildname = Utils.sanitize(message[2]);
                    if(guildname === "") { //inaccurate name
                        self.server.pushToPlayer(self, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.BADNAME,message[2]));
                    } else {
                        var guildId = self.server.addGuild(guildname);
                        if(guildId === false) {
                            self.server.pushToPlayer(self, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.ALREADYEXISTS, guildname));
                        } else {
                            self.server.joinGuild(self, guildId);
                            self.server.pushToPlayer(self, new Messages.Guild(Types.Messages.GUILDACTION.CREATE, [guildId, guildname]));
                        }
                    }
                }
                else if(message[1] === Types.Messages.GUILDACTION.INVITE) {
                    var userName = message[2];
                    var invitee;
                    if(self.group in self.server.groups) {
                        invitee = _.find(self.server.groups[self.group].entities,
                                         function(entity, key) { return (entity instanceof Player && entity.name == userName) ? entity : false; });
                        if(invitee) {
                            self.getGuild().invite(invitee,self);
                        }
                    }
                }
                else if(message[1] === Types.Messages.GUILDACTION.JOIN) {
                    self.server.joinGuild(self, message[2], message[3]);
                }
                else if(message[1] === Types.Messages.GUILDACTION.LEAVE) {
                    self.leaveGuild();
                }
                else if(message[1] === Types.Messages.GUILDACTION.TALK) {
                    self.server.pushToGuild(self.getGuild(), new Messages.Guild(Types.Messages.GUILDACTION.TALK, [self.name, self.id, message[2]]));
                }
            } else {
                if(self.message_callback) {
                    self.message_callback(message);
                }
            }
        });

        this.connection.onClose(function() {
			// remove guest info from database
			if(self.isGuest){
				// can't delete guests because the client closes on player death :c
				//databaseHandler.deleteGuest(self.name);
			}
            if(self.hulkTimeout) {
                clearTimeout(self.hulkTimeout);
            }
            clearTimeout(self.disconnectTimeout);
            if(self.exit_callback) {
                self.exit_callback();
            }
        });
        this.connection.sendUTF8("go"); // Notify client that the HELLO/WELCOME handshake can start
    },

    loginWithUsername: function(username) {
        var self = this;
        if(!username){
            self.connection.sendUTF8("invalidlogin");
            self.connection.close("No account found. Please create one first.");
            return;
        }
        for (var w=0;w<self.worlds.length;w++){
            var loggedInPlayer = self.worlds[w].loggedInPlayer(username,self.id);
            if(loggedInPlayer != null) {
                // disconnect the old session
                log.info(self.id + 'Disconnecting prior session '+loggedInPlayer.id);
                loggedInPlayer.connection.sendUTF8("otherlocation");
                loggedInPlayer.connection.close("Logged in from other location");
            }
        }
        self.name = username;
        self.pw = self.pid.substr(0, 15);
        log.info("LOGIN: " + self.name + " group: "+self.group);
        // TODO implement better moderation system
        //databaseHandler.checkBan(self);
        databaseHandler.loadPlayer(self);
    },
    
    destroy: function() {
        var self = this;

        this.forEachAttacker(function(mob) {
            mob.clearTarget();
        });
        this.attackers = {};

        this.forEachHater(function(mob) {
            mob.forgetPlayer(self.id);
        });
        this.haters = {};
    },

    getState: function() {
        var basestate = this._getBaseState(),
            state = [this.name, this.orientation, this.armor, this.weapon, this.level, this.shield];

        if(this.target) {
            state.push(this.target);
        }

        return basestate.concat(state);
    },

    send: function(message) {
        this.connection.send(message);
    },
	
	loadPendingFriends: function(){
		options = {
			headers: {
				Authorization: 'Bearer '+this.token
			}
		}
		var self = this;
		request.get('https://www.id.net/api/v1/json/links/pending', options, function(e, r, body){
			var response = JSON.parse(body);
			if(!response.results){
				return; // no friends
			}
			for (var i=0;i<response.results.length;i++){
				if(!self.friends[response.results[i].pid]){
					self.friends[response.results[i].pid] = {};
				}
				self.friends[response.results[i].pid].p = 1;
				self.friends[response.results[i].pid].ni = response.results[i].nickname;
				/*if(!self.friends[response.results[i].pid].n){
					self.databaseHandler.usernameFromIdSpecial(response.data[i].id, self.friends[response.data[i].id], function(username, pid, friend){
						friend.n = username;
					});
				}*/
			}
		});
	},
	
	loadFriends: function(){
		options = {
			headers: {
				Authorization: 'Bearer '+this.token
			}
		}
		var self = this;
		request.get('https://www.id.net/api/v1/json/'+self.pid+'/friends?limit=40&offset=0', options, function(e, r, body){
			var response = JSON.parse(body);
			if(!response.data){
				return; // no friends
			}
			for (var i=0;i<response.data.length;i++){

                if(!self.friends[response.data[i].id]){
                    self.friends[response.data[i].id] = {};
                }
                var friend = self.friends[response.data[i].id];
                friend.p = 0;
                friend.ni = response.data[i].nickname;
                friend.t = response.data[i].avatars.thumb_url;
                databaseHandler.usernameFromIdSpecial(response.data[i].id, friend, function(username, pid, friend) {
                    var characters = [];
                    for (var i = 0; i < username.length, item = username[i]; i++)
                        characters.push(item.name);

                    friend.characters = characters;
                    self.sendServerStatistic();
                });
			}

		});
	},
	
	sortFriends: function(){
		var self = this;
		setTimeout(function(){
			var sortedFriends = {};
			var tempFriends2 = {};
			var tempFriends3 = {};
			var tempFriends4 = {};
			// sort by pend, online, offline, unjoined
			for (var pid in self.friends) {
				var p = self.friends[pid];
				if(p.p){ // pends
					sortedFriends[pid] = p;
				}else if(typeof self.server.globalPlayers[pid] != 'undefined'){ // online paragon
					p.o = 1;
					tempFriends2[pid] = p;
				}else if(p.n){ // joined but offline (has username)
					tempFriends3[pid] = p;
				}else{
					tempFriends4[pid] = p; // friends but not joined
				}
			}
			// merge
			for (var pid in tempFriends2) {
				sortedFriends[pid] = tempFriends2[pid];
			}
			for (var pid in tempFriends3) {
				sortedFriends[pid] = tempFriends3[pid];
			}
			for (var pid in tempFriends4) {
				sortedFriends[pid] = tempFriends4[pid];
			}
			//send
			self.friends = sortedFriends;
			if(self.friends){
				self.updateFriends();
			}
		}, 1000);
	},

    flagPVP: function(pvpFlag) {
        if(this.pvpFlag != pvpFlag){
            this.pvpFlag = pvpFlag;
            this.send(new Messages.PVP(this.pvpFlag).serialize());
        }
    },

    broadcast: function(message, ignoreSelf) {
        if(this.broadcast_callback) {
            this.broadcast_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
        }
    },

    broadcastToZone: function(message, ignoreSelf) {
        if(this.broadcastzone_callback) {
            this.broadcastzone_callback(message, ignoreSelf === undefined ? true : ignoreSelf);
        }
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    onMove: function(callback) {
        this.move_callback = callback;
    },

    onLootMove: function(callback) {
        this.lootmove_callback = callback;
    },

    onZone: function(callback) {
        this.zone_callback = callback;
    },

    onOrient: function(callback) {
        this.orient_callback = callback;
    },

    onMessage: function(callback) {
        this.message_callback = callback;
    },

    onBroadcast: function(callback) {
        this.broadcast_callback = callback;
    },

    onBroadcastToZone: function(callback) {
        this.broadcastzone_callback = callback;
    },

    equip: function(item) {
        log.info("new Messages.EquipItem "+item);
    	return new Messages.EquipItem(this, item);
    },

    addHater: function(mob) {
        if(mob) {
            if(!(mob.id in this.haters)) {
                this.haters[mob.id] = mob;
            }
        }
    },

    removeHater: function(mob) {
        if(mob && mob.id in this.haters) {
            delete this.haters[mob.id];
        }
    },

    forEachHater: function(callback) {
        _.each(this.haters, function(mob) {
            callback(mob);
        });
    },

    equipArmor: function(kind) {
        this.armor = kind;
        this.armorLevel = Properties.getArmorLevel(kind,this.gender);
    },

    equipAvatar: function(kind) {
        if(kind) {
            this.avatar = kind;
        } else {
            this.avatar = Types.Entities.ARMOR0M;
        }
     },

    equipWeapon: function(kind) {
        this.weapon = kind;
        this.weaponLevel = Properties.getWeaponLevel(kind);
    },
    
    equipShield: function(kind) {
        this.shield = kind;
        this.shieldLevel = Properties.getShieldLevel(kind);
    },
    
    equipAmulet: function(kind) {
        this.amulet = kind;
        this.amuletLevel = Properties.getAmuletLevel(kind);
    },
    
    equipRing: function(kind) {
        this.ring = kind;
        this.ringLevel = Properties.getRingLevel(kind);
    },

    equipItem: function(itemKind, isAvatar) {
        if(itemKind) {
            log.debug(this.name + " equips " + Types.getKindAsString(itemKind));

            if(Types.isArmor(itemKind)) {
                if(isAvatar) {
                    databaseHandler.equipAvatar(this.name, Types.getKindAsString(itemKind));
                    this.equipAvatar(itemKind);
                } else {
                    databaseHandler.equipAvatar(this.name, Types.getKindAsString(itemKind));
                    this.equipAvatar(itemKind);

                    databaseHandler.equipArmor(this.name, Types.getKindAsString(itemKind));
                    this.equipArmor(itemKind);
                }
                this.updateHitPoints();
                this.send(new Messages.HitPoints(this.maxHitPoints).serialize());
            } else if(Types.isWeapon(itemKind)) {
                databaseHandler.equipWeapon(this.name, Types.getKindAsString(itemKind));
                this.equipWeapon(itemKind);
            } else if(Types.isShield(itemKind)) {
                databaseHandler.equipShield(this.name, Types.getKindAsString(itemKind));
                this.equipShield(itemKind);
            } else if(Types.isAmulet(itemKind)) {
                databaseHandler.equipAmulet(this.name, Types.getKindAsString(itemKind));
                this.equipAmulet(itemKind);
            } else if(Types.isRing(itemKind)) {
                databaseHandler.equipRing(this.name, Types.getKindAsString(itemKind));
                this.equipRing(itemKind);
            }
        }
    },

    updateHitPoints: function() {
        this.resetHitPoints(Formulas.hp(this.level)); 
    },
    
    updateManaPoints: function() {
        this.resetManaPoints(Formulas.mp(this.level));
    },

    updatePosition: function() {
        if(this.requestpos_callback) {
            var pos = this.requestpos_callback();
            this.setPosition(pos.x, pos.y);
        }
    },

    onRequestPosition: function(callback) {
        this.requestpos_callback = callback;
    },

    resetTimeout: function() {
        clearTimeout(this.disconnectTimeout);
        var duration = 1000 * 60 * 15; // 15 min
        // if adam
        if (this.pid == '53e40c45145932145a0084be') {
            duration = 1000 * 60 * 60 * 24; // 1 day
        }
        this.disconnectTimeout = setTimeout(this.timeout.bind(this), duration); 
    },

    timeout: function() {
        this.connection.sendUTF8("timeout");
        this.connection.close("Player was idle for too long");
    },

    incExp: function(gotexp){
        var updatedExp = Math.round(gotexp * this.friendsBonus);
    	var newExp = parseInt(this.experience) + (parseInt(updatedExp));
        this.experience = newExp;
    	databaseHandler.setExp(this);
        var origLevel = this.level;
        this.level = Types.getLevel(this.experience);
        if(origLevel !== this.level) {
            this.updateHitPoints();
            this.updateManaPoints();
            this.send(new Messages.HitPoints(this.maxHitPoints).serialize());
            this.send(new Messages.ManaPoints(this.maxManaPoints).serialize());
        }
    },
    
    incArenaWins: function(loserLevel){
    	if(this.arenaPvp) {
    		var wincost = Types.getWinRevard(this.level, loserLevel);
    		log.info('incArenaWins add '+wincost+" crystals");
    		databaseHandler.addremortCrystals(this, wincost);
    		databaseHandler.addWinCrystals(this, wincost);
    		
    		this.pushArenaWinCrystals(this.winCrystals, loserLevel);
    		this.pushStat(Types.PushStats.CRYSTALS, this.remortCrystals);
    	} else {
    		log.info('incArenaWins arenaPvp '+this.arenaPvp);
    	}
    },

    setGuildId: function(id) {
        if(typeof this.server.guilds[id] !== "undefined") {
            this.guildId = id;
        }
        else {
            log.error(this.id + " cannot add guild " + id + ", it does not exist");
        }
    },

    getGuild: function() {
        return this.hasGuild ? this.server.guilds[this.guildId] : undefined;
    },

    hasGuild: function() {
        return (typeof this.guildId !== "undefined");
    },

    leaveGuild: function() {
        if(this.hasGuild()){
            var leftGuild = this.getGuild();
            leftGuild.removeMember(this);
            this.server.pushToGuild(leftGuild, new Messages.Guild(Types.Messages.GUILDACTION.LEAVE, [this.name, this.id, leftGuild.name]));
            delete this.guildId;
            this.server.pushToPlayer(this, new Messages.Guild(Types.Messages.GUILDACTION.LEAVE, [this.name, this.id, leftGuild.name]));
        }
        else {
            this.server.pushToPlayer(this, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.NOLEAVE,""));
        }
    },

    checkName: function(name) {
        if(name === null) return false;
        else if(name === '') return false;
        else if(name === ' ') return false;

        for(var i=0; i < name.length; i++) {
            var c = name.charCodeAt(i);

            if(!((0xAC00 <= c && c <= 0xD7A3) || (0x3131 <= c && c <= 0x318E)       // Korean (Unicode blocks "Hangul Syllables" and "Hangul Compatibility Jamo")
                || (0x61 <= c && c <= 0x7A) || (0x41 <= c && c <= 0x5A)             // English (lowercase and uppercase)
                || (0x30 <= c && c <= 0x39)                                         // Numbers
                || (c == 0x20) || (c == 0x5f)                                       // Space and underscore
                || (c == 0x28) || (c == 0x29)                                       // Parentheses
                || (c == 0x5e))) {                                                  // Caret
                return false;
            }
        }
        return true;
    },
		
    sendWelcome: function(p) {
        var self = this;
        self.changeWorld(p.map); // breaking change - was "mapName" in redis ver now "map" in mongo. redis ver won't work anymore

        p.avatar = p.armor;
        p.weaponAvatar = p.weapon;

		self.map = p.map;
        self.kind = Types.Entities.WARRIOR;
        self.admin = p.admin || null;
        self.gender = p.gender;
        self.crystalsPerWeek = p.crystalsPerWeek || 0;
        self.crystalsPerRemorte = p.crystalsPerRemorte || 0;
        self.spendCrystals = p.spendCrystals || 0;

        for(index in Types.waypoints)
            self.waypoints[index] = p.waypoints[index] ? p.waypoints[index] : false;

        self.equipArmor(Types.getKindFromString(p.armor));
        self.equipAvatar(Types.getKindFromString(p.avatar));
        self.equipWeapon(Types.getKindFromString(p.weapon));
		self.equipShield(Types.getKindFromString(p.shield));
		self.equipAmulet(Types.getKindFromString(p.amulet));
		self.equipRing(Types.getKindFromString(p.ring));

        self.inventory = {
            potions:    p.inventory.potions,
            keys:       p.inventory.keys,
            items:       p.inventory.items
        };

        databaseHandler.loadCollections(function(result) {
            self.collections = result;

            var items = self.inventory.items;
            for (var index = 0; index < items.length, item = items[index]; index++) {
                for (var iCol = 0; iCol < self.collections.length, collection = self.collections[iCol]; iCol++) {
                    var itemNumber = _.indexOf(collection.items, item[0]);
                    if (itemNumber >= 0)
                        collection.items.splice(itemNumber, 1);
                }
            }
        });

        // TODO update achievements with new format
        /*
        self.achievement[1] = {found: achievementFound[0], progress: achievementProgress[0]};
        self.achievement[2] = {found: achievementFound[1], progress: achievementProgress[1]};
        */
        self.bannedTime = p.bannedTime;
        self.banUseTime = p.banUseTime;
        self.experience = p.exp;
		self.pvpKills = p.kills;
        self.level = Types.getLevel(self.experience);
        self.orientation = Utils.randomOrientation();
        self.updateHitPoints();
        self.updateManaPoints();
        self.gold = p.currencyGold;
        self.cash = p.currencyCash;
        self.remorts = p.remorts;
        self.remortexp = p.remortexp;
        self.spells = p.spells;
        self.remortCrystals = p.remortCrystals;
        if (p.x == undefined || p.y == undefined)
        {
            p.x = 0;
            p.y = 0;
        }
        if(p.x === 0 && p.y === 0) {
			// starting position :)
			// maybe move to mongo default
            self.updatePosition();
        } else {
            self.setPosition(p.x, p.y);
        }
        self.chatBanEndTime = p.chatBanEndTime;

        self.server.addPlayer(self);
        self.server.enter_callback(self);

		// TODO send json object instead of array
        self.send([
            Types.Messages.WELCOME, self.id, self.name, self.x, self.y,
            self.hitPoints, self.manaPoints, p.armor, p.weapon, p.shield, p.amulet, p.ring, p.avatar, p.weaponAvatar,
            self.experience, p.local, p.kills, p.map, p.currencyGold, p.currencyCash, p.remorts, p.remortexp, p.remortCrystals,
			p.keys, p.gender, self.waypoints
        ]);

        self.hasEnteredGame = true;
        self.isDead = false;
        self.sendInventory();
        self.sendSpells();

        // self.server.addPlayer(self, aGuildId);
    },
    
    // general purpose single stat server to client update
	pushStat: function(pushstat, value){
        var self = this;
        self.send([Types.Messages.SERVER_CLIENT_STAT_PUSH, pushstat, value]);
    },
    
    pushArenaSpendStat: function(pushstat, value) {
    	var self = this;
        self.send([Types.Messages.ARENAPURCHASE, value]);
	},
	
	pushArenaWinCrystals: function(winCrystals, loserLevel){
		var self = this;
        self.send([Types.Messages.ARENAWIN, winCrystals, loserLevel]);
	},
	
	pushArenaExit: function() {
		var self = this;
        self.send([Types.Messages.ARENAEXIT]);
	},

	sendProfile: function(name, armor, weapon, exp, shield, amulet, ring, hp, mhp, mp, mmp, pid, crystalls, remortExp){
        var self = this;
        var friendMainName = self.friends[pid].ni;
        var friendAccAvatar = self.friends[pid].t;
        self.send([
            Types.Messages.PROFILE, name, armor, weapon, exp, shield, amulet, ring, hp, mhp, mp, mmp, pid, crystalls, remortExp, friendMainName, friendAccAvatar
        ]);
    },
	
	updateFriends: function(){
		var self = this;
        var friendsNum = 0;
		for (var pid in self.friends) {
			var p = self.friends[pid];
			if(p.o){ // online
				friendsNum++;
			}
		}
		self.friendsBonus = Types.getXPBonus(friendsNum);
		
		var friendsStr = JSON.stringify(self.friends);
        self.send([Types.Messages.UPDATEFRIENDS, friendsStr]);
    },
	
	sendDetail: function(id, level, hp, mhp){
        var self = this;
        self.send([
            Types.Messages.DETAIL, id, level, hp, mhp
        ]);
    },
	
	sendKills: function(){
        var self = this;
        self.send([
            Types.Messages.PVPKILL, self.pvpKills
        ]);
    },
    
    sendSpendCryctals: function(){
    	var self = this;
        self.send([
            Types.Messages.ARENAPURCHASE, self.spendCrystals
        ]);
    },
    
    sendWinCrystals: function(){
    	var self = this;
        self.send([
            Types.Messages.ARENAWIN, self.winCrystals
        ]);
    },
    
    sendLeaveArena: function(){
    	var self = this;
        self.send([
            Types.Messages.ARENAEXIT
        ]);
    },
	
	sendLeaderboards: function(leaderboards){
        this.send([Types.Messages.LEADERBOARDS, leaderboards]);
    },

	sendServerStatistic: function() {
        var statistic        = {};
        statistic.players    = this.server.statistic.getOnlinePlayersData();
        statistic.guestCount = this.server.statistic.getGuestCount();
        statistic.friends    = this.friends;
        this.send([Types.Messages.PLAYERS_STAT_REQUEST, statistic]);
    },
        
    sendInventory: function(){
        var self = this;
        // send full inventory data
        log.info("sendInventory");
        self.send([
            Types.Messages.UPDATE_INVENTORY, self.inventory
        ]);
    },

    sendSpells: function(){
        var self = this;
        // send full inventory data
        log.info("sendSpells");
        self.send([
            Types.Messages.SPELLS, self.spells
        ]);
    },
    
    inventoryContains: function(itemType, quantity) {
        var self = this;

        if (Types.Entities.KEY == itemType) {
            var keys = self.inventory.keys;

            for (var i = 0; i < keys.length, key = keys[i]; i++) {
                if(key == itemType)
                    return true
            }
        }

        if(Types.isPotion(itemType) || Types.isBombPotion(itemType)) {
            var POTIONS = {ID: 0, QUANTITY: 1};

            var potions = self.inventory.potions;

            for (var i = 0; i < potions.length, potion = potions[i]; i++) {
                if(potion[POTIONS.ID] == itemType && potion[POTIONS.QUANTITY] >= quantity)
                    return true
            }
        }

        return false;
    },

    addKey: function(keyId) {
        var keys = this.inventory.keys;
        var index = keys.indexOf(keyId);
        if(index == -1) {
            keys.push(keyId);
            databaseHandler.saveInventory(this.name, this.inventory);
        }
        this.sendInventory();
    },

    addToInventory: function(kind) {

        var self = this;

        var isUnUnique = function(arrayItems){
            for (var index = 0; index < arrayItems.length; index++) {
                if((arrayItems[index][0] == kind))
                    return arrayItems[index];
            }
            return false;
        };

        /*if (Types.Entities.KEY == kind) {
            var keys = self.inventory.keys;
            var index = keys.indexOf(kind);
            if(index == -1)
                keys.push(kind);
        }*/

        if (Types.isCollectionItem(kind)) {
            var items = self.inventory.items;
            if (!isUnUnique(items))
                items.push([kind, 1]);

            self.tryUnlockCollection(kind);
        }

        if (Types.isPotion(kind) || Types.isBombPotion(kind)) {
            var potions = self.inventory.potions;
            if(item = isUnUnique(potions))
                ++item[1];
            else
                potions.push([kind, 1]);
        }

        if(Types.isSpell(kind)) {

            if(!isUnUnique(self.spells)) {
                self.spells.push([kind, 1]);
                databaseHandler.saveSpells(this.name, kind);
                self.sendSpells();
            }
        }
        else
            databaseHandler.saveInventory(self.name, self.inventory);
        self.sendInventory();
    },


    tryUnlockCollection: function(item) {
        for(var index = 0; index < this.collections.length, collection = this.collections[index]; index++) {
            if(collection.items.length == 0)
                continue;
            var itemIndex = _.indexOf(collection.items, item);
            if (itemIndex >= 0)
                collection.items.splice(itemIndex, 1);

            if(collection.items.length <= 0)
                this.sendDebugMsg("You unlock "+collection.name+" collection!");
        }
    },
    
    deductFromInventory: function(itemType,quantity) {
        var self = this;
        var result = false;

        if(Types.isPotion(itemType) || Types.isBombPotion(itemType)) {
            var POTIONS = {ID: 0, QUANTITY: 1};

            var potions = self.inventory.potions;

            for (var i = 0; i < potions.length, potion = potions[i]; i++) {
                if(potion[POTIONS.ID] == itemType && potion[POTIONS.QUANTITY] >= quantity) {
                    potion[POTIONS.QUANTITY] -= quantity;
                    result = true;
                }
            }
        }

        if(result === true)
            databaseHandler.saveInventory(this.name, this.inventory);
        return result;
    },

    isInCollection: function(itemKind, inventoryCategorie) {
        /*var ITEM = {ID: 0, QUANTITY: 1};
        for(var i = 0; i < inventoryCategorie.length, item = inventoryCategorie[i]; i++)
            if(item[ITEM.ID] == itemKind)
                return i;
        return false;*/
    },
	
	sendReload: function(username){
        var self = this;
        self.send([Types.Messages.RELOAD], username);
    },
    
    changeWorld: function(worldName) {
        log.info("changeWorld: " + this.name+ " - " + worldName + '['+this.id+']');

        for (var w=0;w<this.worlds.length;w++){
            if (this.worlds[w].id === worldName){
                this.worldIndex = w;
                // gracefully leave old world (if any)
                this.server.handlePlayerVanish(this);
                if (this.exit_callback) this.exit_callback();
                // set to new world
                this.server = this.worlds[this.worldIndex];
                // reset hasEnteredGame flag so new world population counter updates on entry
                this.hasEnteredGame = false;
                break;
            }
        }
    },

    sendDebugMsg: function(msg){
        log.info("DEBUG GO HOME");
        this.send([Types.Messages.DEBUG_MSG, msg]);
    }
});
