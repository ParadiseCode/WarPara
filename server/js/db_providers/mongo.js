var cls = require("../lib/class");
var mongoose = require("mongoose");
var mongodb = require("mongodb");
var Utils = require('../utils');
var Player = require('../player');
var Messages = require("../message");
var bcrypt = require("bcrypt");
var _ = require("underscore");
var async = require("async");
    
mongoose.plugin(function (schema) {
    schema.options.safe = {
        w: 1
    };
    schema.options.strict = true;
});

var playerMap = {
    name: String,
    email: String,
    pw: String,
    pid: String,
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    armor: String,
    weapon: String,
    shield: String,
    amulet: String,
    ring: String,
    gender: { type: String, default: "M" },
    waypoints: { type: Array, default: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true] },
    exp: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
    loginTime: { type: Number, default: 0 },
    inventory: {
        potions: [],
        keys:    [],
        items:   []
    },
    spells: [],
    map: {type: String, default: 'centralarea'},
    gold: { type: Number, default: 0 },
    cash: { type: Number, default: 0 },
    remorts: { type: Number, default: 0 },
    remortexp: { type: Number, default: 0 },
    local: {},
    kills: { type: Number, default: 0 },
    winCrystals: { type: Number, default: 0 },
    spendCrystals: { type: Number, default: 0 },
    remortCrystals: { type: Number, default: 0 },
    crystalsPerWeek: { type: Number, default: 0 },
    crystalsPerRemorte: { type: Number, default: 0 },
    expPerRemort: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    achievements: {},
	keys: {}
};

var mobMap = {
	name: String,
	kind: Number,
	health: Number,
	damage: Number,
	shield: Number,
	sprite: String,
	width: Number,
	height: Number,
	level: Number,
	roamspeed: { type: Number, default: 20},
	regenrate: { type: Number, default: 0},
	attackspeed: { type: Number, default: 50},
	movespeed: { type: Number, default: 150},
	walkspeed: { type: Number, default: 100},
	idlespeed: { type: Number, default: 50},
	attackrate: { type: Number, default: 800},
	agrorange: { type: Number, default: 3},
	drops: {},
	followers: Number
};

var keyMap = {
	id: { type: Number, unique : true, required : true, dropDups: true },
	name: String,
	world: String,
	type: String,
	desc: String
};

var achieveList = {
	id: { type: Number, unique : true, required : true, dropDups: true },
    conditionCount: Number,
    event: String,
	eventObject: String
};

var collections = {
    name: String,
    items: []
};

module.exports = DatabaseHandler = cls.Class.extend({
    init: function(config){
        this.leaderData = null;
        mongoose.connect('mongodb://'+config.mongo_host+':'+config.mongo_port+'/'+config.mongo_db);

        var collections = ["players", "mobs", "keylist"];
        mongodb.MongoClient.connect('mongodb://'+config.mongo_host+':'+config.mongo_port+'/'+config.mongo_db, function(error, db) {
            if(error) {
               log.info("connection failed: " + error);
                return;
            }

            var jobs = [];
        
            // creating collections
            collections.forEach(function(collection) {
                jobs.push(function() {
                    db.createCollection(collection, {}, next);
                });
            });
            // indexes
            jobs.push(function() {
                db.collection("players").createIndex(["name", 1], next); 
            });
            jobs.push(function() {
                db.collection("players").createIndex(["pid", 1], next); 
            });
            jobs.push(function() {
                db.collection("players").createIndex(["kills", 1], next); 
            });
            jobs.push(function() {
                db.collection("players").createIndex(["totalexp", 1], next); 
            });
			jobs.push(function() {
                db.collection("mobs").createIndex(["name", 1], next); 
            });
			jobs.push(function() {
                db.collection("mobs").createIndex(["id", 1], next); 
            });
			/*
			This one already defined implicitly by keyMap above
			jobs.push(function() {
                db.collection("keylist").createIndex(["id", 1],{unique:true,background:true}, next); 
            });
			*/
			jobs.push(function() {
                db.collection("keylist").createIndex(["world", 1], next); 
            });

            function next(error) {
                if(error) {
                    console.log(error);
                }
            
                if(!jobs.length) {
                    module.exports.ready = true;
                    db.close();
                } else {
                    jobs.shift()();
                }
            }
            next();
        });
        this.updateLeaderBoardDate();
    },

    Player: mongoose.model("Player", new mongoose.Schema(playerMap, { collection: "players" })),
	Mob: mongoose.model("Mob", new mongoose.Schema(mobMap, { collection: "mobs" })),
    Achieves: mongoose.model("Achieves", new mongoose.Schema(achieveList, { collection: "achieveList" })),
	Key: mongoose.model("Key", new mongoose.Schema(keyMap, {collection: "keylist" })),
    Collection: mongoose.model("Collection", new mongoose.Schema(collections, {collection: "collections" })),

    loadPlayer: function(player) {
        var self = this;
        var curTime = new Date().getTime();
        this.Player.findOne({name: player.name}).exec(function(error, p) {
            if(error || !p){
                // Could not find the user
                log.error(error);
                player.connection.sendUTF8("invalidlogin");
                player.connection.close("db error, user does not exist: " + player.name);
                return;
            }
            // Check Password
            bcrypt.compare(player.pw, p.pw, function(err, res) {
                if(err){
                    log.error(err);
                }
                if(!res) {
                    player.connection.sendUTF8("invalidlogin");
                    player.connection.close("Wrong Password: " + player.name+' '+player.pw);
                    return;
                }
            });
            // TODO this needs to be redone
            // Check Ban
            var d = new Date();
            var lastLoginTimeDate = new Date(p.lastLoginTime);
            d.setDate(d.getDate() - d.getDay());
            d.setHours(0, 0, 0);
            if(p.lastLoginTime < d.getTime()){
                log.info(player.name + "ban is initialized.");
                bannedTime = 0;
                //client.hset("b:" + player.connection._connection.remoteAddress, "time", bannedTime);
            }
            var admin = null;

            p.armor = p.armor.slice(0,-1) + p.gender;
            log.info("Player name: " + p.name);
            log.info("Armor: " + p.armor);
            log.info("Weapon: " + p.weapon);
            log.info("Shield: " + p.shield);
            log.info("Amulet: " + p.amulet);
            log.info("Ring: " + p.ring);
            log.info("potions: " + JSON.stringify(p.inventory.potions));
            log.info("Experience: " + p.exp);
			
			// legacy stuff, not sure
			p.avatar = p.armor;
			p.weaponAvatar = p.weapon;

            player.sendWelcome(p);
            return;
        });
    },

    loadMobs: function(calback){
        console.log("Load mobs!");
        this.Mob.find().sort({id:1}).exec(function(error, result) {
            if(error || !result){
                console.log(error);
                return;
            }
            MobList.loadMobs(JSON.stringify(result));
            if(calback)
                calback(result);

            var fs = require('fs');

            fs.writeFile(__dirname + "/../../../shared/Mobs.json", JSON.stringify(result), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The Mobs.json was saved!");
            });
            //MobList.loadMobs(JSON.stringify(result));
            return result;
        });
    },

    loadCollections: function(calback) {
        console.log("Load collections!");
        this.Collection.find().lean().exec(function(error, result) {
            if(error || !result){
                console.log(error);
                return;
            }

            if(calback)
                calback(result);
        });
    },

    createPlayer: function(player, remort) {
        var curTime = new Date().getTime();
        
        remort = remort || false;
        var self = this;

        // Check if username is taken
        this.Player.findOne({name: player.name}).exec(function(error, p) {
            if(p) {
                player.connection.sendUTF8("userexists");
                player.connection.close("Username not available: " + player.name);
                return;
            } else {
				
				if(player.gender==="M")
				{
					var ArmorPlayer = "Armor_00M";
				}
				else
				{
					var ArmorPlayer = "Armor_00F";
				}
                var newPlayer = {
                    name: player.name,
                    pw: player.pw,
                    email: player.email,
                    armor: ArmorPlayer,
                    weapon: "Sword_00",
                    shield: "Shield_00",
                    map: "centralarea",
                    amulet: "Amulet_00",
                    ring: "Ring_00",
                    exp: 0,
                    kills: 0,
                    gender: player.gender,
                    inventory: player.inventory,
                    waypoints: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
                    loginTime: curTime,
                    pid: player.pid
                }

                return new self.Player(newPlayer).save(function(error) {
                    if(error){
                        log.error(error);
                    }
                    log.info("New User: " + player.name + ' pid: '+player.pid);
                    if(!remort){
                        player.sendWelcome({
                            name: player.name,
                            pw: player.pw,
                            email: player.email,
                            armor: ArmorPlayer,
                            weapon: "Sword_00",
                            shield: "Shield_00",
                            amulet: "Amulet_00",
                            map: "centralarea",
                            ring: "Ring_00",
                            exp: 0,
                            kills: 0,
                            gender: player.gender,
                            inventory: {
                                potions:    [[42,10],[481,10],[482,10],[483,10],[484,10],[485,10],[486,10],[487,10],[488,10],[489,10],[490,10],[491,10],[492,10]],
                                keys:       [],
                                items:      []
                            },
                            waypoints: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
                            loginTime: curTime,
                            pid: player.pid
                        });
                    }
                });
            }
        });
    },

    deleteCharacter: function(username, pid) {
        this.Player.remove({name: username, pid: pid}).exec(function(error) {
            if(error){
                log.info('Invalid delete attempt of '+username+' by '+pid);
            }else{
                log.info('deleteCharacter:'+username+','+pid);
            }
        });
    },
    
    // multichar - when we change character persist "current active"
    setActiveUsernameForPid: function(pid,username) {
        // not sure what this is for - Eddie
        //client.hset("id:" + pid, "username", username);
    },
    
	convertPlayer: function(player, guestName, username, hash, email, pid) {
        var oldUserKey = "u:" + guestName;
		var newUserKey = "u:" + username;
        var curTime = new Date().getTime();

        // Check if username is taken
        this.Player.findOne({name: username}).exec(function(error, p) {
            if(p){
                player.connection.sendUTF8("userexists");
                return;
            }else{               
                this.Player.update({name: guestName}, {name: username, pw: hash, email: email, pid: pid}, { upsert: false, multi: false }, function(error, p) {
                    if(error){
                        log.error('failed to convert guest '+error);
                    }else{
                        log.info("Convert User: " + username + ' pid: '+pid);
                    }
                });
            }
        });
    },
	
    // character username from idnet pid
	usernameFromId: function(pid, callback){
        this.Player.findOne({pid: pid}).exec(function(error, p) {
            if(p){
                callback(p);
            }
        });
	},
	
	// character username from idnet pid
	usernameFromIdSpecial: function(pid, friend, callback){
        this.Player.find({pid: pid}).lean().exec(function(error, p) {
            if(p){
                callback(p, pid, friend);
            }
        });
	},
    
    // list of character usernames for idnet pid
	getCharacters: function(pid, listcallback){
        log.info('getCharacters:'+pid);
        this.Player.find({pid: pid}).exec(function(error, players) {
            if(!players){
                listcallback(characterList);
                return;
            }
            var characterList = [];
            var usernames = [];
            for(var i = 0; i < players.length; i++){
                usernames.push(players[i].name);
                var charinfo = {
                    'username': players[i].name,
                    'armor': players[i].armor,
                    'weapon': players[i].weapon,
                    'shield': players[i].shield,
                    'amulet': players[i].amulet,
                    'ring': players[i].ring,
                    'level': players[i].level,
                    'map': players[i].map
                };
                charinfo.armor = charinfo.armor.slice(0,-1) + players[i].gender;
                characterList.push(charinfo);
            }
            log.info('usernames:'+JSON.stringify(usernames));
            listcallback(characterList);  
        });
	},
	
    // TODO remove this, use delete character or something better
	deleteGuest: function(name){
        this.Player.remove({name: name}).exec(function(error) {
            log.info("guest deleted "+name);
        });
	},
	
	saveLocal: function(name, data){
        this.Player.update({name: name}, {local: data}, { upsert: false, multi: false }).exec();
	},
	
	// get an offline player's profile (not used)
	getProfile: function (player, name){
        var self = this;
        var userKey = "u:" + name;
        client.smembers("usr", function(err, replies){
            for(var index = 0; index < replies.length; index++){
                if(replies[index].toString() === player.name){
                    client.multi()
                        .hget(userKey, "armor") // 0
                        .hget(userKey, "weapon") // 1
                        .hget(userKey, "exp") // 2
                        .hget(userKey, "shield") // 3
                        .hget(userKey, "amulet") // 4
                        .hget(userKey, "ring") // 5
						.exec(function(err, replies){
                            var armor = replies[0];
                            var weapon = replies[1];
                            var exp = Utils.NaN2Zero(replies[2]);
                            var shield = replies[3];
                            var amulet = replies[4];
                            var ring = replies[5];
							player.sendProfile(name, armor, weapon, exp, shield, amulet, ring);
						});
				}
			}
		});
	},
	
	addKill: function(player) {
		player.pvpKills += 1;
        this.Player.update( {name: player.name}, { $inc: {kills: 1} }, { upsert: false }).exec();
		player.sendKills();
	},
	
	addWinCrystals: function(player, amount) {
		log.info("addWinCrystals: " + player.name + " " + amount);
        player.winCrystals += amount;
        var profit = (player.winCrystals / player.spendCrystals * 100) - 100;
        this.Player.update( {name: player.name}, {winCrystals: player.winCrystals, profit: profit.toFixed(2)}, { upsert: false }).exec();
	},
	
	addSpendCrystals: function(player, amount) {
		log.info("addSpendCrystals: " + player.name + " " + amount);
        player.spendCrystals += amount;
        var profit = (player.winCrystals / player.spendCrystals * 100) - 100;
        this.Player.update( {name: player.name}, {spendCrystal: player.spendCrystals, profit: profit.toFixed(2)}, { upsert: false }).exec();
	},

    addremortCrystals: function(player, amount) {
        var self = this;
		log.info("remortCrystals: " + player.name + " " + amount);

        this.Player.findOne({name: player.name}).exec(function(error, p) {
            player.remortCrystals    += amount;
            var weekFromRegister      = Math.ceil(p._id.getTimestamp().getDay() / 7);
            player.crystalsPerWeek    = Math.ceil(player.remortCrystals / weekFromRegister);
            player.crystalsPerRemorte = player.remorts !== 0 ? Math.ceil(player.remortCrystals / player.remorts) : player.remortCrystals;

            self.Player.update( {name: player.name}, {
                remortCrystals: player.remortCrystals,
                crystalsPerWeek: player.crystalsPerWeek,
                crystalsPerRemorte: player.crystalsPerRemorte
            }, { upsert: false }).exec();
        });
	},
	
    // get pvp leaders
    getLeaderboards: function(callback){
        var self = this;
        var result = {};
        var queryParams = {
            0: {
                _id: true,
                name: true,
                level: true,
                remorts: true,
                remortCrystals: true,
                crystalsPerWeek: true,
                crystalsPerRemorte: true
            },
            1: {
                _id: true,
                name: true,
                level: true,
                remorts: true,
                winCrystals: true,
                spendCrystals: true,
                profit: true
            },
            2: {
                _id: true,
                name: true,
                level: true,
                remorts: true,
                exp: true,
                remortexp: true,
                expPerRemort: true
            }
        };

        var sortConditions = ['remortCrystals', 'crystalsPerWeek', 'crystalsPerRemorte',
                              'winCrystals', 'spendCrystals', 'profit', 'exp', 'remortexp', 'expPerRemort'];

        sortConditions.forEach(function(name, index) {
            var sortQuery = {};
            sortQuery[name] = -1;
            self.Player.find({}, queryParams[Math.floor(index / 3)])
                       .sort(sortQuery)
                       .limit(1000)
                       .lean()
                       .exec(function(error, response) {
            if(error)
                log.info(error);
            response.forEach(function(item, index) {
                item.date = item._id.getTimestamp();
            });
                var data = JSON.stringify(response);

                updateResult(data, name);
            });
        });
        updateResult = function(data, name) {
            result[name] = data;
            if (_.size(result) == sortConditions.length) {
                callback(result);
            }
        };
    },

    updateLeaderBoardDate: function() {
        var self = this;

        this.getLeaderboards(function(result) {
            self.leaderData = result;
        });

        setInterval(function() {self.updateLeaderBoardDate()}, 60 * 60 * 1000);
    },
	
	// be very careful about running this. make sure the maps are set correct in the redis call
	resetAllPositions: function(){
        /*
        TODO convert to mongo
        var self = this;
		async.waterfall([
			function(callback){
				client.smembers("usr", function(err, replies){
					for(var i = 0; i < replies.length; i++){
						var name = replies[i].toString();
						if(name.charAt(0) != "_" && name.charAt(1) != "_"){
							callback(err, name);
						}
					}
				});
			},
			function(name){
				client.hset("u:" + name, "x", 103);
				client.hset("u:" + name, "y", 90);
				client.hset("u:" + name, "map", 'world');
			}
		], function (err) {
			if(err){log.info(err);}
			log.info('reset all player positions');
		});
    */
	},  
	
	deleteAllGuests: function(){
        this.Player.remove({name:/^_/}).exec();
	},

    equipArmor: function(name, armor){
        log.info("Set Armor: " + name + " " + armor);
        this.Player.update({name: name}, {armor: armor}, { upsert: false, multi: false }).exec();
    },
    equipAvatar: function(name, armor){
        log.info("Set Avatar: " + name + " " + armor);
        this.Player.update({name: name}, {avatar: armor}, { upsert: false, multi: false }).exec();
    },
    equipWeapon: function(name, weapon){
        log.info("Set Weapon: " + name + " " + weapon);
        this.Player.update({name: name}, {weapon: weapon}, { upsert: false, multi: false }).exec();
    },//, shield, amulet, ring,
    equipShield: function(name, shield){
        log.info("Set Shield: " + name + " " + shield);
        this.Player.update({name: name}, {shield: shield}, { upsert: false, multi: false }).exec();
    },
    equipAmulet: function(name, amulet){
        log.info("Set Amulet: " + name + " " + amulet);
        this.Player.update({name: name}, {amulet: amulet}, { upsert: false, multi: false }).exec();
    },
    equipRing: function(name, ring){
        log.info("Set Ring: " + name + " " + ring);
        this.Player.update({name: name}, {ring: ring}, { upsert: false, multi: false }).exec();
    },
    remort: function(player,newPlayer,hash){
        log.info("Remort: " + player.name);
        /*
        TODO convert to mongo
        // fields to keep
        var remorts = player.remorts+1;
        var remortExp = player.remortExp + player.experience;
        var remortPoints = player.remortPoints;
        
        // work out new name (add star prefix if not present)
        var newName = player.name;
        if (newName.charAt(0) != "★") {
            newName = "★" + player.name;
            // delete old account
            client.del("u:"+player.name, function(err, reply){
                log.info(player.name+" old deleted");
            });
            client.srem("chars:"+player.pid, player.name);
            client.srem("usr", player.name);
            client.zrem('kills', player.name);
            client.zrem('totalexp', player.name);
            client.zrem('exp', player.name);
            client.zrem('remortexp', player.name);
            client.zrem('remortpoints', player.name);
            client.zrem('winCrystals', player.name);
        }
                
        // delete account with new name if any
        client.del("u:"+newName, function(err, reply){
            log.info(newName+" deleted");
        });
        client.srem("usr", newName);
        client.zrem('kills', newName);
        client.zrem('totalexp', newName);
        client.zrem('exp', newName);
        client.zrem('remortexp', newName);
        client.zrem('remortpoints', newName);
        client.zrem('winCrystals', newName);
                
        // create fresh account
        newPlayer.name = newName;
        newPlayer.email = player.email;
        newPlayer.pw = hash;
        newPlayer.pid = player.pid;
        
        this.createPlayer(newPlayer,true);
        
        // apply preserved fields
        newPlayer.remorts = remorts;
        newPlayer.remortExp = remortExp;
        newPlayer.remortPoints = remortPoints;
        
        client.hset("u:" + newPlayer.name, "remorts", newPlayer.remorts);
        client.hset("u:" + newPlayer.name, "remortexp", newPlayer.remortExp);
        client.hset("u:" + newPlayer.name, "remortpoints", newPlayer.remortPoints);
        
        client.zadd('remortexp', remortExp, newName);
        client.zadd('remortpoints', remortPoints, newName);
        
        // set "current" to new name
        client.hset("id:" + player.pid, "username", newName);
        
        return newName; // for reload msg
        */
        
    },
    addRemortPoints: function(player, amount){
        log.info("addRemortPoints (crystals): " + player.name + " " + amount);
        player.remortCrystals += amount;
        this.Player.update( {name: player.name}, { $inc: {remortCrystals: amount} }, { upsert: false }).exec();
    },
    setExp: function(player){
        log.info("Set Exp: " + player.name + " " + player.experience);
        var expPerRemort = player.remorts !== 0 ? Math.round(player.experience / player.remorts) : player.experience;
		this.Player.update( {name: player.name}, { exp: player.experience, expPerRemort: expPerRemort}, { upsert: false }).exec();
    },
    saveInventory: function(name, inventory){

        var inventoryData = {
            potions: inventory.potions,
            keys:    inventory.keys,
            items:   inventory.items
        };

        this.Player.update( {name: name}, { inventory: inventoryData }).exec();
        log.info("saveInventory: " + name + " " + JSON.stringify(inventory));
    },

    saveSpells: function(name, kind){
        this.Player.update( {name: name}, {$addToSet: {spells:[kind, 1]}}).exec();
    },

    saveWaypoints: function(name, waypoints){
        this.Player.update( {name: name}, { waypoints: waypoints }).exec();
    },
    saveGold: function(name, gold){
        log.info("Set Gold: " + name + " " + gold);
        this.Player.update( {name: name}, { gold: gold }, { upsert: false }).exec();
    },
    saveCash: function(name, cash){
        log.info("Set Cash: " + name + " " + cash);
        this.Player.update( {name: name}, { cash: cash }, { upsert: false }).exec();
    },    
    saveMap: function(name, mapName, x, y){
        this.Player.update( {name: name}, { map:mapName, x:x, y:y }, { upsert: false }).exec();
        log.info("saveMap: " + name + " " + mapName);        
    },    
    foundAchievement: function(name, number){
        log.info("Found Achievement: " + name + " " + number);
        //client.hset("u:" + name, "achievement" + number + ":found", "true");
    },
    progressAchievement: function(name, number, progress){
        log.info("Progress Achievement: " + name + " " + number + " " + progress);
        //client.hset("u:" + name, "achievement" + number + ":progress", progress);
    },
    setUsedPubPts: function(name, usedPubPts){
        log.info("Set Used Pub Points: " + name + " " + usedPubPts);
        //client.hset("u:" + name, "usedPubPts", usedPubPts);
    },
    setCheckpoint: function(name, x, y){
        log.info("Set Check Point: " + name + " " + x + " " + y);
        this.Player.update( {name: name}, { x:x, y:y }, { upsert: false }).exec();
    }
});
