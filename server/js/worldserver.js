
var cls = require("./lib/class"),
    _ = require("underscore"),
    Log = require('log'),
    Entity = require('./entity'),
    Character = require('./character'),
    //Mob = require('./mob'),
    MobFactory = require('./mobFactory'),
    Map = require('./map'),
    Npc = require('./npc'),
    Player = require('./player'),
    Guild = require('./guild'),
    Item = require('./item'),
    Emitter = require('./emitter'),
    MobArea = require('./mobarea'),
    ChestArea = require('./chestarea'),
    Chest = require('./chest'),
    Trap = require('./trap'),
    Lever = require('./lever'),
    LockedDoor = require('./lockeddoor'),
    RockWall = require('./rockwall'),
    HiddenWall = require('./hiddenwall'),
    LitBomb = require('./litbomb'),
    Messages = require('./message'),
    Properties = require("./properties"),
    Utils = require("./utils"),
    MobList = require("../../shared/js/mobManager"),
    EventManager = require("./events"),
    Types = require("../../shared/js/gametypes");

// ======= GAME SERVER ========

module.exports = World = cls.Class.extend({
    init: function(id, maxPlayers, websocketServer, databaseHandler, serverStat) {
        var self = this;

        this.id = id;
        this.maxPlayers = maxPlayers;
        this.server = websocketServer;
        this.ups = 10;
        this.databaseHandler = databaseHandler;
        this.statistic = serverStat;

        this.map = null;

        this.entities = {};
        this.players = {};
		this.globalPlayers = {};
        this.guilds = {};
        this.mobs = {};
        this.attackers = {};
        this.items = {};
        this.equipping = {};
        this.hurt = {};
        this.npcs = {};
        this.mobAreas = [];
        this.chestAreas = [];
        this.groups = {};
        this.emitters = [];
        this.leaderData = null;
        this.eventManager = null;

        this.outgoingQueues = {};

        this.itemCount = 0;
        this.playerCount = 0;
        this.projectileCount = 0;
        this.selfSpawnCounter = 0;

        this.zoneGroupsReady = false;

		this.stuckTimer = setInterval(function(){
			self.forEachPlayer(function(p){
				// if last message 20 minutes ago
				if(p.lastMessage + 1200000 < new Date().getTime()){
					if(p.exit_callback) {
						p.exit_callback();
					}else{
						try{
							removePlayer(p);
						}catch(e){
							log.error('failed to remove stuck player '+p);
						}
					}
				}
			});
		
		}, 300000);

        this.onPlayerConnect(function(player) {
            player.onRequestPosition(function() {
                if(player.lastCheckpoint) {
                    return player.lastCheckpoint.getRandomPosition();
                } else {
                    return self.map.getRandomStartingPosition();
                }
            });
        });

        this.onPlayerEnter(function(player) {
            log.info(player.name + "(" + player.connection._connection.remoteAddress + ") has joined " + self.id + " in guild " + player.guildId +" at group "+player.group + "pos("+player.x+""+player.y+")");

            if(!player.hasEnteredGame) {
                self.incrementPlayerCount();
            }

            // Number of players in this world
            //self.pushToPlayer(player, new Messages.Population(self.playerCount));
            
            if(player.hasGuild()){
                self.pushToGuild(player.getGuild(), new Messages.Guild(Types.Messages.GUILDACTION.CONNECT, player.name),player);
                var names = _.without(player.getGuild().memberNames(), player.name);
                if(names.length > 0){
                    self.pushToPlayer(player, new Messages.Guild(Types.Messages.GUILDACTION.ONLINE, names));
                }
            }
            self.pushRelevantEntityListTo(player);

            var move_callback = function(x, y) {
                log.debug(player.name + " is moving to (" + x + ", " + y + ").");
                 var isPVP = self.map.isPVP(x, y);
                player.flagPVP(isPVP); 
               player.forEachAttacker(function(mob) {
                     if(mob.target === null){
                        player.removeAttacker(mob);
                        return;
                    }
                   var target = self.getEntityById(mob.target);
                    if(target) {
                        var pos = self.findPositionNextTo(mob, target);
                        if(mob.distanceToSpawningPoint(pos.x, pos.y) > 50) {
                            mob.clearTarget();
                            mob.forgetEveryone();
                            player.removeAttacker(mob);
                        } else {
                            self.moveEntity(mob, pos.x, pos.y);
                        }
                    }
                });
            };

            player.onMove(move_callback);
            player.onLootMove(move_callback);

            player.onZone(function() {
                var hasChangedGroups = self.handleEntityGroupMembership(player);

                if(hasChangedGroups) {
                    self.pushToPreviousGroups(player, new Messages.Destroy(player));
                    self.pushRelevantEntityListTo(player);
                }
            });

            player.onBroadcast(function(message, ignoreSelf) {
                self.pushToAdjacentGroups(player.group, message, ignoreSelf ? player.id : null);
            });

            player.onBroadcastToZone(function(message, ignoreSelf) {
                self.pushToGroup(player.group, message, ignoreSelf ? player.id : null);
            });

            player.onExit(function() {
                log.info(player.name + " has left the game. [" + this.id + "]");
                if(player.hasGuild()){
                    self.pushToGuild(player.getGuild(), new Messages.Guild(Types.Messages.GUILDACTION.DISCONNECT, player.name), player);
                }
                self.removePlayer(player);
                self.decrementPlayerCount();

                if(self.removed_callback) {
                    self.removed_callback(player);
                }
            });

            if(self.added_callback) {
                self.added_callback(player);
            }
        });

        // Called when an entity is attacked by another entity
        this.onEntityAttack(function(attacker) {
            var target = self.getEntityById(attacker.target);
            if(target && attacker.type === "mob") {
                var pos = self.findPositionNextTo(attacker, target);
                self.moveEntity(attacker, pos.x, pos.y);
            }
        });

        this.onRegenTick(function() {
            self.forEachCharacter(function(character) {
            
                if(character.type === 'player') {
                    // players
                    if(!character.hasFullHealth()) {
                        var regenAmount = Math.floor(character.maxHitPoints / 25);
						character.regenHealthBy(regenAmount);
                        self.pushToPlayer(character, character.regen());
                    }                       
                } else {
                    // mobs heal by the filed in the db " recovery " instead of character.maxHitPoints / 25)
                    if(!character.hasFullHealth()) {
                        character.regenHealthBy(character.Recovery);
                    }                    
                }
                
                if(!character.hasFullMana()) {
				    var amt = Math.floor(character.maxManaPoints / 25);
                    if (amt < 1) amt = 1;
                    character.regenManaBy(amt);
                    if(character.type === 'player') {
                        self.pushToPlayer(character, character.manaregen());
                    }
					
                }
                
            });
        });
    },

    run: function(mapFilePath) {
        var self = this;
        this.eventManager = new EventManager;
        this.map = new Map(mapFilePath);
        
        this.map.ready(function() {
            log.info(self.id + " end loading "+mapFilePath+ " width "+self.map.width+ " height "+self.map.height);
        
            self.initZoneGroups();
            //log.info(self.id + " done zone groups");
            self.map.generateCollisionGrid();
            //log.info(self.id + " done collision grid");
            
            // Populate all mob "roaming" areas
            _.each(self.map.mobAreas, function(a) {
               // log.debug(self.id + " creating mobarea "+JSON.stringify(a));
                if (MobList.isMob(MobList.getMobIdByName(a.type))) {
                    var area = MobArea.createMobArea(a.id, a.nb, a.type, a.x, a.y, a.width, a.height, self, a.polylines, a.members);
                    area.spawnMobs();
                    area.onEmpty(self.handleEmptyMobArea.bind(self, area));
                    self.mobAreas.push(area);
                }
            });
            
            //log.info(self.id + " done roaming");

            // Create all chest areas
            _.each(self.map.chestAreas, function(a) {
                var area = new ChestArea(a.id, a.x, a.y, a.w, a.h, a.tx, a.ty, a.i, self);
                self.chestAreas.push(area);
                area.onEmpty(self.handleEmptyChestArea.bind(self, area));
            });
            
            //log.info(self.id + " done chest areas");

            // Spawn static chests
            var cc = 0;
            _.each(self.map.staticChests, function(chest) {
                var c = self.createChest(chest.x, chest.y, chest.i, chest.chanceItems, chest.summaryDrop);
                self.addStaticItem(c);
                cc++;
            });
            
            //log.info(self.id + " done chests "+cc);
            
            // Spawn traps
            var count = 0;
            _.each(self.map.staticTraps, function(trap) {
                var tr = self.createTrap(trap.x, trap.y);
                self.addStaticItem(tr);
                count++;
            });
            
            //log.info(self.id + " done traps "+count);
            
            // Spawn levers
            _.each(self.map.levers, function(lever) {
				if(!lever.hasOwnProperty('t')){ lever.t = 5; }
                var l = self.createLever(lever.x, lever.y, lever.s, lever.c, lever.t);
                self.addStaticItem(l);
            });            
            //log.info(self.id + " done levers");
			
			/*
			might just use normal static key for server side
			// Spawn keys
            _.each(self.map.keys, function(key) {
				var keyItem = self.createItem(Types.Entities.KEY, key.x, key.y);
                self.addStaticItem(keyItem);
            });            
            log.info(self.id + " done keys");
			*/
            
            // Create emitter instances
            var ec = 0;
            _.each(self.map.emitters, function(emitterConfig) {
                var newEmitter = new Emitter(emitterConfig);
                newEmitter.onEmitProjectile(function(kind,spos,tpos) {
                    // server manages ids but does not keep track of projectiles
                    var projectileId = '5'+self.projectileCount++;                    
                    // id, projectile type, sourcex, sourcey, destx, desty, owner id
					if(spos.x != null && spos.y != null && tpos.x != null && tpos.y != null){
						var pmsg = new Messages.Project(projectileId,kind,spos.x,spos.y,tpos.x,tpos.y,0);
					}else{
						log.error('Bad emitter in '+self.id+' at '+spos.x+' '+spos.y);
						return;
					}
                    //log.info("onEmitProjectile: "+pmsg.serialize());  
                    // send PROJECT msg to groups adjacent to launch coords
                    var startTilePos = { x: Math.floor(spos.x/16), y: Math.floor(spos.y/16) };
                    var groupId = self.map.getGroupIdFromPosition(startTilePos.x, startTilePos.y);
                    self.pushToAdjacentGroups(groupId,pmsg);
                    
                });
                ec++;
                self.emitters.push(newEmitter);                
            });            
            //log.info(self.id + " done "+ec+" emitters");            
            
            // Spawn locked doors
            _.each(self.map.lockedDoors, function(ldoor) {
                var ld = self.createLockedDoor(ldoor.x, ldoor.y, ldoor.c);
                self.addStaticItem(ld);
            });

           // log.info(self.id + " done locked doors");

            // Spawn static entities
            self.spawnStaticEntities();

            //log.info(self.id + " done static entities");

            // Set maximum number of entities contained in each chest area
            _.each(self.chestAreas, function(area) {
                area.setNumberOfEntities(area.entities.length);
            });
        });

        var regenCount = this.ups * 2;
        var updateCount = 0;
        setInterval(function() {
            self.processGroups();
            self.processQueues();

            if(updateCount < regenCount) {
                updateCount += 1;
            } else {
                if(self.regen_callback) {
                    self.regen_callback();
                }
                updateCount = 0;
            }
        }, 1000 / this.ups);
        //log.info(""+this.id+" created (capacity: "+this.maxPlayers+" players).");
    },

    setUpdatesPerSecond: function(ups) {
        this.ups = ups;
    },

    onInit: function(callback) {
        this.init_callback = callback;
    },

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    },

    onPlayerEnter: function(callback) {
        this.enter_callback = callback;
    },

    onPlayerAdded: function(callback) {
        this.added_callback = callback;
    },

    onPlayerRemoved: function(callback) {
        this.removed_callback = callback;
    },

    onRegenTick: function(callback) {
        this.regen_callback = callback;
    },

    pushRelevantEntityListTo: function(player) {

        var entities;

        if(player && (player.group in this.groups)) {
            entities = _.keys(this.groups[player.group].entities);
            log.info("map keys: " + this.groups[player.group].entities);
            entities = _.reject(entities, function(id) { return id == player.id; });
            entities = _.map(entities, function(id) { return parseInt(id, 10); });
            //log.info("map ent: " + _.map(entities, function(id) { return parseInt(id, 10); }));
            if(entities) {
                //log.info("push ent: " + entities);
                this.pushToPlayer(player, new Messages.List(entities));
            }
        }
    },

    pushSpawnsToPlayer: function(player, ids) {
        var self = this;

        _.each(ids, function(id) {
            var entity = self.getEntityById(id);
            if(entity) {
                self.pushToPlayer(player, new Messages.Spawn(entity));
            }
        });

        //log.info("Pushed "+_.size(ids)+" new spawns to "+player.id+"("+player.name+")"+" group: "+player.group);
    },

    pushToPlayer: function(player, message) {
        if(player && player.id in this.outgoingQueues) {
            if(typeof message != 'undefined'){
                this.outgoingQueues[player.id].push(message.serialize());
            }
        } else {
			if(typeof message != 'undefined'){
				log.error("world:"+this.id+" pushToPlayer: player was undefined while sending "+ message.serialize());
			}else{
				log.error("world:"+this.id+" pushToPlayer: player and message was undefined");
			}
        }
    },
    
    pushToGuild: function(guild, message, except) {
        var self = this;

        if(guild){
            if(typeof except === "undefined"){
                guild.forEachMember(function (player, id){
                    self.pushToPlayer(self.getEntityById(id), message);
                });
            }
            else{
                guild.forEachMember(function (player, id){
                    if(parseInt(id,10)!==except.id){
                        self.pushToPlayer(self.getEntityById(id), message);
                    }
                });
            }
        } else {
            log.error("pushToGuild: guild was undefined");
        }
    },

    pushToGroup: function(groupId, message, ignoredPlayer) {
        var self = this,
            group = this.groups[groupId];
        /*if(groupId == "4-7")
            log.info("pushToGroup id: "+message.entity.id+" "+message.entity.name);*/

        if(group) {
            _.each(group.players, function(playerId) {
                if(playerId != ignoredPlayer) {
                    self.pushToPlayer(self.getEntityById(playerId), message, groupId);
                    //if(message.serialize()[0] === 3 && message.serialize().length > 9) {
                    //	log.info("pushToGroup "+groupId+" pushToPlayer "+playerId+" message: "+message.serialize());
                    //}
                }
            });
        } else {
            log.error("groupId: "+groupId+" is not a valid group");
        }
        /*if(groupId == "4-7")
            log.info("A: "+Object.keys(this.groups["4-7"].entities)[0])*/
    },

    pushToAdjacentGroups: function(groupId, message, ignoredPlayer) {
        var self = this;
        //if(message.serialize()[0] === 3 && message.serialize().length > 9) {
        //	log.info("pushToAdjacentGroups "+groupId+" message: "+message.serialize());
        //}
		self.map.forEachAdjacentGroup(groupId, function(id) {
			self.pushToGroup(id, message, ignoredPlayer);
		});
    },

    pushToPreviousGroups: function(player, message) {
        var self = this;

        // Push this message to all groups which are not going to be updated anymore,
        // since the player left them.
        _.each(player.recentlyLeftGroups, function(id){
            self.pushToGroup(id, message);
        });
        player.recentlyLeftGroups = [];
    },

    pushBroadcast: function(message, ignoredPlayer) {
        for(var id in this.outgoingQueues) {
            if(id != ignoredPlayer) {
                this.outgoingQueues[id].push(message.serialize());
            }
        }
    },

    processQueues: function() {
        var self = this,
            connection;

        for(var id in this.outgoingQueues) {
            if(this.outgoingQueues[id].length > 0) {
                connection = this.server.getConnection(id);
                if(connection){
                    connection.send(this.outgoingQueues[id]);
                }
                this.outgoingQueues[id] = [];
            }
        }
    },

    addEntity: function(entity) {
        this.entities[entity.id] = entity;
        this.handleEntityGroupMembership(entity);
    },

    removeEntity: function(entity) {
        var self = this;
        if(entity.id in this.entities) {
            delete this.entities[entity.id];
        }
        if(entity.id in this.mobs) {
            delete this.mobs[entity.id];
        }
        if(entity.id in this.items) {
            delete this.items[entity.id];
        }

        if(entity.type === "mob") {
            this.clearMobAggroLink(entity);
            this.clearMobHateLinks(entity);

            this.eventManager.onMobDeath(entity, function(unlockedWp){
                for(playerIndex in entity.attackerList) {
                    var player = self.players[playerIndex];

                    _.each(unlockedWp, function(wpIndex){
                        var isLock = player.waypoints[wpIndex] == false;
                        if(isLock) {
                            player.waypoints[wpIndex] = true;
                            self.databaseHandler.saveWaypoints(player.name, player.waypoints);
                            self.pushToPlayer(player, new Messages.UpdateWaypoints(wpIndex));
                        }
                    });
                }
            });
        }

        entity.destroy();
        this.removeFromGroups(entity);
        log.info("Removed "+ Types.getKindAsString(entity.kind) +" : "+ entity.id);
    },

    joinGuild: function(player, guildId, answer){
        if( typeof this.guilds[guildId] === 'undefined' ){
            this.pushToPlayer(player, new Messages.GuildError(Types.Messages.GUILDERRORTYPE.DOESNOTEXIST,guildId));
        }
        //#guildupdate (guildrules)
        else {
            if(player.hasGuild()){
                var formerGuildId = player.guildId;
            }
            var res=this.guilds[guildId].addMember(player, answer);
            if(res!==false && typeof formerGuildId !== "undefined"){
                this.guilds[formerGuildId].removeMember(player);
            }
            return res;
        }
        return false;
    },
    
    reloadGuild: function(guildId, guildName){
            var res = false;
            var lastItem = 0;
            if(typeof this.guilds[guildId] !== "undefined"){
                if(this.guilds[guildId].name === guildName){
                    res = guildId;
                }
            }
            if(res===false){
                _.every(this.guilds, function(guild, key){
                    if(guild.name === guildName){
                        res = parseInt(key,10);
                        return false;
                    }
                    else{
                        lastItem = key;
                        return true;
                    }
                });
            }

            if(res===false){//first connected after reboot.
                if(typeof this.guilds[guildId] !== "undefined"){
                    guildId = parseInt(lastItem,10)+1;
                }
                this.guilds[guildId] = new Guild(guildId, guildName, this);
                res = guildId;
            }
        return res;
    },
    
    addGuild: function(guildName){
        var res = true;
        var id=0;//an ID here
        res = _.every(this.guilds,function(guild, key){
            id = parseInt(key,10)+1;
            return (guild.name !== guildName);
        });
        if (res) { 
            this.guilds[id] = new Guild(id, guildName, this);
            res = id;
        }
        return res;
    },

    addPlayer: function(player, guildId) {
        this.addEntity(player);
        this.players[player.id] = player;
        this.outgoingQueues[player.id] = [];
		for (var w=0; w < player.worlds.length; w++){
			player.worlds[w].globalPlayers[player.pid] = player.name;
		}
        var res = true;
        if(typeof guildId !== 'undefined'){
            res = this.joinGuild(player, guildId);
        }
        return res;
    },

    removePlayer: function(player) {
		for (var w=0; w < player.worlds.length; w++){
			delete player.worlds[w].globalPlayers[player.pid];
		}
        player.broadcast(player.despawn());
        this.removeEntity(player);
        if(player.hasGuild()){
            player.getGuild().removeMember(player);
        }
        delete this.players[player.id];
        delete this.outgoingQueues[player.id];
    },
    loggedInPlayer: function(name,ignore){
        for(var id in this.players) {
            if (id != ignore) {
                if(this.players[id].name === name){
                    if(!this.players[id].isDead)
                        return this.players[id];
                }
            }
        }
        return null;
    },

    addMob: function(mob) {
        log.debug(this.id +" addMob: "+mob.x+","+mob.y+ " "+mob.kind + " "+MobList.getMobName(mob.kind));
        this.addEntity(mob);
        this.mobs[mob.id] = mob;
    },

    addNpc: function(kind, x, y) {
        var npc = new Npc('8'+x+''+y, kind, x, y);
        this.addEntity(npc);
        this.npcs[npc.id] = npc;
        return npc;
    },

    addItem: function(item) {
        this.addEntity(item);
        this.items[item.id] = item;

        return item;
    },

    createItem: function(kind, x, y) {
        var id = '9'+this.itemCount++,
        item = null;
        
        switch(kind) {
        
            case Types.Entities.CHEST:
                item = new Chest(id, x, y);
            break;
            
            case Types.Entities.TRAP:
                item = new Trap(id, x, y);
            break;
            
            case Types.Entities.LEVER:
                item = new Lever(id, x, y);
            break;
            
            case Types.Entities.LOCKEDDOOR:
                item = new LockedDoor(id, x, y);
            break;
        
            case Types.Entities.LITBOMB:
                item = new LitBomb(id, x, y);
                
                var self = this;
                item.onDetonate(function(owner){
                
                    // use despawn method on worldserver
                    self.despawn(item);
                    
                    // check neighbour entities for wall kinds and remove as needed
                    
                    var tokill = new Array();
                    
                    // todo: more efficient!
                    for(var id in self.entities) {
                        var ent = self.entities[id];
                        if  (ent.kind === Types.Entities.ROCKWALL || ent.kind === Types.Entities.HIDDENWALL){
                            // above
                            if (ent.x === item.x && ent.y === item.y - 1) {

                                tokill.push(ent);
                            }
                            // below
                            if (ent.x === item.x && ent.y === item.y + 1) {

                                tokill.push(ent);
                            }
                            // left
                            if (ent.x === item.x - 1 && ent.y === item.y) {

                                tokill.push(ent);
                            }
                            // right
                            if (ent.x === item.x + 1 && ent.y === item.y) {

                                tokill.push(ent);
                            }
                        }
                    }
                    
                    _.each(tokill,function(ent){
                        self.despawn(ent);
                    });
                
                });
                
            break;
        
            default:
                item = new Item(id, kind, x, y);
        }
        
        return item;
    },

    createChest: function(x, y, items, chanceItems, summaryDrop) {
        var chest = this.createItem(Types.Entities.CHEST, x, y);
        chest.setItems(items, chanceItems, summaryDrop);
        return chest;
    },
    
    createTrap: function(x, y) {
        var trap = this.createItem(Types.Entities.TRAP, x, y);
        return trap;
    },
    
    createLever: function(x, y, s, c, t){
        var lever = this.createItem(Types.Entities.LEVER, x, y);
        var state = false;
        if(s === 0){ state = false; }else{ state = true; }
        lever.setState(state);
        lever.setItemConnect(c);
		lever.setTime(t);
        return lever;       
    },
    
    createLockedDoor: function(x, y, c){
        var ldoor = this.createItem(Types.Entities.LOCKEDDOOR, x, y);
        ldoor.setItemConnect(c);
        return ldoor;   
    },

    addStaticItem: function(item) {
        item.isStatic = true;
        item.onRespawn(this.addStaticItem.bind(this, item));

        return this.addItem(item);
    },

    addItemFromChest: function(kind, x, y) {
        var item = this.createItem(kind, x, y);
        item.isFromChest = true;

        return this.addItem(item);
    },

    /**
     * The mob will no longer be registered as an attacker of its current target.
     */
    clearMobAggroLink: function(mob) {
        var player = null;
        if(mob.target) {
            player = this.getEntityById(mob.target);
            if(player) {
                player.removeAttacker(mob);
            }
        }
    },

    clearMobHateLinks: function(mob) {
        var self = this;
        if(mob) {
            _.each(mob.hatelist, function(obj) {
                var player = self.getEntityById(obj.id);
                if(player) {
                    player.removeHater(mob);
                }
            });
        }
    },

    forEachEntity: function(callback) {
        for(var id in this.entities) {
            callback(this.entities[id]);
        }
    },

    forEachPlayer: function(callback) {
        for(var id in this.players) {
            callback(this.players[id]);
        }
    },

    forEachMob: function(callback) {
        for(var id in this.mobs) {
            callback(this.mobs[id]);
        }
    },

    forEachCharacter: function(callback) {
        this.forEachPlayer(callback);
        this.forEachMob(callback);
    },

    handleMobHate: function(mobId, playerId, hatePoints) {
        var mob = this.getEntityById(mobId),
            player = this.getEntityById(playerId),
            mostHated;

        if(player && mob) {
            mob.increaseHateFor(playerId, hatePoints);
            player.addHater(mob);

            if(mob.hitPoints > 0) { // only choose a target if still alive
                this.chooseMobTarget(mob);
            }			
			
        }
    },

    chooseMobTarget: function(mob, hateRank) {
        var player = this.getEntityById(mob.getHatedPlayerId(hateRank));

        // If the mob is not already attacking the player, create an attack link between them.
        if(player && !(mob.id in player.attackers)) {
            this.clearMobAggroLink(mob);

            player.addAttacker(mob);
            mob.setTarget(player);

            this.broadcastAttacker(mob);
            log.debug(mob.id + " is now attacking " + player.id);
        }
    },

    onEntityAttack: function(callback) {
        this.attack_callback = callback;
    },

    getEntityById: function(id) {
        if(id in this.entities) {
            return this.entities[id];
        } else {
            log.error("Unknown entity : " + id);
        }
    },

    getPlayerCount: function() {
        var count = 0;
        for(var p in this.players) {
            if(this.players.hasOwnProperty(p)) {
                count += 1;
            }
        }
        return count;
    },

    broadcastAttacker: function(character) {
        if(character) {
            this.pushToAdjacentGroups(character.group, character.attack(), character.id);
        }
        if(this.attack_callback) {
            this.attack_callback(character);
        }
    },

    handleHurtEntity: function(entity, attacker, damage) {
        var self = this;

        if(entity.type === 'player') {
            // A player is only aware of his own hitpoints
            this.pushToPlayer(entity, entity.health());
            //log.info("HURT pushToPlayer: " + entity.name + " " + entity.health());
        }

        if(entity.type === 'mob') {
            // Let the mob's attacker (player) know how much damage was inflicted
            this.pushToPlayer(attacker, new Messages.Damage(entity, damage, entity.hitPoints, entity.maxHitPoints));
            entity.addAttackerList(attacker.id);
        }

        // If the entity is about to die
        if(entity.hitPoints <= 0) {
            if(entity.type === "mob") {
                var mob = entity,
                    items = this.getDroppedItem(mob);
                //var mainTanker = this.getEntityById(mob.getMainTankerId()); // players all get exp now
                // count all attackers to drop multiple loot
                var attackerCount = Object.keys(entity.attackerList).length;
				
				for (var playerId in entity.attackerList) {
					var tmpPlayer = this.getEntityById(playerId);
					var mobExp = MobList.getMobExp(mob.kind);
					var mobLevel = MobList.getMobLevel(mob.kind);
					// exp less for easy monsters
					if(tmpPlayer){
					
						// coef for level difference to calcul xp
						if(mobLevel <= tmpPlayer.level)
						{
							var CoefMob = 1;
							var CoefPlayer = tmpPlayer.level - mobLevel + 1;
						}
						else 
						{
							var CoefMob = mobLevel - tmpPlayer.level + 1;
							var CoefPlayer = 1;
						}
					
                        var playerExp = (mobExp / CoefPlayer) * CoefMob;   
						
						tmpPlayer.incExp(playerExp);
						this.pushToPlayer(tmpPlayer, new Messages.Kill(mob, tmpPlayer.level, tmpPlayer.experience));
					}
				}
                
                // kill all minions on summoners death
                // this doesn't work
                if(entity.minions){
                    for (var mid in entity.minions) {
                        //log.info(entity.minions[mid]);
                        //this.pushToAdjacentGroups(entity.minions[mid].group, entity.minions[mid].despawn());
                        //entity.destroy();
                    }       
                }
                

               this.pushToAdjacentGroups(mob.group, mob.despawn()); // Despawn must be enqueued before the item drop
                for (index in items){ // this function need refactoring
                    var item = items[index];
                    if(item) {
                        for(var i = 0; i < attackerCount; i++){
                            if(i > 3){
                                break;
                            }
                            if( i == 0){
                                this.pushToAdjacentGroups(mob.group, mob.drop(item));
                            }else{
                                var mob = entity,
                                    groupItems = this.getDroppedItem(mob);

                                for(itemIndex in groupItems)
                                {
                                    var groupItem = groupItems[itemIndex];
                                    this.pushToAdjacentGroups(mob.group, mob.despawn());
                                    this.pushToAdjacentGroups(mob.group, mob.drop(groupItem));
                                    this.handleItemDespawn(groupItem);
                                }
                                return;
                            }
                            this.handleItemDespawn(item);
                        }
                    }
                }
            }
            // killed player
            if(entity.type === "player") {
                // pvp award
                // attacker is defined and is not a mob
                if(typeof attacker != 'undefined' && typeof attacker.incExp === 'function'){
                    log.info('PVP AWARD');
                    attacker.incExp(entity.level);
                    attacker.incArenaWins(entity.level);
                    this.databaseHandler.addKill(attacker);
                    this.pushToPlayer(attacker, new Messages.Exp(attacker.level, attacker.experience));
                    self.getOnlineLeader(attacker);
                }
                    
                this.handlePlayerVanish(entity);
                this.pushToAdjacentGroups(entity.group, entity.despawn());
                this.removeFromGroups(entity);
                entity.x = 0;
                entity.y = 0;
            }

            this.removeEntity(entity);
        }
    },
    
    getOnlineLeader: function(player){
        var self = this;
        var leaders = {};
        var sortable = [];
        
        self.forEachPlayer(function(p){
            leaders[p.name] = p.pvpKills;
        });
        
        for (var name in leaders){
            sortable.push([name, leaders[name]]);
        }
        sortable.sort(function(a, b) {return b[1] - a[1]});
        sortable.slice(0,2);

        if(sortable){
            log.info('GET LEADER: ');
            if(sortable.length == 3){
                self.pushToAdjacentGroups(player.group, new Messages.SendLeader(sortable[0][0], sortable[0][1], sortable[1][0], sortable[1][1], sortable[2][0], sortable[2][1]));
            }else if(sortable.length == 2){
                self.pushToAdjacentGroups(player.group, new Messages.SendLeader(sortable[0][0], sortable[0][1], sortable[1][0], sortable[1][1], 0, 0));
            }else if(sortable.length == 1){
                self.pushToAdjacentGroups(player.group, new Messages.SendLeader(sortable[0][0], sortable[0][1], 0, 0, 0, 0));
            } 
        }
        
    },

    despawn: function(entity) {
        this.pushToAdjacentGroups(entity.group, entity.despawn());

        if(entity.id in this.entities) {
            this.removeEntity(entity);
        }
    },

    spawnStaticEntities: function() {
        var self = this,
            count = 0;
        log.info(self.id + " spawning static entities");
        _.each(this.map.staticEntities, function(kindName, tid) {
            var pos = self.map.tileIndexToGridPosition(tid);
            var kind = 0;

            if(mobId = MobList.getMobIdByName(kindName)) // is mob
            {
                kind = mobId;
                //var result = self.databaseHandler.findMob();
                var type = MobList.getMobType(mobId);
                var mob = MobFactory.createMob(type, kind + count++, kind, pos.x + 1, pos.y);
                mob.onRespawn(function() {
                    mob.isDead = false;
					mob.rangedTarget = null;
                    self.addMob(mob);
                    if(mob.area && mob.area instanceof ChestArea) {
                        mob.area.addToArea(mob);
                    }
                });
                mob.onMove(self.onMobMoveCallback.bind(self));
                self.addMob(mob);
                self.tryAddingMobToChestArea(mob);
                return;
            }

            if (Types.isCollectionItem(kindName)) {
                self.addStaticItem(self.createItem(kindName, pos.x + 1, pos.y));
                return;
            }

            kind = Types.getKindFromString(kindName);
            if(Types.isNpc(kind)) {
                log.debug(self.id + " spawning npc "+kind + " at " + pos.x + "," + pos.y);
                self.addNpc(kind, pos.x + 1, pos.y);
            }

            if(Types.isLitBomb(kind)) {
                //log.debug(self.id + " spawning litbomb" + " at " + pos.x + "," + pos.y);
                self.addItem(self.createItem(kind, pos.x + 1, pos.y));
            }
            
            if(Types.isItem(kind)) {
                //log.debug(self.id + " spawning item "+kind + " at " + pos.x + "," + pos.y);
                self.addStaticItem(self.createItem(kind, pos.x + 1, pos.y));
            }
            
        });
    },
    
    spawnMob: function(kind, posX, posY) {
    	var self = this;
    	
    	var randX = self.getRandomInt(-1, 1);
        var randY = self.getRandomInt(-1, 1);

        self.selfSpawnCounter++;
        var mob = MobFactory.createMob(MobList.getMobType(kind), kind + self.selfSpawnCounter, kind, posX + randX, posY + randY);
        mob.onRespawn(function () {
            mob.isDead = false;
            self.addMob(mob);
            if (mob.area && mob.area instanceof ChestArea) {
                mob.area.addToArea(mob);
            }
        });
        mob.onMove(self.onMobMoveCallback.bind(self));
        self.addMob(mob);
    },
    
    spawnMinion: function(entity, skind){
        var self = this;
        if(entity){
            var randX = self.getRandomInt(-1, 1);
            var randY = self.getRandomInt(-1, 1);
            //var mob = new Mob(entity.id + '6' + entity.minionCount, skind, entity.x + randX, entity.y + randY);
            var mob = MobFactory.createMob(MobList.getMobType(entity.kind) ,entity.id + '6' + entity.minionCount, skind, entity.x + randX, entity.y + randY);
            entity.minionCount ++;
            mob.summoner = entity;
            self.addMob(mob);
            entity.minions[entity.id + '6' + entity.minionCount] = mob;
        }
    },

    isValidPosition: function(x, y) {
        if(this.map && _.isNumber(x) && _.isNumber(y) && !this.map.isOutOfBounds(x, y) && !this.map.isColliding(x, y)) {
            return true;
        }
        return false;
    },

    handlePlayerVanish: function(player) {
        var self = this,
            previousAttackers = [];

        // When a player dies or teleports, all of his attackers go and attack their second most hated player.
        player.forEachAttacker(function(mob) {
            previousAttackers.push(mob);
            self.chooseMobTarget(mob, 2);
        });

        _.each(previousAttackers, function(mob) {
            player.removeAttacker(mob);
            mob.clearTarget();
            mob.forgetPlayer(player.id, 1000);
        });

        this.handleEntityGroupMembership(player);
    },

    setPlayerCount: function(count) {
        this.playerCount = count;
    },

    incrementPlayerCount: function() {
        this.setPlayerCount(this.playerCount + 1);
    },

    decrementPlayerCount: function() {
        if(this.playerCount > 0) {
            this.setPlayerCount(this.playerCount - 1);
        }
    },

    getDroppedItem: function(mob, isSingle) {
        var self = this;
        var kind = MobList.getMobName(mob.kind),
            drops = MobList.getMobById(mob.kind).drops,
            p = 0,
            items = [];

        for(var itemName in drops) {
            var percentage = drops[itemName];			
            v = Utils.random(100);
            //p += percentage;
            if(v <= percentage) {
            	var itemX = 0, itemY = 0;
                if(itemName.substr(0, 3) == 'key') {
                    itemX = mob.x;
                    itemY = mob.y;
                } else {
                	var randX = self.getRandomInt(-1, 1);
                    var randY = self.getRandomInt(-1, 1);
                    itemX = mob.x + randX;
                    itemY = mob.y + randY;
                }
            	items.push(this.addItem(this.createItem(Types.Entities[itemName], itemX, itemY)));
                //break;
            }
        }

        return items;
    },
    
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    onMobMoveCallback: function(mob) {
        this.pushToAdjacentGroups(mob.group, new Messages.Move(mob));
        this.handleEntityGroupMembership(mob);
    },

    findPositionNextTo: function(entity, target) {
        var valid = false,
            pos;

        while(!valid) {
            pos = entity.getPositionNextTo(target);
            valid = this.isValidPosition(pos.x, pos.y);
        }
        return pos;
    },

    initZoneGroups: function() {
        var self = this;

        this.map.forEachGroup(function(id) {
            self.groups[id] = { entities: {},
                                players: [],
                                incoming: []};
        });
        this.zoneGroupsReady = true;
    },

    removeFromGroups: function(entity) {
        var self = this,
            oldGroups = [];

        if(entity && entity.group) {

            var group = this.groups[entity.group];
            if(entity instanceof Player) {
                group.players = _.reject(group.players, function(id) { return id === entity.id; });
            }

            this.map.forEachAdjacentGroup(entity.group, function(id) {
                if(entity.id in self.groups[id].entities) {
                    delete self.groups[id].entities[entity.id];
                    oldGroups.push(id);
                }
            });
            entity.group = null;
        }

        return oldGroups;
    },

    /**
     * Registers an entity as "incoming" into several groups, meaning that it just entered them.
     * All players inside these groups will receive a Spawn message when WorldServer.processGroups is called.
     */
    addAsIncomingToGroup: function(entity, groupId) {
    	var self = this,
            isChest = entity && entity instanceof Chest,
            isTrap = entity && entity instanceof Trap,
            isLitBomb = entity && entity instanceof LitBomb,
            isItem = entity && entity instanceof Item,
            isDroppedItem =  entity && isItem && !entity.isStatic && !entity.isFromChest;

        if(entity && groupId) {
            this.map.forEachAdjacentGroup(groupId, function(id) {
                var group = self.groups[id];

                if(group) {
                    if(!_.include(group.entities, entity.id)
                    //  Items dropped off of mobs are handled differently via DROP messages. See handleHurtEntity.
                    && (!isItem || isChest || isTrap || isLitBomb || (isItem && !isDroppedItem))) {
                        group.incoming.push(entity);
                    }
                }
            });
        }
    },

    addToGroup: function(entity, groupId) {

        var self = this,
            newGroups = [];

        if(entity && groupId && (groupId in this.groups)) {
            this.map.forEachAdjacentGroup(groupId, function(id) {
                self.groups[id].entities[entity.id] = entity;
                newGroups.push(id);
            });
            entity.group = groupId;

            if(entity instanceof Player) {
                this.groups[groupId].players.push(entity.id);
                //log.info("add player id: "+entity.id+" name: "+entity.name+" to group "+groupId);
            }
        }

        return newGroups;
    },

    logGroupPlayers: function(groupId) {
        log.debug("Players inside group "+groupId+":");
        _.each(this.groups[groupId].players, function(id) {
            log.debug("- player "+id);
        });
    },

    handleEntityGroupMembership: function(entity) {
        var hasChangedGroups = false;
        if(entity) {
            var groupId = this.map.getGroupIdFromPosition(entity.x, entity.y);
            if(!entity.group || (entity.group && entity.group !== groupId)) {
                hasChangedGroups = true;
                this.addAsIncomingToGroup(entity, groupId);
                var oldGroups = this.removeFromGroups(entity);
                var newGroups = this.addToGroup(entity, groupId);

                if(_.size(oldGroups) > 0) {
                    entity.recentlyLeftGroups = _.difference(oldGroups, newGroups);
                    log.debug("group diff: " + entity.recentlyLeftGroups);
                }
            }
        }
        return hasChangedGroups;
    },

    processGroups: function() {
        var self = this;

        if(this.zoneGroupsReady) {
            this.map.forEachGroup(function(id) {
                var spawns = [];
                if(self.groups[id].incoming.length > 0) {
                    spawns = _.each(self.groups[id].incoming, function(entity) {
                        if(entity instanceof Player) {
                            self.pushToGroup(id, new Messages.Spawn(entity), entity.id);
                            //log.info("processGroups Player "+entity.id+"("+entity.name+") "+entity.group+" id: "+id);
                        } else {
                            //log.info("processGroups "+entity.id+"("+entity.name+") "+entity.group+" id: "+id);
                            self.pushToGroup(id, new Messages.Spawn(entity));
                        }
                    });
                    self.groups[id].incoming = [];
                }
            });
        }
    },

    moveEntity: function(entity, x, y) {
        if(entity) {
            entity.setPosition(x, y);
            this.handleEntityGroupMembership(entity);
        }
    },

    handleItemDespawn: function(item) {
        var self = this;

        if(item) {
            item.handleDespawn({
                beforeBlinkDelay: 10000,
                blinkCallback: function() {
                    self.pushToAdjacentGroups(item.group, new Messages.Blink(item));
                },
                blinkingDuration: 4000,
                despawnCallback: function() {
                    self.pushToAdjacentGroups(item.group, new Messages.Destroy(item));
                    self.removeEntity(item);
                }
            });
        }
    },

    handleEmptyMobArea: function(area) {

    },

    handleEmptyChestArea: function(area) {
        if(area) {
            var chest = this.addItem(this.createChest(area.chestX, area.chestY, area.items));
            this.handleItemDespawn(chest);
        }
    },

    handleOpenedChest: function(chest, player) {
        var self = this;
        this.pushToAdjacentGroups(chest.group, chest.despawn());
        this.removeEntity(chest);

        var kinds = chest.getItems();

        var itemX = chest.x;
        var itemY = chest.y;

        _.each(kinds, function(id, count) {
            if (count > 0) {
                /** drop near chest */
                itemX = chest.x + self.getRandomInt(-1, 1);
                itemY = chest.y + self.getRandomInt(-1, 1);
            }
            var item = self.addItemFromChest(id, itemX, itemY);
            self.handleItemDespawn(item);
        });
    },
    
    handleActivateTrap: function(trap, player) {
        log.info("handleActivateTrap");
        this.pushToAdjacentGroups(trap.group, trap.despawn());
        this.removeEntity(trap);
        
        // A player is only aware of his own hitpoints
        this.pushToPlayer(player, player.health());
        
        if(player.hitPoints <= 0) {
            this.handlePlayerVanish(player);
            this.pushToAdjacentGroups(player.group, player.despawn());
            this.removePlayer(player);;
        }
    },
    
    handleLeverSwitch: function(lever, player) {
        var self = this;
        // set lever state + send new state to client
        this.pushToAdjacentGroups(lever.group, lever.switchChange());
        if(lever.state == false){
			clearTimeout(lever.leverSwitch);
            lever.leverSwitch = setTimeout(function() {
                if(lever.state == false){
                    self.pushToAdjacentGroups(lever.group, lever.switchChange());
                }
            }, lever.time * 1000);
        }else{
			if(lever.leverSwitch){
				clearTimeout(lever.leverSwitch);
			}
		}
    },
    handleMobRetreat: function(mob){
        try {
            this.clearMobAggroLink(mob);
            this.clearMobHateLinks(mob);
            mob.forgetEveryone();
        }catch (e) {
            log.error(e);
        }
    },
    // apply displacement effect of black hole occurring at originX, originY cast by player affecting mob
    applyBlackHoleDisplacement: function(player,mob,originX,originY) {
        // todo: valid destination check/block
        
        // move mob immediately server side
        mob.setPosition(originX,originY);
        
        // we will smooth animate client (over 1 second) side through use of DISPLACE(kind,mobid,x,y,duration) msg        
        player.broadcast(new Messages.Generic(Types.Messages.DISPLACE,[Types.Projectiles.BLACKHOLE, mob.id, originX, originY, 1]),false);        
        
    },
    getPlayerByName: function(name){
        for(var id in this.players) {
            if(this.players[id].name === name){
                return this.players[id];
            }
        }
        return null;
    },

    tryAddingMobToChestArea: function(mob) {
        _.each(this.chestAreas, function(area) {
            if(area.contains(mob)) {
                area.addToArea(mob);
            }
        });
    },

    updatePopulation: function(totalPlayers) {
        this.pushBroadcast(new Messages.Population(this.playerCount, totalPlayers ? totalPlayers : this.playerCount));

        for (id in this.players)
            this.players[id].sendServerStatistic();
    },
    
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});
