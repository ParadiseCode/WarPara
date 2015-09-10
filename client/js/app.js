define(['jquery', 'storage', 'mob', 'character', 'hud/leaderboard', 'config', 'hud/playersBoard'], function($, Storage, Mob, Character, Leaderboard, config, PlayersBoard) {
var idnetUser;
var idnetAuth;
var guestPlay = false;
var guestConvert = false;
var idnetLoaded = false;

    var App = Class.extend({
        init: function() {
            this.currentPage = 1;
            this.blinkInterval = null;
            this.isParchmentReady = true;
            this.ready = false;
            this.prevstate = "loadcharacter";
            this.storage = new Storage();
            this.leaderBoard = new Leaderboard();
            //this.playersBoard = new PlayersBoard();
            this.watchNameInputInterval = setInterval(this.toggleButton.bind(this), 100);
            this.initFormFields();
			this.hasConnectedBefore = false;

            this.frontPage = 'idnet-login';
            this.inspectorFadeOut = false;
            this.inspectorVisible = false;
            this.config = config;
        },
		
		showIdnet: function(login){
			if(typeof login == 'undefined'){
				login = false;
			}
			var self = this;
			//ID.Event.subscribe('id.init', function(){
				var fnCallback = function(response){
					if (response) { // That means that the server processes the response
						self.idnetAuth = response.authResponse;
						self.idnetUser = response.authResponse.details;
						//console.log(response.authResponse);
						console.log(response.authResponse.details);
						if(response.authResponse.details.pid){
                            
							if(self.guestConvert){
								self.toggleScrollContent('convertcharacter');
							}else{
								// normal create character
								if(self.idnetMenuActive()){
									//self.animateParchment('idnet-login', 'loadcharacter');
                                    $('#idnet-login').hide();
                                    // preauth with pid
                                    self.preAuth(self.idnetUser.pid);
								}
							}
						}
					}
				}
				
				var idnetCount = 0;
				// if ID called before loaded, loop
				var tryIdnet = setInterval(function() {
                    if(typeof ID !== 'undefined') {
                        clearInterval(tryIdnet);
						if(!self.idnetUser){
							if(login){
								ID.login(fnCallback);
							}else{
								ID.register(fnCallback);
							}
						}else if(self.idnetMenuActive()){
							self.animateParchment('idnet-login', 'loadcharacter');
						}
                    }else{
						log.info('idnet not loaded yet');
						idnetCount++;
						// override idnet down for guest
						if(idnetCount > 100){
							self.idnetSkip = true;
						}
					}
                }, 100);
			//});
		},
		
		isLoggedIn: function(){
			var self = this;
			ID.getLoginStatus(function(response){
				console.log('getLoginStatus');
				console.log(response);
				console.log(response.status);
                

                
                if ((response.status == null || response.status == "uncomplete") && response.authResponse == null) {
                     console.log('not signed into id.net');
                     
                     $('#progress').hide();
                     $('.loading').hide();
                     $('#idnet-login').css('display','block');
                     
                }
                
                if (response.status && response.status == 'ok' && response.authResponse && response.authResponse.details && response.authResponse.details.pid) {

                    console.log('already signed into id.net');
                    self.idnetAuth = response.authResponse;
                    self.idnetUser = response.authResponse.details;
                    $("#char-netname").text(self.idnetUser.nickname);

                    if(self.idnetUser.avatars.large_url != undefined && self.idnetUser.avatars.large_url != null)
                        $("#profile_menu #player-image").attr('src', self.idnetUser.avatars.large_url);
                    
                    $('#progresstext').text('Preauth...');
                    //self.animateParchment('idnet-login', 'loadcharacter');
                    
                    // preauth...
                    self.preAuth(self.idnetUser.pid);
                }
                
			}, true);
			self.idnetLoaded = true;
		},
		
		preAuth: function(pid){
			var self = this;
			if(self.game) {
            	self.game.pid = pid;
                self.game.preAuth();
            } else {
            	log.info('preauth waiting for game object creation...');
                setTimeout(function() {
                	self.preAuth(pid);
                },1000);
            }
		},
		
		checkIdnet: function(){
			var self = this;
			var fnCallback = function(response){
				if (response) { // That means that the server processes the response
					log.info(response);
				}
			}
			
			ID.getLoginStatus(fnCallback, true);
		},
		
		inviteFriends: function(){
			var self = this;
			ID.ui({
				method: "apprequests",
				message: "Join me, I am playing Paragon War!",
				redirect_uri: 'http://apps.id.net/paragon-war'
			}, function(response) {
				//log.info(response);
				if(response){ // null when zero are sent
					if(response.to == 1){
						self.game.showNotification(response.to+" Friend invitation sent!");
					}else{
						self.game.showNotification(response.to+" Friend invitations sent!");
					}
				}
			});

		},
		
		friendRequest: function(lastProfile) {
			var self = this;
			ID.ui({
				method: "friends",
				redirect_uri: "http://apps.id.net/paragon-war",
				id: lastProfile.pid
			}, function(response) {
				//log.info(response);
				if(response.action != 0){
					self.game.showNotification("Friend request sent to "+lastProfile.name+"!");
				}
			});

		},

        setGame: function(game) {
            this.game = game;
            this.isMobile = this.game.renderer.mobile;
            this.isTablet = this.game.renderer.tablet;
            this.isDesktop = !(this.isMobile || this.isTablet);
            this.supportsWorkers = !!window.Worker;
            this.ready = true;
            this.playersBoard = new PlayersBoard(game.chat);
        },

        initFormFields: function() {
            var self = this;

            // Play button
            this.$play = $('.play');
            this.getPlayButton = function() {
					if(this.getActiveForm()===null){
						return null;
					}
						
					return this.getActiveForm().find('.play span')
			};
            
			this.setPlayButtonState(true);
			
			// Guest button
            this.$guest = $('.guest');
            this.getGuestButton = function() { return this.getActiveForm().find('.guest span') };
			$('.guest-play img').toggle();

            // Login form fields
            this.$loginnameinput = $('#loginnameinput');
            this.loginFormFields = [this.$loginnameinput];

            // Create new character form fields
            this.$nameinput = $('#nameinput');
            this.createNewCharacterFormFields = [this.$nameinput];

            // Functions to return the proper username / password fields to use, depending on which form
            // (login or create new character) is currently active.
            this.getUsernameField = function() {
				if(self.guestConvert){
					return $('#nameinput2');
				}else if(this.loginFormActive()){
					return this.$loginnameinput;
				}else{
					return $('#nameinput');
				}
			};
        },

        center: function() {
            window.scrollTo(0, 1);
        },

        canStartGame: function() {
            if(this.isDesktop) {
                return (this.game && this.game.map && this.game.map.isLoaded);
            } else {
                return this.game;
            }
        },

        tryStartingGame: function() {
			console.log('tryStartGame');
            if(this.starting){
				console.log('already starting');
				return; // Already loading
			}
            
            if(!this.canStartGame) {
				console.log('not ready to start yet');
            	return;
            }
            // load map on the login/create button
            this.game.loadMap("centralarea");
            
			$('.loading').show();
			$('.buttons').hide();
			

            var self = this;
            var action = this.createNewCharacterFormActive() ? 'create' : 'login';
            var username = this.getUsernameField().val();
			var userpw = '';
			var email = '';
			
			if(!username){
				username = 'pid';
			}
			if(self.idnetUser){
				userpw = self.idnetUser.pid;
				email = self.idnetUser.email;
			}
			
			if(self.guestPlay){
				action = 'create';
				username = '_Guest'+Math.random().toString(36).substr(2, 5);
				userpw = Math.random().toString(36).substr(2, 16);
				email = 'guest@none.com'
				
			}else{
				if(!this.validateFormFields(username)) return;
				this.setPlayButtonState(false);
			}

            if(!this.ready || !this.canStartGame()) {
                var watchCanStart = setInterval(function() {
                    log.debug("waiting...");
                    if(self.canStartGame()) {
                        clearInterval(watchCanStart);
						self.fadeBackground();
                        self.startGame(action, username, userpw, email);
                    }
                }, 100);
            } else {
				this.fadeBackground();
                this.startGame(action, username, userpw, email);
            }
        },
		
		tryConvertGuest: function() {
			console.log('tryConvertGuest');
            var self = this;
            var action = 'create';
			var guestName = this.game.player.name;
            var username = $('#nameinput2').val();
			var userpw = '';
			var email = '';
			if(self.idnetUser){
				userpw = self.idnetUser.pid;
				email = self.idnetUser.email;
			}
			if(!this.validateFormFields(username)){
				ga('send', 'event', 'button', 'click', 'guest convert failure');
				return;
			}
			ga('send', 'event', 'button', 'click', 'guest convert success');
			this.game.client.sendConvert(guestName, username, userpw, email);
		},
		
		fadeBackground: function(){
			$('.table-bg').fadeOut(5000);
		},

        startGame: function(action, username, userpw, email) {
            var self = this;

            if(!this.game.started) {
                var optionsSet = false,
                    config = this.config;

                if(!optionsSet) {
                    log.debug("Starting game with build config.");
                    this.game.setServerOptions(config.build.host, config.build.port, username, userpw, email, config.build.cdn, config.build.version);
                }

                this.center();
                this.game.run(action, function(result) {
                    if(result.success === true) {
                        self.start(action);
						log.info('start success');
						if(action == 'create' && !this.hasConnectedBefore){
							if(self.guestPlay){
								ga('send', 'event', 'button', 'click', 'guest create success');
							}else{
								ga('send', 'event', 'button', 'click', 'user create success');
							}
						}else if(action == 'login' && !this.hasConnectedBefore){
							if(self.guestPlay){
								ga('send', 'event', 'button', 'click', 'guest login success');
							}else{
								ga('send', 'event', 'button', 'click', 'user login success');
							}
						}
                    } else {
						log.info('start failure');
						if(action == 'create' && !this.hasConnectedBefore){
							if(self.guestPlay){
								ga('send', 'event', 'button', 'click', 'guest create failure');
							}else{
								ga('send', 'event', 'button', 'click', 'user create failure');
							}
						}else if(action == 'login' && !this.hasConnectedBefore){
							if(self.guestPlay){
								ga('send', 'event', 'button', 'click', 'guest login failure');
							}else{
								ga('send', 'event', 'button', 'click', 'user login failure');
							}
						}
                        self.setPlayButtonState(true);

                        switch(result.reason) {
                            case 'invalidlogin':
                                // Login information was not correct (either username or password)
								self.addValidationError(self.getUsernameField(), 'Start by making a new character.');
								self.animateParchment('loadcharacter', 'createcharacter');
                                self.getUsernameField().focus();
                                break;
                            case 'userexists':
                                // Attempted to create a new user, but the username was taken
                                self.addValidationError(self.getUsernameField(), 'The username you entered is not available.');
                                break;
                            case 'invalidusername':
                                // The username contains characters that are not allowed (rejected by the sanitizer)
                                self.addValidationError(self.getUsernameField(), 'The username you entered contains invalid characters.');
                                break;
                            default:
                                self.addValidationError(null, 'Failed to launch the game: ' + (result.reason ? result.reason : '(reason unknown)'));
                                break;
                        }
                    }

                    self.game.client.onLeaderboards(function(leaderObj){
                        self.leaderBoard.updateBoardData(leaderObj);
                    });
                });
            }
        },

        start: function(action) {
			var self = this;
            this.hideIntro();
			this.hideChat();
            $('body').addClass('started');
        },
        
        setPlayButtonState: function(enabled) {
            var self = this;
            var $playButton = this.getPlayButton();

            if(enabled) {
                this.starting = false;
                this.$play.removeClass('loading');
                $playButton.click(function () { self.tryStartingGame(); });
                if(this.playButtonRestoreText) {
                    $playButton.text(this.playButtonRestoreText);
                }
            } else {
                // Loading state
                this.starting = true;
                this.$play.addClass('loading');
                $playButton.unbind('click');
                this.playButtonRestoreText = $playButton.text();
                $playButton.text('Loading...');
            }
        },

        getActiveForm: function() { 
            if(this.loginFormActive()) return $('#loadcharacter');
            else if(this.createNewCharacterFormActive()) return $('#createcharacter');
			else if(this.guestMenuActive()) return $('#guest');
			else if(this.idnetMenuActive()) return $('#idnet-login');
			else if(this.guestConvert) return $('#convertcharacter');
            else return null;
        },

        loginFormActive: function() {
            return $('#parchment').hasClass("loadcharacter");
        },

        createNewCharacterFormActive: function() {
            return $('#parchment').hasClass("createcharacter");
        },
		
		guestMenuActive: function() {
            return $('#parchment').hasClass("guest");
        },
		
		idnetMenuActive: function() {
            return $('#parchment').hasClass("idnet-login");
        },

        /**
         * Performs some basic validation on the login / create new character forms (required fields are filled
         * out, passwords match, email looks valid). Assumes either the login or the create new character form
         * is currently active.
         */
        validateFormFields: function(username) {
			var self = this;
            this.clearValidationErrors();

            if(!username) {
                this.addValidationError(this.getUsernameField(), 'Please enter a username.');
                return false;
            }
			if(!self.idnetUser){
				self.showIdnet();
				return false;
			}

            return true;
        },

        validateEmail: function(email) {
            // Regex borrowed from http://stackoverflow.com/a/46181/393005
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },

        addValidationError: function(field, errorText) {
			$('.buttons').show();
			$('.loading').hide();
            $('<span/>', {
                'class': 'validation-error blink',
                text: errorText
            }).appendTo('.validation-summary');

            if(field) {
                field.addClass('field-error').select();
                field.bind('keypress', function (event) {
                    field.removeClass('field-error');
                    $('.validation-error').remove();
                    $(this).unbind(event);
                });
            }
        },

        clearValidationErrors: function() {
            var fields = this.loginFormActive() ? this.loginFormFields : this.createNewCharacterFormFields;
            $.each(fields, function(i, field) {
                field.removeClass('field-error');
            });
            $('.validation-error').remove();
        },

        setMouseCoordinates: function(event) {
            var gamePos = $('#container').offset(),
                scale = this.game.renderer.getScaleFactor(),
                width = this.game.renderer.getWidth(),
                height = this.game.renderer.getHeight(),
                mouse = this.game.mouse;

            mouse.x = event.pageX - gamePos.left - (this.isMobile ? 0 : 5 * scale);
            mouse.y = event.pageY - gamePos.top - (this.isMobile ? 0 : 7 * scale);

            if(mouse.x <= 0) {
                mouse.x = 0;
            } else if(mouse.x >= width) {
                mouse.x = width - 1;
            }

            if(mouse.y <= 0) {
                mouse.y = 0;
            } else if(mouse.y >= height) {
                mouse.y = height - 1;
            }
        },
        //Init the hud that makes it show what creature you are mousing over and attacking
        initTargetHud: function(){
            var self = this;
            var scale = self.game.renderer.getScaleFactor(),
                healthMaxWidth = $("#inspector .health").width() - (12 * scale),
                timeout;

            self.game.player.onSetTarget(function(target, name, mouseover){
                var el = '#inspector';
                self.inspectorFadeOut = false;
                
				if (typeof target !== 'undefined') {
					if (typeof target.showName !== 'undefined'){
						var level = target.level;
					}else{
						var level = MobList.getMobLevel(target.kind);
					}
					if(level !== undefined) {
						$(el + ' .level').text("Lvl " + level);
					}
					else {
						$(el+' .level').text('');
					}
					
					$(el+' .name').text(name);
					$(el).fadeIn('fast');
					
					if(target instanceof Mob/* || target instanceof Character*/) {
						if(target.hitPoints){
							$(el+" .health").css('width', Math.round(target.hitPoints/target.maxHitPoints*100)+'%');
						} else if(target.hitPoints === 0 && !target.isDead){
							$(el+" .health").css('width', '100%');
						} else if(target.hitPoints === 0){
							$(el+" .health").css('width', '0%');
						}
						
						var scale = self.game.renderer.getScaleFactor();
						$(el).css('left', (target.x - self.game.renderer.camera.x) * scale - 70 + target.sprite.width / 2);
						$(el).css('top', (target.y - self.game.renderer.camera.y) * scale - 50);
						$(el).css('border-radius', '6px 6px 6px 6px');
					} else {
						$(el+" .health").css('width', '0%');
						$(el).css('left', 15);
						$(el).css('top', 15);
						$(el).css('border-radius', '0 0 6px 0');
					}
				}
            });

            self.game.onUpdateTarget(function(target){
            	if(target instanceof Mob || target instanceof Character) {
					var scale = self.game.renderer.getScaleFactor();
					$("#inspector .health").css('width', Math.round(target.hitPoints/target.maxHitPoints*100) + "%");
					$("#inspector").css('left', (target.x - self.game.renderer.camera.x) * scale - 70 + target.sprite.width / 2);
					$("#inspector").css('top', (target.y - self.game.renderer.camera.y) * scale - 50);
					$("#inspector").css('border-radius', '6px 6px 6px 6px');
            	}
            	
            	if(!self.inspectorFadeOut && $("#inspector").css('display') != 'none' && (target.hitPoints <= 0 || target.isDead)) {
            		$("#inspector").fadeOut('fast');
                    self.inspectorFadeOut = true;
            	}
            });

            self.game.player.onRemoveTarget(function(targetId){
                self.game.player.inspecting = null;
                var inspector = $("#inspector");
                if(!self.inspectorFadeOut && inspector.css('display') != 'none') {
                	inspector.fadeOut('fast');
                    self.inspectorFadeOut = true;
                }
            });
        },
         
        toggleButton: function() {
            var name = $('#parchment input').val(),
                $play = $('#createcharacter .play');

            if(name && name.length > 0) {
                $play.removeClass('disabled');
                $('#character').removeClass('disabled');
            } else {
                $play.addClass('disabled');
                $('#character').addClass('disabled');
            }
        },

        hideIntro: function() {
            clearInterval(this.watchNameInputInterval);
            $('body').removeClass('intro');
            setTimeout(function() {
                $('body').addClass('game');
            }, 500);
        },

        showChat: function() {
            if(this.game.started) {
				$('.chatArea').fadeIn(250);
                $('.chatArea').addClass("active");
                $('#new_message_panel').fadeOut("slow");
            }
        },
		
		showChatInput: function() {
            if(this.game.started) {
                $('#chatbox').fadeIn(250);
                $('#chatinput').focus();
                $('#chatbutton').addClass('active');
            }
        },

        hideChat: function() {
            if(this.game.started) {
                $('#chatbox').fadeOut(250);
                $('#chatinput').blur();
                $('#chatbutton').removeClass('active');
				$('.chatArea').fadeOut(250);
                $('.chatArea').removeClass("active");
				this.game.chatFade = null;
            }
        },
        
        showGameMesages: function() {
            if(this.game.started) {
            	$('.msgArea').addClass('active');
            	$('.msgArea').fadeIn(250);
            }
        },
        
        moveGameMsg: function() {
        	var msg = $("#msgbox").text();
    		$("#msgbox").text("");
    		
    		if(msg != "") {
    			var $messageDiv = $('<li class="message"/>').text(msg);
    			$('.gamemessages').append($messageDiv);
    			$('.msgArea')[0].scrollTop = $('.msgArea')[0].scrollHeight;
    		}
        },
		
        hideGameMesages: function() {
        	$('.msgArea').removeClass('active');
            
        	if(this.game.started) {
                $('.msgArea').fadeOut(250);
            }
        },
        
        // TODO rename to showIntructions
        toggleInstructions: function() {
            this.hideWindows();
            $('#instructions').toggleClass('active');
        },
		// TODO rename to showLeaderboards
		toggleLeaderboards: function() {
            this.hideWindows();
            $('#leaderboards').toggleClass('active');
        },

		showProfile: function() {
            this.hideWindows();
            $('#profile').toggleClass('active');
        },

        toggleAchievements: function() {
			if($('#achievements').hasClass('active')){
				this.hideWindows();
			}else{
				this.hideWindows();
				this.resetPage();
				$('#achievements').toggleClass('active');
			}
        },
		
		togglePlayerPage: function() {
			if(!$('#mainmenu').hasClass('active')){
				this.game.updatePlayerPage(this.game.player);
				$('#menubutton').toggleClass('active');
				$('#mainmenu').toggleClass('active');
			}
        },
		
        toggleWhatsnewContent: function() {
        	var currentState = $('#parchment').attr('class');
        	if(currentState !== 'animate') {
                if(currentState === 'whatsnewlist') {
                    this.animateParchment(currentState, this.prevstate);//'loadcharacter'
                } else {
                	this.prevstate = currentState;
                	this.animateParchment(currentState, 'whatsnewlist');
                }
            }
        },

        resetPage: function() {
            var self = this,
                $achievements = $('#achievements');

            if($achievements.hasClass('active')) {
                $achievements.bind(TRANSITIONEND, function() {
                    $achievements.removeClass('page' + self.currentPage).addClass('page1');
                    self.currentPage = 1;
                    $achievements.unbind(TRANSITIONEND);
                });
            }
        },

        initEquipmentIcons: function() {
            var scale = this.game.renderer.getScaleFactor(),
                getIconPath = function(spriteName) {
                    return 'img/'+ scale +'/item-' + spriteName + '.png';
                },
                weapon = this.game.player.getWeaponName(),
                armor = this.game.player.getSpriteName(),
                weaponPath = getIconPath(weapon),
                armorPath = getIconPath(armor);

            $('#weapon').css('background-image', 'url("' + weaponPath + '")');
			$('#weaponname').text(this.capitalize(weapon));
            if(armor !== 'hulk') {
                $('#armor').css('background-image', 'url("' + armorPath + '")');
				$('#armorname').text(this.capitalize(armor));
            }
        },
        //
        //initLeaderBoard: function() {
        //    $('#leader_menu .content_type .back')[0].click();
        //},

		capitalize: function(s){
			return s && s[0].toUpperCase() + s.slice(1);
		},

        hideWindows: function() {
            var windows = [ '#potions_menu', '#profile_menu', '#instructions', '#leaderboards', '#waypoint_menu',
                            '#profile', '#store', '#crystalstore', '#characterselect', '#key_menu',
                            '#remortdialog', '#leader_menu', '#friends_menu', '#players_menu'];

            windows.forEach(function(elem){
                if($(elem).hasClass('active'))
                    $(elem).removeClass('active');
            });
			$('#keylist').hide();

            if($('#achievements').hasClass('active')) {
                $('#achievements').removeClass('active');
                $('#achievementsbutton').removeClass('active');
            }

			if($('#mainmenu').hasClass('active')) {
                $('#mainmenu').removeClass('active');
                $('#menubutton').removeClass('active');
            }
			if($('body').hasClass('joinidnet')) {
                this.closeInGameScroll('joinidnet');
            }
			if($('body').hasClass('convertcharacter')) {
                this.closeInGameScroll('convertcharacter');
            }
			if($('body').hasClass('guest')) {
                this.closeInGameScroll('guest');
            }
			if($('.msgArea').hasClass('active')) {
                this.hideGameMesages();
            }

            if($('#leader_menu').hasClass('active'))
                this.leaderBoard.closeBoard();

            this.game.hotbar.hideWindow($('.attackwin'));
            this.game.hotbar.hideWindow($('.defensewin'));
            
            $('#parchment').removeClass('pickcharacter');
        },

        showAchievementNotification: function(id, name) {
            var $notif = $('#achievement-notification'),
                $name = $notif.find('.name'),
                $button = $('#achievementsbutton');

            $notif.removeClass().addClass('active achievement' + id);
            $name.text(name);
            if(this.game.storage.getAchievementCount() === 1) {
                this.blinkInterval = setInterval(function() {
                    $button.toggleClass('blink');
                }, 500);
            }
            setTimeout(function() {
                $notif.removeClass('active');
                $button.removeClass('blink');
            }, 5000);/*5000*/
        },

        displayUnlockedAchievement: function(id) {
            var $achievement = $('#achievements li.achievement' + id),
                achievement = this.game.getAchievementById(id);

            if(achievement && achievement.hidden) {
                this.setAchievementData($achievement, achievement.name, achievement.desc);
            }
            $achievement.addClass('unlocked');
        },

        unlockAchievement: function(id, name) {
            this.showAchievementNotification(id, name);
            this.displayUnlockedAchievement(id);

            var nb = parseInt($('#unlocked-achievements').text());
            $('#unlocked-achievements').text(nb + 1);
        },

        initAchievementList: function(achievements) {
            var self = this;
				
			// prevent map change from loading this more than once
			if(self.game.achievementCount == 0){
				$lists = $('#lists'),
                $page = $('#page-tmpl'),
                $achievement = $('#achievement-tmpl'),
                page = 0,
                count = 0,
                $p = null;
				
				_.each(achievements, function(achievement) {
					count++;
					self.game.achievementCount++;

					var $a = $achievement.clone();
					$a.removeAttr('id');
					$a.addClass('achievement'+count);
					if(!achievement.hidden) {
						self.setAchievementData($a, achievement.name, achievement.desc);
					}
					$a.find('.twitter').attr('href', 'http://twitter.com/share?url=http%3A%2F%2Fbrowserquest.mozilla.org&text=I%20unlocked%20the%20%27'+ achievement.name +'%27%20achievement%20on%20Mozilla%27s%20%23BrowserQuest%21&related=glecollinet:Creators%20of%20BrowserQuest%2Cwhatthefranck');
					$a.show();
					$a.find('a').click(function() {
						var url = $(this).attr('href');

						// remove popup code
						//self.openPopup('twitter', url);
						return false;
					});

					if((count - 1) % 4 === 0) {
						page++;
						$p = $page.clone();
						$p.attr('id', 'page'+page);
						$p.show();
						$lists.append($p);
					}
					$p.append($a);
				});
				$('#total-achievements').text(self.game.achievementCount);
			}
        },

        initUnlockedAchievements: function(ids) {
            var self = this;

            _.each(ids, function(id) {
                self.displayUnlockedAchievement(id);
            });
            $('#unlocked-achievements').text(ids.length);
        },

        setAchievementData: function($el, name, desc) {
            $el.find('.achievement-name').html(name);
            $el.find('.achievement-description').html(desc);
        },

        toggleScrollContent: function(content) {
            var currentState = $('#parchment').attr('class');

            if(this.game.started) {
                $('#parchment').removeClass().addClass(content);

                $('body').removeClass('credits legal joinidnet profile convertcharacter').toggleClass(content);
                if(!this.game.player) {
                    $('body').toggleClass('death');
                }

            } else {
                if(currentState !== 'animate') {
                    if(currentState === content) {
                        this.animateParchment(currentState, this.frontPage);
                    } else {
                        this.animateParchment(currentState, content);
                    }
                }
            }
        },

        closeInGameScroll: function(content) {
            $('body').removeClass(content);
            $('#parchment').removeClass(content);
            if(!this.game.player) {
                $('body').addClass('death');
            }
        },

        animateParchment: function(origin, destination) {
            var self = this,
                $parchment = $('#parchment'),
                duration = 1;

            if(this.isMobile) {
                $parchment.removeClass(origin).addClass(destination);
            } else {
                if(this.isParchmentReady) {
                    if(this.isTablet) {
                        duration = 0;
                    }
                    this.isParchmentReady = !this.isParchmentReady;

                    $parchment.toggleClass('animate');
                    $parchment.removeClass(origin);

                    setTimeout(function() {
                        $('#parchment').toggleClass('animate');
                        $parchment.addClass(destination);
                    }, duration * 1000);

                    setTimeout(function() {
                        self.isParchmentReady = !self.isParchmentReady;
                    }, duration * 1000);
                }
            }
        },

        resizeUi: function() {
            //log.debug("resizeUi w: "+window.innerWidth+" h: "+window.innerHeight);
        	if(this.game) {
                if(this.game.started) {
                    this.game.resize();
                    this.initTargetHud();
					this.game.updateGlobes();
                } else {
                    var newScale = this.game.renderer.getScaleFactor();
                    this.game.renderer.rescale(newScale);
                }
            }
        },
        
        onResize: function() {
        	if(this.game) {
        		this.game.renderer.resize();
				if(this.game.started) {
                    this.game.scaleStuff();
				}
        	}
        },

		reloadPage: function(){
			window.location.reload(true);
		},
		
		openCheckout: function(url){
			log.info(url);
			window.open(url);
		}
    });

    return App;
});
