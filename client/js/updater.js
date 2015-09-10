
define(['character', 'timer'], function(Character, Timer) {

    var Updater = Class.extend({
        init: function(game) {
            this.game = game;
            this.playerAggroTimer = new Timer(1000);
            this.lastUpdate = new Date();
        },

        update: function() {
            this.deltaSeconds = (new Date() - this.lastUpdate) / 1000;
            this.updateZoning();
            this.updateCharacters();
            this.updatePlayerAggro();
            this.updateTransitions();
            this.updateAnimations();
            this.updateAnimatedTiles();
            this.updateChatBubbles();
            this.updateInfos();
            this.updateKeyboardMovement();
            this.updateProjectiles();
            this.lastUpdate = new Date();
        },

        updateCharacters: function() {
            var self = this;

            this.game.forEachEntity(function(entity) {
                var isCharacter = entity instanceof Character;

                if(entity.isLoaded) {
                    if(isCharacter) {
                        self.updateCharacter(entity);
                        self.game.onCharacterUpdate(entity);
                    }
                    self.updateEntityFading(entity);
                }
            });
        },
        
        updateProjectiles: function() {
            var self = this;
            this.game.forEachProjectile(function(projectile) {
                if(projectile.isLoaded) {
                    self.updateProjectile(projectile);
                }
            });
        },

        updatePlayerAggro: function() {
            var t = this.game.currentTime,
                player = this.game.player;

            // Check player aggro every 1s when not moving nor attacking
            if(player && !player.isMoving() && !player.isAttacking()  && this.playerAggroTimer.isOver(t)) {
                player.checkAggro();
            }
        },

        updateEntityFading: function(entity) {
            if(entity && entity.isFading) {
                var duration = 1000,
                    t = this.game.currentTime,
                    dt = t - entity.startFadingTime;

                if(dt > duration) {
                    this.isFading = false;
                    entity.fadingAlpha = 1;
                } else {
                    entity.fadingAlpha = dt / duration;
                }
            }
        },

        updateTransitions: function() {
            var self = this,
                m = null,
                z = this.game.currentZoning;

            this.game.forEachEntity(function(entity) {
                m = entity.movement;
                if(m) {
                    if(m.inProgress) {
                        m.step(self.game.currentTime);
                    }
                }
            });

            if(z) {
                if(z.inProgress) {
                    z.step(this.game.currentTime);
                }
            }
        },

        updateZoning: function() {
            var g = this.game,
                c = g.camera,
                z = g.currentZoning,
                s = 3,
                ts = 16,
                speed = 200;

            if(z && z.inProgress === false) {
                var orientation = this.game.zoningOrientation,
                    startValue = endValue = offset = 0,
                    updateFunc = null,
                    endFunc = null;

                if(orientation === Types.Orientations.LEFT || orientation === Types.Orientations.RIGHT) {
                    offset = (c.gridW - 2) * ts;
                    startValue = (orientation === Types.Orientations.LEFT) ? c.x - ts : c.x + ts;
                    endValue = (orientation === Types.Orientations.LEFT) ? c.x - offset : c.x + offset;
                    updateFunc = function(x) {
                        c.setPosition(x, c.y);
                        g.initAnimatedTiles();
                        g.renderer.renderStaticCanvases();
                    }
                    endFunc = function() {
                        c.setPosition(z.endValue, c.y);
                        g.endZoning();
                    }
                } else if(orientation === Types.Orientations.UP || orientation === Types.Orientations.DOWN) {
                    offset = (c.gridH - 2) * ts;
                    startValue = (orientation === Types.Orientations.UP) ? c.y - ts : c.y + ts;
                    endValue = (orientation === Types.Orientations.UP) ? c.y - offset : c.y + offset;
                    updateFunc = function(y) {
                        c.setPosition(c.x, y);
                        g.initAnimatedTiles();
                        g.renderer.renderStaticCanvases();
                    }
                    endFunc = function() {
                        c.setPosition(c.x, z.endValue);
                        g.endZoning();
                    }
                }

                z.start(this.game.currentTime, updateFunc, endFunc, startValue, endValue, speed);
            }
        },

        updateCharacter: function(c) {
            var self = this;
            // Estimate of the movement distance for one update
            var fps =50; // ugh
            var tick = Math.round(16 / Math.round((c.moveSpeed / (1000 / fps))));
            
            if (c.displaceEnds) {
                if (c.displaceEnds > new Date().getTime()) {
                    // linear tween
                    var timeLeft =  (c.displaceEnds - new Date().getTime()) / 1000;
                    var progress = (c.displaceSeconds - timeLeft) / c.displaceSeconds;
                    c.x = c.displaceOrigin.x * (1 - progress) + c.gridX * 16 * progress;
                    c.y = c.displaceOrigin.y * (1 - progress) + c.gridY * 16 * progress;
                } else {
                    c.displaceEnds = null;
                    c.x = c.gridX * 16;
                    c.y = c.gridY * 16;
                }
            }            
            
			//if (c.rangedTarget){
			//	// still in range?
			//	var dx = (c.x - c.rangedTarget.x);
			//	var dy = (c.y - c.rangedTarget.y);
			//	var distanceToTarget = Math.sqrt((dx*dx) + (dy*dy)) / 16; // in tiles
			//	if (distanceToTarget > c.projectileRange) {
			//		// target out of range
			//		if (!c.isMoving()) {
			//			c.moveTo_(c.rangedTarget.gridX,c.rangedTarget.gridY);
			//		}
			//	} else {
			//		// target in firing range
			//		if (c.isMoving()) {
			//			c.stop();
			//		}
			//		// if it's firing on our player
			//		if (this.game.player && (c.rangedTarget.id == this.game.player.id)) {
			//			if (c.canAttack(new Date().getTime(), true)) {
             //               c.hit();
			//					// ask server to raise a projectile
             //               this.game.client.sendMessage([Types.Messages.REQUEST_MOB_PROJECTILE, c.id, c.rangedTarget.id]);
			//			}
			//		}
			//	}
			//}
			
            if (c.hasBuff(Types.Buffs.POISONED) && c.buffowner /*&& c.buffowner[Types.Buffs.POISONED] == this.game.player.id*/) 
			{						
                if (c.poisonLastDealt == null) 
				{
					// no need to add the damage of Poisoned the first time as there was already the impact damage of Poison
                    c.poisonLastDealt = new Date();
                }		
				else if(c.poisonLastDealt && (new Date()) - c.poisonLastDealt > 1000)
				{
					this.game.client.sendHitRanged(c,Types.Projectiles.POISONED,c.gridX,c.gridY); // (time based poisoned dmg 'originates' at mob location)
                    c.poisonLastDealt = new Date();
				}				
            }
			
			
            
            if (c.hasBuff(Types.Buffs.STUNNED)) {
                // block movement when stunned
                return;
            }

            if(c.isMoving() && c.movement.inProgress === false) {
                if(c.orientation === Types.Orientations.LEFT) {
                    c.movement.start(this.game.currentTime,
                                     function(x) {
                                        c.x = x;
                                        c.hasMoved();
                                     },
                                     function() {
                                        c.x = c.movement.endValue;
                                        c.hasMoved();
                                        c.nextStep();
                                     },
                                     c.x - tick,
                                     c.x - 16,
                                     c.moveSpeed);
                }
                else if(c.orientation === Types.Orientations.RIGHT) {
                    c.movement.start(this.game.currentTime,
                                     function(x) {
                                        c.x = x;
                                        c.hasMoved();
                                     },
                                     function() {
                                        c.x = c.movement.endValue;
                                        c.hasMoved();
                                        c.nextStep();
                                     },
                                     c.x + tick,
                                     c.x + 16,
                                     c.moveSpeed);
                }
                else if(c.orientation === Types.Orientations.UP) {
                    c.movement.start(this.game.currentTime,
                                     function(y) {
                                        c.y = y;
                                        c.hasMoved();
                                     },
                                     function() {
                                        c.y = c.movement.endValue;
                                        c.hasMoved();
                                        c.nextStep();
                                     },
                                     c.y - tick,
                                     c.y - 16,
                                     c.moveSpeed);
                }
                else if(c.orientation === Types.Orientations.DOWN) {
                    c.movement.start(this.game.currentTime,
                                     function(y) {
                                        c.y = y;
                                        c.hasMoved();
                                     },
                                     function() {
                                        c.y = c.movement.endValue;
                                        c.hasMoved();
                                        c.nextStep();
                                     },
                                     c.y + tick,
                                     c.y + 16,
                                     c.moveSpeed);
                }
            }
        },
        
        
        updateProjectile: function(p) {
            var self = this;
            
            if (!p.impacted) {
            
                // Calc the movement distance for this update
                var mdist = p.speed * self.deltaSeconds;
                
                var dx = p.tx-p.x;
                var dy = p.ty-p.y;
                
                var tdist = Math.sqrt(dx*dx+dy*dy);
                var amount = mdist/tdist;
                
                // prevent "overshoot"
                if (amount > 1) amount = 1;
                
                p.x += dx * amount;
                p.y += dy * amount;
                
                // game/emitter/mob projected
                // collision with players in transit behaviour
				// note: visual caveat - only affected player will see in transit impact all others will see impact at projectile original target coordinates
                if (p.owner == 0) {
                    // which tile are we over
                    var tpos = { x: Math.floor(p.x/16), y: Math.floor(p.y/16) }
                    // player (self) standing here?
                    if (this.game.player) {
                        if (this.game.player.gridX == tpos.x) {
                            if (this.game.player.gridY == tpos.y) {
                                p.tx = this.game.player.x+8;
                                p.ty = this.game.player.y+8;
                                p.impact(this.game);
                            }
                        }
                    }
                }

                // tornadoes hit as they move over tiles
                if (p.kind === Types.Projectiles.TORNADO) {
                    // only track our own
                    if (this.game.player && p.owner == this.game.player.id) {
                        // which tile are we over
                        var tpos = { x: Math.floor(p.x/16), y: Math.floor(p.y/16) };
                        // has this changed
                        if (p.tpos == null || p.tpos && (p.tpos.x != tpos.x || p.tpos.y != tpos.y) ) {
                            // moved over new tile
                            this.game.detectCollateral(tpos.x,tpos.y,2,p.kind);
                        }
                        p.tpos = tpos;
                    }
                }
                
                if (tdist<1) {
                    p.impact(this.game);
                }
            
            }
          
        },
        
        updateKeyboardMovement: function()
        {           
            if(!this.game.player || this.game.player.isMoving())
                return;

            var game = this.game;
            var player = this.game.player;
                
            var pos = {
                x: player.gridX,
                y: player.gridY
            };

            if(player.moveUp)
            {
                pos.y -= 1;
                game.keys(pos, Types.Orientations.UP);
            }
            else if(player.moveDown)
            {
                pos.y += 1;
                game.keys(pos, Types.Orientations.DOWN);
            }
            else if(player.moveRight)
            {
                pos.x += 1;
                game.keys(pos, Types.Orientations.RIGHT);
            }
            else if(player.moveLeft)
            {
                pos.x -= 1;
                game.keys(pos, Types.Orientations.LEFT);
            }
        
        },

        updateAnimations: function() {
            var t = this.game.currentTime;

            this.game.forEachEntity(function(entity) {
                var anim = entity.currentAnimation;

                if(anim) {
                    if(anim.update(t)) {
                        entity.setDirty();
                    }
                }
            });
            
            this.game.forEachProjectile(function(projectile) {
                var anim = projectile.currentAnimation;
                if(anim) {
                    anim.update(t);
                }
            });

            var sparks = this.game.sparksAnimation;
            if(sparks) {
                sparks.update(t);
            }
            
            if(this.game.shieldAnimation) {
                this.game.shieldAnimation.update(t);
            }

            if(this.game.stunAnimation) {
                this.game.stunAnimation.update(t);
            }

            if(this.game.transformAnimation) {
                this.game.transformAnimation.update(t);
            }

            var target = this.game.targetAnimation;
            if(target) {
                target.update(t);
            }

            var atcTarget = this.game.atackedTargetAnimation;
            if(atcTarget) {
            	atcTarget.update(t);
            }
        },

        updateAnimatedTiles: function() {
            var self = this,
                t = this.game.currentTime;

            this.game.forEachAnimatedTile(function (tile) {
                if(tile.animate(t)) {
                    tile.isDirty = true;
                    tile.dirtyRect = self.game.renderer.getTileBoundingRect(tile);

                    if(self.game.renderer.mobile || self.game.renderer.tablet) {
                        self.game.checkOtherDirtyRects(tile.dirtyRect, tile, tile.x, tile.y);
                    }
                }
            });
        },

        updateChatBubbles: function() {
            var t = this.game.currentTime;

            this.game.bubbleManager.update(t);
        },

        updateInfos: function() {
            var t = this.game.currentTime;

            this.game.infoManager.update(t);
        }
    });

    return Updater;
});
