
define(['camera', 'item', 'character', 'player', 'timer', 'npc', 'animation'],
function(Camera, Item, Character, Player, Timer, Npc, Animation) {

    var Renderer = Class.extend({
        init: function(game, canvas, background, foreground) {
            this.game = game;
            this.camera = null;
            this.context = (canvas && canvas.getContext) ? canvas.getContext("2d") : null;
            this.background = (background && background.getContext) ? background.getContext("2d") : null;
            this.foreground = (foreground && foreground.getContext) ? foreground.getContext("2d") : null;

            this.canvas = canvas;
            this.backcanvas = background;
            this.forecanvas = foreground;
            
            this.scaleCanvas = 1;
            this.allowScale = true;

            this.tilesize = 16;

            this.upscaledRendering = this.context.mozImageSmoothingEnabled !== undefined;
            this.supportsSilhouettes = this.upscaledRendering;

            this.rescale(this.getScaleFactor());

            //Turn on or off Debuginfo
            this.isDebugInfoVisible = false;

            this.animatedTileCount = 0;
            this.highTileCount = 0;

            this.tablet = Detect.isTablet(window.innerWidth);
            
            /* stats.js begin*/
            this.stats = new Stats();
            this.stats.setMode(0); // 0: fps, 1: ms
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.left = '0px';
            this.stats.domElement.style.top = '0px';
            this.stats.domElement.style.display = 'none';
            document.body.appendChild( this.stats.domElement );
            /* stats.js end*/
            
        },

        getWidth: function() {
            return this.canvas.width;
        },

        getHeight: function() {
            return this.canvas.height;
        },

        setTileset: function(tileset) {
            this.tileset = tileset;
        },

        getScaleFactor: function() {
            var w = window.innerWidth,
                h = window.innerHeight,
                scale;

            this.mobile = false;
			// why we don't use 1 anymore ? we need the game to work on 480 X 260, couldn't this help ?
            if(w <= 1000){
                scale = 2;
                this.mobile = true;
            }else if(w <= 1500) {
                scale = 2;
            }else if(w >= 1501){
                scale = 3;
            }

            return scale;
        },

        rescale: function(factor) {
            this.scale = this.getScaleFactor();
			
            this.createCamera();
			
				if(this.mobile && navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
					this.scale = 1.68;		


            this.context.mozImageSmoothingEnabled = false;
            this.background.mozImageSmoothingEnabled = false;
            this.foreground.mozImageSmoothingEnabled = false;

            this.initFont();

            if(!this.upscaledRendering && this.game.map && this.game.map.tilesets) {
                this.setTileset(this.game.map.tilesets[this.scale - 1]);
            }
            if(this.game.renderer && this.game.spritesets) {
                this.game.setSpriteScale(this.scale);
            }
        },

        createCamera: function() {
        	var w = window.innerWidth,
            h = window.innerHeight,
        	cWidth, cHeight, ntsw, ntsh, nts;
        	
        	if(this.camera == null) {
        		this.camera = new Camera(this);
        	}
        	
            this.camera.rescale();

            cWidth = this.camera.gridW * this.tilesize * this.scale;
            cHeight = this.camera.gridH * this.tilesize * this.scale;
            
            ntsw = Math.floor((w -40) / this.camera.gridW);
            ntsh = Math.floor((h - 40) / this.camera.gridH);
            nts = ntsw < ntsh ? ntsw : ntsh;
            
            if(this.allowScale && this.mobile)
            	this.scaleCanvas = nts / (this.tilesize * this.scale);
            else 
            	this.scaleCanvas = 1;
            
            this.canvas.width = Math.round(cWidth * this.scaleCanvas);
            this.canvas.height = Math.round(cHeight * this.scaleCanvas);
            this.context.scale(this.scaleCanvas, this.scaleCanvas);
            //log.debug("#entities set to "+this.canvas.width+" x "+this.canvas.height);
            
            this.backcanvas.width = this.canvas.width;
            this.backcanvas.height = this.canvas.height;
            this.background.scale(this.scaleCanvas, this.scaleCanvas);
            //log.debug("#background set to "+this.backcanvas.width+" x "+this.backcanvas.height);

            this.forecanvas.width = this.canvas.width;
            this.forecanvas.height = this.canvas.height;
            this.foreground.scale(this.scaleCanvas, this.scaleCanvas);
            //log.debug("#foreground set to "+this.forecanvas.width+" x "+this.forecanvas.height);
            
            this.dynamicScaling();
            //log.debug("mobile: "+this.mobile+" w: "+w+" h: "+h+" scale: "+this.scale+" scaleCanvas: "+this.scaleCanvas+" cw: "+this.canvas.width+" ch: "+this.canvas.height);
        },
        
        dynamicScaling: function() {
        	var w = window.innerWidth,
            h = window.innerHeight,
            ch = this.canvas.height,
            cw = this.canvas.width;
        	
        	log.debug("update scaling w: "+w+" h: "+h+" cw: "+cw+" ch: "+ch);
        	
        	var container = $('#container');
            var barH;
            var contW;
            var contH;
            var borderWidth;
            
            if(w <= 1000) {
            	barH = 34;
            	borderWidth = 0;
            	contW = cw + borderWidth;
            	contH = ch + borderWidth + barH;
            	
            	if(w <= 800) {
            		$("#wrapper").css("width", contW - 330);
            	} else {
            		$("#wrapper").css("width", contW - 490);
            	}            	
            }else if(w <= 1500) {
            	barH = 34;
            	borderWidth = 20;
            	contW = 980;
            	contH = 502;
            	
            	$("#wrapper").css("width", "auto");
            }else if(w >= 1501){
            	barH = 51;
            	borderWidth = 30;
            	contW = 1470;
            	contH = 753;
            	$("#wrapper").css("width", "auto");
            }
            container.css("width", contW);
            container.css("height", contH);
			container.css("top", (h - contH) / 2);
            container.css("left", (w - (cw + borderWidth)) / 2);
            container.css("margin", "0 auto 0 0");
            
            $('#canvasborder').css("background-size", "100% 100%");
            
            $('#canvas').css("height", ch);
        },
        
        resize: function() {
        	var w = window.innerWidth,
            h = window.innerHeight,
            ch = this.canvas.height,
            cw = this.canvas.width;
        	
        	if(cw >= w || (ch + 34) >= h || (cw <= w - 40 && (w - cw) <= (h - ch)) || ((h - ch) <= (w - cw) && ch <= h - 60)) {
        		this.rescale();
        		this.game.resetCamera();
        	} else {
        		this.dynamicScaling();
        	}
        },
        
        initFont: function() {
            var fontsize;

            switch(this.scale) {
                case 1:
                    fontsize = 10; break;
                case 2:
                    fontsize = Detect.isWindows() ? 10 : 13; break;
                case 3:
                    fontsize = 20;
            }
            this.setFontSize(fontsize);
        },

        setFontSize: function(size) {
            var font = size+"px GraphicPixel";

            this.context.font = font;
            this.background.font = font;
        },

        drawText: function(text, x, y, centered, color, strokeColor) {
            var ctx = this.context,
                strokeSize;

            switch(this.scale) {
                case 1:
                    strokeSize = 3; break;
                case 2:
                    strokeSize = 3; break;
                case 3:
                    strokeSize = 5;
            }

            if(text && x && y) {
                ctx.save();
                if(centered) {
                    ctx.textAlign = "center";
                }
                ctx.strokeStyle = strokeColor || "#373737";
                ctx.lineWidth = strokeSize;
                ctx.strokeText(text, x, y);
                ctx.fillStyle = color || "white";
                ctx.fillText(text, x, y);
                ctx.restore();
            }
        },

        drawCellRect: function(x, y, color) {
            this.context.save();
            this.context.lineWidth = 2*this.scale;
            this.context.strokeStyle = color;
            this.context.translate(x+2, y+2);
            this.context.strokeRect(0, 0, (this.tilesize * this.scale) - 4, (this.tilesize * this.scale) - 4);
            this.context.restore();
        },
        drawRectStroke: function(x, y, width, height, color) {
            this.context.fillStyle = color;
            this.context.fillRect(x, y, (this.tilesize * this.scale)*width, (this.tilesize * this.scale)*height);
            this.context.fill();
            this.context.lineWidth = 5;
            this.context.strokeStyle = 'black';
            this.context.strokeRect(x, y, (this.tilesize * this.scale)*width, (this.tilesize * this.scale)*height);
        },
        drawRect: function(x, y, width, height, color) {
            this.context.fillStyle = color;
            this.context.fillRect(x, y, (this.tilesize * this.scale)*width, (this.tilesize * this.scale)*height);
        },

        drawCellHighlight: function(x, y, color) {
            var s = this.scale,
                ts = this.tilesize,
                tx = x * ts * s,
                ty = y * ts * s;

            this.drawCellRect(tx, ty, color);
        },

        drawTargetCell: function() {
            var mouse = this.game.getMouseGridPosition();

            if(this.game.targetCellVisible && !(mouse.x === this.game.selectedX && mouse.y === this.game.selectedY)) {
                this.drawCellHighlight(mouse.x, mouse.y, this.game.targetColor);
            }
        },

        drawAttackTargetCell: function() {
            var mouse = this.game.getMouseGridPosition(),
                entity = this.game.getEntityAt(mouse.x, mouse.y),
                s = this.scale;

            if(entity) {
                this.drawCellRect(entity.x * s, entity.y * s, "rgba(255, 0, 0, 0.5)");
            }
        },

        drawOccupiedCells: function() {
            /* broken
            var positions = this.game.entityGrid;

            if(positions) {
                for(var i=0; i < positions.length; i += 1) {
                    for(var j=0; j < positions[i].length; j += 1) {
                        if(!_.isNull(positions[i][j])) {
                            this.drawCellHighlight(i, j, "rgba(50, 50, 255, 0.5)");
                        }
                    }
                }
            }
            
            */
        },

        drawPathingCells: function() {
            var grid = this.game.pathingGrid;

            if(grid && this.game.debugPathing) {
                for(var y=0; y < grid.length; y += 1) {
                    for(var x=0; x < grid[y].length; x += 1) {
                        if(grid[y][x] === 1 && this.game.camera.isVisiblePosition(x, y)) {
                            this.drawCellHighlight(x, y, "rgba(50, 50, 255, 0.5)");
                        }
                        
                        if(this.game.map.isDoor(x, y) && this.game.camera.isVisiblePosition(x, y)) {
                        	this.drawCellHighlight(x, y, "rgba(50, 255, 50, 0.5)");
                        }
                    }
                }
            }
        },

        drawSelectedCell: function() {
                var sprite = this.game.cursors["target"],
                anim = this.game.targetAnimation,
                os = this.upscaledRendering ? 1 : this.scale,
                ds = this.upscaledRendering ? this.scale : 1;

            if(this.game.selectedCellVisible) {
                if(this.mobile || this.tablet) {
                    if(this.game.drawTarget) {
                        var x = this.game.selectedX,
                            y = this.game.selectedY;

                        this.drawCellHighlight(this.game.selectedX, this.game.selectedY, "rgb(51, 255, 0)");
                        this.lastTargetPos = { x: x,
                                               y: y };
                        this.game.drawTarget = false;
                    }
                } else {
                    if(sprite && anim) {
                        var    frame = anim.currentFrame,
                            s = this.scale,
                            x = frame.x * os,
                            y = frame.y * os,
                            w = sprite.width * os,
                            h = sprite.height * os,
                            ts = 16,
                            dx = this.game.selectedX * ts * s,
                            dy = this.game.selectedY * ts * s,
                            dw = w * ds,
                            dh = h * ds;
                        //if(this.game.player.isAttacking()) log.debug("drawSelectedCell x: "+x+" y: "+y+" w: "+w+" h: "+h);
                        this.context.save();
                        this.context.translate(dx, dy);
                        this.context.drawImage(sprite.image, x, y, w, h, 0, 0, dw, dh);
                        this.context.restore();
                    }
                }
            }
        },
        
        drawAtackedEntityCell: function(entity) {
            if(this.game.player && this.game.player.isAttacking() && this.game.player.target && this.game.player.target.id === entity.id) {
            if(this.mobile || this.tablet) {
                    this.drawCellRect(entity.x*this.scale, entity.y*this.scale	, "rgb(255, 51, 0)");
            } else {
            	var anim = this.game.atackedTargetAnimation;
            	var sprite = this.game.cursors["target"];
            	if(sprite && anim) {
                	var os = this.upscaledRendering ? 1 : this.scale,
                        ds = this.upscaledRendering ? this.scale : 1;
                	    frame = anim.currentFrame,
                        s = this.scale,
                        x = frame.x * os,
                        y = frame.y * os,
                        w = sprite.width * os,
                        h = sprite.height * os,
                        ts = 16,
                        dw = w * ds,
                        dh = h * ds,
                        ex = entity.x * s,
                        ey = entity.y * s;

                    this.context.save();
                    this.context.translate(ex, ey);
                    this.context.drawImage(sprite.image, x, y, w, h, 0, 0, dw, dh);
                    this.context.restore();
                }
            }
        }
    },

        clearScaledRect: function(ctx, x, y, w, h) {
            var s = this.scale;

            ctx.clearRect(x * s, y * s, w * s, h * s);
        },

        drawCursor: function() {
            var mx = this.game.mouse.x,
                my = this.game.mouse.y,
                s = this.scale,
                os = this.upscaledRendering ? 1 : this.scale;

            this.context.save();
            if(this.game.currentCursor && this.game.currentCursor.isLoaded) {
                this.context.drawImage(this.game.currentCursor.image, 0, 0, 16 * os, 16 * os, mx/this.scaleCanvas, my/this.scaleCanvas, 16*s*this.scaleCanvas, 16*s*this.scaleCanvas);
            }
            this.context.restore();
        },
        
        drawScaledImage: function(ctx, image, x, y, w, h, dx, dy) {
            var s = this.upscaledRendering ? 1 : this.scale;
            _.each(arguments, function(arg) {
                if(_.isUndefined(arg) || _.isNaN(arg) || _.isNull(arg) || arg < 0) {
                    log.error("x:"+x+" y:"+y+" w:"+w+" h:"+h+" dx:"+dx+" dy:"+dy, true);
                }
            });

            ctx.drawImage(image,
                          x * s,
                          y * s,
                          w * s,
                          h * s,
                          dx * this.scale,
                          dy * this.scale,
                          w * this.scale,
                          h * this.scale);
        },

        drawTile: function(ctx, tileid, tileset, setW, gridW, cellid) {
            var s = this.upscaledRendering ? 1 : this.scale;
            if(tileid !== -1) { // -1 when tile is empty in Tiled. Don't attempt to draw it.
                this.drawScaledImage(ctx,
                                     tileset,
                                     getX(tileid + 1, setW / s) * this.tilesize,
                                     Math.floor(tileid / (setW / s)) * this.tilesize,
                                     this.tilesize,
                                     this.tilesize,
                                     getX(cellid + 1, gridW) * this.tilesize,
                                     Math.floor(cellid / gridW) * this.tilesize);
            }
        },

        clearTile: function(ctx, gridW, cellid) {
            var s = this.scale,
                ts = this.tilesize,
                x = Math.floor(getX(cellid + 1, gridW)) * ts * s,
                y = Math.floor(cellid / gridW) * ts * s,
                w = ts * s,
                h = w;

            ctx.clearRect(x, y, h, w);
        },

        drawEntity: function(entity) {
            var sprite = entity.sprite,
                shadow = this.game.shadows["small"],
                anim = entity.currentAnimation,
                os = this.upscaledRendering ? 1 : this.scale,
                ds = this.upscaledRendering ? this.scale : 1;

            if (entity instanceof Character) {
                if (entity.hasBuff(Types.Buffs.RABBIT)) {
                    // Empty
                }
            }

            if(anim && sprite) {
                var frame = anim.currentFrame,
                    s = this.scale,
                    x = frame.x * os,
                    y = frame.y * os,
                    w = sprite.width * os,
                    h = sprite.height * os,
                    ox = sprite.offsetX * s,
                    oy = sprite.offsetY * s,
                    dx = entity.x * s,
                    dy = entity.y * s,
                    dw = w * ds,
                    dh = h * ds;

                if(entity.isFading) {
                    this.context.save();
                    this.context.globalAlpha = entity.fadingAlpha;
                }

                this.drawEntityName(entity);
                //this.drawEntityExp(entity);
                this.drawEntityHealth(entity);
                this.drawEntityMana(entity);
                this.drawAtackedEntityCell(entity);
                
                this.context.save();

                if(entity.flipSpriteX) {
                    this.context.translate(dx + this.tilesize*s, dy);
                    this.context.scale(-1, 1);
                }
                else if(entity.flipSpriteY) {
                    this.context.translate(dx, dy + dh);
                    this.context.scale(1, -1);
                }
                else {
                    this.context.translate(dx, dy);
                }

                if(entity.isVisible()) {
                    if(entity.hasShadow()) {
                        this.context.drawImage(shadow.image, 0, 0, shadow.width * os, shadow.height * os,
                                               0,
                                               entity.shadowOffsetY * ds,
                                               shadow.width * os * ds, shadow.height * os * ds);
                    }
                    
                    var tinted = null;
                    if (entity.tint != null) {
                        // create offscreen buffer,
                        // todo: caching
                        tinted = document.createElement('canvas');
                        tinted.width = sprite.image.width;
                        tinted.height = sprite.image.height;
                        bx = tinted.getContext('2d');
                        bx.drawImage(sprite.image,0,0);

                        bx.globalCompositeOperation = "source-atop";
                        bx.fillStyle = entity.tint.color || '#FF0000';
                        bx.fillRect(0,0,tinted.width,tinted.height);

                    }

                    if(entity instanceof Character) {
                    	// draw weapon animation over characters that are not dead and have a weapon
                    	if(entity.orientation === Types.Orientations.DOWN) {
                    		this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
                    		this.drawWeapon(entity, frame, os, anim, s, ds);
                    		this.drawShield(entity, frame, os, anim, s, ds);
                    	} else if(entity.orientation === Types.Orientations.LEFT) {
                    		this.drawWeapon(entity, frame, os, anim, s, ds);
                    		this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
                    		this.drawShield(entity, frame, os, anim, s, ds);
                    	} else if(entity.orientation === Types.Orientations.RIGHT) {
                    		this.drawShield(entity, frame, os, anim, s, ds);
                    		this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
                    		this.drawWeapon(entity, frame, os, anim, s, ds);
                    	} else if(entity.orientation === Types.Orientations.UP) {
                    		this.drawShield(entity, frame, os, anim, s, ds);
                    		this.drawWeapon(entity, frame, os, anim, s, ds);
                    		this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
                    	}
                    } else {
                    	this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
                    }
                    
                    if (entity.tint != null) {
                        this.context.save();
                        this.context.globalAlpha = entity.tint.alpha || 0.5;
                        this.context.drawImage(tinted, x, y, w, h, ox, oy, dw, dh);
                        this.context.restore();
                    }

                    // draw sparkle/sparks on item entities
                    if(this.game.isItemInstance(entity) && entity.kind !== Types.Entities.CAKE) {
                        var sparks = this.game.sprites["sparks"],
                            anim = this.game.sparksAnimation,
                            frame = anim.currentFrame,
                            sx = sparks.width * frame.index * os,
                            sy = sparks.height * anim.row * os,
                            sw = sparks.width * os,
                            sh = sparks.width * os;

                        this.context.drawImage(sparks.image, sx, sy, sw, sh,
                                               sparks.offsetX * s,
                                               sparks.offsetY * s,
                                               sw * ds, sh * ds);
                    }
                }

                this.context.restore();

                if(entity.isFading) {
                    this.context.restore();
                }
            }
            
            if(entity.kind === Types.Entities.LITBOMB && !entity.hideTimer) {
            	var counterText = "wait", 
            	fillColor = "rgb(255, 50, 50)",
            	strokeColor = "rgb(255, 180, 180)",
                nowTime = new Date(),
                diffTime = nowTime.getTime() - entity.initTime.getTime();
            	
            	switch(true){
	            	case (diffTime > 3000): counterText = "Boom!"; break;
	            	case (diffTime > 2000): counterText = "it"; break;
	            	case (diffTime > 1000): counterText = "for"; break;	
            	}
            	
            	this.context.save();
            	
                this.drawText(counterText, 
                		(entity.x + 8) * this.scale, 
                		entity.y * this.scale, 
                		true, fillColor, strokeColor);
                
                this.context.restore();
            }
        },
        
        drawWeapon:function(entity, frame, os, anim, s, ds) {
        	if(!entity.isDead && entity.hasWeapon() && !entity.invincible) {
                var weapon = this.game.sprites[entity.getEquippedWeaponName()];

                if(weapon) {
                    var weaponAnimData = weapon.animationData[anim.name],
                        index = this.isIdle(anim.name) ? 1 - (frame.index % weaponAnimData.length) : frame.index % weaponAnimData.length,
                        wx = weapon.width * index * os,
                        wy = weapon.height * anim.row * os,
                        ww = weapon.width * os,
                        wh = weapon.height * os;

                    this.context.drawImage(weapon.image, wx, wy, ww, wh,
                                           weapon.offsetX * s,
                                           weapon.offsetY * s,
                                           ww * ds, wh * ds);
                }
            }
        },
        
        drawShield:function(entity, frame, os, anim, s, ds) {
        	if(!entity.isDead && entity.hasShield() && !entity.invincible) {
                var shield = this.game.sprites[entity.getShieldName()];

                if(shield) {
                    var shieldAnimData = shield.animationData[anim.name],
                        index = this.isIdle(anim.name) ? 1 - (frame.index % shieldAnimData.length) : frame.index % shieldAnimData.length,
                        wx = shield.width * index * os,
                        wy = shield.height * anim.row * os,
                        ww = shield.width * os,
                        wh = shield.height * os;

                    this.context.drawImage(shield.image, wx, wy, ww, wh,
				                    		shield.offsetX * s,
				                    		shield.offsetY * s,
                                            ww * ds, wh * ds);
                }
            }
        },
        
       drawProjectile: function(projectile) {
            var sprite = projectile.sprite,
                anim = projectile.currentAnimation,
                os = this.upscaledRendering ? 1 : this.scale,
                ds = this.upscaledRendering ? this.scale : 1;

            if(anim && sprite) {
                var frame = anim.currentFrame,
                    s = this.scale,
                    x = frame.x * os,
                    y = frame.y * os,
                    w = sprite.width * os,
                    h = sprite.height * os,
                    ox = sprite.offsetX * s,
                    oy = sprite.offsetY * s,
                    dx = Math.floor(projectile.x * s),
                    dy = Math.floor(projectile.y * s),
                    dw = Math.floor(w * ds),
                    dh = Math.floor(h * ds);

                this.context.save();

                this.context.translate(dx, dy);
                
                this.context.rotate(sprite.offsetAngle*Math.PI/180);
                this.context.rotate(projectile.angle*Math.PI/180);
                
                if(projectile.visible) {
                    this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
                }

                this.context.restore();

            }
        },
        
       drawBuff: function(buff,entity) {
            var sprite = null,
                anim = null,
                os = this.upscaledRendering ? 1 : this.scale,
                ds = this.upscaledRendering ? this.scale : 1;

            if (buff == Types.Buffs.SHIELDED) {
                sprite = this.game.sprites["shield"];
                anim = this.game.shieldAnimation;
            }
                
            if (buff == Types.Buffs.STUNNED) {
                sprite = this.game.sprites["explosion-stun"];
                anim = this.game.stunAnimation;
            }
            
            if (buff == Types.Buffs.POISONED) {
                // no anim - we'll hue adjust the character (green)
                entity.tint = { color: '#00FF00', alpha: 0.5 };
            }
            if (buff == Types.Buffs.ENRAGED) {
                entity.tint = { color: '#FF0000', alpha: 0.5 };
            }			

            if(anim && sprite) {
                var frame = anim.currentFrame,
                    s = this.scale,
                    x = frame.x * os,
                    y = frame.y * os,
                    w = sprite.width * os,
                    h = sprite.height * os,
                    ox = sprite.offsetX * s,
                    oy = sprite.offsetY * s,
                    dx = (entity.x + 8) * s,
                    dy = (entity.y + 8) * s,
                    dw = w * ds,
                    dh = h * ds;

                this.context.save();
                this.context.translate(dx, dy);                
                this.context.rotate(sprite.offsetAngle*Math.PI/180);
                this.context.drawImage(sprite.image, x, y, w, h, ox, oy, dw, dh);
                this.context.restore();
            }
        },        
        
        drawBuffs: function() {
            var self = this;

            this.game.forEachEntity(function(entity) {
                if (entity instanceof Character) {
                    _.each(Types.Buffs,function(buff) {
                        if (entity.hasBuff(buff)) {
                            self.drawBuff(buff,entity);
                        }
                    });
                }
            });
        },        
        
        drawProjectiles: function() {
            var self = this;

            this.game.forEachProjectile(function(projectile) {
                self.drawProjectile(projectile);
            });
        },

        drawEntities: function(dirtyOnly) {
            var self = this;

            this.game.forEachVisibleEntityByDepth(function(entity) {
                if(entity.isLoaded) {
                    if(dirtyOnly) {
                        if(entity.isDirty) {
                            self.drawEntity(entity);

                            entity.isDirty = false;
                            entity.oldDirtyRect = entity.dirtyRect;
                            entity.dirtyRect = null;
                        }
                    } else {
                        self.drawEntity(entity);
                        // reset tint after every draw so we must explicitly set once per frame when needed
                        entity.tint = null;
                    }
                }
            });
        },

        getEntityBoundingRect: function(entity) {
            var rect = {},
                s = this.scale,
                spr;

            if(entity instanceof Player && entity.hasWeapon()) {
                var weapon = this.game.sprites[entity.getEquippedWeaponName()];
                spr = weapon;
            } else {
                spr = entity.sprite;
            }

            if(spr) {
                rect.x = (entity.x + spr.offsetX - this.camera.x) * s;
                rect.y = (entity.y + spr.offsetY - this.camera.y) * s;
                rect.w = spr.width * s;
                rect.h = spr.height * s;
                rect.left = rect.x;
                rect.right = rect.x + rect.w;
                rect.top = rect.y;
                rect.bottom = rect.y + rect.h;
            }
            return rect;
        },

        getTileBoundingRect: function(tile) {
            var rect = {},
                gridW = this.game.map.width,
                s = this.scale,
                ts = this.tilesize,
                cellid = tile.index;

            rect.x = ((getX(cellid + 1, gridW) * ts) - this.camera.x) * s;
            rect.y = ((Math.floor(cellid / gridW) * ts) - this.camera.y) * s;
            rect.w = ts * s;
            rect.h = ts * s;
            rect.left = rect.x;
            rect.right = rect.x + rect.w;
            rect.top = rect.y;
            rect.bottom = rect.y + rect.h;

            return rect;
        },

        getTargetBoundingRect: function(x, y) {
            var rect = {},
                s = this.scale,
                ts = this.tilesize,
                tx = x || this.game.selectedX,
                ty = y || this.game.selectedY;

            rect.x = ((tx * ts) - this.camera.x) * s;
            rect.y = ((ty * ts) - this.camera.y) * s;
            rect.w = ts * s;
            rect.h = ts * s;
            rect.left = rect.x;
            rect.right = rect.x + rect.w;
            rect.top = rect.y;
            rect.bottom = rect.y + rect.h;

            return rect;
        },

        isIntersecting: function(rect1, rect2) {
            return !((rect2.left > rect1.right) ||
                     (rect2.right < rect1.left) ||
                     (rect2.top > rect1.bottom) ||
                     (rect2.bottom < rect1.top));
        },

        drawEntityName: function(entity) {
            this.context.save();
            if(entity.name && !entity.isDead && !entity.isDying && entity.id != this.game.playerId) {
				var color;
				if((entity.id === this.game.playerId)){
					color = '#fcda5c';
				}else if(entity.pid && this.game && this.game.player && this.game.player.friends && this.game.player.friends[entity.pid]){
					color = '#00ff06';
				}else{
					color = 'white';
				}
		
				var name = (entity.level) ? 'lvl '+entity.level+' '+entity.name : entity.name;
				this.drawText(name,
                              (entity.x + 8) * this.scale,
                              (entity.y + entity.nameOffsetY) * this.scale,
                              true,
                              color);
            }
            
            this.context.restore();
        },
        
        drawEntityExp: function(entity) {
            if(entity.id == this.game.playerId) {
            	if(!entity.experience) {
            		entity.experience = 0;
            	}
            	
            	var barSize = 24;
            	var needExp = Types.expForLevel(entity.level + 1);
            	var prevExp = Types.expForLevel(entity.level);
            	var needNext = needExp - prevExp;
            	var curExp = entity.experience - prevExp;
        		
            	var expX = (entity.x) * this.scale - barSize / 2;
            	var expY = (entity.y + entity.nameOffsetY + 3) * this.scale;
            	var expW = Math.round(curExp / needNext * barSize * this.scale);
            	var expH = 2 * this.scale;
            	
            	this.context.save();
            	this.context.strokeStyle = "#000000";
            	this.context.lineWidth = 1;
            	this.context.strokeRect(expX, expY, barSize * this.scale, expH);
            	this.context.fillStyle = "#9C30DA";
            	this.context.fillRect(expX, expY, expW, expH);
            	this.context.restore();
            }
        },
		
        drawEntityMana: function(entity) {
            if(entity.id == this.game.playerId) {
            	var barSize = 24;
            	var maxManaPoints = entity.maxManaPoints;
            	var manaPoints = entity.manaPoints;
        		
            	var expX = (entity.x) * this.scale - barSize / 2;
            	var expY = (entity.y + entity.nameOffsetY + 3) * this.scale;
            	var expW = Math.round(manaPoints / maxManaPoints * barSize * this.scale);
            	var expH = 2 * this.scale;
            	
            	this.context.save();
            	this.context.strokeStyle = "#000000";
            	this.context.lineWidth = 1;
            	this.context.strokeRect(expX, expY, barSize * this.scale, expH);
            	this.context.fillStyle = "#0C4AB4";
            	this.context.fillRect(expX, expY, expW, expH);
            	this.context.restore();
            }
        },
		
        drawEntityHealth: function(entity) {
            if(entity.pw) {
            	var barSize = 24;
            	var maxHitPoints = entity.maxHitPoints;
            	var hitPoints = entity.hitPoints;
        		
            	var expX = (entity.x) * this.scale - barSize / 2;
            	if(entity.id == this.game.playerId) {
            		var expY = (entity.y + entity.nameOffsetY) * this.scale;
            	} else {
            		var expY = (entity.y + entity.nameOffsetY + 3) * this.scale;
            	}
            	var expW = Math.round(hitPoints / maxHitPoints * barSize * this.scale);
            	var expH = 2 * this.scale;
            	
            	this.context.save();
            	this.context.strokeStyle = "#000000";
            	this.context.lineWidth = 1;
            	this.context.strokeRect(expX, expY, barSize * this.scale, expH);
            	this.context.fillStyle = "#FD0000";
            	this.context.fillRect(expX, expY, expW, expH);
            	this.context.restore();
            }
        },
		
        drawTerrain: function() {
            var self = this,
                m = this.game.map,
                tilesetwidth = this.tileset.width / m.tilesize;

            this.game.forEachVisibleTile(function (id, index) {
                if(!m.isHighTile(id) && !m.isAnimatedTile(id)) { // Don't draw unnecessary tiles
                    self.drawTile(self.background, id, self.tileset, tilesetwidth, m.width, index);
                }
            }, 1);
        },

        drawAnimatedTiles: function(dirtyOnly) {
            var self = this,
                m = this.game.map,
                tilesetwidth = this.tileset.width / m.tilesize;

            this.animatedTileCount = 0;
            this.game.forEachAnimatedTile(function (tile) {
                if(dirtyOnly) {
                    if(tile.isDirty) {
                        self.drawTile(self.context, tile.id, self.tileset, tilesetwidth, m.width, tile.index);
                        tile.isDirty = false;
                    }
                } else {
                    self.drawTile(self.context, tile.id, self.tileset, tilesetwidth, m.width, tile.index);
                    self.animatedTileCount += 1;
                }
            });
        },

        drawHighTiles: function(ctx) {
            var self = this,
                m = this.game.map,
                tilesetwidth = this.tileset.width / m.tilesize;

            this.highTileCount = 0;
            this.game.forEachVisibleTile(function (id, index) {
                if(m.isHighTile(id)) {
                    self.drawTile(ctx, id, self.tileset, tilesetwidth, m.width, index);
                    self.highTileCount += 1;
                }
            }, 1);
        },

        drawBackground: function(ctx, color) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },

        drawDebugInfo: function() {
            if(this.isDebugInfoVisible) {
                //this.drawText("A: " + this.animatedTileCount, 100, 30, false);
                //this.drawText("H: " + this.highTileCount, 140, 30, false);
            }
        },

        drawCombatInfo: function() {
            var self = this;

            switch(this.scale) {
                case 2: this.setFontSize(20); break;
                case 3: this.setFontSize(30); break;
            }
            this.game.infoManager.forEachInfo(function(info) {
                self.context.save();
                self.context.globalAlpha = info.opacity;
                self.drawText(info.value, (info.x + 8) * self.scale, Math.floor(info.y * self.scale), true, info.fillColor, info.strokeColor);
                
                if(info.type === "crystals") {
                	var dx = 30, dy = -12;
                	switch(self.scale) {
	                	case 2: dx = 40; dy = -24; break;
	                    case 3: dx = 60; dy = -36; break;
	                }
                	
                	var crystal = self.game.sprites["crystalblue"],
                	x = Math.floor(info.x * self.scale + dx),
                	y = Math.floor(info.y * self.scale + dy),
                	w = crystal.width,
                	h = crystal.height;
                	
                	self.context.drawImage(crystal.image, 0, 0, w, h, x, y, w * self.scale, h * self.scale);
                }
                
                self.context.restore();
            });
            this.initFont();
        },

        setCameraView: function(ctx) {
            ctx.translate(-this.camera.x * this.scale, -this.camera.y * this.scale);
        },

        clearScreen: function(ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },

        getPlayerImage: function() {
			if(!this.game.player){ return; }
            return this.generatePlayerImage(this.game.player.spriteName,this.game.player.weaponName);
        },
        
        generatePlayerImage: function(armorName,weaponName) {
                        
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                os = this.upscaledRendering ? 1 : this.scale,
                sprite = this.game.sprites[armorName],
                spriteAnim = sprite.animationData["idle_down"],
                // character
                row = spriteAnim.row,
                w = sprite.width * os,
                h = sprite.height * os,
                y = row * h,
                // weapon
                weapon = this.game.sprites[weaponName],
                ww = weapon.width * os,
                wh = weapon.height * os,
                wy = wh * row,
                offsetX = (weapon.offsetX - sprite.offsetX) * os,
                offsetY = (weapon.offsetY - sprite.offsetY) * os,
                // shadow
                shadow = this.game.shadows["small"],
                sw = shadow.width * os,
                sh = shadow.height * os,
                ox = -sprite.offsetX * os,
                oy = -sprite.offsetY * os;

            canvas.width = w;
            canvas.height = h;

            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(shadow.image, 0, 0, sw, sh, ox, oy, sw, sh);
            ctx.drawImage(sprite.image, 0, y, w, h, 0, 0, w, h);
            ctx.drawImage(weapon.image, 0, wy, ww, wh, offsetX, offsetY, ww, wh);

            return canvas.toDataURL("image/png");            
            
        },            

        renderStaticCanvases: function() {
            this.background.save();
            this.setCameraView(this.background);
            this.drawTerrain();
            this.background.restore();
        },

        renderFrame: function() {

            this.clearScreen(this.context);

            this.context.save();
                this.setCameraView(this.context);
                this.drawAnimatedTiles();
                this.drawSelectedCell();
                
                if(this.game.started && this.game.cursorVisible && !this.mobile && !this.tablet) {                    
                    this.drawTargetCell();
                }

                this.drawPathingCells();
                this.drawEntities();
                this.drawBuffs();
                this.drawProjectiles();
                this.drawCombatInfo();
                this.drawHighTiles(this.context);
            this.context.restore();

            // Overlay UI elements
            if(!this.mobile && !this.tablet) {
                if(this.game.cursorVisible) this.drawCursor();
            }

            this.drawDebugInfo();
        
        },

        isIdle: function(animName) {
            return animName.indexOf('idle') + 1;
        }
    });

    var getX = function(id, w) {
        if(id == 0) {
            return 0;
        }
        return (id % w == 0) ? w - 1 : (id % w) - 1;
    };

    return Renderer;
});
