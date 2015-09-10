
define(['player', 'entityfactory', 'lib/bison'], function(Player, EntityFactory, BISON) {

	var GameClient = Class.extend({
		init: function(host, port) {
			this.connection = null;
			this.host = host;
			this.port = port;
			
			this.debugMessages = false;

			this.connected_callback = null;
			this.spawn_callback = null;
			this.movement_callback = null;

			this.fail_callback = null;

			this.notify_callback = null;
			
			this.lastDetail = (new Date).getTime();

			this.handlers = [];
			this.handlers[Types.Messages.WELCOME] = this.receiveWelcome;
			this.handlers[Types.Messages.UPDATE_INVENTORY] = this.receiveUpdateInventory;
			this.handlers[Types.Messages.SPELLS] = this.receiveSpells;
			this.handlers[Types.Messages.MOVE] = this.receiveMove;
			this.handlers[Types.Messages.LOOTMOVE] = this.receiveLootMove;
			this.handlers[Types.Messages.ATTACK] = this.receiveAttack;
			this.handlers[Types.Messages.RANGED_TARGET_CHANGED] = this.receiveRangedTargetChanged;
			this.handlers[Types.Messages.PROJECT] = this.receiveProject;
			this.handlers[Types.Messages.PROJECT_WITH_ENTITIES] = this.receiveProjectWithEntities;
			this.handlers[Types.Messages.SPAWN] = this.receiveSpawn;
			this.handlers[Types.Messages.DESPAWN] = this.receiveDespawn;
			this.handlers[Types.Messages.SPAWN_BATCH] = this.receiveSpawnBatch;
			this.handlers[Types.Messages.HEALTH] = this.receiveHealth;
            this.handlers[Types.Messages.MANA] = this.receiveMana;
			this.handlers[Types.Messages.CHAT] = this.receiveChat;
			this.handlers[Types.Messages.DEBUG_MSG] = this.receiveDebug;
			this.handlers[Types.Messages.EQUIP] = this.receiveEquipItem;
			this.handlers[Types.Messages.DROP] = this.receiveDrop;
			this.handlers[Types.Messages.TELEPORT] = this.receiveTeleport;
			this.handlers[Types.Messages.DAMAGE] = this.receiveDamage;
			this.handlers[Types.Messages.POPULATION] = this.receivePopulation;
			this.handlers[Types.Messages.LIST] = this.receiveList;
			this.handlers[Types.Messages.DESTROY] = this.receiveDestroy;
			this.handlers[Types.Messages.KILL] = this.receiveKill;
			this.handlers[Types.Messages.HP] = this.receiveHitPoints;
            this.handlers[Types.Messages.MP] = this.receiveManaPoints;
			this.handlers[Types.Messages.BLINK] = this.receiveBlink;
			this.handlers[Types.Messages.GUILDERROR] = this.receiveGuildError;
			this.handlers[Types.Messages.GUILD] = this.receiveGuild;
			this.handlers[Types.Messages.PVP] = this.receivePVP;
			this.handlers[Types.Messages.SWITCHCHANGE] = this.receiveSwitch;
			this.handlers[Types.Messages.RELOAD] = this.receiveReload;
			this.handlers[Types.Messages.PROFILE] = this.receiveProfile;
			this.handlers[Types.Messages.WAYPOINTS_UPDATE] = this.receiveWaypointsUpdate;
			this.handlers[Types.Messages.UPDATEFRIENDS] = this.updateFriends;
			this.handlers[Types.Messages.DETAIL] = this.receiveDetail;
			this.handlers[Types.Messages.EXP] = this.receiveExp;
			this.handlers[Types.Messages.PVPKILL] = this.receivePVPKill;
			this.handlers[Types.Messages.PVPLEADER] = this.receivePVPLeader;
			this.handlers[Types.Messages.LEADERBOARDS] = this.receiveLeaderboards;
			this.handlers[Types.Messages.PLAYERS_STAT_REQUEST] = this.receivePlayersOnline;
            this.handlers[Types.Messages.MAPCHANGE] = this.receiveMapChange;
			this.handlers[Types.Messages.ADMINMSG] = this.receiveAdminMessage;
			this.handlers[Types.Messages.PRIVATEMESSAGE] = this.receivePrivateMessage;
			this.handlers[Types.Messages.GETCHECKOUT] = this.receiveGetCheckout;
            this.handlers[Types.Messages.SERVER_CLIENT_STAT_PUSH] = this.receiveStat;
            this.handlers[Types.Messages.CHARACTERS] = this.receiveCharacters;
            this.handlers[Types.Messages.ARENAWIN] = this.receiveArenaWin;
            this.handlers[Types.Messages.ARENAPURCHASE] = this.receiveArenaSpend;
            this.handlers[Types.Messages.ARENAEXIT] = this.receiveArenaExit;
            this.handlers[Types.Messages.BUFF_ENABLE] = this.receiveBuffEnable;
            this.handlers[Types.Messages.BUFF_DISABLE] = this.receiveBuffDisable;
            this.handlers[Types.Messages.DISPLACE] = this.receiveDisplace;
			this.handlers[Types.Messages.SPEED] = this.receiveSpeed;
			this.handlers[Types.Messages.SPEEDPOTION] = this.receiveSpeedPotion;
			this.useBison = false;
			this.enable();
		},

		enable: function() {
			this.isListening = true;
		},

		disable: function() {
			this.isListening = false;
		},

		connect: function(dispatcherMode) {
			var url = "ws://"+ this.host +":"+ this.port +"/",
				self = this;

			log.info("Trying to connect to server : "+url);

            this.connection = io(url, {forceNew: true, reconnection: false}); // This sets the connection as a socket.io Socket.

			if(dispatcherMode) {
				this.connection.on('message', function(e) {
					var reply = JSON.parse(e.data);

					if(reply.status === 'OK') {
						self.dispatched_callback(reply.host, reply.port);
					} else if(reply.status === 'FULL') {
						alert("The game is currently at maximum player population. Please retry later.");
					} else {
						alert("Unknown error while connecting to server.");
					}
				});
			} else {
				this.connection.on('connection', function() {
					log.info("Connected to server "+self.host+":"+self.port);
				});

				this.connection.on('message', function(e) {
					if(e === "go") {
                        if (!self.otherLocation) {
                            if(self.connected_callback) {
                                self.connected_callback();
                            }
                        }
						return;
					}
					if(e === 'timeout') {
						self.isTimeout = true;
						return;
					}                   
                    if(e === 'otherlocation'){
                        self.otherLocation = true;
                    }
					if(e === 'invalidlogin' || e === 'userexists' || e === 'invalidusername'){
						if(self.fail_callback){
							self.fail_callback(e);
						}
						return;
					}
				   self.receiveMessage(e);
				});

				this.connection.on('error', function(e) {
					log.error(e, true);
				});

				this.connection.on('disconnect', function() {
					log.debug("Connection closed");
					$('#container').addClass('error');

					if(self.disconnected_callback) {
						if(self.isTimeout) {
							self.disconnected_callback("You have been disconnected for being inactive for too long");                     
                        } else {
							self.disconnected_callback("The connection to the server has been lost");
						}
					}
				});
			}
		},

		sendMessage: function(json) {
			var data;
			if(this.connection.connected === true) {
				if(this.useBison) {
					data = BISON.encode(json);
				} else {
					data = JSON.stringify(json);
				}
				this.connection.send(data);
			}
		},

		receiveMessage: function(message) {
			var data, action;

			if(this.isListening) {
				if(this.useBison) {
					data = BISON.decode(message);
				} else {
					data = JSON.parse(message);
				}

				if(this.debugMessages){
					// this causes console lag even with not visible.
					log.debug("data: " + message);
				}

				if(data instanceof Array) {
					if(data[0] instanceof Array) {
						// Multiple actions received
						this.receiveActionBatch(data);
					} else {
						// Only one action received
						this.receiveAction(data);
						//log.error("step 2 : (" + data + ") maybe this ? ("+ data[0]+ ")");
					}
				}
			}
		},

		receiveAction: function(data) {
			var action = data[0];
			
			if(this.debugMessages){
				log.debug(Types.getMessageTypeAsString(action));
			}
			
			if(this.handlers[action] && _.isFunction(this.handlers[action])) {
				this.handlers[action].call(this, data);
			}
			else {
				log.error("Unknown action : " + action);
			}
		},

		receiveActionBatch: function(actions) {
			var self = this;

			_.each(actions, function(action) {
				self.receiveAction(action);
			});
		},

		receiveWelcome: function(data) {
			var id = data[1],
				name = data[2],
				x = data[3],
				y = data[4],
				hp = data[5],
                mp = data[6],
				armor = data[7],
				weapon = data[8],
				shield = data[9],
				amulet = data[10],
				ring = data[11],
				avatar = data[12],
				weaponAvatar = data[13],
				experience = data[14],
				local = data[15],
				kills = data[16],
                mapName = data[17],
                currencyGold = data[18],
                currencyCash = data[19],
                remortCount = data[20],
                remortExp = data[21],
                remortPoints = data[22],
                keys = data[23],
                gender = data[24],
                waypoints = data[25];

			if(this.welcome_callback) {
				this.welcome_callback(id, name, x, y, hp, mp, armor, weapon, shield, amulet, ring, avatar, weaponAvatar,
                    experience, local, kills, mapName, currencyGold, currencyCash, remortCount, remortExp, remortPoints,
                    keys, gender, waypoints);
			}
		},

        receiveUpdateInventory: function(data) {
            var inventory = data[1];

            if(this.inventory_callback) {
                this.inventory_callback(inventory);
            }
		},

		receiveSpells: function(data) {
			var spells = data[1];

			if(this.spells_callback) {
				this.spells_callback(spells);
			}
		},

		receiveMove: function(data) {
			var id = data[1],
				x = data[2],
				y = data[3];

			if(this.move_callback) {
				this.move_callback(id, x, y);
			}
		},
		
		receiveProject: function(data) {
			if(this.project_callback) {
				this.project_callback(data);
			}
		},

		receiveProjectWithEntities: function(data) {
			if(this.project_callback) {
				this.project_callback(data,true);
			}
		},		

		receiveLootMove: function(data) {
			var id = data[1],
				item = data[2];

			if(this.lootmove_callback) {
				this.lootmove_callback(id, item);
			}
		},

		receiveAttack: function(data) {
			var attacker = data[1],
				target = data[2];

			if(this.attack_callback) {
				this.attack_callback(attacker, target);
			}
		},
		
		receiveRangedTargetChanged: function(data) {
			var attacker = data[1],
				target = data[2];

			if(this.RangedTargetChanged_callback) {
				this.RangedTargetChanged_callback(attacker, target);
			}
		},		

		receiveSpawn: function(data) {
			var id = data[1],
				kind = data[2],
				x = data[3],
				y = data[4];
			log.debug("receiveSpawn id: "+id+" kind: "+kind);
            //log.info("receiveSpawn id: "+id+" kind: "+kind);

            if(MobList.isMob(kind)) {
                var Mob = EntityFactory.createEntity(kind, id, "", data);
                if(this.spawn_character_callback)
                    this.spawn_character_callback(Mob, x, y, data[8], data[9]);
                return;
            }
			
			if(Types.isItem(kind)) {
				var item = EntityFactory.createEntity(kind, id);

				if(this.spawn_item_callback) {
					this.spawn_item_callback(item, x, y);
				}
			} else if(Types.isChest(kind)) {
				var item = EntityFactory.createEntity(kind, id);

				if(this.spawn_chest_callback) {
					this.spawn_chest_callback(item, x, y);
				}
			} else if(Types.isTrap(kind)) {
				var item = EntityFactory.createEntity(kind, id);

				if(this.spawn_trap_callback) {
					this.spawn_trap_callback(item, x, y);
				}
			} else if(Types.isLever(kind) || Types.isLockedDoor(kind)) {
				// get itemConnect data for levers / locked doors
				if(typeof data[5] != 'undefined'){
					var itemConnect = data[5];
				}
				var item = EntityFactory.createEntity(kind, id);
				item.setItemConnect(itemConnect);
				
				if(this.spawn_item_callback) {
					this.spawn_item_callback(item, x, y);
				}
			}else if(Types.isLitBomb(kind)) {
				var item = EntityFactory.createEntity(kind, id);
                // expect owner player id from server
				if(typeof data[8] != 'undefined'){
					item.owner = parseInt(data[8]);
				}
				if(this.spawn_item_callback) {
					this.spawn_item_callback(item, x, y);
				}

			} else {
				var name, orientation, target, weapon, armor, level, hitPoints, maxHitPoints, pid, shield;
				hitPoints = data[5];
				maxHitPoints = data[6];
				level = data[7];
				pid = data[8];
				if(Types.isPlayer(kind)) {
					name = data[9];
					orientation = data[10];
					armor = data[11];
					weapon = data[12];
					if(data.length > 13) {
						target = data[13];
					}
                    shield = data[14];
				}
				else if(MobList.isMob(kind)) {
					orientation = data[8];
					if(data.length > 9) {
						target = data[9];
					}
				}

                log.info("createEntity: "+id+" kind: "+kind+" name: "+name);
				var character = EntityFactory.createEntity(kind, id, name);

				if(character instanceof Player) {
					character.weaponName = Types.getKindAsString(weapon);
					character.spriteName = Types.getKindAsString(armor);
					character.shieldName = Types.getKindAsString(shield);
				}
				character.hitPoints = hitPoints;
				character.maxHitPoints = maxHitPoints;
				character.level = level;
				character.pid = pid;

				if(this.spawn_character_callback) {
					this.spawn_character_callback(character, x, y, orientation, target);
				}
			}
		},

		receiveDespawn: function(data) {
			var id = data[1];

			if(this.despawn_callback) {
				this.despawn_callback(id);
			}
		},

		receiveHealth: function(data) {
			var points = data[1],
				isRegen = false;

			if(data[2]) {
				isRegen = true;
			}

			if(this.health_callback) {
				this.health_callback(points, isRegen);
			}
		},
        
        // change in current mana points
		receiveMana: function(data) {
			var points = data[1],
				isRegen = false;

			if(data[2]) {
				isRegen = true;
			}

			if(this.mana_callback) {
				this.mana_callback(points, isRegen);
			}
		},        

		receiveChat: function(data) {
			var id = data[1],
				text = data[2];

			if(this.chat_callback) {
				this.chat_callback(id, text);
			}
		},

        receiveDebug: function(data) {
			var text = data[1];

            if(this.debug_callback)
                this.debug_callback(text);

		},
        
		receiveMapChange: function(data) {
			var mapName = data[1];

			if(this.mapchange_callback) {
				this.mapchange_callback(mapName);
			}
		}, 

		receiveAdminMessage: function(data) {
			var message = data[1];

			if(this.adminMessage_callback) {
				this.adminMessage_callback(message);
			}
		},
		
		receivePrivateMessage: function(data) {
			var fromId = data[1];
			var message = data[2];
			var fromName = data[3];

			if(this.privateMessage_callback) {
				this.privateMessage_callback(fromId, message, fromName);
			}
		},
		
		receiveGetCheckout: function(data) {
			var url = data[1];

			if(this.getCheckout_callback) {
				this.getCheckout_callback(url);
			}
		}, 

		receiveEquipItem: function(data) {
			var id = data[1],
				itemKind = data[2];

			if(this.equip_callback) {
				this.equip_callback(id, itemKind);
			}
		},

		receiveDrop: function(data) {
			var mobId = data[1],
				id = data[2],
				kind = data[3],
				item = EntityFactory.createEntity(kind, id);
			
			if(item){
				item.wasDropped = true;
				item.playersInvolved = data[4];

				if(this.drop_callback) {
					this.drop_callback(item, mobId);
				}
			}
		},

		receiveTeleport: function(data) {
			var id = data[1],
				x = data[2],
				y = data[3];

			//log.debug("receiveTeleport id: "+id+" x: "+x+" y: "+y);
			
			if(this.teleport_callback) {
				this.teleport_callback(id, x, y);
			}
		},

		receiveDamage: function(data) {
			var id = data[1],
				dmg = data[2];
				hp = parseInt(data[3]),
				maxHp = parseInt(data[4]);

			if(this.dmg_callback){
				this.dmg_callback(id, dmg, hp, maxHp);
			}
		},

		receivePopulation: function(data) {
			var worldPlayers = data[1],
				totalPlayers = data[2];

			if(this.population_callback){
				this.population_callback(worldPlayers, totalPlayers);
			}
		},

		receiveKill: function(data) {
			var mobKind = data[1];
			var level = data[2];
			var exp = data[3];

			if(this.kill_callback) {
				this.kill_callback(mobKind, level, exp);
			}
		},

		receiveList: function(data) {
			data.shift();
			//log.debug("receiveList");

			if(this.list_callback) {
				this.list_callback(data);
			}
		},

		receiveDestroy: function(data) {
			var id = data[1];

			if(this.destroy_callback) {
				this.destroy_callback(id);
			}
		},
        
        // general purpose single stat value update from server
        receiveStat: function(data) {
        
            var pushStat = data[1];
            var value = data[2];
            
            if(this.receiveStat_callback) {
				this.receiveStat_callback(pushStat,value);
			}
                    
        },        

		receiveHitPoints: function(data) {
			var maxHp = data[1];

			if(this.hp_callback) {
				this.hp_callback(maxHp);
			}
		},
        
        // maximum mp msg from server
		receiveManaPoints: function(data) {
			var maxMp = data[1];

			if(this.mp_callback) {
				this.mp_callback(maxMp);
			}
		},        

		receiveBlink: function(data) {
			var id = data[1];

			if(this.blink_callback) {
				this.blink_callback(id);
			}
		},
		 receivePVP: function(data){
			var pvp = data[1];
			if(this.pvp_callback){
				this.pvp_callback(pvp);
			}
		},
		
		receiveSwitch: function(data){
			var id = data[1],
				state = data[2],
				itemConnect = data[3];
			if(this.switch_callback){
				this.switch_callback(id, state, itemConnect);
			}
		},
		
		receiveReload: function(data){
            var username = data[1];
			if(this.reload_callback){
				this.reload_callback(username);
			}
		},
		
		receiveProfile: function(data){
			var name = data[1],
				armor = Types.getKindAsString(data[2]),
				weapon = Types.getKindAsString(data[3]),
				exp = data[4],
				shield = Types.getKindAsString(data[5]),
				amulet = Types.getKindAsString(data[6]),
				ring = Types.getKindAsString(data[7]),
				hp = data[8],
				mhp = data[9],
				mp = data[10],
				mmp = data[11],
				pid = data[12],
                crystalls = data[13],
                remortExp = data[14],
                friendMainName = data[15],
                friendAccAvatar = data[16];
			if(this.profile_callback){
				this.profile_callback(name, armor, weapon, exp, shield, amulet, ring, hp, mhp, mp, mmp, pid, crystalls, remortExp, friendMainName, friendAccAvatar);
			}
		},

        receiveWaypointsUpdate: function(data){
            var id = data[1];

			if(this.wp_update_callback){
				this.wp_update_callback(id);
			}
		},

		updateFriends: function(data){
			var friends = JSON.parse(data[1]);
			if(this.updateFriends_callback){
				this.updateFriends_callback(friends);
			}
		},
		
		receiveDetail: function(data){
			var id = data[1],
				level = data[2],
				hp = data[3],
				mhp = data[4];
			if(this.detail_callback){
				this.detail_callback(id, level, hp, mhp);
			}
		},
		
		receiveExp: function(data){
			var level = data[1];
			var exp = data[2];
			if(this.exp_callback){
				this.exp_callback(level, exp);
			}
		},
		
		receivePVPKill: function(data){
			var kills = data[1];
			if(this.pvpkill_callback){
				this.pvpkill_callback(kills);
			}
		},
		
		receivePVPLeader: function(data){
			var name1 = data[1];
			var score1 = data[2];
			var name2 = data[3];
			var score2 = data[4];
			var name3 = data[5];
			var score3 = data[6];
			if(this.pvpleader_callback){
				this.pvpleader_callback(name1, score1, name2, score2, name3, score3);
			}
		},
		
		receiveLeaderboards: function(data){
            for (name in data[1]) {
                var value = data[1][name];
                data[1][name] = JSON.parse(value);
            }

			if(this.leaderboards_callback){
				this.leaderboards_callback(data[1]);
			}
		},

		receivePlayersOnline: function(data){
            //data[1].friends['77787887'] = {nickname: 'Alextraza'};
            if(this.receivePlayersStat_callback){
                this.receivePlayersStat_callback(data[1]);
            }
		},
        
		receiveCharacters: function(data){
			var characters = JSON.parse(data[1]);
			if(this.receiveCharacters_callback){
				this.receiveCharacters_callback(characters);
			}
		},        
	   
		receiveGuildError: function(data) {
			var errorType = data[1];
			var guildName = data[2];
			if(this.guilderror_callback) {
				this.guilderror_callback(errorType, guildName);
			}
		}, 

		receiveArenaWin: function(data) {
			var wins = data[1];
			var loserLevel = data[2];
			if(this.arenawin_callback) {
				this.arenawin_callback(wins, loserLevel);
			}
		},
		
		receiveArenaSpend: function(data) {
			var spend = data[1];
			if(this.arenaspend_callback) {
				this.arenaspend_callback(spend);
			}
		},
		
		receiveArenaExit: function(data){
			if(this.arenaexit_callback) {
				this.arenaexit_callback();
			}
		},
        
        receiveBuffEnable: function(data){            
            var entityid = data[1];
            var buff = data[2];
            var owner = data[3];
            if(this.buffenable_callback) {
                this.buffenable_callback(buff,entityid,owner);
            }
        },

        receiveBuffDisable: function(data){
            var buff = data[2];
            var entityid = data[1];            
            if(this.buffdisable_callback) {
                this.buffdisable_callback(buff,entityid);
            }
        },
		
		receiveSpeed: function(data)
		{
			var newSpeed = data[1];
            if(this.Speed_callback) 
			{
                this.Speed_callback(newSpeed);
				log.info("reciveSpeed callback "+newSpeed);
            }
			log.info("reciveSpeed "+newSpeed);
        },
		
		receiveSpeedPotion: function(data)
		{
			var val1 = data[1];
			var val2 = data[2];
            if(this.SpeedPotion_callback) 
			{
                this.SpeedPotion_callback(val1,val2);
				log.info("reciveSpeedPotion callback "+val1+" / "+val2);
            }
			log.info("reciveSpeedPotion "+val1+" / "+val2);
        },
        
        receiveDisplace: function(data){
            var kind = data[1];
            var entityid = data[2];
            var destx = data[3];
            var desty = data[4];
            var seconds = data[5];  
            if(this.displace_callback) {
                this.displace_callback(kind,entityid,destx,desty,seconds);
            }
        },

		receiveGuild: function(data) {
			if( (data[1] === Types.Messages.GUILDACTION.CONNECT) &&
				this.guildmemberconnect_callback ){
				this.guildmemberconnect_callback(data[2]); //member name
			}
			else if( (data[1] === Types.Messages.GUILDACTION.DISCONNECT) &&
				this.guildmemberdisconnect_callback ){
				this.guildmemberdisconnect_callback(data[2]); //member name
			}
			else if( (data[1] === Types.Messages.GUILDACTION.ONLINE) &&
				this.guildonlinemembers_callback ){
					data.splice(0,2);
				this.guildonlinemembers_callback(data); //member names
			}
			else if( (data[1] === Types.Messages.GUILDACTION.CREATE) &&
				this.guildcreate_callback){
				this.guildcreate_callback(data[2], data[3]);//id, name
			}
			else if( (data[1] === Types.Messages.GUILDACTION.INVITE) &&
				this.guildinvite_callback){
				this.guildinvite_callback(data[2], data[3], data[4]);//id, name, invitor name
			}
			else if( (data[1] === Types.Messages.GUILDACTION.POPULATION) &&
				this.guildpopulation_callback){
				this.guildpopulation_callback(data[2], data[3]);//name, count
			}
			else if( (data[1] === Types.Messages.GUILDACTION.JOIN) &&
				this.guildjoin_callback){			   
					this.guildjoin_callback(data[2], data[3], data[4], data[5]);//name, (id, (guildId, guildName))
			}
			else if( (data[1] === Types.Messages.GUILDACTION.LEAVE) &&
				this.guildleave_callback){
					this.guildleave_callback(data[2], data[3], data[4]);//name, id, guildname
			}
			else if( (data[1] === Types.Messages.GUILDACTION.TALK) &&
				this.guildtalk_callback){
					this.guildtalk_callback(data[2], data[3], data[4]);//name, id, message
			}
		},

		onDispatched: function(callback) {
			this.dispatched_callback = callback;
		},

		onConnected: function(callback) {
			this.connected_callback = callback;
		},

		onDisconnected: function(callback) {
			this.disconnected_callback = callback;
		},
        
		onPlayersStat: function(callback) {
			this.receivePlayersStat_callback = callback;
		},

		onWelcome: function(callback) {
			this.welcome_callback = callback;
		},
		
		onInventory: function(callback) {
			this.inventory_callback = callback;
		},

		onSpells: function(callback) {
			this.spells_callback = callback;
		},

		onSpawnCharacter: function(callback) {
			this.spawn_character_callback = callback;
		},

		onSpawnItem: function(callback) {
			this.spawn_item_callback = callback;
		},

		onSpawnChest: function(callback) {
			this.spawn_chest_callback = callback;
		},
		
		onSpawnTrap: function(callback) {
			this.spawn_trap_callback = callback;
		},

		onDespawnEntity: function(callback) {
			this.despawn_callback = callback;
		},

		onEntityMove: function(callback) {
			this.move_callback = callback;
		},
		
		onProject: function(callback) {
			this.project_callback = callback;
		},

		onEntityAttack: function(callback) {
			this.attack_callback = callback;
		},
		
		onRangedTargetChanged: function(callback) {
			this.RangedTargetChanged_callback = callback;
		},		

		onPlayerChangeHealth: function(callback) {
			this.health_callback = callback;
		},
        
		onPlayerChangeMana: function(callback) {
			this.mana_callback = callback;
		},        

		onPlayerEquipItem: function(callback) {
			this.equip_callback = callback;
		},

		onPlayerMoveToItem: function(callback) {
			this.lootmove_callback = callback;
		},

		onPlayerTeleport: function(callback) {
			this.teleport_callback = callback;
		},

		onChatMessage: function(callback) {
			this.chat_callback = callback;
		},
        
        onMapChange: function(callback) {
			this.mapchange_callback = callback;
		},

        onDebugMsg: function(callback) {
			this.debug_callback = callback;
		},

		onAdminMessage: function(callback) {
			this.adminMessage_callback = callback;
		},
		
		onPrivateMessage: function(callback) {
			this.privateMessage_callback = callback;
		},
		
		onGetCheckout: function(callback) {
			this.getCheckout_callback = callback;
		},

		onDropItem: function(callback) {
			this.drop_callback = callback;
		},

		onPlayerDamageMob: function(callback) {
			this.dmg_callback = callback;
		},

		onPlayerKillMob: function(callback) {
			this.kill_callback = callback;
		},

		onPopulationChange: function(callback) {
			this.population_callback = callback;
		},

		onEntityList: function(callback) {
			this.list_callback = callback;
		},

		onEntityDestroy: function(callback) {
			this.destroy_callback = callback;
		},
        
		onReceiveStat: function(callback) {
            // general purpose single stat value update from server
			this.receiveStat_callback = callback;
		},        

		onPlayerChangeMaxHitPoints: function(callback) {
			this.hp_callback = callback;
		},
        
		onPlayerChangeMaxManaPoints: function(callback) {
			this.mp_callback = callback;
		},        

		onItemBlink: function(callback) {
			this.blink_callback = callback;
		},
		onPVPChange: function(callback){
			this.pvp_callback = callback;
		},
		onSwitchChange: function(callback){
			this.switch_callback = callback;
		},
		onReload: function(callback){
			this.reload_callback = callback;
		},
		onProfile: function(callback){
			this.profile_callback = callback;
		},
        onWpUpdate: function(callback){
            this.wp_update_callback = callback;
		},
		onUpdateFriends: function(callback){
			this.updateFriends_callback = callback;
		},
		onDetail: function(callback){
			this.detail_callback = callback;
		},
		onExp: function(callback){
			this.exp_callback = callback;
		},
		onPVPKill: function(callback){
			this.pvpkill_callback = callback;
		},
		onPVPLeader: function(callback){
			this.pvpleader_callback = callback;
		},
		onLeaderboards: function(callback){
			this.leaderboards_callback = callback;
		},
		onReceiveCharacters: function(callback){
			this.receiveCharacters_callback = callback;
		},        
		onGuildError: function(callback) {
			this.guilderror_callback = callback;
		},
		
		onGuildCreate: function(callback) {
			this.guildcreate_callback = callback;
		},
		
		onGuildInvite: function(callback) {
			this.guildinvite_callback = callback;
		},
		
		onGuildJoin: function(callback) {
			this.guildjoin_callback = callback;
		},
		
		onGuildLeave: function(callback) {
			this.guildleave_callback = callback;
		},
		
		onGuildTalk: function(callback) {
			this.guildtalk_callback = callback;
		},
		
		onMemberConnect: function(callback) {
			this.guildmemberconnect_callback = callback;
		},
		
		onMemberDisconnect: function(callback) {
			this.guildmemberdisconnect_callback = callback;
		},
		
		onReceiveGuildMembers: function(callback) {
			this.guildonlinemembers_callback = callback;
		},
		
		onGuildPopulation: function(callback) {
			this.guildpopulation_callback = callback;
		},
		
		onArenaWin: function(callback) {
			this.arenawin_callback = callback;
		},
		
		onArenaSpend: function(callback) {
			this.arenaspend_callback = callback;
		},
		
		onArenaExit: function(callback) {
			this.arenaexit_callback = callback;
		},
        
		onBuffEnable: function(callback) {
			this.buffenable_callback = callback;
		},

		onBuffDisable: function(callback) {
			this.buffdisable_callback = callback;
		},
		
		onSpeed: function(callback) {
			this.Speed_callback = callback;
		},
		
		onSpeedPotion: function(callback) {
			this.SpeedPotion_callback = callback;
		},
        
		onDisplace: function(callback) {
			this.displace_callback = callback;
		},

		sendCreate: function(player) {
			this.sendMessage([Types.Messages.CREATE, player.name, player.pw, player.email, player.gender]);
		},
        
		sendDeleteCharacter: function(username,pid) {
			this.sendMessage([Types.Messages.DELETECHARACTER, username, pid]);
		},        
		
		sendToken: function(token) {
			this.sendMessage([Types.Messages.IDNETTOKEN, token]);
		},

		sendLogin: function(player) {
			this.sendMessage([Types.Messages.LOGIN,
							  player.name,
							  player.pw]);
		},
        
        sendNpcLoot: function(flagname) {
			this.sendMessage([Types.Messages.NPC_LOOT, flagname]);
		},
		
		sendConvert: function(guestName, username, pw, email) {
			this.sendMessage([Types.Messages.CONVERT, guestName, username, pw, email]);
		},
        
        sendAchievement: function(id,msg) {
            this.sendMessage([Types.Messages.ACHIEVEMENT, id, msg]);
        },
		
		sendProfile: function(name) {
			this.sendMessage([Types.Messages.PROFILE, name]);
		},
		
		sendUpdateFriends: function() {
			this.sendMessage([Types.Messages.UPDATEFRIENDS]);
		},
		
		getLeader: function() {
			this.sendMessage([Types.Messages.PVPLEADER]);
		},
		
		getLeaderboards: function() {
			this.sendMessage([Types.Messages.LEADERBOARDS]);
		},

        getPlayersOnline: function() {
			this.sendMessage([Types.Messages.PLAYERS_STAT_REQUEST]);
		},
		
		sendDetail: function(name) {
			var now = (new Date).getTime();
			if(now - this.lastDetail > 1000){
				this.sendMessage([Types.Messages.DETAIL, name]);
				this.lastDetail = now;
			}
		},
	   
		sendLocal: function(dataString) {
			this.sendMessage([Types.Messages.LOCAL, dataString]);
		},

		sendMove: function(x, y) {
			this.sendMessage([Types.Messages.MOVE, x, y]);
		},
		
		sendRetreat: function(mob) {
			this.sendMessage([Types.Messages.RETREAT, mob.id]);
		},
		
		sendRemort: function(player) {
			this.sendMessage([Types.Messages.REMORT, player.id]);
		},

		sendLootMove: function(item, x, y) {
			this.sendMessage([Types.Messages.LOOTMOVE, x, y, item.id]);
		},

		sendAggro: function(mob) {
			this.sendMessage([Types.Messages.AGGRO, mob.id]);
		},
		
		sendAggroRanged: function(mob) {
			this.sendMessage([Types.Messages.AGGRORANGED, mob.id]);
		},

		sendAttack: function(mob) {
			this.sendMessage([Types.Messages.ATTACK, mob.id]);
		},
		
		sendHit: function(mob) {
			this.sendMessage([Types.Messages.HIT, mob.id]);
		},
        
        sendHitRanged: function(mob,projectiletype,originx,originy) {
			this.sendMessage([Types.Messages.HITRANGED, mob.id, projectiletype,originx,originy]);
		},
		
		sendHitBomb: function(mob) {
			this.sendMessage([Types.Messages.HITBOMB, mob.id]);
		},
        
		sendHitHeal: function(projectiletype) {
			this.sendMessage([Types.Messages.HITHEAL,projectiletype]);
		},

		sendHitWorldProjectile: function(projectiletype,owner) {
			this.sendMessage([Types.Messages.HITWORLDPROJECTILE,projectiletype,owner]);
		},         

		sendHurt: function(mob) {
			this.sendMessage([Types.Messages.HURT, mob.id]);
		},
		
		sendGetCheckout: function(id) {
			this.sendMessage([Types.Messages.GETCHECKOUT, id]);
		},

		sendChat: function(text) {
			this.sendMessage([Types.Messages.CHAT, text]);
		},

		sendLoot: function(item) {
			this.sendMessage([Types.Messages.LOOT, item.id]);
		},

        sendKey: function(keyId) {
			this.sendMessage([Types.Messages.KEY, parseInt(keyId)]);
		},

		sendTeleport: function(x, y) {
			this.sendMessage([Types.Messages.TELEPORT, x, y]);
		},

		sendWaypointEnter: function(wpId) {
			this.sendMessage([Types.Messages.WAYPOINT_ENTER, parseInt(wpId)]);
		},

		sendStorePurchase: function(kind, quantity, currency) {
			this.sendMessage([Types.Messages.STOREPURCHASE, kind, quantity, currency]);
		},
        
		sendArenaPurchase: function(quantity, currency) {
			log.debug("sendArenaPurchase "+quantity+" "+currency);
			this.sendMessage([Types.Messages.ARENAPURCHASE, quantity, currency]);
		},
		
		sendLeaveArena: function() {
			this.sendMessage([Types.Messages.ARENAEXIT]);
		},
		
		sendZone: function() {
			this.sendMessage([Types.Messages.ZONE]);
		},
		
		sendDropBomb: function(x, y) {
			this.sendMessage([Types.Messages.DROPBOMB, x, y]);
		},
		
		sendCastSpell: function(projectile,sx,sy,x,y, idTarget) {
            if(!idTarget)
                idTarget = 0;
			this.sendMessage([Types.Messages.CASTSPELL,projectile,sx,sy,x,y, idTarget]);
		},
        
		sendUseDoorToMap: function(mapName,x,y) {
			this.sendMessage([Types.Messages.USEDOORTOMAP,mapName,x,y]);
		},        
        
		sendInventoryUse: function(itemKind) {
			this.sendMessage([Types.Messages.INVENTORYUSE,itemKind]);
		},

		sendInventorySort: function(inventory) {
			this.sendMessage([Types.Messages.INVENTORYSORT, JSON.stringify(inventory)]);
		},

		sendOpen: function(chest) {
			this.sendMessage([Types.Messages.OPEN, chest.id]);
		},
		
		sendActivate: function(trap) {
			this.sendMessage([Types.Messages.ACTIVATETRAP, trap.id]);
		},
		
		sendSwitch: function(lever) {
			this.sendMessage([Types.Messages.SWITCH, lever.id]);
		},

		sendCheck: function(id) {
			this.sendMessage([Types.Messages.CHECK, id]);
		},
		
		sendWho: function(ids) {
			ids.unshift(Types.Messages.WHO);
			this.sendMessage(ids);
		},
		
		sendNewGuild: function(name) {
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.CREATE, name]);
		},
		
		sendGuildInvite: function(invitee) {
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.INVITE, invitee]);
		},
		
		sendGuildInviteReply: function(guild, answer) {
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.JOIN, guild, answer]);
		},
		
		talkToGuild: function(message){
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.TALK, message]);
		},
		
		sendLeaveGuild: function(){
			this.sendMessage([Types.Messages.GUILD, Types.Messages.GUILDACTION.LEAVE]);
		}
	});

	return GameClient;
});
