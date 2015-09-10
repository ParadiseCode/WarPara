require('behavior/behaviorFactory');
define(['infomanager', 'bubble', 'renderer', 'map', 'animation', 'sprite', 'spritelist', 'projectile', 'customProjectile',
        'tile', 'warrior', 'gameclient', 'audio', 'updater', 'transition',
        'pathfinder', 'item', 'collectionItem', 'mob', 'npc', 'player', 'character', 'chest', 'trap', 'rockwall', 'hiddenwall', 'litbomb',
        'exceptions', 'guild', 'lever', 'lockeddoor', 'area', 'hud/keyList', 'hud/chat', 'hud/hotbar', 'hud/waypointList', 'moblist', '../../shared/js/gametypes', '../../shared/js/mobManager'],
function(InfoManager, BubbleManager, Renderer, Map, Animation, Sprite, SpriteList, Projectile, CustomProjectile, AnimatedTile,
         Warrior, GameClient, AudioManager, Updater, Transition, Pathfinder,
         Item, CollectionItem, Mob, Npc, Player, Character, Chest, Trap, RockWall, HiddenWall, LitBomb,
         Exceptions, Guild, Lever, LockedDoor, Area, KeyList, Chat, Hotbar, Waypoints) {
    var Game = Class.extend({
        init: function(app) {
            var self = this;
            this.app = app;
            this.ready = false;
            this.started = false;
            this.hasNeverStarted = true;

            this.renderer = null;
            this.updater = null;
            this.pathfinder = null;
            this.chatinput = null;
            this.bubbleManager = null;
            this.audioManager = null;

            // Player
            this.player = new Warrior("player", "");
            this.player.moveUp = false;
            this.player.moveDown = false;
            this.player.moveLeft = false;
            this.player.moveRight = false;
            this.player.disableKeyboardNpcTalk = false;
            this.hotbarSize = 7;
            this.inventoryData = {};

            this.keyList = new KeyList();

            // Game state
            this.entities = {};
            this.projectiles = {};
            this.deathpositions = {};
            this.entityGrid = null;
            this.pathingGrid = null;
            this.renderingGrid = null;
            this.itemGrid = null;
            this.currentCursor = null;
            this.mouse = { x: 0, y: 0 };
            this.zoningQueue = [];
			this.lastZoning = {x: 0, y: 0};
            this.previousClickPosition = {};
            this.currentWorld = '';
			this.dialogAreas = [];

            this.cursorVisible = true;
            this.selectedX = 0;
            this.selectedY = 0;
            this.selectedCellVisible = false;
            this.targetColor = "rgba(255, 255, 255, 0.5)";
            this.targetCellVisible = true;
            this.hoveringTarget = false;
            this.isHoverHimself = false;
            this.hoveringPlayer = false;
            this.hoveringMob = false;
            this.hoveringItem = false;
            this.hoveringCollidingTile = false;
            this.clickToFire = null; // set to a Types.Projectiles kind to enter firing mode

            this.inventoryActiveItem = Types.Entities.WEAPON0;
            this.defenseItem = Types.Action.SOCIAL_STATE;

            this.lastLeverPulled = [];
            
            this.achievementCount = 0;

            // combat
            this.infoManager = new InfoManager(this);

            this.chat = new Chat(this.app);

            // zoning
            this.currentZoning = null;

            this.cursors = {};

            this.sprites = {};

            // tile animation
            this.animatedTiles = null;

            // debug
            this.debugPathing = false;
            
            // pvp
            this.pvpFlag = false;

            // loading
            this.loadedCount = 0;
            
            // block health potion spawn;
            this.healthPotionSpawn = true;
            BehaviorFactory.AttachGameInstance(this);
        },
        
        // main registration of event handlers. this is called from onWelcome
        registerHandlers: function() {
            var self = this;
            
                self.player.onStartPathing(function(path) {
                    var i = path.length - 1,
                        x =  path[i][0],
                        y =  path[i][1];

                    if(self.player.isMovingToLoot()) {
                        self.player.isLootMoving = false;
                    }
                    else if(!self.player.isAttacking()) {
                        self.client.sendMove(x, y);
                    }

                    // Target cursor position
                    self.selectedX = x;
                    self.selectedY = y;

                    if(!self.player.isAttacking()) {
                    	self.selectedCellVisible = true;
                    }

                    if(self.renderer.mobile || self.renderer.tablet) {
                        self.drawTarget = true;
                        self.clearTarget = true;
                        self.renderer.targetRect = self.renderer.getTargetBoundingRect();
                        self.checkOtherDirtyRects(self.renderer.targetRect, null, self.selectedX, self.selectedY);
                    }
                });

                self.player.onCheckAggro(function() {
                    self.forEachMob(function(mob) {
						
						// melee
                        if(mob.isAggressive && !mob.isAttacking() && self.player.isNear(mob, mob.aggroRange) && mob.isTerrified !== true) {
                            self.player.aggro(mob);
                        }
						
						//// ranged
						//if (mob.projectile && mob.projectileRange) {
						//	if(mob.isAggressive && !mob.isAttacking() && self.player.isNear(mob, mob.projectileRange) && mob.isTerrified != true) {
						//		self.player.aggroRanged(mob);
						//	}
						//}
						
						
                    });
                    
                    if(self.player.inspecting === null) {
                        if(!self.player.hasTarget()) {
                    	    if(!self.app.inspectorFadeOut) {
	                        	$('#inspector').fadeOut('fast');
	                            self.app.inspectorFadeOut = true;
                            }
                            $('#inspector .health').text('');
                            if(self.player){
                                self.player.inspecting = null;
                            }
                        }
                    }
                });

                self.player.onAggro(function(mob) {
                    if(!mob.isWaitingToAttack(self.player) && !self.player.isAttackedBy(mob)) {
                        self.player.log_info("Aggroed by " + mob.id + " at ("+self.player.gridX+", "+self.player.gridY+")");
                        self.client.sendAggro(mob);
                        mob.waitToAttack(self.player);
                    }
                });
				
                //self.player.onAggroRanged(function(mob) {
                //
					////self.player.log_info("Ranged Aggroed by " + mob.id + " at ("+self.player.gridX+", "+self.player.gridY+")");
					//self.client.sendAggroRanged(mob);
                //
                //});

                self.player.onBeforeStep(function() {
                    var blockingEntity = self.getEntityAt(self.player.nextGridX, self.player.nextGridY);
                    if(blockingEntity && blockingEntity.id !== self.playerId) {
                        if(self.client.debugMessages){
                            log.debug("Blocked by " + blockingEntity.id);
                        }
                    }
                    self.unregisterEntityPosition(self.player);
                });

                self.player.onStep(function() {
                    if(self.player.hasNextStep()) {
                        self.registerEntityDualPosition(self.player);
                    }

                    if(self.isZoningTile(self.player.nextGridX, self.player.nextGridY,self.player.gridX, self.player.gridY)) {
                        self.enqueueZoningFrom(self.player.nextGridX, self.player.nextGridY);
                    }

                    self.player.forEachAttacker(self.makeAttackerFollow);

                    var item = self.getItemAt(self.player.gridX, self.player.gridY);
                    if(self.isItemInstance(item)) {
                        self.tryLootingItem(item);
                    }
                    
                    var entity = self.getEntityAt(self.player.gridX, self.player.gridY);
                    if(entity instanceof Trap) {
                        self.client.sendActivate(entity);
                        self.makeCharacterGoTo(self.player, entity.gridX, entity.gridY);
                    }

                    // location Achievements go here
                    if(self.currentWorld === 'gauntlet'){
                        if(self.player.gridX >= 47 && self.player.gridY >= 28 && self.player.gridX <= 54 && self.player.gridY <= 32) {
                            self.tryUnlockingAchievement("GAUNTLET_RUN");
                        }
                    }

                    self.updatePlayerCheckpoint();

                    if(!self.player.isDead) {
                        self.audioManager.updateMusic();
                    }
                    
                    if(self.client.port === 8000 || self.client.port === 8300) {
                    	$('#gridpos').text("X: "+self.player.gridX+"; Y: "+self.player.gridY+";");
                    }
                });

                self.player.onStopPathing(function(x, y) {
                    if(self.player.hasTarget()) {
                        self.player.lookAtTarget();
                    }

                    self.selectedCellVisible = false;

                    if(self.isItemAt(x, y)) {
                        var item = self.getItemAt(x, y);
                        self.tryLootingItem(item);
                    }

                    if(self.map.isDoor(x, y) && !self.player.isAttacking()) {
                        var dest = self.map.getDoorDestination(x, y);
                        
                        if(dest.data) {
                        	if(dest.data === "training") {
                        		this.healthPotionSpawn = false;
                        	} else if(dest.data === "pvp") {
                        		if(self.app.guestPlay){
                                    self.updatePlayerCheckpoint();
                                    self.app.guestConvert = true;
                                    self.app.hideWindows();
                                    self.app.toggleScrollContent('joinidnet');

                                    self.showNotification("You need to create an account first");
                                    self.unregisterEntityPosition(self.player);
                                    self.registerEntityPosition(self.player);
                                    return;
                                } else {
                                	var arenaCost = Types.getArenaCost(Types.Currencies.CRYSTALS);
                                	if (self.player.remortPoints < arenaCost) {
                                		self.showNotification("You need at least 100 crystals to participate in battles");
                                        self.unregisterEntityPosition(self.player);
                                        self.registerEntityPosition(self.player);
                                        return;
                                	} else {
                                		self.showNotification("You spend "+arenaCost+"/"+self.player.remortPoints+" crystals to enter");
                                        self.client.sendArenaPurchase(1, Types.Currencies.CRYSTALS);
                                		self.player.arenaPvp = true;
                                	}
                                }
                        	} else if(dest.data === "leaveArena") {
                        		this.healthPotionSpawn = true;
                        		self.player.arenaPvp = false;
                        		self.client.sendLeaveArena();
                        		
                        	} else if(dest.data === "unsetpvp") {
                        		self.pvpFlag = false;
                                self.player.pvpFlag = false;
                                $('#pvp-overlay').hide();
                        	} else if(dest.data === "setpvp") {
                        		self.pvpFlag = true;
                                self.player.pvpFlag = true;
                                
                                if(!self.renderer.mobile && !self.renderer.tablet){
                                    $('#pvp-overlay').show();
                                    self.client.getLeader();
                                }
                        	}
                        }
                        
                        // door that needs item
                        if (dest.keyitem !== null && dest.keyitem !== 0) {
                            /*if (!self.inventoryContains(dest.keyitem,1)) {
                                self.showNotification("You need a " + Types.getKindAsString(dest.keyitem)+ " to use this door");
                                self.unregisterEntityPosition(self.player);
                                self.registerEntityPosition(self.player);
                                return;
                            }*/
                        }
                        
                        // door to other map
                        if (dest.map){
                            self.client.sendUseDoorToMap(dest.map,dest.x,dest.y);
                            return;
                        }
						if(dest.key && dest.key !== 0){
							if(dest.key.toString().indexOf(",") === -1){
								if(!self.player.getInventory().hasKey(dest.key)){
									self.showNotification("You try to enter but it seems locked");
                                    self.unregisterEntityPosition(self.player);
                                    self.registerEntityPosition(self.player);
									return;
								}
							}else{
								var keys = dest.key.split(',');
								for(var j = 0; j < keys.length; j++){
									if(!self.player.getInventory().hasKey(keys[j])){
										self.showNotification("You try to enter but it seems locked");
                                        self.unregisterEntityPosition(self.player);
                                        self.registerEntityPosition(self.player);
										return;
									}
								}
							}
						}
                            
                         // call guest prompt
						//TODO call this somehwere to ask guests to save their account
						/*
                           if(self.app.guestPlay && dest.x == 76 && dest.y == 77){
                               self.updatePlayerCheckpoint();
                               self.app.guestConvert = true;
                               self.app.hideWindows();
                               self.app.toggleScrollContent('joinidnet');
                           }
						*/

                        self.player.setGridPosition(dest.x, dest.y);
                        self.player.nextGridX = dest.x;
                        self.player.nextGridY = dest.y;
                        self.player.turnTo(dest.orientation);
                        self.client.sendTeleport(dest.x, dest.y);

                        self.camera.focusEntity(self.player);
                        self.resetZone();

                        self.player.forEachAttacker(function(attacker) {
                            attacker.disengage();
                            attacker.idle();
                            self.client.sendRetreat(attacker);
                        });

                        self.updatePlateauMode();
							
						// force everything to redraw
						self.renderer.clearScreen(self.renderer.context);
						self.forEachVisibleEntityByDepth(function(entity) {
							entity.setDirty();
						});

                        if(dest.portal) {
                            self.audioManager.playSound("teleport");
                        }

                        if(!self.player.isDead) {
                            self.audioManager.updateMusic();
                        }
                    }
					// NPC auto talk, only works once
					if(!self.AutoNpc){
						var dialog = self.playerDialogArea();
						if(dialog && dialog.auto){
							self.entities.forEachEntity(function(entity){
								if(entity instanceof Npc){
									if(dialog.contains(entity)){
										self.makeNpcTalk(entity);
										self.AutoNpc = true;
									}
								}
							});
						}
					}
                    if(self.player.target instanceof Npc) {
                        self.makeNpcTalk(self.player.target);
                    } else if(self.player.target instanceof Chest) {
                        self.client.sendOpen(self.player.target);
                        self.audioManager.playSound("chest");
                    } else if(self.player.target instanceof Lever) {
						if(self.player.target.isSwitching === false){
							self.player.target.isSwitching = true;
							self.client.sendSwitch(self.player.target);
						}
                    } else if(self.player.target instanceof Trap) {
                        self.client.sendActivate(self.player.target);
                        self.makeCharacterGoTo(self.player, self.player.target.gridX, self.player.target.gridY);
                    }

                    self.player.forEachAttacker(function(attacker) {
                        if(!attacker.isAdjacentNonDiagonal(self.player)) {
                            attacker.follow(self.player);
                        }
                    });

                    self.unregisterEntityPosition(self.player);
                    self.registerEntityPosition(self.player);
                });

                self.client.onInventory(function (inventory) {
                    self.player.loadInventory(inventory);
                    self.hotbar.updateHotbar();
                    self.keyList.updateKeylist(self.player.getInventory().getKeys());
                });

                self.player.onRequestPath(function(x, y) {
                    var ignored = [self.player]; // Always ignore self

                    if(self.player.hasTarget()) {
                        ignored.push(self.player.target);
                    }
                    return self.findPath(self.player, x, y, ignored);
                });

                self.player.onDeath(function() {
                    log.info(self.playerId + " is dead");
					self.player.invincible = false;
                    self.player.stopBlinking();
                    self.player.setSprite(self.sprites["death"]);
                    self.player.animate("death", 120, 1, function() {
                        log.info(self.playerId + " was removed");

                        self.removeEntity(self.player);
                        self.removeFromRenderingGrid(self.player, self.player.gridX, self.player.gridY);

                        self.player = null;
                        self.client.disable();

                        setTimeout(function() {
                            self.playerdeath_callback();
                        }, 1000);
                    });

                    self.player.forEachAttacker(function(attacker) {
                        attacker.disengage();
                        attacker.idle();
                    });
                    //
                    //self.player.forEachRangeAttacker(function(attacker) {
                    //    attacker.rangedTarget = null;
                    //});

                    self.audioManager.fadeOutCurrentMusic();
                    self.audioManager.playSound("death");
                });

                self.player.onHasMoved(function(player) {
                    self.assignBubbleTo(player);
                });
                self.client.onPVPChange(function(pvpFlag){
                    self.player.flagPVP(pvpFlag);
                    if(pvpFlag){
                        self.showNotification("PVP is on.");
                    } else{
                        self.showNotification("PVP is off.");
                    }
                });

                self.player.onArmorLoot(function(armorName) {
                    self.player.switchArmor(self.sprites[armorName]);
                });

                self.player.onSwitchItem(function() {
					if(self.player){
						self.storage.savePlayer(self.renderer.getPlayerImage(),
                                            self.player.getArmorName(),
                                            self.player.getEquippedWeaponName(),
                                            self.player.getGuild());
					}
                    if(self.equipment_callback) {
                        self.equipment_callback();
                    }
                    self.hotbar.updateWeaponIcon();
                });
                
                self.player.onSwitchRing(function(ringName) {
                	
                });
                
                self.client.onReload(function(username) {
                    self.app.reloadPage();
                    log.info("RELOAD");
                });

                self.client.onDebugMsg(function(msg){
                    self.showNotification(msg);
                });

                self.client.onWpUpdate(function(id){
                    self.waypointList.unlockWayPoint(id);
                });

                self.client.onProfile(function(name, armor, weapon, exp, shield, amulet, ring, hp, mhp, mp, mmp, pid, crystalls, remortExp, friendMainName, friendAccAvatar) {
                    log.info(name+' '+armor+' '+weapon+' '+shield+' '+amulet+' '+ring+' '+exp+' '+pid);
                    var inspected = new Warrior("player", name);
                    inspected.level = Types.getLevel(exp);
                    inspected.experience = exp;
                    inspected.remortPoints = crystalls;
                    inspected.maxHitPoints = mhp;
                    inspected.hitPoints = hp;
                    inspected.maxManaPoints = mmp;
                    inspected.manaPoints = mp;
                    inspected.remortExp = remortExp;
                    inspected.friendMainName = friendMainName;
                    inspected.friendAccAvatar = friendAccAvatar;
                    inspected.setArmorName(weapon);
                    inspected.sprite = new Sprite(armor, 1, self.cdn, self.version);
                    inspected.setWeaponName(weapon);
                    inspected.setRingName(ring);
                    inspected.setAmuletName(amulet);
                    inspected.setShieldName(shield);

                    self.updatePlayerPage(inspected, true);
                    self.app.hideWindows();
                    //self.client.getLeaderboards();
                    $('#profile_menu').toggleClass('active');
                });

                self.client.onUpdateFriends(function(friends) {
                    self.player.friends = friends;
                    var friendsNum = 0;
                    
                    $("#friendslist").empty();
					for (var pid in friends) {
						var p = friends[pid];
						if(p.p){ // pending
							$("#friendslist").append('<div class="friendsitem" id="'+pid+'"><span>'+p.ni+'</span><span> <a href="#" class="ignorefriend clickable">Ignore</a> <a href="#" class="acceptfriend clickable">Accept</a></span></div>');
						}else if(p.o){ // online
							friendsNum++;
							$("#friendslist").append('<div class="friendsitem" id="'+pid+'"><img src="'+p.t+'" width="20" height="20"><span>'+p.ni+'</span><br>\
							<span><img src="/img/common/online-icon.png" width="20" height="20"><a href="#" class="profile clickable" id="'+p.n+'" >'+p.n+'</a></span> <span><a href="#" class="pm clickable" id="'+p.n+'">Message</a></span></div>');
						}else if(p.n){ // offline
							$("#friendslist").append('<div class="friendsitem" id="'+pid+'"><img src="'+p.t+'" width="20" height="20"><span>'+p.ni+'</span><br>\
							<span>'+p.n+'</span></div>');
						}else{ // friend but not joined
							$("#friendslist").append('<div class="friendsitem" id="'+pid+'"><img src="'+p.t+'" width="20" height="20"><span>'+p.ni+'</span></div>');
						}
                    }
					
					var friendsBonus = Types.getXPBonus(friendsNum);
					self.player.friendsBonus = friendsBonus;
					$("#friendslist").prepend('<div class="friendsitem pxadvert">You have '+friendsNum+' id.net friends online<br>That gives you '+Math.round((friendsBonus - 1)*100)+'% EXP bonus</div>');
                });
                
                self.client.onDetail(function(id, level, hp, mhp) {
                    var target = self.getEntityById(id);
                    if(typeof target !== 'undefined'){
                        target.level = level;
                        target.hitPoints = hp;
                        target.maxHitPoints = mhp;
                        self.player.showTarget(target);
                        self.updateTarget2(target);
                    }
                });

                self.client.onSpawnItem(function(item, x, y) {
                    if(self.client.debugMessages){
                        log.info("Spawned " + Types.getKindAsString(item.kind) + " (" + item.id + ") at "+x+", "+y);
                    }
                    if(item.kind === Types.Entities.LOCKEDDOOR){
                        self.addItem(item, x, y);
                        self.addToPathingGrid(x, y);
                        var direction = self.map._getLockedDoorDirection(x, y);
                        item.setDirection(direction);
                    }else{
                        self.addItem(item, x, y);
                    }
                    
                    if(item.kind === Types.Entities.ROCKWALL){
                        item.onSmash(function(){
                            item.stopBlinking();
                            item.setSprite(self.sprites["death"]);
                            item.setAnimation("death", 120, 1, function() {
                                log.info(item.id + " was removed");
                                self.removeEntity(item);
                                self.removeFromRenderingGrid(item, item.gridX, item.gridY);
                            });
                        });
                        // enforce no (wall) collision on rockwall location
                        self.map.grid[y][x] = 0;
                    }
                    
                    if(item.kind === Types.Entities.HIDDENWALL){
                        item.onSmash(function(){
                            item.stopBlinking();
                            item.setSprite(self.sprites["death"]);
                            item.setAnimation("death", 120, 1, function() {
                                self.removeEntity(item);
                                self.removeFromRenderingGrid(item, item.gridX, item.gridY);
                            });
                            
                            // uncollide
                            self.map.grid[item.gridY][item.gridX] = 0;
                            
                            // bring out any hidden tiles in 3x3 area over this hiddenwall entity
                            
                            for (var oy=-1;oy<=1;oy++){
                                for (var ox=-1;ox<=1;ox++){
                                    var pos = { x: item.gridX+ox, y:item.gridY+oy };
                                    
                                    // hidden tile data avail here?
                                    var htgid = self.map.getHiddenTile(pos.x,pos.y);
                                    if (htgid !== null) {
                                    
                                        var tile = self.map.data[self.map.width*pos.y+pos.x];
                                        if (tile instanceof Array){
                                            tile.push(htgid);
                                        } else {
                                            tile = [tile,htgid];
                                        }
                                    
                                    }
                                    
                                }
                            }
                            
                            self.renderer.renderStaticCanvases();
                            
                            
                        });

                        // make collision tile, we will remove on smash
                        self.map.grid[y][x] = 1;
                        
                        // remove any hidden tiles in 3x3 area over this hiddenwall entity on spawn if present
                        for (var oy=-1;oy<=1;oy++){
                            for (var ox=-1;ox<=1;ox++){
                                var pos = { x: x+ox, y:y+oy };
                                
                                // hidden tile data avail here?
                                var htgid = self.map.getHiddenTile(pos.x,pos.y);
                                    if (htgid !== null) {
                                    
                                    var tile = self.map.data[self.map.width*pos.y+pos.x];
                                    if (tile instanceof Array){
                                        // top tile from hidden tiles? remove it
                                        if (tile[tile.length-1] === htgid){
                                            tile.pop();
                                        }
                                    }
                                
                                }
                                
                            }
                        }
                        
                        self.renderer.renderStaticCanvases();
                        
                    }
                    
                    if(item.kind === Types.Entities.LITBOMB){
                        self.audioManager.playSound("placebomb");
                        item.onExplode(function(){
                            item.stopBlinking();
                            item.setSprite(self.sprites["explosion"]);

                            if (item.owner === self.player.id) {
                                // our bomb - check for collateral damage to mobs
                                // then send a hit msg to server where dmg is applied
                                self.detectCollateral(item.gridX,item.gridY,1,item.kind);
                            } else {
                                // other players bomb
                                // check for damage to us if in PVP area
                                if (self.pvpFlag){
                                    if (self.player.gridX >= item.gridX - 1) {
                                        if (self.player.gridX <= item.gridX + 1) {
                                            if (self.player.gridY >= item.gridY - 1) {
                                                if (self.player.gridY <= item.gridY + 1) {
                                                    // in range
                                                    self.client.sendHitWorldProjectile(Types.Entities.LITBOMB,item.owner);
                                                }                                    
                                            }                                        
                                        }                                    
                                    }
                                }
                            }
                            
                            item.setAnimation("explosion", 120, 1, function() {
                                log.info(item.id + " was removed");
                                self.removeEntity(item);
                                self.removeFromRenderingGrid(item, item.gridX, item.gridY);
                            });
                        });
                    }
                    
                });

                self.client.onSpawnChest(function(chest, x, y) {
                    if(self.client.debugMessages){
                        log.info("Spawned chest (" + chest.id + ") at "+x+", "+y);
                    }
                    chest.setSprite(self.sprites[chest.getSpriteName()]);
                    chest.setGridPosition(x, y);
                    chest.setAnimation("idle_down", 150);
                    self.addEntity(chest, x, y);

                    chest.onOpen(function() {
                        chest.stopBlinking();
                        chest.setSprite(self.sprites["death"]);
                        chest.setAnimation("death", 120, 1, function() {
                            log.info(chest.id + " was removed");
                            self.removeEntity(chest);
                            self.removeFromRenderingGrid(chest, chest.gridX, chest.gridY);
                            self.previousClickPosition = {};
                        });
                    });
                });
                
                self.client.onSpawnTrap(function(trap, x, y) {
                    if(self.client.debugMessages){
                        log.info("Spawned trap (" + trap.id + ") at "+x+", "+y);
                    }
                    trap.setSprite(self.sprites[trap.getSpriteName()]);
                    trap.setGridPosition(x, y);
                    trap.setAnimation("idle", 150);
                    trap.onActivate(function() {
                        trap.stopBlinking();
                        trap.setAnimation("explosion", 120, 1, function() {
                            self.removeEntity(trap);
                            self.removeFromRenderingGrid(trap, trap.gridX, trap.gridY);
                            self.previousClickPosition = {};
                        });
                    });
                    
                    self.addEntity(trap, x, y);
                });

                self.client.onSpawnCharacter(function(entity, x, y, orientation, targetId) {
                    if(!self.entityIdExists(entity.id)) {
                        try {
                            if(entity.id !== self.playerId){
                                entity.setSprite(self.sprites[entity.getSpriteName()]);
                                entity.setGridPosition(x, y);
                                entity.setOrientation(orientation);
                                entity.idle();

                                self.addEntity(entity);
                                
                                if(self.client.debugMessages){
                                    log.debug("Spawned " + Types.getKindAsString(entity.kind) + " (" + entity.id + ") at "+entity.gridX+", "+entity.gridY);
                                }

                                if(entity instanceof Character) {
                                    entity.onBeforeStep(function() {
                                        self.unregisterEntityPosition(entity);
                                    });

                                    entity.onStep(function() {
                                    	if(!entity.isDying) {
                                            self.registerEntityDualPosition(entity);

                                            if (self.player !== null) {
                                                if(self.player.target === entity) {
                                                    self.makeAttackerFollow(self.player);
                                                }
                                                
                                                if((self.player.target && self.player.target.id === entity.id) || (self.player.inspecting && self.player.inspecting.id === entity.id)) {
                                                	if(self.updatetarget_callback) {
                                                		self.updatetarget_callback(entity);
                                                	}
                                                }
                                            }

                                            entity.forEachAttacker(function(attacker) {
                                                if(attacker.isAdjacent(attacker.target)) {
                                                    attacker.lookAtTarget();
                                                } else {
                                                    attacker.follow(entity);
                                                }
                                            });
                                        }
                                    });

                                    entity.onStopPathing(function(x, y) {
                                        if(!entity.isDying) {
                                            /*if(entity.hasTarget() && entity.canReachTarget())*/ {
                                                entity.lookAtTarget();
                                            }

                                            // presumeably other players
                                            if(entity instanceof Player) {
                                                var gridX = entity.destination.gridX,
                                                    gridY = entity.destination.gridY;

                                                if(self.map.isDoor(gridX, gridY)) {
                                                    var dest = self.map.getDoorDestination(gridX, gridY);
                                                    entity.setGridPosition(dest.x, dest.y);
                                                }
                                            }

                                            entity.forEachAttacker(function(attacker) {
                                                if(!attacker.isAdjacentNonDiagonal(entity) && attacker.id !== self.playerId) {
                                                    attacker.follow(entity);
                                                }
                                            });

                                            self.unregisterEntityPosition(entity);
                                            self.registerEntityPosition(entity);
                                        }
                                    });

                                    entity.onRequestPath(function(x, y) {
                                        var ignored = [entity], // Always ignore self
                                            ignoreTarget = function(target) {
                                                ignored.push(target);

                                                // also ignore other attackers of the target entity
                                                target.forEachAttacker(function(attacker) {
                                                    ignored.push(attacker);
                                                });
                                            };
											
										//if(entity && entity.rangedTarget) {
										//	ignoreTarget(entity.rangedTarget);
										//}

                                        if(entity.hasTarget()) {
                                            ignoreTarget(entity.target);
                                        } else if(entity.previousTarget) {
                                            // If repositioning before attacking again, ignore previous target
                                            // See: tryMovingToADifferentTile()
                                            ignoreTarget(entity.previousTarget);
                                        }

                                        return self.findPath(entity, x, y, ignored);
                                    });

                                    entity.onDeath(function() {
                                        log.info(entity.id + " is dead");

                                        if(entity instanceof Mob) {
                                            // Keep track of where mobs die in order to spawn their dropped items
                                            // at the right position later.
                                            self.deathpositions[entity.id] = {x: entity.gridX, y: entity.gridY};
                                        }

                                        entity.isDying = true;
                                        entity.setSprite(self.sprites[/*entity instanceof Mobs.Rat ? "rat" : */"death"]);
                                        entity.animate("death", 120, 1, function() {
                                            log.info(entity.id + " was removed");

                                            self.removeEntity(entity);
                                            self.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);
                                        });

                                        entity.forEachAttacker(function(attacker) {
                                            attacker.disengage();
                                        });

                                        if(self.player.target && self.player.target.id === entity.id) {
                                            self.player.disengage();
                                        }
                                        
                                        if((self.player.target && self.player.target.id === entity.id) || (self.player.inspecting && self.player.inspecting.id === entity.id)) {
                                        	if(this.updatetarget_callback) {
                                        		this.updatetarget_callback(entity);
                                        	}
                                        }

                                        // Upon death, this entity is removed from both grids, allowing the player
                                        // to click very fast in order to loot the dropped item and not be blocked.
                                        // The entity is completely removed only after the death animation has ended.
                                        self.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
                                        self.removeFromPathingGrid(entity.gridX, entity.gridY);

                                        if(self.camera.isVisible(entity)) {
                                            self.audioManager.playSound("kill"+Math.floor(Math.random()*2+1));
                                        }

                                        self.updateCursor();
                                    });

                                    entity.onHasMoved(function(entity) {
                                        self.assignBubbleTo(entity); // Make chat bubbles follow moving entities
                                    });

                                    if(entity instanceof Mob) {
                                        if(targetId) {
                                            var player = self.getEntityById(targetId);
                                            if(player) {
                                                self.createAttackLink(entity, player);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        catch(e) {
                            log.error(e);
                        }
                    } else {
                        log.debug("Character "+entity.id+" already exists. Don't respawn. kinde: "+entity.kind+" name: "+entity.name+" X: "+entity.gridX+" Y: "+entity.gridY);
                    }
                });

                self.client.onDespawnEntity(function(entityId) {
                    var entity = self.getEntityById(entityId);

                    if(entity) {
                        log.info("Despawning " + Types.getKindAsString(entity.kind) + " (" + entity.id+ ")");

                        if(entity.gridX === self.previousClickPosition.x && entity.gridY === self.previousClickPosition.y) {
                            self.previousClickPosition = {};
                        }

                        if(self.isItemInstance(entity)) {
                            self.removeItem(entity);
                        } else if (entity instanceof LitBomb) {
                            entity.explode();
                            self.audioManager.playSound("death");
                        } else if (entity instanceof RockWall || entity instanceof HiddenWall) {
                            entity.smash();
                        } else if(entity instanceof Character) {
                            entity.forEachAttacker(function(attacker) {
                                if(attacker.canReachTarget()) {
                                    attacker.hit(self.game.client);
                                }
                            });
                            entity.die();
                        } else if(entity instanceof Chest) {
                            entity.open();
                        } else if(entity instanceof Trap) {
                            entity.activate();
                            log.debug("activate trap");
                        }

                        entity.clean();
                    }
                });

                self.client.onItemBlink(function(id) {
                    var item = self.getEntityById(id);

                    if(item) {
                        item.blink(150);
                    }
                });
                
                self.client.onGuildError(function(errorType, info) {
                    if(errorType === Types.Messages.GUILDERRORTYPE.BADNAME){
                        self.showNotification(info + " seems to be an inappropriate guild name…");
                    }
                    else if(errorType === Types.Messages.GUILDERRORTYPE.ALREADYEXISTS){
                        self.showNotification(info + " already exists…");
                        setTimeout(function(){self.showNotification("Either change the name of YOUR guild");},2500);
                        setTimeout(function(){self.showNotification("Or ask a member of " + info + " if you can join them.");},5000);
                    }
                    else if(errorType === Types.Messages.GUILDERRORTYPE.IDWARNING){
                        self.showNotification("WARNING: the server was rebooted.");
                        setTimeout(function(){self.showNotification(info + " has changed ID.");},2500);
                    }
                    else if(errorType === Types.Messages.GUILDERRORTYPE.BADINVITE){
                        self.showNotification(info+" is ALREADY a member of “"+self.player.getGuild().name+"”");
                    }
                });
                
                self.client.onGuildCreate(function(guildId, guildName) {
                    self.player.setGuild(new Guild(guildId, guildName));
                    self.storage.setPlayerGuild(self.player.getGuild());
                    self.showNotification("You successfully created and joined…");
                    setTimeout(function(){self.showNotification("…" + self.player.getGuild().name);},2500);
                });
                
                self.client.onGuildInvite(function(guildId, guildName, invitorName) {
                    self.showNotification(invitorName + " invited you to join “"+guildName+"”.");
                    self.player.addInvite(guildId);
                    setTimeout(function(){$("#chatinput").attr("placeholder", "Do you want to join "+guildName+" ? Type /guild accept yes or /guild accept no");
                    self.app.showChat();},2500);
                });
                
                self.client.onGuildJoin(function(playerName, id, guildId, guildName) {
                    if(typeof id === "undefined"){
                        self.showNotification(playerName + " failed to answer to your invitation in time.");
                        setTimeout(function(){self.showNotification("Might have to send another invite…");},2500);
                    }
                    else if(id === false){
                        self.showNotification(playerName + " respectfully declined your offer…");
                        setTimeout(function(){self.showNotification("…to join “"+self.player.getGuild().name+"”.");},2500);
                    }
                    else if(id === self.player.id){
                        self.player.setGuild(new Guild(guildId, guildName));
                        self.storage.setPlayerGuild(self.player.getGuild());
                        self.showNotification("You just joined “"+guildName+"”.");
                    }
                    else{
                        self.showNotification(playerName+" is now a jolly member of “"+guildName+"”.");//#updateguild
                    }
                });
                
                self.client.onGuildLeave(function(name, playerId, guildName) {
                    if(self.player.id===playerId){
                        if(self.player.hasGuild()){
                            if(self.player.getGuild().name === guildName){//do not erase new guild on create
                                self.player.unsetGuild();
                                self.storage.setPlayerGuild();
                                self.showNotification("You successfully left “"+guildName+"”.");
                            }
                        }
                        //missing elses above should not happen (errors)
                    }
                    else{
                        self.showNotification(name + " has left “"+guildName+"”.");//#updateguild
                    }
                });
                
                self.client.onGuildTalk(function(name, id, message) {
                    if(id===self.player.id){
                        self.showNotification("YOU: "+message);
                    }
                    else{
                        self.showNotification(name+": "+message);
                    }
                });

                self.client.onMemberConnect(function(name) {
                    self.showNotification(name + " connected to your world.");//#updateguild
                });
                
                self.client.onMemberDisconnect(function(name) {
                    self.showNotification(name + " lost connection with your world.");
                });
                
                self.client.onReceiveGuildMembers(function(memberNames) {
                    self.showNotification(memberNames.join(", ") + ((memberNames.length===1) ? " is " : " are ") +"currently online.");//#updateguild
                });
                
                // define handler for projectile announcement from server
                self.client.onProject(function(data,isWithEntities) {
                
				
					if (isWithEntities) {
						// entity id (source, target) based projection
						// e.g mob to player

						//var id = data[1];
						//var projectiletype = Types.Projectiles.MOB6ARROW; // todo lookup from mob
						//
						//var mobId = data[2];
						//var targetId = data[3];
						//
                        var id = data[1];
						var mob = self.getEntityById(data[2]);
						var target = self.getEntityById(data[3]);
						//
						//var sx = mob.x+8,
						//sy = mob.y+8,
						//x = target.x+8,
						//y = target.y+8,
						//owner = mobId;
                        var projectile = CustomProjectile.getProjectile(id, self.sprites, self.audioManager, mob, target);
                        projectile.onImpactCompleted(function(projectile) {
                            self.removeProjectile(projectile);
                        });
                        self.addProjectile(projectile);


                        //self.createProjectile(id,projectiletype,sx,sy,x,y,owner,targetId);
						
					} else {
						// absolute coord based projection
						// e.g. map emitter, player cast to ground
						var id = data[1],
						projectiletype = data[2],
						sx = data[3],
						sy = data[4],
						x = data[5],
						y = data[6],
						owner = data[7],
						target = null;

                        self.createProjectile(id,projectiletype,sx,sy,x,y,owner);
					}
                });							

                self.client.onEntityMove(function(id, x, y) {
                    var entity = null;

                    if(id !== self.playerId) {
                        entity = self.getEntityById(id);

                        if(entity) {
                            entity.disengage();
                            entity.idle();
                            self.makeCharacterGoTo(entity, x, y);
                        }
                    }
                });

                self.client.onEntityDestroy(function(id) {
                    var entity = self.getEntityById(id);
                    if(entity) {
                        if(self.isItemInstance(entity)) {
                            self.removeItem(entity);
                        } else {
                            self.removeEntity(entity);
                        }
                        log.debug("Entity was destroyed: "+entity.id);
                    }
                });
                
                 // general purpose single stat value update from server
                self.client.onReceiveStat(function(pushStat,value) {
                
                    if (pushStat === Types.PushStats.CRYSTALS) {
                        self.player.remortPoints = parseInt(value);
                        $("#label_crystals").text(self.player.remortPoints);
                        $('#char-remortPoints').text('Crystals: '+self.player.remortPoints);
                    }
                    
                });                

                self.client.onPlayerMoveToItem(function(playerId, itemId) {
                    var player, item;

                    if(playerId !== self.playerId) {
                        player = self.getEntityById(playerId);
                        item = self.getEntityById(itemId);

                        if(player && item) {
                            self.makeCharacterGoTo(player, item.gridX, item.gridY);
                        }
                    }
                });

                self.client.onEntityAttack(function(attackerId, targetId) {
                    var attacker = self.getEntityById(attackerId),
                        target = self.getEntityById(targetId);

                    if(attacker && target && attacker.id !== self.playerId) {
                        log.debug(attacker.id + " attacks " + target.id);

                        if(attacker && target instanceof Player && target.id !== self.playerId && target.target && target.target.id === attacker.id && attacker.getDistanceToEntity(target) < 3) { console.log('atack');
                            setTimeout(function() {
                                self.createAttackLink(attacker, target);
                            }, 200); // delay to prevent other players attacking mobs from ending up on the same tile as they walk towards each other.
                        } else {
                            self.createAttackLink(attacker, target);
                        }
                    }
                });
                //
                //self.client.onRangedTargetChanged(function(attackerId, targetId) {
                //    var attacker = self.getEntityById(attackerId),
                //        target = self.getEntityById(targetId);
                //
                //    if(attacker && target) {
                //        log.debug(attacker.id + " range attacks " + target.id);
					//
					//	attacker.rangedTarget = target;
                //        attacker.moveSpeed = attacker.agroMoveSpeed;
                //        attacker.walkSpeed = attacker.aggroRunAnimSpeed;
                //        target.addRangedAttacker(attacker);
					//
					//	// face target
					//	attacker.turnTo(attacker.getOrientationTo(target));
					//
					//	// client will raise requests to server for projectiles in updater loop
					//
                //    }
					//
                //});

                self.client.onPlayerDamageMob(function(mobId, points, hitPoints, maxHp) {
                    var mob = self.getEntityById(mobId);
                    mob.onTakeDamageEvent(self.player);
                    if(mob && points) {
                        self.infoManager.addDamageInfo(points, mob.x, mob.y - 15, "inflicted");
                    }
                    if(self.player.hasTarget()){
                        self.updateTarget(mobId, points, hitPoints, maxHp);
                    }
                });

                self.client.onPlayerKillMob(function(kind, level, exp) {
                    var levelledUp = (self.player.level < level);
					var mobExp = MobList.getMobExp(kind);
					var mobLevel = MobList.getMobLevel(kind);
					
					// exp less for easy monsters					
					// coef for level difference to calcul xp
					if(mobLevel <= self.player.level)
					{
						var CoefMob = 1;
						var CoefPlayer = self.player.level - mobLevel + 1;
					}
					else 
					{
						var CoefMob = mobLevel - self.player.level + 1;
						var CoefPlayer = 1;
					}
					
                    var playerExp = (mobExp / CoefPlayer) * CoefMob;
					var mobExp = Math.round(playerExp * self.player.friendsBonus);
                    
                    self.updateExp(mobExp, exp, level);
                    
                    var mobName = Types.getKindAsString(kind);

                    if(mobName === 'skeleton2') {
                        mobName = 'greater skeleton';
                    }

                    if(mobName === 'eye') {
                        mobName = 'evil eye';
                    }

                    if(mobName === 'deathknight') {
                        mobName = 'death knight';
                    }

                    if(mobName === 'boss') {
                        self.showNotification("You killed the skeleton king");
                    }
                });
                
                self.client.onExp(function(level, exp){                    
                    var expDiff = exp - self.player.experience;
                    self.player.level = level;
                    self.player.experience = exp;
                    
                    self.updateExp(expDiff, exp, level);
                });
                
                self.client.onPVPKill(function(kills){                    
                    $('#kill-count').text('You '+kills);
                });
                
                self.client.onPVPLeader(function(name1, score1, name2, score2, name3, score3){
                    $('#leader-count1').text(name1+' '+score1);
                    if(name2){  $('#leader-count2').text(name2+' '+score2); }
                    if(name3){  $('#leader-count3').text(name3+' '+score3); }
                });

                self.client.onPlayerChangeHealth(function(points, isRegen) {
                    var player = self.player,
                        diff,
                        isHurt;

                    if(player && !player.isDead && !player.invincible) {
                        isHurt = points <= player.hitPoints;
                        diff = points - player.hitPoints;
						if(points < 0){
							player.hitPoints = 0;
						}else{
							player.hitPoints = points;
						}

                        if(player.hitPoints <= 0) {
                            player.die();
							ga('send', 'event', 'update', 'player', 'death');
                        }
                        if(isHurt) {
                            player.hurt();
                            self.infoManager.addDamageInfo(diff, player.x, player.y - 15, "received");
                            self.audioManager.playSound("hurt");
                            //self.storage.addDamage(-diff);
                            //self.tryUnlockingAchievement("MEATSHIELD");
                            if(self.playerhurt_callback) {
                                self.playerhurt_callback();
                            }
                        } else if(!isRegen){
                            self.infoManager.addDamageInfo("+"+diff, player.x, player.y - 15, "healed");
                        }
                        self.updateGlobes();
                    }
                });
                
                self.client.onPlayerChangeMana(function(points, isRegen) {
                    self.player.manaPoints = points;
                    self.updateGlobes();
                });

                self.client.onPlayerChangeMaxHitPoints(function(hp) {
                    self.player.maxHitPoints = hp;
                    self.player.hitPoints = hp;
					self.updateGlobes();
                });
                
                self.client.onPlayerChangeMaxManaPoints(function(mp) {
                    self.player.maxManaPoints = mp;
                    self.player.manaPoints = mp;
					self.updateGlobes();
                });                

                self.client.onPlayerEquipItem(function(playerId, itemKind) {
                    var player = self.getEntityById(playerId),
                        itemName = Types.getKindAsString(itemKind);
                    log.info("onPlayerEquipItem "+itemName);

                    if(player) {
                        if(Types.isArmor(itemKind)) {
							player.setSprite(self.sprites[itemName]);
							/* change the hulk potion to speed potion (test)
                            if(itemName == 'hulk'){
                                //player.invincible = true;
                                // show notification if it's us
								player.moveSpeed = player.moveSpeed*60/100;
								player.walkSpeed = player.walkSpeed*60/100;
                                if (playerId == self.playerId) {
                                    self.showNotification("You run like the wind!");
                                }
                            }else{
                                //player.invincible = false;
								player.moveSpeed = player.moveSpeed*100/60;
								player.walkSpeed = player.walkSpeed*100/60;
								player.setSprite(self.sprites[itemName]);
                            }     
							*/
							
                        } else if(Types.isWeapon(itemKind)) {
                            player.setWeaponName(itemName);
                            self.hotbar.updateWeaponIcon();
                        } else if(Types.isShield(itemKind)) {
                            player.setShieldName(itemName);
                        } else if(Types.isRing(itemKind)) {
                            player.setRingName(itemName);
                        } else if(Types.isAmulet(itemKind)) {
                            player.setAmuletName(itemName);
                        } else {
                        	log.info("ERROR: try to equip unknown item");
                        }
                    }
                });

                self.client.onPlayerTeleport(function(id, x, y) {
                    var entity = null,
                        currentOrientation;

                    if(id !== self.playerId) {
                        entity = self.getEntityById(id);

                        if(entity) {
                            currentOrientation = entity.orientation;

                            self.makeCharacterTeleportTo(entity, x, y);
                            entity.setOrientation(currentOrientation);

                            entity.forEachAttacker(function(attacker) {
                                attacker.disengage();
                                attacker.idle();
                                attacker.stop();
                            });
                        }
                    }
                });
                
                self.client.onSwitchChange(function(id, state, itemConnect) {
                    var lever = self.getEntityById(id);
                    if(lever){
                        // keep sequence of levers for puzzles
                        var leverArr = self.lastLeverPulled;
                        var connectNum = parseInt(itemConnect);
                        leverArr.unshift(connectNum);
                        leverArr = leverArr.slice(0,5);
                        var door = self.getEntityByItemConnect(lever.itemConnect, Types.Entities.LOCKEDDOOR);
                        self.audioManager.playSound("lever");
                        if(state === 0){ // off
                            lever.setAnimation("idle_down", 150);
                            lever.state = true;
                            // unlock door connected to lever
                            if(door){
                                if(connectNum <= 50){ // non puzzle lever
                                    door.setVisible(false);
                                    self.removeFromPathingGrid(door.gridX, door.gridY);
                                }
                                if(connectNum >= 51 && connectNum <= 55){ // first lever sequence @ dungeon #3
                                    if(leverArr[0] === 51 && leverArr[1] === 52  && leverArr[2] === 53){
                                        door.setVisible(false);
                                        self.removeFromPathingGrid(door.gridX, door.gridY);
                                    }                               
                                }
                                if(connectNum >= 56 && connectNum <= 60){ // first lever sequence @ dungeon #4
                                    if(leverArr[0] === 56 && leverArr[1] === 57  && leverArr[2] === 58){
                                        door.setVisible(false);
                                        self.removeFromPathingGrid(door.gridX, door.gridY);
                                    }                               
                                }
								if(connectNum >= 61 && connectNum <= 65){ // first lever sequence @ dungeon #7
                                    if(leverArr[0] === 61 && leverArr[1] === 62){
                                        door.setVisible(false);
                                        self.removeFromPathingGrid(door.gridX, door.gridY);
                                    }                               
                                }
                            }
                        }else{
                            lever.setAnimation("idle_up", 150);
                            lever.state = false;
                            // lock door connected to lever
                            if(door){
                                door.setVisible(true);
								var blockingEntity = self.getEntityAt(door.gridX, door.gridY);
								if(!blockingEntity){
									self.addToPathingGrid(door.gridX, door.gridY);
								}else{
									self.blockingLever = setInterval(function(){
										if(!self.getEntityAt(door.gridX, door.gridY)){
											clearInterval(self.blockingLever);
											self.addToPathingGrid(door.gridX, door.gridY);
										}
									}, 1000);
								
								}
                            }
                        }
						setTimeout(function(){
							lever.isSwitching = false;
						}, 500);
                    }
                });

                self.client.onDropItem(function(item, mobId) {
                    var pos = self.getDeadMobPosition(mobId);

                    if(pos) {
                        var randX = self.getRandomInt(-2, 2);
                        var randY = self.getRandomInt(-2, 2);
                        var count = 0;
                        // make sure items are not blocked by walls or entity
                        // checkPathingGrid returns true when walkable
                        while(!self.checkPathingGrid(pos.x + randX, pos.y + randY) || self.getEntityAt(pos.x + randX, pos.y + randY)){
                            randX = self.getRandomInt(-2, 2);
                            randY = self.getRandomInt(-2, 2);
                            count++;
							if(count >= 10){
                                randX = 0;
                                randY = 0;
                                break;
                            }
                        }
                        self.addItem(item, pos.x + randX, pos.y + randY);
                        log.info('Item dropped '+item.id);
                        self.updateCursor();
                    }
                });

                self.client.onChatMessage(function(entityId, message) {
                    var entity = self.getEntityById(entityId);
					if(entity && entity.isLoaded){
						if(message.length > 58){
							self.createBubble(entityId, message.substring(0, 58)+'..');
						}else{
							self.createBubble(entityId, message);
						}
						self.assignBubbleTo(entity);
					}
					if(entity){ // this should be changed to get the name from the server
						self.audioManager.playSound("chat");
						self.chat.addChatMessage(entity.name, message);
					}
                });
                
                self.client.onMapChange(function(mapName) {
                
                    // save "local" data to server immediately
                    self.storage.sendToServer();
                    
                    // stop render loop during load
                    self.isStopped = true;
                    
                    self.loadMap(mapName,function(){
                        log.info('onmapchange');
                        self.resetCamera();
                        self.initItemGrid();
                        self.respawn();
                        
                    });
                });

                self.client.onAdminMessage(function(message) {
                    self.chat.addChatMessage('ADMIN', message);
                });
                
                self.client.onPrivateMessage(function(fromId, message, fromName) {
                    self.chat.addPrivateChatMessage(fromName, message);
                    // TODO if in same group show chat bubble
                });
                
                self.client.onGetCheckout(function(url) {
                    self.app.openCheckout(url);
                }); 

                self.client.onPopulationChange(function(worldPlayers, totalPlayers) {
                    if(self.nbplayers_callback) {
                        self.nbplayers_callback(worldPlayers, totalPlayers);
                    }
                });
                
                self.client.onGuildPopulation(function(guildName, guildPopulation) {
                    if(self.nbguildplayers_callback) {
                        self.nbguildplayers_callback(guildName, guildPopulation);
                    }
                });

                self.client.onDisconnected(function(message) {
                    if(self.player) {
                        self.player.die();
                    }
                    if(self.disconnect_callback) {
                        self.disconnect_callback(message);
                    }
                });
                                
                self.client.onArenaWin(function(wins, loserLevel) {
                    log.info("win on arena total"+wins);
                    
                    if(self.player) {
                    	self.player.arenaCrystalWin = wins;
                    	// add crystal reward, show crystal info
                    	var winreward = Types.getWinRevard(self.player.level, loserLevel);
                    	self.player.remortPoints += winreward;
                    	self.infoManager.addDamageInfo("+" + winreward, self.player.x, self.player.y - 15, "crystals", 5000);
                    }
                });
                
                self.client.onArenaSpend(function(spend) {
                    log.info("enter on arena, total spend"+spend);
                    
                    if(self.player) {
                    	self.player.arenaCrystalSpend = spend;
                    }
                });
                
                self.client.onArenaExit(function() {

                	log.info("leave arena");
                	self.healthPotionSpawn = true;
            		
            		if(self.player) {
                    	self.player.arenaPvp = false;
                    }
                });

                self.client.onBuffEnable(function(buff,entityid,owner) {

                
                    var entity = self.getEntityById(entityid);                  
                    if (entity) {
                        entity.buffs[buff] = true;
                        entity.buffowner = entity.buffowner || {};
                        entity.buffowner[buff] = owner;

                        if (buff === Types.Buffs.RABBIT)
                            entity.transform(self.sprites["jelly"]);
                    }
                    
                    log.info("buff enabled "+Types.getBuffTypeAsString(buff));
                });

                self.client.onBuffDisable(function(buff,entityid) {

                    var entity = self.getEntityById(entityid);                  
                    if (entity) {
                        entity.buffs[buff] = false;

                        if (buff === Types.Buffs.RABBIT){
							entity.normalize();
						}
                    }                
                    log.info("buff disabled "+Types.getBuffTypeAsString(buff));
                });
				
				self.client.onSpeed(function(newSpeed) 
				{
					if(self.player) 
					{
						self.player.moveSpeed = newSpeed;
						self.player.walkSpeed = newSpeed;
						self.showNotification("You run like the wind!");
                    }
                    log.info("change player speed to "+newSpeed);
                });
				
				self.client.onSpeedPotion(function(val1,val2) 
				{
					if(self.player) 
					{
						self.player.moveSpeed = self.player.moveSpeed*val1/val2;
						self.player.walkSpeed = self.player.walkSpeed*val1/val2;
						if(val1<val2)
						{							
							self.showNotification("You run like the wind!");
						}
						else
						{
							self.showNotification("You fell tired now!");
						}         
                    }
                    log.info("player use a green potion speed "+newSpeed);
                });
                
                self.client.onDisplace(function(kind,entityid,x,y,seconds) {

                    var mob = self.getEntityById(entityid);                  
                    if (mob) {
                        log.info("displace " + kind + " " + entityid + " " + x + " " + y + " " + seconds);
                        
                        if(!self.map.isOutOfBounds(x, y)) {
                            mob.disengage();
                            mob.idle();                            
                            mob.interrupted = false; // hard stop by killing path
                            mob.movement = new Transition();
                            mob.path = null;
                            mob.newDestination = null;                         
                            self.unregisterEntityPosition(mob);
                            mob.displaceOrigin = { x: mob.x, y: mob.y };
                            mob.displaceSeconds = seconds;
                            mob.setGridPosition(x, y);
                            self.registerEntityPosition(mob);
                            mob.displaceEnds = new Date().getTime() + seconds * 1000;
                            //self.assignBubbleTo(mob);
                        } else {
                            log.debug("Displace out of bounds: "+x+", "+y);
                        }
                        
                    }                

                });                    
            
        },
        // end of registerHandlers
        
        preAuth: function() {
            var self = this;
            if (self.client.connection.connected === false) {
                log.info('preauth waiting for connection...');
                setTimeout(function(){
                    self.preAuth();
                },1000);
                return;
            }
            
            // connected
            self.client.sendMessage([Types.Messages.PREAUTH, self.pid]);
        },
        
        setup: function($bubbleContainer, canvas, background, foreground, input) {
            this.setBubbleManager(new BubbleManager($bubbleContainer));
            this.setRenderer(new Renderer(this, canvas, background, foreground));
                        
            this.setChatInput(input);
            // start loading art
            this.loadSprites();
            
            this.onSpriteLoadProgress(function(loaded,total) {
               // $('#spriteprogress').text('Loaded '+loaded+' / '+total+ ' sprites');
				$('#spriteprogressbar').css('width',parseInt(loaded/total*378)+'px');
				$('#spriteprogressbar').css('display','block');
            });
            
        },

        setStorage: function(storage) {
            this.storage = storage;
            this.storage.game = this;
        },

        setRenderer: function(renderer) {
            this.renderer = renderer;
        },

        setUpdater: function(updater) {
            this.updater = updater;
        },

        setPathfinder: function(pathfinder) {
            this.pathfinder = pathfinder;
        },

        setChatInput: function(element) {
            this.chatinput = element;
        },

        setBubbleManager: function(bubbleManager) {
            this.bubbleManager = bubbleManager;
        },
		
		createProjectile: function(id,projectiletype,sx,sy,x,y,owner,targetId) {
			var self = this;
			var np = new Projectile(id,projectiletype);
			np.setPosition(sx,sy);
			np.setTarget(x,y); // (sets angle)
			np.owner = owner;
			np.targetEntityId = targetId;
			
			if (projectiletype === Types.Projectiles.FIREBALL) {
				np.setSprite(self.sprites["projectile-fireball"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 30;
				self.audioManager.playSound("firecast");
			}
			
			if (projectiletype === Types.Projectiles.ICEBALL) {
				np.setSprite(self.sprites["projectile-iceball"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 30;
				self.audioManager.playSound("icecast");
			}
			
			if (projectiletype === Types.Projectiles.PINEARROW) {
				np.setSprite(self.sprites["projectile-pinearrow"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 30;
				self.audioManager.playSound("arrowshot");
			}
			
			if (projectiletype === Types.Projectiles.MOB6ARROW) {
				np.setSprite(self.sprites["projectile-mob6arrow"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 30;
				self.audioManager.playSound("arrowshot");
			}					

			if (projectiletype === Types.Projectiles.BOULDER) {
				np.setSprite(self.sprites["projectile-boulder"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 5;
				//self.audioManager.playSound("launchboulder");
			}                          
			
			if (projectiletype === Types.Projectiles.HEALBALL1) {
				np.setSprite(self.sprites["projectile-none"]);
				np.setAnimation("travel", 60,0, null);
				np.speed = 16 * 8;
				np.angle = 0; // no vectoring
                np.onImpactCompleted(
                    function(p) { self.player.tryEngageAfterDefenceAction(); });
				self.audioManager.playSound("healcast");
			}
			
			// lavaball has no travel anim, only explosion anim on impact
			if (projectiletype === Types.Projectiles.LAVABALL) {
				np.setSprite(self.sprites["projectile-none"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 50;
				np.angle = 0; // no vectoring 
				//self.audioManager.playSound("lavacast");
			}                    

			if (projectiletype === Types.Projectiles.TORNADO) {
				np.setSprite(self.sprites["projectile-tornado"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 5;
				np.angle = 0; // no vectoring
				//self.audioManager.playSound("tornado");
			}
			
			if (projectiletype === Types.Projectiles.TERROR) {
				np.setSprite(self.sprites["projectile-terror"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 30;
				self.audioManager.playSound("terrorcast");
			}

			if (projectiletype === Types.Projectiles.STUN) {
				np.setSprite(self.sprites["projectile-stun"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 30;
				self.audioManager.playSound("stuncast");
			}
			
			if (projectiletype === Types.Projectiles.POISON) {
				np.setSprite(self.sprites["projectile-poison"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 30;
				self.audioManager.playSound("poisoncast");
			}
			
			if (projectiletype === Types.Projectiles.BLACKHOLE) {
				np.setSprite(self.sprites["projectile-blackhole"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 30;
				self.audioManager.playSound("blackholecast");
			}
			
			if (projectiletype === Types.Projectiles.TRANSFORM) {
				np.setSprite(self.sprites["projectile-transform"]);
				np.setAnimation("travel", 60,0,null);
				np.speed = 16 * 30;
				self.audioManager.playSound("transformcast");
			}
			
			np.visible=true;
			
			np.onImpact(function(p){

				// raise hit msgs for dmg to mobs
				
				var impactPos = {
					x: Math.floor(p.tx/16),
					y: Math.floor(p.ty/16)
				};       
				
				// impact sound
				if (p.kind === Types.Projectiles.FIREBALL) {
					self.audioManager.playSound("fireimpact");
					if (p.owner === self.playerId) {
						self.detectCollateral(impactPos.x,impactPos.y,2,p.kind);
					}
				}
				if (p.kind === Types.Projectiles.HEALBALL1) {
					self.detectHeal(impactPos.x,impactPos.y,0,p.kind);
				}
				if (p.kind === Types.Projectiles.TERROR) {
					self.audioManager.playSound("terrorimpact");
					if (p.owner === self.playerId) {
						self.detectCollateral(impactPos.x,impactPos.y,3,p.kind);
					}
				}
				if (p.kind === Types.Projectiles.STUN) {
					self.audioManager.playSound("stunimpact");
					if (p.owner === self.playerId) {
						self.detectCollateral(impactPos.x,impactPos.y,1,p.kind);
					}
				}
				if (p.kind === Types.Projectiles.POISON) {
					self.audioManager.playSound("poisonimpact");
					if (p.owner === self.playerId) {
						self.detectCollateral(impactPos.x,impactPos.y,0,p.kind);
					}
				}
				if (p.kind === Types.Projectiles.BLACKHOLE) {
					self.audioManager.playSound("blackholeimpact");
					if (p.owner === self.playerId) {
						self.detectCollateral(impactPos.x,impactPos.y,5,p.kind);
					}
				}
				if (p.kind === Types.Projectiles.TRANSFORM) {
					self.audioManager.playSound("transformimpact");
					if (p.owner === self.playerId) {
						self.detectCollateral(impactPos.x,impactPos.y,0,p.kind);
					}
				}                        
				if (p.kind === Types.Projectiles.ICEBALL) {
					self.audioManager.playSound("iceimpact");
					if (p.owner === self.playerId) {
						self.detectCollateral(impactPos.x,impactPos.y,1,p.kind);
					}
				}
				if (p.kind === Types.Projectiles.PINEARROW) {
					//self.audioManager.playSound("arrowimpact");
					if (p.owner === self.playerId) {
						self.detectCollateral(impactPos.x,impactPos.y,0,p.kind);
					}
				}
				
				// detect splash damage to self in range of any emitter, mob fired or PVP explosion
				if (p.owner === 0 || (self.pvpFlag && self.player && p.owner !== self.player.id) || (p.targetEntityId && p.targetEntityId === self.player.id)) {
					var range = 8;//px - assume centered on a tile on impact
					if (self.player) {
						if (self.player.x + 8 >= p.tx - range) {
							if (self.player.x + 8 <= p.tx + range) {
								if (self.player.y + 8 >= p.ty - range) {
									if (self.player.y + 8 <= p.ty + range) {
										self.client.sendHitWorldProjectile(p.kind,p.owner);
									}
								}
							}
						}
					}
				}                        
			
			});

			/*			
			np.rangeMobLogic(function(p){

				var projectileId = p.id;
				self.removeProjectile(p);

				// mob projectile?
				if (projectileId < 0) {

					var mobId = projectileId * -1;
					var mob = self.getEntityById(mobId);

					if (mob && mob.rangedTarget) {

						// still in range?
						var dx = (mob.x - mob.rangedTarget.x);
						var dy = (mob.y - mob.rangedTarget.y);
						var distanceToTarget = Math.sqrt((dx*dx) + (dy*dy)) / 16; // in tiles
						if (distanceToTarget <= mob.projectileRange) {

							self.createProjectile(projectileId,Types.Projectiles.MOB6ARROW,mob.x,mob.y,mob.rangedTarget.x,mob.rangedTarget.y,0);


						} else {

							// out of range
							log.info('mob out of range for repeat fire');

						}

					}

				}

			});
			
			*/
			
			self.addProjectile(np);
					
		},

		
        loadMap: function(mapName,completeCallback) {
            var self = this;
                        
            this.map = new Map(!this.renderer.upscaledRendering, this, mapName);

            this.map.ready(function() {
                self.currentWorld = mapName;
                log.info("Map "+mapName+" loaded.");
                var tilesetIndex = self.renderer.upscaledRendering ? 0 : self.renderer.scale - 1;
                self.renderer.setTileset(self.map.tilesets[tilesetIndex]);
                if (completeCallback) completeCallback();
            });
        },

        initPlayer: function() {

            this.player.setSprite(this.sprites[this.player.getSpriteName()]);
            this.player.idle();

            log.debug("Finished initPlayer");
        },

        initShadows: function() {
            this.shadows = {};
            this.shadows["small"] = this.sprites["shadow16"];
        },

        initCursors: function() {
            this.cursors["hand"] = this.sprites["cursor-point"];
            this.cursors["sword"] = this.sprites["cursor-sword"];
            this.cursors["loot"] = this.sprites["cursor-point"];
            this.cursors["target"] = this.sprites["target"];
            this.cursors["arrow"] = this.sprites["arrow"]; // Think this was removed at some point
            this.cursors["talk"] = this.sprites["cursor-talk"];
            this.cursors["join"] = this.sprites["cursor-talk"];
            this.cursors["walk"] = this.sprites["cursor-walk"];
            this.cursors["spell"] = this.sprites["cursor-spell"];
            this.cursors["bow"] = this.sprites["cursor-bow"];
            this.cursors["inspect"] = this.sprites["item-helpbutton"];
        },

        initAnimations: function() {
            this.targetAnimation = new Animation("idle_down", 4, 0, 16, 16);
            this.targetAnimation.setSpeed(50);
            
            this.atackedTargetAnimation = new Animation("idle_down", 4, 1, 16, 16);
            this.atackedTargetAnimation.setSpeed(50);

            this.sparksAnimation = new Animation("idle_down", 6, 0, 16, 16);
            this.sparksAnimation.setSpeed(120);
            
            this.shieldAnimation = new Animation("idle_down", 4, 0, 64, 64);
            this.shieldAnimation.setSpeed(120);

            this.stunAnimation = new Animation("explosion", 5, 0, 32, 32);
            this.stunAnimation.setSpeed(120);

            this.transformAnimation = new Animation("idle_down", 2, 0, 32, 24);
            this.transformAnimation.setSpeed(120);
        },

        initHurtSprites: function() {
            var self = this;

            Types.forEachArmorKind(function(kind, kindName) {
                if(self.sprites[kindName] === undefined){
					if (self.sprites[kindName].isLoaded) {
                    self.sprites[kindName].createHurtSprite();
                	}
				}
            });
        },

        initSilhouettes: function() {
            var self = this;

            Types.forEachMobOrNpcKind(function(kind, kindName) {
                if(self.sprites.hasOwnProperty(kindName)){
                    self.sprites[kindName].createSilhouette();
                }
            });
            self.sprites["chest"].createSilhouette();
            self.sprites["item-cake"].createSilhouette();
        },

        initAchievements: function() {
            var self = this;

            this.achievements = {
                DUNGEON1: {
                    id: 1,
                    name: "A way forward",
                    desc: "Kill the Troll in Dungeon 1"
                },
                MATILDA_CLOTH: {
                    id: 2,
                    name: "Fancy Pants",
                    desc: "Give Matilda some cloth"
                },
                BOOK: {
                    id: 3,
                    name: "A Friend Indeed",
                    desc: "Find and return the writer's book"
                },
                DUNGEON2: {
                    id: 4,
                    name: "Sword vs Spells",
                    desc: "Kill the Wizard in Dungeon 2"
                },
                DUNGEON3: {
                    id: 5,
                    name: "Undead Horrors",
                    desc: "Kill the Spectre in Dungeon 3"
                },
                DUNGEON4: {
                    id: 6,
                    name: "Déjà vu",
                    desc: "Kill the super Skeleton in Dungeon 4"
                },
                DUNGEON5: {
                    id: 7,
                    name: "Big Beast",
                    desc: "Kill the Baron"
                },
                DUNGEON6: {
                    id: 8,
                    name: "Hungry for More",
                    desc: "Kill 50 Chefs",
                    isCompleted: function() {
                        log.info('CHEF COUNT '+self.storage.getChefCount());
                        return self.storage.getChefCount() >= 50;
                    }
                },
                MIST_WARDEN: {
                    id: 9,
                    name: "Mistgivings",
                    desc: "Return the Warden to Fairy Queen"
                },
                GAUNTLET_RUN: {
                    id: 10,
                    name: "Run the Gauntlet",
                    desc: "Fight your way through the Gauntlet"
                }                
            };

            _.each(this.achievements, function(obj) {
                if(!obj.isCompleted) {
                    obj.isCompleted = function() { return true; }
                }
                if(!obj.hidden) {
                    obj.hidden = false;
                }
            });

            this.app.initAchievementList(this.achievements);

            if(this.storage.hasAlreadyPlayed()) {
                this.app.initUnlockedAchievements(this.storage.data.achievements.unlocked);
            }
        },

        getAchievementById: function(id) {
            var found = null;
            _.each(this.achievements, function(achievement, key) {
                if(achievement.id === parseInt(id)) {
                    found = achievement;
                }
            });
            return found;
        },

        setSpriteScale: function(scale) {
            var self = this;
            
            if(this.renderer.upscaledRendering) {
                this.sprites = this.spritesets[0];
            } else {
                this.sprites = this.spritesets[scale - 1];

                _.each(this.entities, function(entity) {
                    entity.sprite = null;
                    entity.setSprite(self.sprites[entity.getSpriteName()]);
                });
                this.initHurtSprites();
                this.initCursors();
            }
            this.initShadows();
        },

        loadSprites: function() {
            var self = this;

            log.info("Loading "+_.size(SpriteList)+" sprites... and "+_.size(MobList.getMobs())+" mob sprites");
            this.spritesets = [];
            this.spritesets[0] = {};
            this.spritesets[1] = {};
            this.spritesets[2] = {};            
            self.loadedCount = 0;

			for (var spriteName in SpriteList){
				self.loadSprite(spriteName);
			}
			
            for (var spriteName in MobList.getMobs()){
                self.loadSprite(spriteName);
            }
			
        },
		
		loadSprite: function(name) {
            var self = this;
            var ns = null;
            if(this.renderer.upscaledRendering) {
                ns = new Sprite(name, 1, this.cdn, this.version);
                this.spritesets[0][name] = ns;
            } else {
                ns = new Sprite(name, 2, this.cdn, this.version);
                this.spritesets[1][name] = ns;
                if(!this.renderer.mobile && !this.renderer.tablet) {
                    ns = new Sprite(name, 3, this.cdn, this.version);
                    this.spritesets[2][name] = ns;
                }
            }
            if (ns !== null) {
                ns.onLoad(function(){
                    self.loadedCount++;
                    
                    var total = _.size(SpriteList) + _.size(MobList.getMobs());
					
                    if (self.spriteLoadProgress_callback) {
                        // params x of y
                        self.spriteLoadProgress_callback(self.loadedCount,total);
                    }
                    
                    if (self.loadedCount === total) {
                        log.info('sprite load complete');
                        self.setSpriteScale(self.renderer.scale);
                        self.spriteLoadComplete = true;
                        if (self.spriteLoadComplete_callback) {
                            self.spriteLoadComplete_callback();
                        }
						//Hide loading
						$('#loadingmessage').css('display','none');
						$('#spriteprogressholder').css('display','none');
						$('#parchment').css('display','block');
                    }
                });
            };
        },

        spritesLoaded: function() {
            if(_.any(this.sprites, function(sprite) { return !sprite.isLoaded; })) {
                return false;
            }
            return true;
        },

        setCursor: function(name, orientation) {
            if(name in this.cursors) {
                this.currentCursor = this.cursors[name];
                this.currentCursorOrientation = orientation;
            } else {
                log.error("Unknown cursor name :"+name);
            }
        },

        updateCursorLogic: function() {
           // console.log("hover: "+this.hoveringPlayer);
            if(this.hoveringCollidingTile && this.started) {
                this.targetColor = "rgba(255, 50, 50, 0.5)";
            }
            else {
                this.targetColor = "rgba(255, 255, 255, 0.5)";
            }
            
            if (this.clickToFire !== null && this.started) {
                this.targetColor = "rgba(255, 255, 50, 0.5)";
            }
            
            if(!this.isStopAndAtack()) {
            	this.clickToFire = null;
            }

            if(this.defenseItem !== Types.Action.SOCIAL_STATE && this.isHoverHimself) {
                this.setCursor("spell");
                return;
            }

            if(this.hoveringPlayer && this.started) {
                if(this.pvpFlag){
                    if(Types.isWeapon(this.inventoryActiveItem)) {
                    	this.setCursor("sword");
                    } else if(this.inventoryActiveItem === Types.Entities.SHORTBOW) {
                    	this.setCursor("bow");
                    } else if (Types.isSpell(this.inventoryActiveItem)) {
                    	this.setCursor("spell");
                    }
                	
                } else if(this.defenseItem === Types.Action.SOCIAL_STATE){
                    if(this.hoveringFriend)
                        this.setCursor("inspect");
                    else
                        this.setCursor("talk");
				} else if(this.defenseItem !== Types.Action.SOCIAL_STATE){
                    this.setCursor("spell");
                }

                this.hoveringTarget = false;
                this.hoveringMob = false;
                this.targetCellVisible = false;
                this.isHoverHimself = false;
            } else if(this.hoveringMob && this.started && this.clickToFire == null) {
            	if(Types.isWeapon(this.inventoryActiveItem)) {
                	this.setCursor("sword");
                } else if(this.inventoryActiveItem === Types.Entities.SHORTBOW) {
                	this.setCursor("bow");
                } else if (Types.isSpell(this.inventoryActiveItem)) {
                	this.setCursor("spell");
                }
                this.hoveringTarget = false;
                this.hoveringPlayer = false;
                this.targetCellVisible = true;
                this.isHoverHimself = false;
                this.targetColor = "rgba(255, 50, 50, 0.5)";
            }
            else if(this.hoveringNpc && this.started) {
                this.setCursor("talk");
                this.hoveringTarget = false;
                this.targetCellVisible = false;
            } else if((this.hoveringItem || this.hoveringChest) && this.started) {
                this.setCursor("loot");
                this.hoveringTarget = false;
                this.targetCellVisible = true;
                this.isHoverHimself = false;
            } else if(this.clickToFire != null && this.started) {
                if(this.clickToFire == Types.Projectiles.PINEARROW){
                    this.setCursor("bow");
                } else {
                    this.setCursor("spell");
                }
			} else if(!this.hoveringCollidingTile && !this.hoveringPlateauTile) {
				this.setCursor("walk");
            } else {
                this.setCursor("hand");
                this.hoveringTarget = false;
                this.hoveringPlayer = false;
                this.targetCellVisible = true;
                this.isHoverHimself = false;
            }
        },

        focusPlayer: function() {
            this.renderer.camera.lookAt(this.player);
        },

        addEntity: function(entity) {
            var self = this;

            if(this.entities[entity.id] === undefined) {
                this.entities[entity.id] = entity;
                this.registerEntityPosition(entity);

                if(!(this.isItemInstance(entity) && entity.wasDropped)
                && !(this.renderer.mobile || this.renderer.tablet)) {
                    entity.fadeIn(this.currentTime);
                }

                if(this.renderer.mobile || this.renderer.tablet) {
                    entity.onDirty(function(e) {
                        if(self.camera.isVisible(e)) {
                            e.dirtyRect = self.renderer.getEntityBoundingRect(e);
                            self.checkOtherDirtyRects(e.dirtyRect, e, e.gridX, e.gridY);
                        }
                    });
                }
            }
            else {
                log.error("This entity already exists : " + entity.id + " ("+entity.kind+")");
            }
        },

        removeEntity: function(entity) {
            if(entity.id in this.entities) {
                this.unregisterEntityPosition(entity);
                delete this.entities[entity.id];
            }
        },
        
        addProjectile: function(projectile) {
            if(this.projectiles[projectile.id] === undefined) {
                this.projectiles[projectile.id] = projectile;
            }
            else {
                log.error("This projectile already exists : " + projectile.id);
            }
        },
        
        removeProjectile: function(projectile) {
            if(projectile.id in this.projectiles) {
                delete this.projectiles[projectile.id];
            }
            else {
                log.error("Cannot remove projectile. Unknown ID : " + projectile.id);
            }
        },

        addItem: function(item, x, y) {
            var sprite = this.sprites[item.getSpriteName()];
            item.setSprite(sprite);
            item.setGridPosition(x, y);
            if(item.kind == Types.Entities.LEVER){
                item.setAnimation("idle_up", 150);
            }else if(item.kind == Types.Entities.LOCKEDOOR){
                item.setAnimation("idle_down", 150);
            }else{
                item.setAnimation("idle", 150);
            }
            this.addEntity(item);
        },

        removeItem: function(item) {
            if(item) {
                this.removeFromItemGrid(item, item.gridX, item.gridY);
                this.removeFromRenderingGrid(item, item.gridX, item.gridY);
                delete this.entities[item.id];
            } else {
                log.error("Cannot remove item. Unknown ID : " + item.id);
            }
        },

        initPathingGrid: function() {
            this.pathingGrid = [];
            for(var i=0; i < this.map.height; i += 1) {
                this.pathingGrid[i] = [];
                for(var j=0; j < this.map.width; j += 1) {
                    this.pathingGrid[i][j] = this.map.grid[i][j];
                }
            }
            log.info("Initialized the pathing grid with static colliding cells.");
        },

        initEntityGrid: function() {
            this.entityGrid = {};
            log.info("Initialized the entity grid.");
        },

        initRenderingGrid: function() {
            this.renderingGrid = {};
            log.info("Initialized the rendering grid.");
        },

        initItemGrid: function() {
            this.itemGrid = {};
            log.info("Initialized the item grid.");
        },

        /**
         *
         */
        initAnimatedTiles: function() {
            var self = this,
                m = this.map;

            this.animatedTiles = [];
            this.forEachVisibleTile(function (id, index) {
                if(m.isAnimatedTile(id)) {
                    var tile = new AnimatedTile(id, m.getTileAnimationLength(id), m.getTileAnimationDelay(id), index),
                        pos = self.map.tileIndexToGridPosition(tile.index);

                    tile.x = pos.x;
                    tile.y = pos.y;
                    self.animatedTiles.push(tile);
                }
            }, 1);
            //log.info("Initialized animated tiles.");
        },

        addToRenderingGrid: function(entity, x, y) {
            // probably don't need map bounds check anymore
            if(!this.map.isOutOfBounds(x, y)) {
                if (this.renderingGrid[x+','+y] == null) this.renderingGrid[x+','+y] = [];
                this.renderingGrid[x+','+y].push(entity);                
            }
        },

        removeFromRenderingGrid: function(entity, x, y) {
            if (this.renderingGrid[x+','+y] != null) {
                this.renderingGrid[x+','+y] = _.without(this.renderingGrid[x+','+y],entity);
            }            
        },
        
        addToEntityGrid: function(entity, x, y) {
            if (this.entityGrid[x+','+y] == null) this.entityGrid[x+','+y] = [];
            this.entityGrid[x+','+y].push(entity);
        },

        removeFromEntityGrid: function(entity, x, y) {
            if (this.entityGrid[x+','+y] != null) {
                this.entityGrid[x+','+y] = _.without(this.entityGrid[x+','+y],entity);
            }
        },
        
        addToItemGrid: function(item, x, y) {
            if (this.itemGrid[x+','+y] == null) this.itemGrid[x+','+y] = [];
            this.itemGrid[x+','+y].push(item);
        },        
        
        removeFromItemGrid: function(item, x, y) {
            if (this.itemGrid[x+','+y] != null) {
                this.itemGrid[x+','+y] = _.without(this.itemGrid[x+','+y],item);
            }
        },
        
        addToPathingGrid: function(x, y) {
            this.pathingGrid[y][x] = 1;
        },

        removeFromPathingGrid: function(x, y) {
            this.pathingGrid[y][x] = 0;
        },
        
        checkPathingGrid: function(x, y){
            if(this.pathingGrid[y][x] == 0){
                return true;
            }else{
                return false;
            }
        },

        /**
         * Registers the entity at two adjacent positions on the grid at the same time.
         * This situation is temporary and should only occur when the entity is moving.
         * This is useful for the hit testing algorithm used when hovering entities with the mouse cursor.
         *
         * @param {Entity} entity The moving entity
         */
        registerEntityDualPosition: function(entity) {
            if(entity) {
                this.addToEntityGrid(entity, entity.gridX,entity.gridY);
                this.addToRenderingGrid(entity, entity.gridX, entity.gridY);

                if(entity.nextGridX >= 0 && entity.nextGridY >= 0) {
                    this.addToEntityGrid(entity, entity.nextGridX, entity.nextGridY);
                    if(!(entity instanceof Player)) {
                        this.pathingGrid[entity.nextGridY][entity.nextGridX] = 1;
                    }
                }
            }
        },

        /**
         * Clears the position(s) of this entity in the entity grid.
         *
         * @param {Entity} entity The moving entity
         */
        unregisterEntityPosition: function(entity) {
            if(entity) {
                this.removeFromEntityGrid(entity, entity.gridX, entity.gridY);
                this.removeFromPathingGrid(entity.gridX, entity.gridY);

                this.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);

                if(entity.nextGridX >= 0 && entity.nextGridY >= 0) {
                    this.removeFromEntityGrid(entity, entity.nextGridX, entity.nextGridY);
                    this.removeFromPathingGrid(entity.nextGridX, entity.nextGridY);
                }
            }
        },

        registerEntityPosition: function(entity) {
            var x = entity.gridX,
                y = entity.gridY;

            if(entity) {
                if(entity instanceof Character || entity instanceof Chest || entity instanceof RockWall || entity instanceof HiddenWall || entity instanceof Lever  || entity instanceof Trap ) {
                    this.addToEntityGrid(entity,x,y);
                    if(!(entity instanceof Player || entity instanceof Trap)) {
                        this.pathingGrid[y][x] = 1;
                    }
                }
                if(this.isItemInstance(entity)) {
                    this.addToItemGrid(entity,x,y);
                }

                this.addToRenderingGrid(entity, x, y);
            }
        },

        setServerOptions: function(host, port, username, userpw, email, cdn, version) {
            this.host = host;
            this.port = port;
            this.username = username;
            this.userpw = userpw;
            this.email = email;
            this.pid = userpw;
			this.cdn = cdn;
			this.version = version;
        },
 
        loadAudio: function() {
            this.audioManager = new AudioManager(this);
        },

        initMusicAreas: function() {
            var self = this;
            _.each(this.map.musicAreas, function(area) {
                self.audioManager.addArea(area.x, area.y, area.w, area.h, area.id);
            });
        },
		
		initDialogAreas: function() {
            var self = this;
            _.each(this.map.dialogAreas, function(mapArea) {
				var area = new Area(mapArea.x, mapArea.y, mapArea.w, mapArea.h);
				area.num = mapArea.id;
				if(mapArea.auto){
					area.auto = 1;
				}
				self.dialogAreas.push(area);
            });
        },
		
		playerDialogArea: function(){
			var self = this;
			var dialog = null;
			var dialogArea = _.detect(this.dialogAreas, function(area) {
				return area.contains(self.player);
			});
			if(dialogArea){
				dialog = dialogArea;
			}
			return dialog;
		},

        run: function(action, started_callback) {
            var self = this;

            
            this.setUpdater(new Updater(this));
            this.camera = this.renderer.camera;



            var wait = setInterval(function() {
                if(self.map.isLoaded && self.spritesLoaded()) {
                    self.ready = true;
                    log.debug('All sprites loaded.');

                    self.loadAudio();

                    self.initMusicAreas();
					self.initDialogAreas();
                    self.initCursors();
                    self.initAnimations();
                    self.initShadows();
                    self.initHurtSprites();

                    if(!self.renderer.mobile
                    && !self.renderer.tablet
                    && self.renderer.upscaledRendering) {
                        self.initSilhouettes();
                    }

                    self.initEntityGrid();
                    self.initItemGrid();
                    self.initPathingGrid();
                    self.initRenderingGrid();

                    self.setPathfinder(new Pathfinder(self.map.width, self.map.height));

                    self.initPlayer();
                    self.setCursor("hand");

                    self.player.name = self.username;
                    self.player.pw = self.userpw;
                    self.player.email = self.email;
                    self.player.pid = self.pid;
					self.player.gender = self.gender || Types.GENDER.MALE;
                    self.started = true;
                    
                    if(action === 'create') {
                        self.client.sendCreate(self.player);
                    } else {
                        self.client.sendLogin(self.player);
                    }
                    self.started = true;
                    
                    started_callback({success: true});
                    //self.hotbar.inventoryItemClicked($("inventoryitem-weapon0"));
                    clearInterval(wait);
                }
            }, 100);
        },

        tick: function() {
            this.currentTime = new Date().getTime();

            if(this.started) {
                this.renderer.stats.begin();
                this.updateCursorLogic();
                this.updater.update();
                this.renderer.renderFrame();
                this.renderer.stats.end();
            }

            if(!this.isStopped) {
                requestAnimFrame(this.tick.bind(this));
            }
        },

        start: function() {
            var self = this;
            this.tick();
            //this.hasNeverStarted = false;
            log.info("Game loop started.");
			var d = new Date();
			this.lastKeySend = d.getTime();
            this.app.leaderBoard.setLeaderBoardRequst(function() {self.client.getLeaderboards()});
            this.app.leaderBoard.sendRequest();
            this.client.onPlayersStat( function(data) {
                self.app.playersBoard.updateBoardData(data);
            });
            this.client.getLeaderboards();
            this.client.getPlayersOnline();


        },

        stop: function() {
            log.info("Game stopped.");
            this.isStopped = true;
        },

        entityIdExists: function(id) {
            return id in this.entities;
        },

        getEntityById: function(id) {
            if(id in this.entities) {
                return this.entities[id];
            }
            else {
                log.info("Unknown entity id : " + id);
            }
        },
        
        getEntityByItemConnect: function(cid, type) {
            for (var key in this.entities) {
                var entity = this.entities[key];
                if(typeof entity.itemConnect != 'undefined' && entity.kind == type){
                    if(entity.itemConnect == cid){
                        return entity;
                    }
                }
            }
        },

        connect: function(action, started_callback) {
            var self = this,
                connecting = false; // always in dispatcher mode in the build version

            this.client = new GameClient(this.host, this.port);
            this.hotbar = new Hotbar(this.client, this);
            this.client.fail_callback = function(reason){
                started_callback({
                    success: false,
                    reason: reason
                });
                log.info('fail callback triggered '+reason);
                self.started = false;
            };

            //>>excludeStart("prodHost", pragmas.prodHost);
            var config = this.app.config.local || this.app.config.dev;
            if(config) {
                this.client.connect(config.dispatcher); // false if the client connects directly to a game server
                connecting = true;
            }
            //>>excludeEnd("prodHost");

            //>>includeStart("prodHost", pragmas.prodHost);
            if(!connecting) {
                this.client.connect(false); // dont use the dispatcher in production
            }
            //>>includeEnd("prodHost");

            this.client.onDispatched(function(host, port) {
                log.debug("Dispatched to game server "+host+ ":"+port);

                self.client.host = host;
                self.client.port = port;
                self.client.connect(); // connect to actual game server
            });

            // received "go" string from server
            this.client.onConnected(function() {
                log.info("Connected to server");


                
                //self.app.showAchievementNotification(1, 'test');     
                
                /*
                if(action === 'create') {
                    self.client.sendCreate(self.player);
                } else {
                    self.client.sendLogin(self.player);
                }
                */
                
            });

            this.client.onEntityList(function(list) { //alert(list);
                var entityIds = _.pluck(self.entities, 'id'),
                    knownIds = _.intersection(entityIds, list),
                    newIds = _.difference(list, knownIds);

                self.obsoleteEntities = _.reject(self.entities, function(entity) {
                    return _.include(knownIds, entity.id) || entity.id === self.player.id;
                });

                // Destroy entities outside of the player's zone group
                self.removeObsoleteEntities();

                // Ask the server for spawn information about unknown entities
                if(_.size(newIds) > 0) {
                    self.client.sendWho(newIds);
                };
            });

            this.storeItemClicked = function(elem) {
                // todo
            };
            
            this.inventoryItemClicked = function(elem){
                this.clickToFire = null;
                //log.info("inventoryItemClicked");

                // player page inventory click
                if(!elem.parent().hasClass('hotbar')){
                    var inventoryNum = elem.attr("class").split(' ');
                    inventoryNum = parseInt(inventoryNum[0].substr(9, inventoryNum[0].length));
                    if(this.hotbarSize == 7){
                        // move to hotbar
                        if(elem.parent().hasClass('inventoryr4') || elem.parent().hasClass('inventoryr3')){
                            this.moveToHotbar(inventoryNum);
                        // move to inventory
                        }else{
                            this.moveToInventory(inventoryNum);
                        };
                    }else{
                        // move to hotbar
                        if(elem.parent().hasClass('inventoryr4') || elem.parent().hasClass('inventoryr3') || elem.parent().hasClass('inventoryr2')){
                            this.moveToHotbar(inventoryNum);
                        // move to inventory
                        }else{
                            this.moveToInventory(inventoryNum);
                        };
                    }
                    this.updateHotbar();
                    // delay send inventory sort so the player has time to make multiple changes
                    clearTimeout(this.sendSortDelay);
                    this.sendSortDelay = setTimeout(function(){
                        self.client.sendInventorySort(self.inventoryData);
                    }, 4000);
                }
                this.hotbar.hotbarItemClicked(elem);
            };

            // show gold store page
            this.showStore = function() {
                $("#label_gold").text("Gold: "+self.player.gold);
                $("#label_cash").text("Cash: "+self.player.cash);
                              
                $('.storer1').html('');
                $('.storer2').html('');
                $('.storer3').html('');
                $('.storer4').html('');

                var storeData = {
                    items: [null,null,null],
                    quantities: [0,0,0]
                };

                for (var i=0;i<storeData.items.length;i++){
                    var item = storeData.items[i];
                    var quantity = storeData.quantities[i];
                    
                    var itemName = Types.getKindAsString(item);
                    var quantityshown = quantity.toString();
                    if (quantity === 1){ quantityshown = ''; }
                        
                    if (item != null){
                        var itemhtml = '<div class="store'+i+' inventoryitem-general inventoryitem-'+itemName+'"><div class="quantitylabel">'+quantityshown+'</div></div>';
                    }else{
                        var itemhtml = '<div class="store'+i+' inventoryitem-empty"></div>';
                    }
                                    
                    if(i <= 4){ $('.storer1').append(itemhtml); }
                    else if(i <= 9){ $('.storer2').append(itemhtml); }
                    else if(i <= 14){ $('.storer3').append(itemhtml); }
                    else if(i <= 19){ $('.storer4').append(itemhtml); }
                    
                    $('.store'+i)._index = i;
                        
                    $('.store'+i).click(function() {
                        self.storeItemClicked($(this));
                    });
                
                };
                        
                self.app.hideWindows();
                $('#store').toggleClass('active');
            };

            // show crystal store page
            this.showCrystalStore = function() {
            
                $('#crystalstorenotice').text("Click an item to purchase");
                $("#label_crystals").text(self.player.remortPoints);
                              
                var crystalStoreInventory = Types.Stores.STORE2.inventory;
                
                var columns = 4;
                
                // clear
                $('#crystalstoregrid').html('');
                
                // build
                for (var i=0;i<=crystalStoreInventory.length-1;i++){
                    var row = Math.floor(i/columns);
                    var col = i % columns;
                    var tileId = 'crystalstoretile' + i;
                    var item = crystalStoreInventory[i];
                    var tileHtml = '<div id="' + tileId + '" class="crystalstoregridtile" style="left:'+col*100+'px'+';top:'+row*100+'px'+'"><div class="crystalstoretileimage" style="background-image:url('+item.image+')"></div><div class="crystalstoretileprice">'+item.cost+'</div><div class="iconcrystalblue"></div></div>';
                    $('#crystalstoregrid').append(tileHtml);
                    
                    $('#'+tileId).attr('_index',i);
                    $('#'+tileId).attr('_kind',item.item);
                    $('#'+tileId).click(function() {
                        self.crystalStoreTileClicked($(this));
                    });
                    
                }
                                    
                self.app.hideWindows();
                $('#crystalstore').toggleClass('active');
            };
            
            // item tile in crystal store clicked
            this.crystalStoreTileClicked = function(elem) {
            
                var index = elem.attr('_index');
                var kind = parseInt(elem.attr('_kind'));
                
                if (self.app.guestPlay) {
                    $('#crystalstorenotice').text("Dear guest, you can't buy anything without an account.");
                    return;
                }
                
                var cost = Types.getStoreItemCost(kind,Types.Currencies.CRYSTALS);
                if (cost > self.player.remortPoints) {
                    $('#crystalstorenotice').text("You don't have enough Crystals. Unlock some achievements to earn more.");
                } else {
                    this.client.sendStorePurchase(kind,1,Types.Currencies.CRYSTALS);
                    $('#crystalstorenotice').text("Purchased for "+cost+ " Crystals");
                }
            
            };
			
			// character tile in character grid clicked
            this.characterGridTileClicked = function(elem) {
				self.username = elem.attr('_username');
	
				// are we clicking in a delete context?
                if ($('#deletetext').is(':visible')) {
                    $('#deletetext').hide();
                    var confirmed = confirm('Are you sure you want to delete ' + self.username);
                    if (confirmed == true) {
                        elem.hide();
                        self.client.sendDeleteCharacter(self.username,self.pid);
                    }
                    $('#pickerbuttons').show();
                    return;
                }
				
				  $('.continuePlay').click(function() {
	                    self.continuePlayClicked(elem);
	               });
				
				self.app.animateParchment('pickcharacter', 'pre-map');
            };
			
            // continue selected character
            this.continuePlayClicked = function(elem) {
                log.info(elem);
                            
                var index = elem.attr('_index');  
                var mapname = elem.attr('_map');
                console.log(self.username);
                console.log(mapname);
                
                self.app.hideWindows();
                
                $('#progresstext').text('Loading map...');
				$('#progress').css('margin-top','-23%');
                $('#progress').css('display','block');

                self.loadMap(mapname,function(){
                    
                    $('#progress').css('display','none');
                    
                    var action = 'login';
                    self.userpw = self.pid;
                    
                    self.started = false; // ....
                    
                    // try to reset to pre login state
                    
                    self.entities = {};
                    self.initEntityGrid();
                    self.initPathingGrid();
                    self.initRenderingGrid();

                    self.player = new Warrior("player", self.username);
                    self.player.pw = self.userpw;
                    self.player.email = self.email;

                    self.app.initTargetHud();

                    self.clickToFire = null;
                    console.log(self.username, self.userpw, self.email);
                             
                    self.app.startGame(action, self.username, self.userpw, self.email);
                });
            };
            
            // show remort dialog
            this.showRemortDialog = function() {
             
                $("#remort_yes").click(function(){
					ga('send', 'event', 'button', 'click', 'remort', self.player.remorts);
                    self.app.hideWindows();
                    self.client.sendRemort(self.player);
                });
                
                $("#remort_no").click(function(){
				ga('send', 'event', 'button', 'click', 'remort skip', self.player.remorts);
                    self.app.hideWindows();
                });
                        
                self.app.hideWindows();
                $('#remortdialog').toggleClass('active');
                
            };            
            
            this.client.onWelcome(function(id, name, x, y, hp, mp, armor, weapon, shield, amulet, ring,
                                           avatar, weaponAvatar, experience, local,
                                           kills, mapName, currencyGold, currencyCash,
                                           remortCount, remortExp, remortPoints, keys, gender, waypoints) {
                log.info("Received player ID from server : "+ id+" mapName: "+mapName);
				log.info('keys');
				log.info(keys);
                self.player.id = id;
                self.playerId = id;
                self.storage.init();
                self.scaleStuff();
				if(!self.app.guestPlay && !self.app.hasConnectedBefore){
					self.client.sendToken(self.app.idnetAuth.access_token);
				}

                if(!self.app.hasConnectedBefore)
                    self.waypointList = new Waypoints(self.client, waypoints);
				self.app.hasConnectedBefore = true;
                if(local != 0 && local != null){
                    self.storage.data = JSON.parse(local);
                }

                log.info(local);
                self.storage.hasPlayed = true;
                self.storage.synced = true;
                self.initAchievements();
                // Always accept name received from the server which will
                // sanitize and shorten names exceeding the allowed length.
                self.player.showName = name;
                self.player.name = name;
                self.player.setGridPosition(x, y);
                self.player.setMaxHitPoints(hp);
                self.player.setMaxManaPoints(mp);
                self.player.setArmorName(armor);
                self.player.setSpriteName(avatar);
                self.player.setWeaponName(weapon);
                self.player.setShieldName(shield);
                self.player.setAmuletName(amulet);
                self.player.setRingName(ring);
                self.player.pvpKills = kills;
                self.player.gold = currencyGold;
                self.player.cash = currencyCash;
                self.player.remorts = remortCount;
                self.player.remortExp = remortExp;
                self.player.remortPoints = remortPoints;
                self.player.setGender(gender);

                if(remortCount == null)
                    remortCount = 0;
                $('#char-remort').text('Remort: '+remortCount);
                
                $('#char-remortCrystals').text('Crystals: '+remortPoints);
                $('#char-CrystalsPvp').text('Crystals win in PVP: '+self.player.arenaCrystalWin);
                $('#char-expirience').text('EXP: '+experience);
                $('#char-remortExp').text('Legendary EXP: '+remortExp);
                $('#char-totalExp').text('Total EXP: '+(experience+remortExp));
                
                $('#kill-count').text('You '+kills);
                self.storage.savePlayer(self.renderer.getPlayerImage(),
                                            self.player.getSpriteName(),
                                            self.player.getEquippedWeaponName(),
                                            self.player.getGuild());
                self.initPlayer();
                self.player.image = self.renderer.getPlayerImage();
                log.info(self.storage.data);
                log.info(self.storage.data.player);
                log.info(self.storage.data.achievements);
                self.player.experience = experience;
                self.player.level = Types.getLevel(experience);
                
                self.updateExp(0, self.player.experience, self.player.level);
                /*
                if(experience == 0 && remortCount == 0){
                    self.app.toggleInstructions();
                }
				*/
                self.resetCamera();
                self.updatePlateauMode();

                self.addEntity(self.player);
                self.player.dirtyRect = self.renderer.getEntityBoundingRect(self.player);
                self.updateGlobes();
				
				if(self.app.guestPlay){
					self.guestAnnoy = setInterval(function(){
						self.chat.addChatMessage('GAME', 'Want to save your character? Click save account on the player page.');
					}, 500000);
				}else{
					self.friendRequest = setInterval(function(){
						self.client.sendUpdateFriends();
						self.checkPendingFriends();
					}, 300000);
				}

                if(self.storage.data.mute){
                    self.audioManager.mute(true);
                }else{
					self.audioManager.updateMusic();
				}

                
                if (self.map.mapName !== mapName){
                    // need to load different map  
                    self.loadMap(mapName,function(){
                        self.initItemGrid();
						self.initDialogAreas();
                        self.respawn();
                    });
                }

                self.registerHandlers();

                self.gamestart_callback();

                if(self.hasNeverStarted) {
                    self.start();
                    started_callback({success: true});
                }else{
                    log.info('never started');
                }
            });
           
            this.client.onReceiveCharacters(function(data) {
	            log.info('CHARACTERS:'+JSON.stringify(data));
	            $('#progresstext').text('Loading sprites...');
                self._characterdata = data;
                
                // if no characters hide the delete button
                if (self._characterdata && self._characterdata.length == 0) {
                    $('#deleteplayer_button').hide();
                }
	                        
                self.onSpriteLoadComplete(function(){
					$('#spriteprogressholder').hide();
					$('#loadingmessage').hide();
					self.createCharacterGrid();
				});
            
            });

            // end of game.connect
        },
        
        createCharacterGrid: function() {
        	var self = this;
        	log.info("start createCharacterGrid");
        	if(this.shadows) {
        		$('#progress').css('display','none');
				$('#idnet-login').css('display','none');
	          //  $('#spriteprogress').text(''); // clear
	            self.populateCharacterGrid();
	            self.app.animateParchment('loadcharacter', 'pickcharacter');
        	} else {
        		setTimeout(function(){
        			log.info("createCharacterGrid wait for init complete...");
        			self.createCharacterGrid();
        		},1000);
        	}
        },
        
        populateCharacterGrid: function() {
                var self = this;
                
                if (self._characterdata == null) {
                    log.info('_characterdata null');
                    return;
                }                    
                
                // populate char select page           
	            var columns = 5;
	            
	            // clear
	            $('.charactergrid').html('');
	            
	            // build
	            for (var i=0;i<self._characterdata.length;i++){
	                var charinfo = self._characterdata[i];

                    console.log(charinfo);
	                var row = Math.floor(i/columns);
	                var col = i % columns;
	                var tileId = 'charactertile' + i;
	                var tileHtml = '<div class="charactergridtile '+tileId+'" style="left:'+col*100+'px'+';top:'+row*100+'px'+'"><img class="charactergridtileimage characterimage'+i+'"></img><div class="charactergridtilename">'+charinfo.username + ' LVL '+charinfo.level+'</div></div>';
	                $('.charactergrid').append(tileHtml);
	                
	                $('.'+tileId).attr('_index',i);
	                $('.'+tileId).attr('_username',charinfo.username);
	                $('.'+tileId).attr('_map',charinfo.map);
                    
                    $('.characterimage'+i).attr('src',self.renderer.generatePlayerImage(charinfo.armor, charinfo.weapon));
                    
	                $('.'+tileId).click(function() {
	                    self.characterGridTileClicked($(this));
	                });
	            }
        },
		
		createGender: function() {
			// clear
	        $('.gender-selection').html(null);
			var gender = ["Male", "Female"];
			var self = this;

	            // build
	            for (var i=0;i<gender.length;i++){
	                var tileId = 'gender' + gender[i];
					var tileHtml = '<div id="' + tileId + '" class="gender '+ gender[i] + '">';
					$('.gender-selection').append(tileHtml);
	                
	                $('#'+tileId).click(function() {
						var myGender = $(this).attr('class').split(' ')[1][0];
	                   //log.info($(this).attr('class').split(' ')[1][0]);
					   self.player.gender = myGender;
					   self.gender = myGender;
					   self.app.clearValidationErrors();
					   
					   if(self.app.guestPlay === true){
						   log.info("play as a guest");
						   self.app.tryStartingGame();
						}else{
							log.info("play as a login player");
						    self.app.animateParchment('genderselection', 'createcharacter');
							}
	                });
	            }
        },
		
        /**
         * Links two entities in an attacker<-->target relationship.
         * This is just a utility method to wrap a set of instructions.
         *
         * @param {Entity} attacker The attacker entity
         * @param {Entity} target The target entity
         */
        createAttackLink: function(attacker, target) {
            if(attacker.hasTarget() && attacker.target == target) {
            	return;
            }
        	
        	if(attacker.hasTarget()) {
                attacker.removeTarget();
            }
            attacker.engage(target);

            if(attacker.id !== this.playerId) {
                target.addAttacker(attacker);
            }
        },

        /**
         * Converts the current mouse position on the screen to world grid coordinates.
         * @returns {Object} An object containing x and y properties.
         */
        getMouseGridPosition: function() {
            var mx = this.mouse.x;
            var  my = this.mouse.y;
            var  c = this.renderer.camera;
            var  s = this.renderer.scale;
            var  ts = this.renderer.tilesize;
            var  sC = this.renderer.scaleCanvas;
            mx = mx / sC;
            my = my / sC;
            var  offsetX = mx % (ts * s);
            var  offsetY = my % (ts * s);
            var  x = ((mx - offsetX) / (ts * s)) + c.gridX;
            var  y = ((my - offsetY) / (ts * s)) + c.gridY;

                return { x: x, y: y };
        },

        /**
         * Moves a character to a given location on the world grid.
         *
         * @param {Number} x The x coordinate of the target location.
         * @param {Number} y The y coordinate of the target location.
         */
        makeCharacterGoTo: function(character, x, y) {
            if(!this.map.isOutOfBounds(x, y)) {
                character.go(x, y);
            }
        },

        /**
         *
         */
        makeCharacterTeleportTo: function(character, x, y) {
            if(!this.map.isOutOfBounds(x, y)) {
                this.unregisterEntityPosition(character);

                character.setGridPosition(x, y);

                this.registerEntityPosition(character);
                this.assignBubbleTo(character);
            } else {
                log.debug("Teleport out of bounds: "+x+", "+y);
            }
        },
        
        // return map coords of nearest mob (pixel not tile coords)
        getNearestMobPosition: function() {
            var self = this;
            var playerPos = {   x:this.player.x+8,
                                y:this.player.y+8   };
        
            var nearestMob = null;
            var nearestDist = null;
            this.forEachMob(function(mob) {
                if (self.camera.isVisible(mob)) {
                    if (nearestMob === null) {
                        nearestMob = mob;
                        nearestDist = Math.sqrt(Math.pow(mob.x+8-playerPos.x,2) + Math.pow(mob.y+8-playerPos.y,2));
                    }
                    var dist = Math.sqrt(Math.pow(mob.x+8-playerPos.x,2) + Math.pow(mob.y+8-playerPos.y,2));
                    if (dist < nearestDist) {
                        nearestMob = mob;
                        nearestDist = dist;
                    }
                }
            });
            
            if (nearestMob !== null) {
                return {    x:nearestMob.x+8,
                            y:nearestMob.y+8    };
            }
            
            return null;
        },
        
        // return map coords of nearest player (pixel not tile coords)
        getNearestPlayerPosition: function() {
            var self = this;
            var playerPos = {   x:this.player.x+8,
                                y:this.player.y+8   };
        
            var nearestPlayer = null;
            var nearestDist = null;
            this.forEachPlayer(function(player) {
                // in sight
                if (self.camera.isVisible(player)) {
                    // not ourselves
                    if (player.id != self.player.id) {
                        if (nearestPlayer === null) {
                            nearestPlayer = player;
                            nearestDist = Math.sqrt(Math.pow(player.x+8-playerPos.x,2) + Math.pow(player.y+8-playerPos.y,2));
                        }
                        var dist = Math.sqrt(Math.pow(player.x+8-playerPos.x,2) + Math.pow(player.y+8-playerPos.y,2));
                        if (dist < nearestDist) {
                            nearestPlayer = player;
                            nearestDist = dist;
                        }
                    }
                }
            });
            
            if (nearestPlayer !== null) {
                return {    x:nearestPlayer.x+8,
                            y:nearestPlayer.y+8    };
            }
            
            return null;
        
        },        
        
        // players detect healing on themselves only
        detectHeal: function(x,y,range,projectiletype) {
        
            var self = this;
            var player = this.player;
            
            if (player.gridX >= x-range){
                if (player.gridX <= x+range){
                    if (player.gridY >= y-range){
                        if (player.gridY <= y+range){
                            // in heal range
                            this.client.sendHitHeal(projectiletype);
                        }
                    }
                }
            }

        },
        
        detectCollateral: function(x,y,range,kind) {
        
            var self = this;
            var player = this.player;
            
            this.forEachMob(function(mob) {
                
                if (mob.gridX >= x-range){
                    if (mob.gridX <= x+range){
                        if (mob.gridY >= y-range){
                            if (mob.gridY <= y+range){
                                // mob in range of explosion
                                self.applyCollateral(player,mob,x,y,kind);
                            }
                        }
                    }
                }
            
            });
        
        },
        
        applyCollateral: function(player,mob,x,y,kind){
        
            if (kind == Types.Projectiles.FIREBALL) {
                this.client.sendHitRanged(mob,kind,x,y);
            }
            
            if (kind == Types.Projectiles.ICEBALL) {
                this.client.sendHitRanged(mob,kind,x,y);
            }
            
            if (kind == Types.Projectiles.PINEARROW) {
                this.client.sendHitRanged(mob,kind,x,y);
            }
            
            if (kind == Types.Projectiles.TORNADO) {
                this.client.sendHitRanged(mob,kind,x,y);
            }  

            if (kind == Types.Entities.LITBOMB) {
                log.info('client detects bomb collateral on mob '+Types.getKindAsString(mob.kind)+' at ' + mob.gridX+ ','+mob.gridY);
                this.client.sendHitBomb(mob,x,y);
            }
            
            if (kind == Types.Projectiles.TERROR || kind == Types.Projectiles.STUN) {
                this.client.sendHitRanged(mob,kind,x,y);
                mob.disengage(); // mark client side too 10s
                mob.unconfirmedTarget = null;
            }
            
            if (kind == Types.Projectiles.POISON) {
                this.client.sendHitRanged(mob,kind,x,y);
            }
            
            if (kind == Types.Projectiles.TRANSFORM) {
                this.client.sendHitRanged(mob,kind,x,y);
            }            

            if (kind == Types.Projectiles.BLACKHOLE) {
                this.client.sendHitRanged(mob,kind,x,y);
            }
        
        },

        /**
         *
         */
        makePlayerAttackNext: function()
        {

            pos = {
                x: this.player.gridX,
                y: this.player.gridY
            };
            switch(this.player.orientation)
            {
                case Types.Orientations.DOWN:
                    pos.y += 1;
                    this.makePlayerAttackTo(pos);
                    break;
                case Types.Orientations.UP:
                    pos.y -= 1;
                    this.makePlayerAttackTo(pos);
                    break;
                case Types.Orientations.LEFT:
                    pos.x -= 1;
                    this.makePlayerAttackTo(pos);
                    break;
                case Types.Orientations.RIGHT:
                    pos.x += 1;
                    this.makePlayerAttackTo(pos);
                    break;

                default:
                    break;
            }
        },

        /**
         *
         */
        makePlayerAttackTo: function(pos)
        {
            entity = this.getEntityAt(pos.x, pos.y);
            if(entity instanceof Mob) {
                this.makePlayerAttack(entity);
            }
        },

        /**
         * Moves the current player to a given target location.
         * @see makeCharacterGoTo
         */
        makePlayerGoTo: function(x, y) {
            this.makeCharacterGoTo(this.player, x, y);
        },

        /**
         * Moves the current player towards a specific item.
         * @see makeCharacterGoTo
         */
        makePlayerGoToItem: function(item) {
            if(item) {
                this.player.isLootMoving = true;
                this.makePlayerGoTo(item.gridX, item.gridY);
                this.client.sendLootMove(item, item.gridX, item.gridY);
            }
        },
        
        makePlayerGoToLever: function(lever){
            if(lever) {
                this.player.setTarget(lever);
                this.player.follow(lever);
            }
        },
        
        makePlayerGoToTrap: function(trap){
            if(trap) {
                //this.player.setTarget(trap);
                this.makeCharacterGoTo(this.player, trap.gridX, trap.gridY);
            }
        },

        /**
         *
         */
        makePlayerTalkTo: function(npc) {
            if(npc) {
                this.player.setTarget(npc);
                this.player.follow(npc);
            }
        },

        makePlayerOpenChest: function(chest) {
            if(chest) {
                this.player.setTarget(chest);
                this.player.follow(chest);
            }
        },
        
        makePlayerFallInTrap: function(trap) {
            if(trap) {
                //this.player.setTarget(trap);
                this.makeCharacterGoTo(this.player, trap.gridX, trap.gridY);
            }
        },

        /**
         *
         */
        makePlayerAttack: function(mob) {
            //log.info("makePlayerAttack isAttacking: "+this.player.isAttacking()+" hasTarget: "+this.player.hasTarget());
        	
        	this.createAttackLink(this.player, mob);
            this.client.sendAttack(mob);
        },

        /**
         *
         */
        makeNpcTalk: function(npc) {
            var msg;

            if(npc) {
                msg = npc.talk(this);
                this.previousClickPosition = {};
                if(msg) {
                    this.createBubble(npc.id, msg);
                    this.assignBubbleTo(npc);
                    this.audioManager.playSound("npc");
                } else {
                    this.destroyBubble(npc.id);
                    this.audioManager.playSound("npc-end");
                }
                // talking to npc achievements
                /*
                this.tryUnlockingAchievement("SMALL_TALK");

                if(npc.kind === Types.Entities.RICK) {
                    this.tryUnlockingAchievement("RICKROLLD");
                }
                */
            }
        },

        /**
         * Loops through all the entities currently present in the game.
         * @param {Function} callback The function to call back (must accept one entity argument).
         */
        forEachEntity: function(callback) {
            _.each(this.entities, function(entity) {
                callback(entity);
            });
        },
        
        /**
         * Loops through all the projectiles currently present in the game.
         * @param {Function} callback The function to call back (must accept one projectile argument).
         */   
        forEachProjectile: function(callback) {
            _.each(this.projectiles, function(projectile) {
                callback(projectile);
            });
        },

        /**
         * Same as forEachEntity but only for instances of the Mob subclass.
         * @see forEachEntity
         */
        forEachMob: function(callback) {
            _.each(this.entities, function(entity) {
                if(entity instanceof Mob) {
                    callback(entity);
                }
            });
        },
        
        /**
         * Same as forEachEntity but only for instances of the Player subclass.
         * @see forEachEntity
         */
        forEachPlayer: function(callback) {
            _.each(this.entities, function(entity) {
                if(entity instanceof Player) {
                    callback(entity);
                }
            });
        },        

        /**
         * Loops through all entities visible by the camera and sorted by depth :
         * Lower 'y' value means higher depth.
         * Note: This is used by the Renderer to know in which order to render entities.
         */
        forEachVisibleEntityByDepth: function(callback) {
            var self = this,
                m = this.map;
            try {
            
            this.camera.forEachVisiblePosition(function(x, y) {
                if(!m.isOutOfBounds(x, y)) {
                    if(self.renderingGrid[x+','+y] != null) {
                        _.each(self.renderingGrid[x+','+y], function(entity) {
                            callback(entity);
                        });
                    }
                }
            }, this.renderer.mobile ? 0 : 2);
            
            } catch (e) {
                log.info(e);
            }
        },


        /**
         *
         */
        forEachVisibleTileIndex: function(callback, extra) {
            var m = this.map;

            this.camera.forEachVisiblePosition(function(x, y) {
                if(!m.isOutOfBounds(x, y)) {
                    callback(m.GridPositionToTileIndex(x, y) - 1);
                }
            }, extra);
        },

        /**
         *
         */
        forEachVisibleTile: function(callback, extra) {
            var self = this,
                m = this.map;

            if(m.isLoaded) {
                this.forEachVisibleTileIndex(function(tileIndex) {
                    if(_.isArray(m.data[tileIndex])) {
                        _.each(m.data[tileIndex], function(id) {
                            callback(id-1, tileIndex);
                        });
                    }
                    else {
                        if(_.isNaN(m.data[tileIndex]-1)) {
                            //throw Error("Tile number for index:"+tileIndex+" is NaN");
                        } else {
                            callback(m.data[tileIndex]-1, tileIndex);
                        }
                    }
                }, extra);
            }
        },

        /**
         *
         */
        forEachAnimatedTile: function(callback) {
            if(this.animatedTiles) {
                _.each(this.animatedTiles, function(tile) {
                    callback(tile);
                });
            }
        },

        /**
         * Returns the entity located at the given position on the world grid.
         * @returns {Entity} the entity located at (x, y) or null if there is none.
         */
        getEntityAt: function(x, y) {
            if(this.map.isOutOfBounds(x, y) || !this.entityGrid) {
                return null;
            }

            var entities = this.entityGrid[x+','+y] || [];
            var entity = null;
            if(_.size(entities) > 0) {
                entity = entities[_.keys(entities)[0]];
            } else {
                entity = this.getItemAt(x, y);
            }
            return entity;
        },

        getMobAt: function(x, y) {
            var entity = this.getEntityAt(x, y);
            if(entity && (entity instanceof Mob)) {
                return entity;
            }
            return null;
        },

        getPlayerAt: function(x, y) {
          var entity = this.getEntityAt(x, y);
            if(entity && (entity instanceof Player) && (entity !== this.player)) {
                return entity;
            }
            return null;
        },

       getNpcAt: function(x, y) {
            var entity = this.getEntityAt(x, y);
            if(entity && (entity instanceof Npc)) {
                return entity;
            }
            return null;
        },

        getChestAt: function(x, y) {
            var entity = this.getEntityAt(x, y);
            if(entity && (entity instanceof Chest)) {
                return entity;
            }
            return null;
        },
        
        getTrapAt: function(x, y) {
            var entity = this.getEntityAt(x, y);
            if(entity && (entity instanceof Trap)) {
                return entity;
            }
            return null;
        },

        getItemAt: function(x, y) {
            if(this.map.isOutOfBounds(x, y) || !this.itemGrid) {
                return null;
            }
            var items = this.itemGrid[x+','+y] || [],
                item = null;

            if(_.size(items) > 0) {
                // If there are potions/burgers stacked with equipment items on the same tile, always get expendable items first.
                _.each(items, function(i) {
                    if(Types.isExpendableItem(i.kind)) {
                        item = i;
                    };
                });

                // Else, get the first item of the stack
                if(!item) {
                    item = items[_.keys(items)[0]];
                }
            }
            return item;
        },

        /**
         * Returns true if an entity is located at the given position on the world grid.
         * @returns {Boolean} Whether an entity is at (x, y).
         */
        isEntityAt: function(x, y) {
            return !_.isNull(this.getEntityAt(x, y));
        },

        isMobAt: function(x, y) {
            return !_.isNull(this.getMobAt(x, y));
        },
        isPlayerAt: function(x, y) {
            return !_.isNull(this.getPlayerAt(x, y));
        },

        isItemAt: function(x, y) {
            return !_.isNull(this.getItemAt(x, y));
        },

        isNpcAt: function(x, y) {
            return !_.isNull(this.getNpcAt(x, y));
        },

        isChestAt: function(x, y) {
            return !_.isNull(this.getChestAt(x, y));
        },
        
        isTrapAt: function(x, y) {
            return !_.isNull(this.getTrapAt(x, y));
        },

        /**
         * Finds a path to a grid position for the specified character.
         * The path will pass through any entity present in the ignore list.
         */
        findPath: function(character, x, y, ignoreList) {
            var self = this,
                grid = this.pathingGrid,
                path = [],
                isPlayer = (character === this.player);

            if(this.map.isColliding(x, y)) {
                return path;
            }

            if(this.pathfinder && character) {
                if(ignoreList) {
                    _.each(ignoreList, function(entity) {
                        self.pathfinder.ignoreEntity(entity);
                    });
                }

                path = this.pathfinder.findPath(grid, character, x, y, false);

                if(ignoreList) {
                    this.pathfinder.clearIgnoreList();
                }
            } else {
                log.error("Error while finding the path to "+x+", "+y+" for "+character.id);
            }
            return path;
        },

        /**
         * Toggles the visibility of the pathing grid for debugging purposes.
         */
        togglePathingGrid: function() {
            if(this.debugPathing) {
                this.debugPathing = false;
            } else {
                this.debugPathing = true;
            }
        },

        /**
         * Toggles the visibility of the FPS counter and other debugging info.
         */
        toggleDebugInfo: function() {
            if(this.renderer && this.renderer.isDebugInfoVisible) {
                this.renderer.isDebugInfoVisible = false;
            } else {
                this.renderer.isDebugInfoVisible = true;
            }
        },

        /**
         *
         */
        movecursor: function() {
            var mouse = this.getMouseGridPosition(),
                x = mouse.x,
                y = mouse.y;

            this.cursorVisible = true;

            if(this.player && !this.renderer.mobile && !this.renderer.tablet) {
                this.hoveringCollidingTile = this.map.isColliding(x, y);
                this.hoveringPlateauTile = this.player.isOnPlateau ? !this.map.isPlateau(x, y) : this.map.isPlateau(x, y);
                this.hoveringMob = this.isMobAt(x, y);
                this.hoveringPlayer = this.isPlayerAt(x, y);
                this.isHoverHimself = (this.player.gridX == x && this.player.gridY == y);
                this.hoveringItem = this.isItemAt(x, y);
                this.hoveringNpc = this.isNpcAt(x, y);
                this.hoveringOtherPlayer = this.isPlayerAt(x, y);
                this.hoveringChest = this.isChestAt(x, y);
                this.hoveringTrap = this.isTrapAt(x, y);
                    
                if(this.hoveringMob || this.hoveringNpc || this.hoveringChest || this.hoveringOtherPlayer) {
                    var entity = this.getEntityAt(x, y);
					
					this.hoveringFriend = entity.pid && this.player && this.player.friends && this.player.friends[entity.pid];

                    if(this.hoveringOtherPlayer){
                        return false;
                    }

                    this.player.showTarget(entity);
                    
                    if(!entity.isHighlighted && this.renderer.supportsSilhouettes) {
                        if(this.lastHovered) {
                            this.lastHovered.setHighlight(false);
                        }
                        //entity.setHighlight(true);
                    }
                    this.lastHovered = entity;
                }
                else if(this.lastHovered) {
                    if(typeof this.detailTimer != 'undefined'){
                        clearInterval(this.detailTimer);
                        delete this.detailTimer;
                    }
                    this.lastHovered.setHighlight(null);
                    if(!this.player.hasTarget()){
                        this.player.inspecting = null;
                    }
                    if(typeof entity == 'undefined'){
                        this.player.inspecting = null;
                    }
                    if(this.player.inspecting == null) {
                        var self = this;
                        if(!this.player.hasTarget()) {
	                        this.timeout = setTimeout(function(){
	                            if(!self.app.inspectorFadeOut) {
		                        	$('#inspector').fadeOut('fast');
		                            self.app.inspectorFadeOut = true;
	                            }
	                            $('#inspector .health').text('');
	                            if(self.player){
	                                self.player.inspecting = null;
	                            }
	                        }, 1000);
                        } else {
                        	this.player.inspecting = this.player.target;
                        }
                    }
                    this.lastHovered = null;
                }
            }
        },

        /**
         * Moves the player one space, if possible
         */
        keys: function(pos, orientation) {
            this.hoveringCollidingTile = false;
            this.hoveringPlateauTile = false;

            // not sure why this is here
            if(!this.player.disableKeyboardNpcTalk)
                this.previousClickPosition = pos;

            if(!this.player.isMoving()) {
				var d = new Date();
				var now = d.getTime(); 
				if(this.lastKeySend + 100 > now){
					log.info('skip input');
					return;
				}
				this.lastKeySend = now;
                this.cursorVisible = false;
                this.processInput(pos, true);
            }
        },

        click: function()
        {
            var pos = this.getMouseGridPosition();

            /*if(pos.x === this.previousClickPosition.x &&
             pos.y === this.previousClickPosition.y) {
                return;
            } else {*/
                this.previousClickPosition = pos;
            //}

            this.processInput(pos, false);
        },

        /**
         * Processes game logic when the user triggers a click/touch event during the game.
         */
        processInput: function(pos, keys) {
			if(this.currentZoning && this.currentZoning.inProgress){
				log.info('prevent walking during transition');
				return false;
			}
			
			var isSightMode = this.isStopAndAtack();
			var entity = this.getEntityAt(pos.x, pos.y);
			var self = this;
			
				if(!entity || (this.player.isAttacking() && this.player.target != entity)) {
	                this.player.disengage();
	            }
				
	            if(!entity || (this.player.followingMode && this.player.target != entity)) {
	                this.player.followingMode = false;
	                this.player.target = null;
	            }
            
			// bow active - check if we are clicking destination
			if (Types.isWeapon(this.inventoryActiveItem)) {
				this.clickToFire = null;
				if(entity instanceof Mob || (entity instanceof Player && entity !== this.player && this.player.pvpFlag && this.pvpFlag)) {
					this.makePlayerAttack(entity);
					if(entity instanceof Player) {
						log.info("processInput sendDetail attack "+entity.name);
						this.client.sendDetail(entity.name);
					}
				}
			} else
                this.clickToFire = Types.getProjectileForSpell(this.inventoryActiveItem);

            // bow/spell cast click
            if (this.clickToFire !== null
            	&& this.started
            	&& (isSightMode
            		|| (entity !== null
            				&& (entity instanceof Mob
            					|| (entity instanceof Player && entity !== this.player && this.player.pvpFlag && this.pvpFlag)
            				)
            			)
            		)
            	)
            {
                if(this.player.canAttack(this.currentTime, true)) // cooldown beetwen spell/bow shoot
                {
                    this.player.lookAtTarget({gridX: pos.x, gridY: pos.y});
                    var targetPosition = {x: pos.x * 16 + 8, y: pos.y * 16 + 8};
                    this.player.hit(null, this.client);
                    this.client.sendCastSpell(this.clickToFire, this.player.x + 8, this.player.y + 8, targetPosition.x, targetPosition.y);
                }

                this.previousClickPosition = {};
                if(!isSightMode) {
                	this.clickToFire = null;
                }
                log.info("after spell clickToFire: "+this.clickToFire+" isSightMode: "+isSightMode);
                return;
            }
            
            // regular click
            if(this.started
            && this.player
            && !this.player.isDead
            && !this.hoveringCollidingTile
            && !this.hoveringPlateauTile) {
                
                //log.info("regular click isSightMode: "+isSightMode);
                var isAnotherPlayer = entity instanceof Player && entity !== this.player;
                var isPlayerNotGuest = isAnotherPlayer && entity.name.charAt(0) != "_";

                if(isPlayerNotGuest && !this.pvpFlag && !keys){
					if(entity.pid && this.player && this.player.friends && this.defenseItem === Types.Action.SOCIAL_STATE){

                        var isFriend = this.player.friends[entity.pid];

                        if(isFriend) {
                            var inspected = new Warrior("player", entity.name);
                            this.client.sendProfile(entity.name);
                        }
                        else
                        {
                            this.lastProfile = {pid: entity.pid, name: entity.name};

                            $('#requesttext').text('Friend '+entity.name);
                            $('.friendRequest').show();

                            this.friendRequestTimer = setInterval(function(){
                                self.showFriendRequest(entity);
                            }, 100);

                            this.friendRequestTimeout = setTimeout(function(){
                                $('.friendRequest').hide();
                                clearInterval(self.friendRequestTimer);
                            }, 12000);
                        }
						return;
					}
                }

                if(entity instanceof Player && this.defenseItem !== Types.Action.SOCIAL_STATE){
                    if(this.player.canAttack(this.currentTime, true)) // cooldown beetwen spell use
                        this.client.sendCastSpell(this.defenseItem, this.player.x+8,this.player.y+8,pos.x*16+8,pos.y*16+8, entity.id);

                    this.previousClickPosition = {};
                    return;
                }
                
                if(this.isItemInstance(entity)) {
                    this.makePlayerGoToItem(entity);
                }
                else if(entity instanceof Lever) {
                    this.makePlayerGoToLever(entity);
                }
                else if(entity instanceof Npc) {
                    if(this.player.isAdjacentNonDiagonal(entity) === false) {
                        this.makePlayerTalkTo(entity);
                    } else {
                        if(!this.player.disableKeyboardNpcTalk) {
                            this.makeNpcTalk(entity);

                            if(this.player.moveUp || this.player.moveDown || this.player.moveLeft || this.player.moveRight)
                                this.player.disableKeyboardNpcTalk = true;
                        }
                    }
                }
                else if(entity instanceof Chest) {
                    this.makePlayerOpenChest(entity);
                }
                else if(entity instanceof Trap) {
                    this.makePlayerFallInTrap(entity);
                }
                else {
                    this.makePlayerGoTo(pos.x, pos.y);
                }
            }else{
				log.info('input disabled ');
			}
        },
		
		showFriendRequest: function(entity){
			$('.friendRequest').css('left', (entity.x - this.renderer.camera.x) * this.renderer.scale - ($('.friendRequest').width() / 2) + entity.sprite.width / 2);
			$('.friendRequest').css('top', (entity.y - this.renderer.camera.y) * this.renderer.scale - 100);
		},

        isMobOnSameTile: function(mob, x, y) {
            var X = x || mob.gridX,
                Y = y || mob.gridY,
                list = this.entityGrid[X+','+Y] || [],
                result = false;

            _.each(list, function(entity) {
                if(entity instanceof Mob && entity.id !== mob.id) {
                    result = true;
                }
            });
            return result;
        },

        getFreeAdjacentNonDiagonalPosition: function(entity) {
            var self = this,
                result = null;

            entity.forEachAdjacentNonDiagonalPosition(function(x, y, orientation) {
                if(!result && !self.map.isColliding(x, y) && !self.isMobAt(x, y)) {
                    result = {x: x, y: y, o: orientation};
                }
            });
            return result;
        },

        tryMovingToADifferentTile: function(character) {
            var attacker = character,
                target = character.target;

            if(attacker && target && target instanceof Player) {
                if(!target.isMoving() && attacker.getDistanceToEntity(target) === 0) {
                    var pos;

                    switch(target.orientation) {
                        case Types.Orientations.UP:
                            pos = {x: target.gridX, y: target.gridY - 1, o: target.orientation}; break;
                        case Types.Orientations.DOWN:
                            pos = {x: target.gridX, y: target.gridY + 1, o: target.orientation}; break;
                        case Types.Orientations.LEFT:
                            pos = {x: target.gridX - 1, y: target.gridY, o: target.orientation}; break;
                        case Types.Orientations.RIGHT:
                            pos = {x: target.gridX + 1, y: target.gridY, o: target.orientation}; break;
                    }

                    if(pos) {
                        attacker.previousTarget = target;
                        attacker.disengage();
                        attacker.idle();
                        this.makeCharacterGoTo(attacker, pos.x, pos.y);
                        target.adjacentTiles[pos.o] = true;

                        return true;
                    }
                }

                if(!target.isMoving() && attacker.isAdjacentNonDiagonal(target) && this.isMobOnSameTile(attacker)) {
                    var pos = this.getFreeAdjacentNonDiagonalPosition(target);

                    // avoid stacking mobs on the same tile next to a player
                    // by making them go to adjacent tiles if they are available
                    if(pos && !target.adjacentTiles[pos.o]) {
                        if(this.player.target && attacker.id === this.player.target.id) {
                            return false; // never unstack the player's target
                        }

                        attacker.previousTarget = target;
                        attacker.disengage();
                        attacker.idle();
                        this.makeCharacterGoTo(attacker, pos.x, pos.y);
                        target.adjacentTiles[pos.o] = true;

                        return true;
                    }
                }
            }
            return false;
        },

        /**
         *
         */
        onCharacterUpdate: function(character) {
            var time = this.currentTime,
                self = this;
            
            // If mob has finished moving to a different tile in order to avoid stacking, attack again from the new position.
            if(character.previousTarget && !character.isMoving() && character instanceof Mob) {
                var t = character.previousTarget;

                if(this.getEntityById(t.id)) { // does it still exist?
                    character.previousTarget = null;
                    this.createAttackLink(character, t);
                    return;
                }
            }

            if(character.isAttacking() && (!character.previousTarget || character.id === this.playerId)) {
                var isMoving = this.tryMovingToADifferentTile(character); // Don't let multiple mobs stack on the same tile when attacking a player.

                if(character.canAttack(time)) {
                    if(!isMoving) { // don't hit target if moving to a different tile.
                        if(character.hasTarget() && character.getOrientationTo(character.target) !== character.orientation) {
                            character.lookAtTarget();
                        }

                        character.hit(null, this.client);

                        if(character.id === this.playerId) {
                            this.client.sendHit(character.target);
                        }

                        if(character instanceof Player && this.camera.isVisible(character)) {
                            this.audioManager.playSound("hit"+Math.floor(Math.random()*2+1));
                        }

                        if(character.hasTarget() && character.target.id === this.playerId && this.player && !this.player.invincible) {
                            this.client.sendHurt(character);
                        }
                    }
                } else {
                    if(character.hasTarget()
                    && character.isDiagonallyAdjacent(character.target)
                    && character.target instanceof Player
                    && character.isMeleeRange()
                    && !character.target.isMoving()) {
                        character.follow(character.target);
                    }
                }
            }
        },

        isZoningTile: function(x, y, fromx, fromy) {
        
            // if mobile use old camera based method (buggy due to timing issues)
            // the camera position varies in a non uniform way in mobile mode
            // making the absolute position based strategy infeasible
            if (this.renderer.mobile) {
                var c = this.camera;            
                x = x - c.gridX;
                y = y - c.gridY;                
                if(x === 0 || y === 0 || x === c.gridW-1 || y === c.gridH-1) {
                    return true;
                }
                return false;
            }

            var zoneWidth = 28;
            var zoneHeight = 12;
            
            // left
            if (x % zoneWidth == 0) {
                if (fromx > x) {
                    return true;
                }
            }
            
            // right
            if (x % zoneWidth == 1) {
                if (fromx < x) {
                    return true;
                }
            }
            // up
            if (y % zoneHeight == 0) {
                if (fromy > y) {
                    return true;
                }
            }
            
            // down
            if (y % zoneHeight == 1) {
                if (fromy < y) {
                    return true;
                }
            }
            
            return false;
        },

        getZoningOrientation: function(x, y) {
            var orientation = "",
                c = this.camera;

            x = x - c.gridX;
            y = y - c.gridY;

            if(x === 0) {
                orientation = Types.Orientations.LEFT;
            }
            else if(y === 0) {
                orientation = Types.Orientations.UP;
            }
            else if(x === c.gridW-1) {
                orientation = Types.Orientations.RIGHT;
            }
            else if(y === c.gridH-1) {
                orientation = Types.Orientations.DOWN;
            }

            return orientation;
        },

        startZoningFrom: function(x, y) {
            this.zoningOrientation = this.getZoningOrientation(x, y);

            if(this.renderer.mobile || this.renderer.tablet) {
                var z = this.zoningOrientation,
                    c = this.camera,
                    ts = this.renderer.tilesize,
                    x = c.x,
                    y = c.y,
                    xoffset = (c.gridW - 2) * ts,
                    yoffset = (c.gridH - 2) * ts;

                if(z === Types.Orientations.LEFT || z === Types.Orientations.RIGHT) {
                    x = (z === Types.Orientations.LEFT) ? c.x - xoffset : c.x + xoffset;
                } else if(z === Types.Orientations.UP || z === Types.Orientations.DOWN) {
                    y = (z === Types.Orientations.UP) ? c.y - yoffset : c.y + yoffset;
                }
                c.setPosition(x, y);
                this.endZoning();
            } else {
				if(this.currentZoning == null){
					log.info('start zoning');
					this.currentZoning = new Transition();
					log.info(this.zoningQueue);
				}
            }
            this.bubbleManager.clean();
            this.client.sendZone();
        },

        enqueueZoningFrom: function(x, y) {
			// this is a bigger bandaid that abandons all zones when transition gets stuck
			
			// Maybe it would be better to have a function that converts x,y to zones and mobile zones 
			// and keep track that way instead of using funky xy math here.
			if(this.zoningQueue.length > 1){
				for(var i = 0; i < this.zoningQueue.length; i++){
					if(this.zoningQueue[i].x == x || this.zoningQueue[i].y == y){
						if(!this.currentZoning || this.currentZoning.inProgress == false){
							this.currentZoning = null;
							this.resetZone();
							this.zoningQueue = [];
							log.info('abandon zone que');
							return false;
						}else{
							log.info('zone que prevented');
							return false;
						}
						break;
						//log.info(this.zoningQueue);
					}
				}
			}
			log.info('enqueueZoningFrom:'+x+','+y);
			this.zoningQueue.push({x: x, y: y});
			//log.info(this.zoningQueue);
				
			if(this.zoningQueue.length === 1) {
				this.startZoningFrom(x, y);
			}
        },

        endZoning: function() {
			log.info('end zoning');
            this.currentZoning = null;
            this.resetZone();
            this.zoningQueue.shift();
			
			// Force immediate drawing of all visible entities in the new zone as they may has changed positions
			this.renderer.clearScreen(this.renderer.context);
            this.forEachVisibleEntityByDepth(function(entity) {
                entity.setDirty();
            });

            if(this.zoningQueue.length > 0) {
                var pos = this.zoningQueue[0];
                this.startZoningFrom(pos.x, pos.y);
            }
        },
		
		// this should not be trusted
        isZoning: function() {
            return !_.isNull(this.currentZoning);
        },

        resetZone: function() {
            this.bubbleManager.clean();
            this.initAnimatedTiles();
            this.renderer.renderStaticCanvases();
        },

        resetCamera: function() {
			if(this.camera){
				this.camera.focusEntity(this.player);
				this.resetZone();
			}
        },

        say: function(message) {
                        
            if (message === '!fps'){
                $('#stats').toggle();
            }            
        
            if (message === '!debug'){
                //this.client.debugMessages = true;
				this.togglePathingGrid();
				this.toggleDebugInfo();
            }
            
            if (message === '!cheat'){
            	this.client.sendAchievement(0, "cheat");
            }
            
            if (message === '!stop'){
            	this.isStopped = true;
            }
                    
            //#cli guilds
            var regexp = /^\/guild\ (invite|create|accept)\s+([^\s]*)|(guild:)\s*(.*)$|^\/guild\ (leave)$/i;
            var args = message.match(regexp);
            if(args != undefined){
                switch(args[1]){
                    case "invite":
                        if(this.player.hasGuild()){
                            this.client.sendGuildInvite(args[2]);
                        }
                        else{
                            this.showNotification("Invite "+args[2]+" to where?");
                        }
                        break;
                    case "create":
                        this.client.sendNewGuild(args[2]);
                        break;
                    case undefined:
                        if(args[5]==="leave"){
                            this.client.sendLeaveGuild();
                        }
                        else if(this.player.hasGuild()){
                            this.client.talkToGuild(args[4]);
                        }
                        else{
                            this.showNotification("You got no-one to talk to…");
                        }
                        break;
                    case "accept":
                        var status;
                        if(args[2] === "yes") {
                            status = this.player.checkInvite();
                            if(status === false){
                                this.showNotification("You were not invited anyway…");
                            }
                            else if (status < 0) {
                                this.showNotification("Sorry to say it's too late…");
                                setTimeout(function(){self.showNotification("Find someone and ask for another invite.")},2500);
                            }
                            else{
                                this.client.sendGuildInviteReply(this.player.invite.guildId, true);
                            }
                        }
                        else if(args[2] === "no"){
                            status = this.player.checkInvite();
                            if(status!==false){
                                this.client.sendGuildInviteReply(this.player.invite.guildId, false);
                                this.player.deleteInvite();
                            }
                            else{
                                this.showNotification("Whatever…");
                            }
                        }
                        else{
                            this.showNotification("“guild accept” is a YES or NO question!!");
                        }
                        break;
                }   
            }
            if(this.app.guestPlay && message != '!test' && message != '!castle'){
                //this.audioManager.playSound("noloot");
                this.showNotification('Guests can not chat. Save your account from the player page.');
				ga('send', 'event', 'button', 'click', 'guest chat failure');
            }else{
                this.chat.sendChatMessage(message);
				ga('send', 'event', 'button', 'click', 'user chat');
            }
            

        },

        createBubble: function(id, message) {
            this.bubbleManager.create(id, message, this.currentTime);
        },

        destroyBubble: function(id) {
            this.bubbleManager.destroyBubble(id);
        },

        assignBubbleTo: function(character) {
            var bubble = this.bubbleManager.getBubbleById(character.id);
            if(bubble) {
                var s = this.renderer.scale,
                    t = 16 * s, // tile size
                    x = ((character.x - this.camera.x) * s),
                    w = parseInt(bubble.element.css('width')) + 24,
                    offset = (w / 2) - (t / 2),
                    offsetY,
                    y;

                if(character instanceof Npc) {
                    offsetY = 0;
                } else {
                    if(s === 2) {
                        if(this.renderer.mobile) {
                            offsetY = 0;
                        } else {
                            offsetY = 15;
                        }
                    } else {
                        offsetY = 12;
                    }
                }

                y = ((character.y - this.camera.y) * s) - (t * 2) - offsetY;

                bubble.element.css('left', x - offset + 'px');
                bubble.element.css('top', y + 'px');
            }
        },

        respawn: function() {
            log.debug("Beginning respawn");

            this.entities = {};
			this.projectiles = {};
            this.initEntityGrid();
            this.initPathingGrid();
            this.initRenderingGrid();

            this.player = new Warrior("player", this.username);
            this.player.pw = this.userpw;
            this.player.email = this.email;
            this.initPlayer();
            this.app.initTargetHud();
			
			this.isStopped = false;
            this.started = true;
            this.clickToFire = null;
            this.client.enable();
            this.client.sendLogin(this.player);

            this.storage.incrementRevives();

            this.renderer.clearScreen(this.renderer.context);
            this.forEachVisibleEntityByDepth(function(entity) {
                entity.setDirty();
            });

            log.debug("Finished respawn");
        },

        onGameStart: function(callback) {
            this.gamestart_callback = callback;
        },
        
        onSpriteLoadProgress: function(callback) {
            this.spriteLoadProgress_callback = callback;
        },
        
        onSpriteLoadComplete: function(callback) {
            log.info("onSpriteLoadComplete spriteLoadComplete"+this.spriteLoadComplete);
        	this.spriteLoadComplete_callback = callback;
            if (this.spriteLoadComplete == true){
                // immediate
            	log.info("onSpriteLoadComplete immediate");
                this.spriteLoadComplete_callback();
            }
        },        

        onDisconnect: function(callback) {
            this.disconnect_callback = callback;
        },

        onPlayerDeath: function(callback) {
            this.playerdeath_callback = callback;
        },

        onUpdateTarget: function(callback){
          this.updatetarget_callback = callback;
        },
        
        onPlayerExpChange: function(callback){
            this.playerexp_callback = callback;
        },
        
        onGameMessage: function(callback){
            this.gamemessage_callback = callback;
        },

        onPlayerHurt: function(callback) {
            this.playerhurt_callback = callback;
        },

        onPlayerEquipmentChange: function(callback) {
            this.equipment_callback = callback;
        },

        onNbPlayersChange: function(callback) {
            this.nbplayers_callback = callback;
        },
        
        onGuildPopulationChange: function(callback) {
            this.nbguildplayers_callback = callback;
        },

        onNotification: function(callback) {
            this.notification_callback = callback;
        },

        resize: function() {
            var x = this.camera.x,
                y = this.camera.y,
                currentScale = this.renderer.scale,
                newScale = this.renderer.getScaleFactor();

                this.renderer.rescale(newScale);
                this.camera = this.renderer.camera;
                this.camera.setPosition(x, y);

                this.renderer.renderStaticCanvases();
        },
        updateExp: function(newExp, exp, level) {
			// tracking
			if(this.player.experience == 0 && exp > 0){
				ga('send', 'event', 'update', 'player', 'first experience');
			}
			
            var levelledUp = (this.player.level < level);
            
            if(newExp > 0)
            {
            	this.infoManager.addDamageInfo("+"+newExp+" exp", this.player.x, this.player.y - 15, "exp", 3000);
            }
            
            this.player.experience = exp;
            
            if (levelledUp) {
				ga('send', 'event', 'update', 'player', 'level', level);
                this.player.level = level;
                this.showNotification( "Level " + this.player.level + " reached!");
                this.audioManager.playSound("levelup");
                         
                $('#levelup-notification').show();
                         
                // transition fails async if display: set at same time, add short delay
                setTimeout(function () {
                    $('#levelup-notification').addClass('active');
                }, 20);
                         
                setTimeout(function() {
                    $('#levelup-notification').removeClass('active');
                    $('#levelup-notification').hide();
                }, 2000);
                         
            }
            
            if(this.playerexp_callback) {
            	var needExp = Types.expForLevel(this.player.level + 1);
            	var prevExp = Types.expForLevel(this.player.level);
            	var needNext = needExp - prevExp;
            	var curExp = this.player.experience - prevExp;
            	
            	this.playerexp_callback(curExp, needNext);
            }
        },
        updateTarget: function(targetId, points, hitPoints, maxHp){
            if(this.player.hasTarget() && this.updatetarget_callback){
                var target = this.getEntityById(targetId);
                target.name = Types.getKindAsString(target.kind);
                target.points = points;
                target.hitPoints = hitPoints;
                target.maxHitPoints = maxHp;
                this.updatetarget_callback(target);
            }
        },
        updateTarget2: function(target){
            if(this.updatetarget_callback){
                this.updatetarget_callback(target);
            }
        },
    
        getDeadMobPosition: function(mobId) {
            var self = this;
            var position;

            if(mobId in this.deathpositions) {
                position = this.deathpositions[mobId];
                setTimeout(function() { delete self.deathpositions[mobId]}, 500);
            }

            return position;
        },

        onAchievementUnlock: function(callback) {
            this.unlock_callback = callback;
        },

        tryUnlockingAchievement: function(name) {
            var achievement = null;
            if(name in this.achievements) {
                achievement = this.achievements[name];

                if(achievement.isCompleted() && this.storage.unlockAchievement(achievement.id)) {
                    if(this.unlock_callback) {
                        this.unlock_callback(achievement.id, achievement.name, achievement.desc);
                        this.audioManager.playSound("achievement");
                        this.client.sendAchievement(achievement.id, achievement.name); // notify server
                        this.infoManager.addDamageInfo("+1000", this.player.x, this.player.y - 15, "crystals", 5000);
                    }
                }
            }
        },
        
        // client side inventory quantity check for use in npc.js
        /*inventoryContains: function(kind,quantity){
            
            quantity = quantity || 1;
            
            for (var i=0;i<this.inventoryData.items.length;i++){
           
                if (this.inventoryData.items[i] === kind) {
                    if (this.inventoryData.quantities[i] >= quantity) {
                        return true;
                    }
                }
            
            }
        
            return false;
        },*/

        showNotification: function(message) {
            if(this.notification_callback && message != null) {
                this.notification_callback(message);
            }
        },

        isItemInstance: function(item) {
            return item instanceof Item || item instanceof CollectionItem;
        },

        removeObsoleteEntities: function() {
            var nb = _.size(this.obsoleteEntities),
                self = this;
            if(nb > 0) {
                _.each(this.obsoleteEntities, function(entity) {
                    if(entity.id != self.player.id) { // never remove yourself
                        self.removeEntity(entity);
                    }
                });
                log.debug("Removed "+nb+" entities: "+_.pluck(_.reject(this.obsoleteEntities, function(id) { return id === self.player.id }), 'id'));
                this.obsoleteEntities = null;
            }
        },

        /**
         * Fake a mouse move event in order to update the cursor.
         *
         * For instance, to get rid of the sword cursor in case the mouse is still hovering over a dying mob.
         * Also useful when the mouse is hovering a tile where an item is appearing.
         */
        updateCursor: function() {
            if(!this.cursorVisible)
                var keepCursorHidden = true;

            this.movecursor();
            this.updateCursorLogic();

            if(keepCursorHidden)
                this.cursorVisible = false;
        },

        /**
         * Change player plateau mode when necessary
         */
        updatePlateauMode: function() {
            if(this.map.isPlateau(this.player.gridX, this.player.gridY)) {
                this.player.isOnPlateau = true;
            } else {
                this.player.isOnPlateau = false;
            }
        },

        updatePlayerCheckpoint: function() {
            var checkpoint = this.map.getCurrentCheckpoint(this.player);

            if(checkpoint) {
                var lastCheckpoint = this.player.lastCheckpoint;
                if(!lastCheckpoint || (lastCheckpoint && lastCheckpoint.id !== checkpoint.id)) {
                    this.player.lastCheckpoint = checkpoint;
                    this.client.sendCheck(checkpoint.id);
                }
            }
        },

        makeAttackerFollow: function(attacker) {
        if(!attacker){
            return;
        }
              var target = attacker.target;

              if(attacker.canReachTarget()) {
                    attacker.lookAtTarget();
              } else {
                  attacker.follow(target);
              }
        },

        forEachEntityAround: function(x, y, r, callback) {
            for(var i = x-r, max_i = x+r; i <= max_i; i += 1) {
                for(var j = y-r, max_j = y+r; j <= max_j; j += 1) {
                    if(!this.map.isOutOfBounds(i, j)) {
                        if (this.renderingGrid[i+','+j] != null) {
                            _.each(this.renderingGrid[i+','+j], function(entity) {
                                callback(entity);
                            });
                        }
                    }
                }
            }
        },

        checkOtherDirtyRects: function(r1, source, x, y) {
            var r = this.renderer;

            this.forEachEntityAround(x, y, 2, function(e2) {
                if(source && source.id && e2.id === source.id) {
                    return;
                }
                if(!e2.isDirty) {
                    var r2 = r.getEntityBoundingRect(e2);
                    if(r.isIntersecting(r1, r2)) {
                        e2.setDirty();
                    }
                }
            });

            if(source && !(source.hasOwnProperty("index"))) {
                this.forEachAnimatedTile(function(tile) {
                    if(!tile.isDirty) {
                        var r2 = r.getTileBoundingRect(tile);
                        if(r.isIntersecting(r1, r2)) {
                            tile.isDirty = true;
                        }
                    }
                });
            }

            if(!this.drawTarget && this.selectedCellVisible) {
                var targetRect = r.getTargetBoundingRect();
                if(r.isIntersecting(r1, targetRect)) {
                    this.drawTarget = true;
                    this.renderer.targetRect = targetRect;
                }
            }
        },

        tryLootingItem: function(item) {
            try {

                if((Types.isSpell(item.kind) && this.player.isSpellEquip(item.kind)) ||
                   (Types.isItem(item.kind)  && this.player.getInventory().isItemExist(item.kind)))
                    return;

                // looting achievements here                
                if(item.kind == Types.Entities.WARDEN){
                    if(!this.storage.hasKey('wardenDone')){
                        this.storage.saveToLocal('hasWarden', 1);
                    }else{
                        this.showNotification("You already returned the Mist Warden");
                        return;
                    }
                }
                
                if(item.kind == Types.Entities.BOOK){
                    if(!this.storage.hasKey('bookDone')){
                        this.storage.saveToLocal('hasBook', 1);
                    }else{
                        this.showNotification("You already returned the writer's book");
                        return;
                    }
                }
                
                if(item.kind == Types.Entities.CAKE){
                    if(item.gridX >= 356 && item.gridX <= 363 && item.gridY >= 305 && item.gridY <= 309){
                        this.tryUnlockingAchievement("GAUNTLET_RUN");
                    }
                }

                if(item.kind == Types.Entities.KEY){
                    //keys objects
                    var keyData = this.map._getKeyData(item.gridX, item.gridY);
                    if (this.player.getInventory().hasKey(keyData[0])) {
                        this.showNotification("You've already picked up this key");
                        return;
                    }

                    if(keyData){
                        this.client.sendKey(keyData[0]);
                        this.showNotification(keyData[1]);
                    }

                    var keys = [
                        [339, 362, 63,  70,  2, 'You pickup the exit key'],
                        [252, 309, 205, 217, 3, 'You pickup the prison key'],
                        [294, 309, 192, 205, 4, 'key 4 message here'],
                        [257, 260, 356, 358, 6, 'You pick up key 1 of 3 for dungeon #8'],
                        [332, 333, 365, 366, 7, 'You pick up key 2 of 3 for dungeon #8'],
                        [340, 341, 366, 368, 8, 'You pick up key 3 of 3 for dungeon #8'],
                        [338, 391, 182, 203, 9, 'You pickup the Mansion key']
                    ];

                    var KEY = {
                        GRID_X: 0,
                        GRID_X1: 1,
                        GRID_Y: 2,
                        GRID_Y1: 3,
                        KEY: 4,
                        MSG: 5
                    };

                    _.each(keys, function(body, index) {
                        if(item.gridX >= body[KEY.GRID_X] && item.gridX <= body[KEY.GRID_X1] && item.gridY >= body[KEY.GRID_Y] && item.gridY <= body[KEY.GRID_Y1]){
                            this.client.sendKey(body[KEY.KEY]);
                            this.showNotification(body[KEY.MSG]);
                        }
                    });

                    // must be deleted
                    // if key from dungeon 2; key is for the exit door for Dungeon 2
                    //if(item.gridX >= 339 && item.gridX <= 362 && item.gridY >= 63 && item.gridY <= 70){
                    //    this.client.sendKey(2);
                    //    this.showNotification('You pickup the exit key');
                    //}
                    //
                    //// if key from dungeon 5 / baron cave
                    //if(item.gridX >= 252 && item.gridX <= 309 && item.gridY >= 205 && item.gridY <= 217){
                    //    this.client.sendKey(3);
                    //    this.showNotification('You pickup the prison key');
                    //}
                    //
                    //// THIS KEY HAS BEEN REMOVED.  Instead, doorkey4 is activated after a dialogue with Faun.
                    //if(item.gridX >= 294 && item.gridX <= 309 && item.gridY >= 192 && item.gridY <= 205){
                    //    this.client.sendKey(4);
                    //    this.showNotification('key 4 message here');
                    //}
                    //
                    //// key 6 genards dungeon
                    //if(item.gridX >= 257 && item.gridX <= 260 && item.gridY >= 356 && item.gridY <= 358){
                    //    this.client.sendKey(6);
                    //    this.showNotification('You pick up key 1 of 3 for dungeon #8');
                    //}
                    //
                    //// key 7 genards dungeon
                    //if(item.gridX >= 332 && item.gridX <= 333 && item.gridY >= 365 && item.gridY <= 366){
                    //    this.client.sendKey(7);
                    //    this.showNotification('You pick up key 2 of 3 for dungeon #8');
                    //}
                    //
                    //// key 8 genards dungeon
                    //if(item.gridX >= 340 && item.gridX <= 341 && item.gridY >= 366 && item.gridY <= 368){
                    //    this.client.sendKey(8);
                    //    this.showNotification('You pick up key 3 of 3 for dungeon #8');
                    //}
                    //
                    //// key 9 for Baron's front door, from Dungeon4 boss
                    //if(item.gridX >= 338 && item.gridX <= 391 && item.gridY >= 182 && item.gridY <= 203){
                    //    this.client.sendKey(9);
                    //    this.showNotification('You pickup the Mansion key');
                    //}
                }
                this.player.loot(item);
                this.client.sendLoot(item); // Notify the server that this item has been looted
                this.removeItem(item);
                this.showNotification(item.getLootMessage());

                if(Types.isHealingItem(item.kind)) {
                    this.audioManager.playSound("heal");
                } else {
                    this.audioManager.playSound("loot");
                }

            } catch(e) {
                if(e instanceof Exceptions.LootException) {
                    this.showNotification(e.message);
                    this.audioManager.playSound("noloot");
                } else {
                    throw e;
                }
            }
        },
        
        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        
        updatePlayerPage: function(player, isFriendProfile){
            var accName = isFriendProfile ? player.friendMainName  : this.player.accountName;
            var avatar =  isFriendProfile ? player.friendAccAvatar : this.player.accountAvatar;

            $('#char-name').text(player.showName);
            $('#char-level').text('Level: '+player.level);
            $('#char-health').text('Health: '+player.hitPoints+'/'+player.maxHitPoints );
            $('#hbar').width((player.hitPoints / player.maxHitPoints) * 100+'%' );
            $('#char-mana').text('Mana: '+player.manaPoints+'/'+player.maxManaPoints );
            $('#mbar').width((player.manaPoints / player.maxManaPoints) * 100+'%' );
            $('#char-CrystalsPvp').text('Crystals win in PVP: '+this.player.arenaCrystalWin);
            // exp difference between current and next level
            var expDelta = Types.expForLevel(player.level+1) - Types.expForLevel(player.level);
            // ratio of progress toward next level
            var levelProgress = (player.experience - Types.expForLevel(player.level)) / expDelta;
            var needExp = Types.expForLevel(player.level+1);

            $('#char-exp').text('Expirience: '+player.experience+'/'+needExp);
            $('#char-expirience').text('EXP: '+player.experience);
            $('#char-remortCrystals').text('Crystals: '+player.remortPoints);
            $('#char-remortExp').text('Legendary EXP: '+player.remortExp);
            $('#char-totalExp').text('Total EXP: '+(parseInt(player.experience)+parseInt(player.remortExp)));
            $('#char-netname').text(accName);
            $("#profile_menu #player-image").attr('src', avatar);

            $('#ebar').width((levelProgress) * 100+'%' );
            $('#playerimage').attr('src', player.image);
            $('#char-ach').text('Achievements: '+this.storage.data.achievements.unlocked.length+'/'+this.achievementCount);
            if(this.app.guestPlay){
                $('.invitebut').hide();
                $('.aboutjoinbut').show();
            }else{
                $('.aboutjoinbut').hide();
            }
            
            if(self.game && player.inspecting !== null) {
            	var target = player.inspecting;
            	$("#inspector").css('left', (target.x - self.game.renderer.camera.x) * scale - 70 + target.sprite.width / 2);
            	$("#inspector").css('top', (target.y - self.game.renderer.camera.y) * scale - 50);
            }

            var scale = this.renderer.scale;
            $(".armor_cell").css('backgroundImage', 'url(img/'+ scale +'/Item_'+ player.getArmorName() +'.png)');

            var shieldkind = Types.getKindFromString(player.getShieldName())
            var shieldRank = Types.getShieldRank(shieldkind);
            $(".shield_cell").css('backgroundImage', 'url(img/'+ scale +'/Item_shield'+ shieldRank +'.png)');

            if(player.getRingName() && player.getRingName() != 'none')
                $(".ring_cell").css('backgroundImage', 'url(img/'+ scale +'/'+ player.getRingName() +'.png)');

            if(player.getAmuletName() && player.getAmuletName() != 'none')
                $(".amulet_cell").css('backgroundImage', 'url(img/'+ scale +'/'+ player.getAmuletName() +'.png)');

            var weaponIconName = this.sprites[player.getWeaponName()].id;
            $(".weapon_cell").css('backgroundImage', 'url(img/'+ scale +'/Item_'+ weaponIconName +'.png)');

            this.scaleStuff();
        },
        
        scaleStuff: function(){
			$('.chatArea')[0].scrollTop = $('.chatArea')[0].scrollHeight;
			$('.msgArea')[0].scrollTop = $('.msgArea')[0].scrollHeight;
            $('.inventoryr2').removeClass('botsep');
            $('.inventoryr3').removeClass('botsep');
            if(this.renderer.mobile || this.renderer.tablet) {
                $('.inventoryr2').addClass('botsep');
                // player page widths
                $('#player-info-col').width('27%');
                $('#player-inventory-col').width('40%');
                $('#player-friends-col').width('39%');
                //this.hotbarSize = 7;
            }else{
                $('.inventoryr3').addClass('botsep');
                // player page widths
                $('#player-info-col').width('30%');
                $('#player-inventory-col').width('30%');
                $('#player-friends-col').width('45%');
                //this.hotbarSize = 7;
            }
            this.hotbar.updateHotbar();
        },

        ignoreFriend: function(id){
			var self = this;
            ID.api('links/accept/'+id, 'POST', null, function(response){
                self.client.sendUpdateFriends();
            });
        },
        acceptFriend: function(id){
			var self = this;
            ID.api('links/mutual_accept/'+id, 'POST', null, function(response){
                self.client.sendUpdateFriends();
            });
        },
        checkPendingFriends: function(){
            var self = this;
            ID.api('links/pending', 'GET', null, function(response){
                if(response.results && response.results.length == 1){
                    self.addChatMessage('GAME', response.results[0].nickname+' has sent you a friend request.');
                }else if(response.results.length > 1){
                    self.chat.addChatMessage('GAME', 'You have '+response.results.length+' pending friend requests.');
                }
            });
        },
        
        updateGlobes: function(){
            var self = this;
            var healthHeight = Math.floor((self.player.hitPoints / self.player.maxHitPoints) * (26 * self.renderer.scale));
            var healthDiff = (self.player.maxHitPoints * 26 * self.renderer.scale) - healthHeight;
            $('#healthfull').height(healthHeight);
            $('#healthfull').css('background-position', '0px '+healthDiff * -1+'px');
			$('#healthtext').text(Math.floor(self.player.hitPoints)+"/"+self.player.maxHitPoints);
                        
            var manaHeight = Math.floor((self.player.manaPoints / self.player.maxManaPoints) * (26 * self.renderer.scale))
            var manaDiff = (self.player.maxManaPoints * 26 * self.renderer.scale) - manaHeight;
            $('#manafull').height(manaHeight);
            $('#manafull').css('background-position', '0px '+manaDiff * -1+'px');
            $('#manatext').text(Math.floor(self.player.manaPoints)+"/"+self.player.maxManaPoints);
            
            $('#char-health').text('Health: '+self.player.hitPoints+'/'+self.player.maxHitPoints );
            $('#hbar').width((self.player.hitPoints / self.player.maxHitPoints) * 100+'%' );
            $('#char-mana').text('Mana: '+self.player.manaPoints+'/'+self.player.maxManaPoints );
            $('#mbar').width((self.player.manaPoints / self.player.maxManaPoints) * 100+'%' );
        },

        isStopAndAtack: function(){
            return $(".barbutton").hasClass("active");
        }
    });
    
    return Game;
});
