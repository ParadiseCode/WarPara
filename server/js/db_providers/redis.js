var Utils = require('../utils');

var cls = require("../lib/class"),
    Player = require('../player'),
    Messages = require("../message"),
    redis = require("redis"),
    bcrypt = require("bcrypt"),
	_ = require("underscore"),
	async = require("async");

module.exports = DatabaseHandler = cls.Class.extend({
    init: function(config){
        client = redis.createClient(config.redis_port, config.redis_host, {socket_nodelay: true});
        client.auth(config.redis_password || "");
		client.select(config.dbnum);
    },
    loadPlayer: function(player){
        var self = this;
        var userKey = "u:" + player.name;
        var curTime = new Date().getTime();
        client.smembers("usr", function(err, replies){
            for(var index = 0; index < replies.length; index++){
                if(replies[index].toString() === player.name){
                    client.multi()
                        .hget(userKey, "pw") // 0
                        .hget(userKey, "armor") // 1
                        .hget(userKey, "weapon") // 2
                        .hget(userKey, "exp") // 3
                        .hget("b:" + player.connection._connection.remoteAddress, "time") // 4
                        .hget("b:" + player.connection._connection.remoteAddress, "banUseTime") // 5
                        .hget("b:" + player.connection._connection.remoteAddress, "loginTime") // 6
                        .hget(userKey, "inventory") // 7

                        .hget(userKey, "map") //8
                        .hget(userKey, "gold") //9                        
                        .hget(userKey, "cash") // 10
                        .hget(userKey, "remorts") // 11
                        .hget(userKey, "remortexp") // 12
                        .hget(userKey, "remortpoints") // 13
                        
                        .hget(userKey, "achievement1:found") // 14
                        .hget(userKey, "achievement1:progress") // 15
                        .hget(userKey, "achievement2:found") // 16
                        .hget(userKey, "achievement2:progress") // 17
                        .hget(userKey, "achievement3:found") // 18
                        .hget(userKey, "achievement3:progress") // 19
                        .hget(userKey, "achievement4:found") // 20
                        .hget(userKey, "achievement4:progress") // 21
                        .hget(userKey, "achievement5:found") // 22
                        .hget(userKey, "achievement5:progress") // 23
                        .hget(userKey, "achievement6:found") // 24
                        .hget(userKey, "achievement6:progress") // 25

                        .hget(userKey, "spare7") //26
                        .hget(userKey, "spare8") //27
                        .hget(userKey, "spare9") // 28
                        
                        .hget(userKey, "x") // 29
                        .hget(userKey, "y") // 30
                        .hget(userKey, "achievement7:found") // 31
                        .hget(userKey, "achievement7:progress") // 32
                        .hget(userKey, "achievement8:found") // 33
                        .hget(userKey, "achievement8:progress") // 34
                        .hget("cb:" + player.connection._connection.remoteAddress, "etime") // 35
                        
                        .hget(userKey, "spare10") // 36
                        .hget(userKey, "spare11") // 37
                        .hget(userKey, "spare12") // 38
                        .hget(userKey, "spare13") // 39
						.hget(userKey, "local") // 40
						.hget(userKey, "kills") // 41
						
						.hget(userKey, "winCrystals") // 42
						.hget(userKey, "spendCrystals") // 43
                        
                        .exec(function(err, replies){
                            var pw = replies[0];
                            var armor = replies[1];
                            var weapon = replies[2];
                            var exp = Utils.NaN2Zero(replies[3]);
                            var bannedTime = Utils.NaN2Zero(replies[4]);
                            var banUseTime = Utils.NaN2Zero(replies[5]);
                            var lastLoginTime = Utils.NaN2Zero(replies[6]);

                            var inventoryData = JSON.parse(replies[7]);
                            if (inventoryData === null){
                                inventoryData = { kinds:[], quantities:[] }
                            }
                            var inventory = inventoryData.kinds;
                            var inventoryNumber = inventoryData.quantities;
                            
                            var mapName = replies[8];
                            var currencyGold = Utils.NaN2Zero(replies[9]);
                            var currencyCash = Utils.NaN2Zero(replies[10]);
                            
                            var remortCount = Utils.NaN2Zero(replies[11]);
                            var remortExp = Utils.NaN2Zero(replies[12]);
                            var remortPoints = Utils.NaN2Zero(replies[13]);
                            
                            var achievementFound = [
                              Utils.trueFalse(replies[14]),
                              Utils.trueFalse(replies[16]),
                              Utils.trueFalse(replies[18]),
                              Utils.trueFalse(replies[20]),
                              Utils.trueFalse(replies[22]),
                              Utils.trueFalse(replies[24]),
                              Utils.trueFalse(replies[31]),
                              Utils.trueFalse(replies[33]),
                            ];
                            var achievementProgress = [
                              Utils.NaN2Zero(replies[15]),
                              Utils.NaN2Zero(replies[17]),
                              Utils.NaN2Zero(replies[19]),
                              Utils.NaN2Zero(replies[21]),
                              Utils.NaN2Zero(replies[23]),
                              Utils.NaN2Zero(replies[25]),
                              Utils.NaN2Zero(replies[32]),
                              Utils.NaN2Zero(replies[34]),
                            ];

                            var x = Utils.NaN2Zero(replies[29]);
                            var y = Utils.NaN2Zero(replies[30]);
                            var chatBanEndTime = Utils.NaN2Zero(replies[35]);
							var local = replies[40];
							var kills = parseInt(replies[41] || 0);

                            // Check Password

                            bcrypt.compare(player.pw, pw, function(err, res) {
                                if(!res) {
                                    player.connection.sendUTF8("invalidlogin");
                                    player.connection.close("Wrong Password: " + player.name+' '+player.pw);
                                    return;
                                }

                                // Check Ban
                                var d = new Date();
                                var lastLoginTimeDate = new Date(lastLoginTime);
                                d.setDate(d.getDate() - d.getDay());
                                d.setHours(0, 0, 0);
                                if(lastLoginTime < d.getTime()){
                                    log.info(player.name + "ban is initialized.");
                                    bannedTime = 0;
                                    client.hset("b:" + player.connection._connection.remoteAddress, "time", bannedTime);
                                }
                                client.hset("b:" + player.connection._connection.remoteAddress, "loginTime", curTime);



                                var admin = null;
                                var avatar = armor;
                                var weaponAvatar = weapon;

                                log.info("Player name: " + player.name);
                                log.info("Armor: " + armor);
                                log.info("Weapon: " + weapon);
                                log.info("Experience: " + exp);
                                log.info("Banned Time: " + (new Date(bannedTime)).toString());
                                log.info("Ban Use Time: " + (new Date(banUseTime)).toString());
                                log.info("Last Login Time: " + lastLoginTimeDate.toString());
                                log.info("Chatting Ban End Time: " + (new Date(chatBanEndTime)).toString());

                                player.sendWelcome(armor, weapon,
                                    avatar, weaponAvatar, exp, admin,
                                    bannedTime, banUseTime,
                                    inventory, inventoryNumber,
                                    achievementFound, achievementProgress,
                                    x, y, chatBanEndTime, local, kills, mapName, currencyGold, currencyCash,
                                    remortCount,remortExp,remortPoints);
                            });
                    });
                    return;
                }
            }

            // Could not find the user
            player.connection.sendUTF8("invalidlogin");
            player.connection.close("User does not exist: " + player.name);
            return;
        });
    },

    createPlayer: function(player, remort) {
        var userKey = "u:" + player.name;
        var curTime = new Date().getTime();
        
        remort = remort || false;

        // Check if username is taken
        client.sismember('usr', player.name, function(err, reply) {
            if(reply === 1) {
                player.connection.sendUTF8("userexists");
                player.connection.close("Username not available: " + player.name);
                return;
            } else {
                // Add the player
                client.multi()
                    .sadd("usr", player.name)
                    .hset(userKey, "pw", player.pw)
                    .hset(userKey, "email", player.email)
                    .hset(userKey, "armor", "clotharmor")
                    .hset(userKey, "weapon", "weapon0")
                    .hset(userKey, "exp", 0)
					.hset(userKey, "kills", 0)
                    .hset("b:" + player.connection._connection.remoteAddress, "loginTime", curTime)
                    .exec(function(err, replies){
                        log.info("New User: " + player.name + ' pid: '+player.pid);
                        if (!remort) {
                            player.sendWelcome(
                                "clotharmor", "weapon0", "clotharmor", "weapon0", 0,
                                 null, 0, 0,
                                 [null, null], [0, 0],
                                 [false, false, false, false, false, false],
                                 [0, 0, 0, 0, 0, 0],
                                 player.x, player.y, 0, 0, 0);
                        }
                    });
				
                // add username from old id:<pid> username to chars:<pid> set
                // because otherwise that account will become 'orphaned'
                // when we overwrite id:<pid> username                
                client.hget("id:" + player.pid, "username", function (err, reply) {
                    if (reply) {
                        log.info('Preserved username '+reply+' for pid '+player.pid);
                        client.sadd("chars:" + player.pid, reply);
                    }
                    
                    client.hset("id:" + player.pid, "username", player.name);
                    client.sadd("chars:" + player.pid, player.name);
                });
                

            }
        });
    },

    deleteCharacter: function(username,pid) {
        log.info('deleteCharacter:'+username+','+pid);
        
        //verify pid
        var found = false;
        client.smembers("chars:" + pid, function(err, replies){
            for(var i = 0; i < replies.length; i++){
                if (username == replies[i]) {
                    found = true;
                    break;
                }
            }
            // old way
            client.hget("id:" + pid, "username", function (err2, reply) {
                if (reply == username) {
                    found = true;
                }                               
                
                if (!found) {
                    log.info('Invalid delete attempt of '+username+' by '+pid);
                    return;
                }
                
                client.del("u:"+username, function(err, reply){
                    log.info(username+" deleted");
                });
                client.srem("chars:" + pid, username);
                client.srem("usr", username);
                client.zrem('kills', username);
                client.zrem('totalexp', username);
                client.zrem('exp', username);
                client.zrem('remortexp', username);
                client.zrem('remortpoints', username);
                client.zrem('winCrystals', username);
            });
        });
    },
    
    // multichar - when we change character persist "current active"
    setActiveUsernameForPid: function(pid,username) {
        client.hset("id:" + pid, "username", username);
    },
    
	convertPlayer: function(player, guestName, username, hash, email, pid) {
        var oldUserKey = "u:" + guestName;
		var newUserKey = "u:" + username;
        var curTime = new Date().getTime();

        // Check if username is taken
        client.sismember('usr', username, function(err, reply) {
            if(reply === 1) {
                player.connection.sendUTF8("userexists");
                return;
            } else {
                // copy guest to user
				// rename user keys
				// replace hash, email
				// add pid name
                client.multi()
					.sadd("usr", username)
                    .sunionstore(username, guestName)
                    .rename(oldUserKey, newUserKey)
					.hset(newUserKey, "pw", hash)
                    .hset(newUserKey, "email", email)
					.hset("b:" + player.connection._connection.remoteAddress, "loginTime", curTime)
                    .exec(function(err, replies){
						player.sendReload(username);
                        log.info("Convert User: " + username + ' pid: '+pid);
                    });
					
				client.hset("id:" + pid, "username", username);
                client.sadd("chars:" + pid, username);
            }
        });
    },
	
    // character username from idnet pid
	usernameFromId: function(pid, callback){
		client.hget("id:" + pid, "username", function (err, reply) {
			callback(reply);
		});
	},
	
	// character username from idnet pid
	usernameFromIdSpecial: function(pid, friend, callback){
		client.hget("id:" + pid, "username", function (err, reply) {
			if(reply){
				callback(reply, pid, friend);
			}
		});
	},
    
    // list of character usernames for idnet pid
	getCharacters: function(pid, listcallback){
        log.info('getCharacters:'+pid);
        var characterList = [];
        var usernames = [];
        // multichar way
        client.smembers("chars:" + pid, function(err, replies){
            for(var i = 0; i < replies.length; i++){
                usernames.push(replies[i]);
            }            
            // old way
            client.hget("id:" + pid, "username", function (err2, reply) {
                if (reply) {
                    usernames.push(reply);
                }
            });
            
            usernames = _.uniq(usernames,false);
            
            log.info('usernames:'+JSON.stringify(usernames));
            
            // empty list scenario
            if (usernames.length == 0) {
                listcallback(characterList);
                return;
            }
                                
            async.waterfall([
                function(callback){
                    _.each(usernames,function(name) {
                        log.info('1:'+name);
                        callback(null, name);
                    });
                },
                function(name,callback){
                    //log.info('2:'+name);
                    var userKey = "u:" + name;
                    client.multi()
                        .hget(userKey, "exp") // 0
                        .hget(userKey, "armor") // 1
                        .hget(userKey, "weapon") // 2
                        .hget(userKey, "map") // 3
                        .exec(function(err, replies){
                            var exp = Utils.NaN2Zero(replies[0]);
                            var level = Types.getLevel(exp);
                            var armor = Types.getKindFromString(replies[1]) || Types.Entities.ARMOR0;
                            var weapon = Types.getKindFromString(replies[2]) || Types.Entities.WEAPON0;
                            var map = replies[3] || 'world';
                                
                            var charinfo = {
                                'username': name,
                                'armor': armor,
                                'weapon':weapon,
                                'level': level,
                                'map': map
                            };
                            
                            //log.info('charinfo:'+JSON.stringify(charinfo));
                            characterList.push(charinfo);
                            callback(null,'');
                        });
                }
            ], function (err) {
                
                if(err){                    
                    log.info(err);                
                } else {
                    //log.info('characterList:'+JSON.stringify(characterList));                            
                    listcallback(characterList);                
                }
                
            });                
                                                          
        });

	},
	
	deleteGuest: function(name){
		var userKey = "u:" + name;
		client.del(userKey, function(err, reply){
			log.info("guest deleted "+name);
		});
	},
	
	saveLocal: function(name, data){
		client.hset("u:" + name, "local", data);
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
						.exec(function(err, replies){
                            var armor = replies[0];
                            var weapon = replies[1];
                            var exp = Utils.NaN2Zero(replies[2]);
							player.sendProfile(name, armor, weapon, exp);
						});
				}
			}
		});
	},
	
	addKill: function(player) {
		var self = this;
        var userKey = "u:" + player.name;
		player.pvpKills += 1;
		client.hset(userKey, "kills", player.pvpKills);
		if(player.name.charAt(0) != "_" && player.name.charAt(1) != "_"){
			client.zadd('kills', player.pvpKills, player.name);
		}
		player.sendKills();
	},
	
	addWinCrystals: function(player, amount) {
		log.info("addWinCrystals: " + player.name + " " + amount);
        player.winCrystals += amount;
        client.hset("u:" + player.name, "winCrystals", player.winCrystals);
        client.zadd('winCrystals', player.winCrystals, player.name);
	},
	
	addSpendCrystals: function(player, amount) {
		log.info("addSpendCrystals: " + player.name + " " + amount);
        player.spendCrystals += amount;
        client.hset("u:" + player.name, "spendCrystals", player.spendCrystals);
	},
	
	// get pvp leaders
	getLeaderboards: function(player){
        var self = this;
		
		async.waterfall([
			function(callback){ // get pvp leaders
				client.zrevrange('kills', 0, 29, 'withscores', function(err, replies) {
					if(err){log.info(err);}
					var pvpleaders = [];
					var lists=_.groupBy(replies, function(a,b) {
						return Math.floor(b/2);
					});
					pvpleaders = _.toArray(lists);
					callback(err, pvpleaders);
				});
			},
			function(pvpleaders, callback){ // get exp leaders totals
				var expleaders = [];
				client.zrevrange('totalexp', 0, 29, 'withscores', function(err, replies) {
					if(err){log.info(err);}
					var lists=_.groupBy(replies, function(a,b) {
						return Math.floor(b/2);
					});
					expleaders = _.toArray(lists);
					var lastRecord = false;
					for(var i = 0; i < expleaders.length; i++){
						if(i == expleaders.length - 1){
							lastRecord = true;
						}
						callback(err, pvpleaders, expleaders, i, lastRecord);
					}
				});
			},
			function(pvpleaders, expleaders, i, lastRecord, callback){ // get exp leaders extra details
				client.multi()
                    .hget("u:"+expleaders[i][0], "exp") // 0
                    .hget("u:"+expleaders[i][0], "remortexp") // 1
					.exec(function(err, replies){
						if(err){log.info(err);}
                        var exp = Utils.NaN2Zero(replies[0]);
                        var remortexp = Utils.NaN2Zero(replies[1]);
						expleaders[i].push(exp);
						expleaders[i].push(remortexp);
						if(lastRecord){
							callback(err, pvpleaders, expleaders);
						}
					});
			},
			function(pvpleaders, expleaders, callback){ // get player pvp position
				client.zcount('kills', player.pvpKills, '+inf', function(err, replies) {
					if(err){log.info(err);}
					var pvpPlayer = [player.name, player.pvpKills, replies];
					callback(err, pvpleaders, expleaders, pvpPlayer);
				});
			},
			function(pvpleaders, expleaders, pvpPlayer, callback){ // get player totalexp position
				client.zcount('totalexp', player.experience + player.remortExp, '+inf', function(err, replies) {
					if(err){log.info(err);}
					var totalExpPlayer = [player.name, player.experience + player.remortExp, player.experience, player.remortExp, replies];
					callback(err, pvpleaders, expleaders, pvpPlayer, totalExpPlayer);
				});
			},//
			function(pvpleaders, expleaders, pvpPlayer, totalExpPlayer, callback){ // get player legendexp position
				client.zcount('remortexp', player.remortExp, '+inf', function(err, replies) {
					if(err){log.info(err);}
					var legendExpPlayer = [player.name, player.remortExp, replies];
					callback(err, pvpleaders, expleaders, pvpPlayer, totalExpPlayer, legendExpPlayer);
				});
			},
			function(pvpleaders, expleaders, pvpPlayer, totalExpPlayer, legendExpPlayer, callback){ // get player exp position
				client.zcount('exp', player.experience, '+inf', function(err, replies) {
					if(err){log.info(err);}
					var expPlayer = [player.name, player.experience, replies];
					callback(err, pvpleaders, expleaders, pvpPlayer, totalExpPlayer, legendExpPlayer, expPlayer);
				});
			},
			function(pvpleaders, expleaders, pvpPlayer, totalExpPlayer, legendExpPlayer, expPlayer, callback){ // get player crystal position
				client.zcount('remortpoints', player.remortPoints, '+inf', function(err, replies) {
					if(err){log.info(err);}
					var crystalPlayer = [player.name, player.remortPoints, replies];
					callback(err, pvpleaders, expleaders, pvpPlayer, totalExpPlayer, legendExpPlayer, expPlayer, crystalPlayer);
				});
			},
			function(pvpleaders, expleaders, pvpPlayer, totalExpPlayer, legendExpPlayer, expPlayer, crystalPlayer, callback){ // get player WinCrystal position
				client.zcount('winCrystals', player.arenaCrystalWin, '+inf', function(err, replies) {
					if(err){log.info(err);}
					var winCrystalPlayer = [player.name, player.arenaCrystalWin, replies];
					callback(err, pvpleaders, expleaders, pvpPlayer, totalExpPlayer, legendExpPlayer, expPlayer, crystalPlayer, winCrystalPlayer);
				});
			}
		], function (err, pvpleaders, expleaders, PvpPlayer, TotalExpPlayer, LegendExpPlayer, ExpPlayer, CrystalPlayer, WinCrystalPlayer) {
			if(err){log.info(err);}
			var leaderboards = JSON.stringify({pvp: pvpleaders, exp: expleaders, pvpPlayer: PvpPlayer, totalExpPlayer: TotalExpPlayer, legendExpPlayer: LegendExpPlayer, expPlayer: ExpPlayer, crysralPlayer: CrystalPlayer, winCrystalPlayer: WinCrystalPlayer});
			log.info(leaderboards);
			player.sendLeaderboards(leaderboards);
		});
	},
	
	// be very careful about running this. make sure the maps are set correct in the redis call
	resetAllPositions: function(){
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
	},
    
    // for every remort user delete pre-remort usr and related score entries 
	cleanUp: function(){
        var self = this;
		async.waterfall([
			function(callback){
				client.smembers("usr", function(err, replies){
					for(var i = 0; i < replies.length; i++){
						var name = replies[i].toString();
						if(name.charAt(0) == "★"){
							callback(err, name);
						}
					}
				});
			},
			function(name){
                var preRemortName = name.substring(1);
                client.zrank("totalexp", preRemortName, function(err, reply){
                    if (reply != null) {
                        log.info('purging PREREMORT totalexp/kills entry user: ' + preRemortName);
                        client.zrem('kills', preRemortName);
                        client.zrem('totalexp', preRemortName);
                        client.zrem('exp', preRemortName);
                        client.zrem('remortexp', preRemortName);
                        client.zrem('remortpoints', preRemortName);
                        client.zrem('winCrystals', preRemortName);
                    }
				});
			}
		], function (err) {
			if(err){log.info(err);}
			log.info('ran cleanup');
		});
	},    
	
	deleteAllGuests: function(){
        var self = this;
		async.waterfall([
			function(callback){
				client.smembers("usr", function(err, replies){
					for(var i = 0; i < replies.length; i++){
						var name = replies[i].toString();
						if(name.charAt(0) == "_" && name.charAt(1) == "_"){
							callback(err, name);
						}
					}
				});
			},
			function(name){
				client.del("u:"+name, function(err, reply){
					log.info('DELETING '+name);
				});
				client.srem("usr",name);
			}
		], function (err) {
			if(err){log.info(err);}
			log.info('deleted all guests');
		});
	},
	// remove this after all scores are filled in live version
	moveLeaderboards: function(){
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
				var userKey = "u:" + name;
				client.multi()
                    .hget(userKey, "kills") // 0
                    .hget(userKey, "remortexp") // 1
                    .hget(userKey, "exp") // 2
                    .hget(userKey, "remortpoints") // 3
                    .hget(userKey, "winCrystals") // 4
					.exec(function(err, replies){
                        var kills = Utils.NaN2Zero(replies[0]);
                        var remortpoints = Utils.NaN2Zero(replies[3]);
                        var winCrystals = Utils.NaN2Zero(replies[4]);
                        var exp = Utils.NaN2Zero(replies[2]);
						var remortexp = Utils.NaN2Zero(replies[1]);
                        var totalExp = remortexp + exp;
						client.zadd('kills', kills, name);
						client.zadd('exp', exp, name);
						client.zadd('remortexp', remortexp, name);
						client.zadd('totalexp', totalExp, name);
						client.zadd('remortpoints', remortpoints, name);
						client.zadd('winCrystals', winCrystals, name);
				});
			}
		], function (err) {
			if(err){log.info(err);}
			log.info('filled scores list');
		});
	},

    checkBan: function(player){
        client.smembers("ipban", function(err, replies){
            for(var index = 0; index < replies.length; index++){
                if(replies[index].toString() === player.connection._connection.remoteAddress){
                    client.multi()
                        .hget("b:" + player.connection._connection.remoteAddress, "rtime")
                        .hget("b:" + player.connection._connection.remoteAddress, "time")
                        .exec(function(err, replies){
                             var curTime = new Date();
                             var banEndTime = new Date(replies[0]*1);
                             log.info("curTime: " + curTime.toString());
                             log.info("banEndTime: " + banEndTime.toString());
                             if(banEndTime.getTime() > curTime.getTime()){
                                 player.connection.sendUTF8("ban");
                                 player.connection.close("IP Banned player: " + player.name + " " + player.connection._connection.remoteAddress);
                             }
                        });
                    return;
                }
            }
        });
    },
    banPlayer: function(adminPlayer, banPlayer, days){
        client.smembers("adminname", function(err, replies){
            for(var index = 0; index < replies.length; index++){
                if(replies[index].toString() === adminPlayer.name){
                    var curTime = (new Date()).getTime();
                    client.sadd("ipban", banPlayer.connection._connection.remoteAddress);
                    adminPlayer.server.pushBroadcast(new Messages.Chat(banPlayer, "/1 " + adminPlayer.name + "-- 밴 ->" + banPlayer.name + " " + days + "일"));
                    setTimeout( function(){ banPlayer.connection.close("Added IP Banned player: " + banPlayer.name + " " + banPlayer.connection._connection.remoteAddress); }, 30000);
                    client.hset("b:" + banPlayer.connection._connection.remoteAddress, "rtime", (curTime+(days*24*60*60*1000)).toString());
                    log.info(adminPlayer.name + "-- BAN ->" + banPlayer.name + " to " + (new Date(curTime+(days*24*60*60*1000)).toString()));
                    return;
                }
            }
        });
    },
    chatBan: function(adminPlayer, targetPlayer) {
        client.smembers("adminname", function(err, replies){
            for(var index = 0; index < replies.length; index++){
                if(replies[index].toString() === adminPlayer.name){
                    var curTime = (new Date()).getTime();
                    adminPlayer.server.pushBroadcast(new Messages.Chat(targetPlayer, "/1 " + adminPlayer.name + "-- 채금 ->" + targetPlayer.name + " 10분"));
                    targetPlayer.chatBanEndTime = curTime + (10*60*1000);
                    client.hset("cb:" + targetPlayer.connection._connection.remoteAddress, "etime", (targetPlayer.chatBanEndTime).toString());
                    log.info(adminPlayer.name + "-- Chatting BAN ->" + targetPlayer.name + " to " + (new Date(targetPlayer.chatBanEndTime).toString()));
                    return;
                }
            }
        });
    },
    newBanPlayer: function(adminPlayer, banPlayer){
        log.debug("1");
        if(adminPlayer.experience > 100000){
            log.debug("2");
            client.hget("b:" + adminPlayer.connection._connection.remoteAddress, "banUseTime", function(err, reply){
                log.debug("3");
                var curTime = new Date();
                log.debug("curTime: " + curTime.getTime());
                log.debug("bannable Time: " + (reply*1) + 1000*60*60*24);
                if(curTime.getTime() > (reply*1) + 1000*60*60*24){
                    log.debug("4");
                    banPlayer.bannedTime++;
                    var banMsg = "" + adminPlayer.name + "-- 밴 ->" + banPlayer.name + " " + banPlayer.bannedTime + "번째 " + (Math.pow(2,(banPlayer.bannedTime))/2) + "분";
                    client.sadd("ipban", banPlayer.connection._connection.remoteAddress);
                    client.hset("b:" + banPlayer.connection._connection.remoteAddress, "rtime", (curTime.getTime()+(Math.pow(2,(banPlayer.bannedTime))*500*60)).toString());
                    client.hset("b:" + banPlayer.connection._connection.remoteAddress, "time", banPlayer.bannedTime.toString());
                    client.hset("b:" + adminPlayer.connection._connection.remoteAddress, "banUseTime", curTime.getTime().toString());
                    setTimeout( function(){ banPlayer.connection.close("Added IP Banned player: " + banPlayer.name + " " + banPlayer.connection._connection.remoteAddress); }, 30000);
                    adminPlayer.server.pushBroadcast(new Messages.Chat(banPlayer, "/1 " + banMsg));
                    log.info(banMsg);
                }
                return;
            });
        }
    },
    banTerm: function(time){
        return Math.pow(2, time)*500*60;
    },
    equipArmor: function(name, armor){
        log.info("Set Armor: " + name + " " + armor);
        client.hset("u:" + name, "armor", armor);
    },
    equipAvatar: function(name, armor){
        log.info("Set Avatar: " + name + " " + armor);
        client.hset("u:" + name, "avatar", armor);
    },
    equipWeapon: function(name, weapon){
        log.info("Set Weapon: " + name + " " + weapon);
        client.hset("u:" + name, "weapon", weapon);
    },
    remort: function(player,newPlayer,hash){
        log.info("Remort: " + player.name);
        
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
        
    },
    addRemortPoints: function(player, amount){
        log.info("addRemortPoints: " + player.name + " " + amount);
        player.remortPoints += amount;
        client.hset("u:" + player.name, "remortpoints", player.remortPoints);
        client.zadd('remortpoints', player.remortPoints, player.name);
    },
    setExp: function(player){
        log.info("Set Exp: " + player.name + " " + player.experience);
        client.hset("u:" + player.name, "exp", player.experience);
		if(player.name.charAt(0) != "_" && player.name.charAt(1) != "_"){
			client.zadd('totalexp', player.experience + player.remortExp, player.name);
			client.zadd('exp', player.experience, player.name);
		}
    },
    saveInventory: function(name, kinds, quantities){
        var inventoryData = {   kinds:kinds,
                                quantities:quantities   };
        client.hset("u:" + name, "inventory", JSON.stringify(inventoryData));
        log.info("saveInventory: " + name + " " + JSON.stringify(inventoryData));        
    },
    saveGold: function(name, gold){
        log.info("Set Gold: " + name + " " + gold);
        client.hset("u:" + name, "gold", gold);
    },
    saveCash: function(name, cash){
        log.info("Set Cash: " + name + " " + cash);
        client.hset("u:" + name, "cash", cash);
    },    
    saveMap: function(name,mapName,x,y){
        client.hset("u:" + name, "map", mapName);
        client.hset("u:" + name, "x", x);
        client.hset("u:" + name, "y", y);
        log.info("saveMap: " + name + " " + mapName);        
    },    
    foundAchievement: function(name, number){
        log.info("Found Achievement: " + name + " " + number);
        client.hset("u:" + name, "achievement" + number + ":found", "true");
    },
    progressAchievement: function(name, number, progress){
        log.info("Progress Achievement: " + name + " " + number + " " + progress);
        client.hset("u:" + name, "achievement" + number + ":progress", progress);
    },
    setUsedPubPts: function(name, usedPubPts){
        log.info("Set Used Pub Points: " + name + " " + usedPubPts);
        client.hset("u:" + name, "usedPubPts", usedPubPts);
    },
    setCheckpoint: function(name, x, y){
        log.info("Set Check Point: " + name + " " + x + " " + y);
        client.hset("u:" + name, "x", x);
        client.hset("u:" + name, "y", y);
    }
});
