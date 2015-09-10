define(['jquery', 'app', 'lib/i18next.amd.withJQuery-1.8.2.min'], function($, App, i18n) {
    var app, game;
	var idnetSkip = true;

    var initApp = function() {
		(function(d, s, id){
			var js, fjs = d.getElementsByTagName(s)[0];
			 if (d.getElementById(id)) {return;}
			 js = d.createElement(s); js.id = id;
			 js.src =  document.location.protocol == 'https:' ? "https://scdn.id.net/api/sdk.js" : "http://cdn.id.net/api/sdk.js";
			 fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'id-jssdk'));
			
        $(document).ready(function() {
			i18n.init({ load: 'unspecific', fallbackLng: 'en' }, function(t) {
				$(".intro").i18n();
			});
            app = new App();
            app.center();		
			
			// load Idnet js sdk
			window.idAsyncInit = function() {
			$('.buttons').show();
			var self = this;

				ID.init({
					appId         : '53e34133031ee0c9dd000ee8',                 // App ID from the app dashboard
					status        : true,                                       // Check Id.net Login status
					responseType  : 'token'                                     // 'token' by default
				});
				ID.Event.subscribe('id.init', function(){ app.isLoggedIn(); });
				app.isLoggedIn();
				window.idAsyncInit = null;
			};

			$( "#versions-info" ).load( "../versions.html" );

            if(Detect.isWindows()) {
                // Workaround for graphical glitches on text
                $('body').addClass('windows');
            }

            if(Detect.isOpera()) {
                // Fix for no pointer events
                $('body').addClass('opera');
            }

            if(Detect.isFirefoxAndroid()) {
                // Remove chat placeholder
                $('#chatinput').removeAttr('placeholder');
            }

            $('body').click(function(event) {
				if($('#parchment').hasClass('joinidnet')) {
                    app.toggleScrollContent('joinidnet');
                }
                
            });

            $('.barbutton').click(function() {
                $(this).toggleClass('active');
            });

            $('#chatbutton').click(function() {
                if($('#chatbutton').hasClass('active')) {
                    app.showChat();
					app.showChatInput();
                } else {
                    app.hideChat();
                }
            });

            $('#menubutton').click(function() {
                if($('#menubutton').hasClass("active"))
                    app.togglePlayerPage();
                else
                    app.hideWindows();
            });

            $('#achievementsbutton').click(function() {
                app.toggleAchievements();
                if(app.blinkInterval) {
                    clearInterval(app.blinkInterval);
                }
                $(this).removeClass('blink');
            });
/*
            $('#instructions').click(function() {
                app.hideWindows();
            });
*/
            $('.clickable').click(function(event) {
                event.stopPropagation();
            });
			
			$('#healthglobe, #managlobe').click(function(event) {
                game.click();
            });

            $('#toggle-credits').click(function() {
                app.toggleScrollContent('credits');
            });

            $('#newplayer_button').click(function() {
				game.createGender();
                $('.loading').hide();
                app.animateParchment('pickcharacter', 'genderselection');
                app.clearValidationErrors();
            });
            
            $('#whatsnew_button').click(function() {
            	app.toggleWhatsnewContent('whatsnewlist');
            });

            $('#deleteplayer_button').click(function() {
                $('#deletetext').show();
                $('#pickerbuttons').hide();
                // todo
            });              
            
            $('.whatsnew').click(function() {
            	app.toggleWhatsnewContent('whatsnewlist');
            });

            $('.login').click(function() {
                app.showIdnet(true);
            });
			
			$('.register').click(function() {
                app.showIdnet(false);
            });
			
			$('.continue').click(function(event) {
				app.clearValidationErrors();
				app.tryStartingGame();
            });
			$('.create').click(function(event) {
				app.clearValidationErrors();
				if(app.guestConvert){
					app.tryConvertGuest();
				}else{
					app.tryStartingGame();
				}
            });
//			$('.play').click(function(event) {
//				app.clearValidationErrors();
//				app.guestPlay = true;
//				app.tryStartingGame();
//				$('.guest-play img').toggle();
//            });
			
			$('.guest').click(function(event) {
				if(app.idnetLoaded || self.idnetSkip){
					game.createGender();
					app.guestPlay = true;
					app.animateParchment('idnet-login', 'genderselection');
                    $("#secondary-player-info-col").hide();
                    $("#player-ranked-col").hide();
                    $("#profile_menu .guest_link").show();
                    $("#profile_menu .guest_info").show();

				}
            });
			
			$('#continue span').click(function() {
                app.animateParchment('confirmation', 'createcharacter');
                $('body').removeClass('returning');
                app.clearValidationErrors();
            });
			
			$('.cancel.guestdialog').click(function() {
				app.clearValidationErrors();
				app.animateParchment('guest', 'idnet-login');
            });
			$('.cancel.createdialog').click(function() {
				app.clearValidationErrors();
				app.animateParchment('createcharacter', 'pickcharacter');
            });
			
			$('.cancel.button').click(function() {
				app.clearValidationErrors();
				app.animateParchment('pre-map', 'pickcharacter');
            });

            $('#nameinput').bind("keyup", function() {
                app.toggleButton();
            });
			
			$('.invite').click(function() {
                app.inviteFriends();
            });
			
			$('#friendslist').on('click','.pm', function(){
                app.hideWindows();
				app.showChat();
				app.showChatInput();
				var pmName = $(this).attr('id');
				$('#chatinput').val('!pm '+pmName+' ');
            });
			
			$('#friendslist').on('click','.profile', function(){
                var profileName = $(this).attr('id');
				game.client.sendProfile(profileName);
				app.hideWindows();
            });
			
			$('#friendslist').on('click','.ignorefriend', function(){
				var id = $(this).closest('div').attr('id');
				game.ignoreFriend(id);
            });
			$('#friendslist').on('click','.acceptfriend', function(){
				var id = $(this).closest('div').attr('id');
				game.acceptFriend(id);
            });
			
			$('.friendRequest > #accept').click(function() {
				if(game.lastProfile){
					app.friendRequest(game.lastProfile);
				}
            });
			$('.friendRequest > #cancel').click(function() {
				$('.friendRequest').hide();
				clearTimeout(game.friendRequestTimeout);
				clearInterval(game.friendRequestTimer);
            });
			$('.aboutjoin').click(function() {
				if(app.guestPlay){
					log.info('trigger idnetjoin');
					app.game.updatePlayerCheckpoint();
					app.guestConvert = true;
					app.hideWindows();
					setTimeout(function() {
						app.toggleScrollContent('joinidnet');
					}, 1500);
                }
			});
			$('.leaderboards').click(function() {
					app.hideWindows();
					game.client.getLeaderboards();
					app.toggleLeaderboards();
			});
			$('.checkout').click(function() {
				game.client.sendGetCheckout(0);
			});

            $('#previous').click(function() {
                var $achievements = $('#achievements');

                if(app.currentPage === 1) {
                    return false;
                } else {
                    app.currentPage -= 1;
                    $achievements.removeClass().addClass('active page' + app.currentPage);
                }
            });

            $('#next').click(function() {
                var $achievements = $('#achievements'),
                    $lists = $('#lists'),
                    nbPages = $lists.children('ul').length;

                if(app.currentPage === nbPages) {
                    return false;
                } else {
                    app.currentPage += 1;
                    $achievements.removeClass().addClass('active page' + app.currentPage);
                }
            });
            
            $("#msgbox").click(function() {
            	if($('.msgArea').hasClass('active')) {
            		app.hideGameMesages();
            	} else {
            		app.showGameMesages();
            	}
            });

            $(".char-msg").click(function() {
                app.hideWindows();
                var name = $('#char-name').text();
                $('#chatbutton').click();
            	game.chat.tryOpenPrivateChatRoom(name);
                game.chat.headerRoomClickEvent(name);
            });

            $('.close').click(function() {
                app.hideWindows();
            });

            $("#precisionbutton").click(function() {
                if(!$(this).hasClass('active'))
                    game.clickToFire = null;
            });

            document.addEventListener("touchstart", function() {},false);

            $('#resize-check').bind("transitionend", app.resizeUi.bind(app));
            $('#resize-check').bind("webkitTransitionEnd", app.resizeUi.bind(app));
            $('#resize-check').bind("oTransitionEnd", app.resizeUi.bind(app));
            
            $( window ).resize(function() {
            	app.onResize();
            });

            log.info("App initialized.");
			

            initGame();

        });
    };

    var initGame = function() {
        require(['game'], function(Game) {

            var canvas = document.getElementById("entities"),
                background = document.getElementById("background"),
                foreground = document.getElementById("foreground"),
                input = document.getElementById("chatinput");

            game = new Game(app);
            game.setup('#bubbles', canvas, background, foreground, input);
            game.setStorage(app.storage);
            app.setGame(game);
            
            app.game.host = app.config.build.host;
            app.game.port = app.config.build.port;
            app.game.connect('none',function(){
                log.info('dummy connected callback');
            });

            game.onGameStart(function() {
                app.initEquipmentIcons();
            });

            game.onDisconnect(function(message) {
				app.hideWindows();
                $('#death').find('p').html(message+"<em>Please reload the page.</em>");
                $('#respawn').hide();
            });

            game.onPlayerDeath(function() {
                if($('body').hasClass('credits')) {
                    $('body').removeClass('credits');
                }
                $('body').addClass('death');
            });

            game.onPlayerEquipmentChange(function() {
                app.initEquipmentIcons();
            });

            game.onNbPlayersChange(function(worldPlayers, totalPlayers) {
				/*
            	if(totalPlayers == 1){
					$("#playercount").text('1 player');
				}else{
					$("#playercount").text(totalPlayers+' players');
				}
				*/
            });
            
            game.onPlayerExpChange(function(playerExp, toNextLevelExp) {
            	$("#expbordercenter").text('EXP: '+playerExp+' / '+toNextLevelExp);
            	var barwidth = Math.round(playerExp / toNextLevelExp * 316);
            	$("#expbar").css("width", barwidth+"px");
            });
            
            game.onGuildPopulationChange( function(guildName, guildPopulation) {
				// place counts where you want
			});

            game.onAchievementUnlock(function(id, name, description) {
                app.unlockAchievement(id, name);
            });

            game.onNotification(function(message) {
				// old message bar disabled
				//app.showMessage(message);
				//game.addChatMessage('GAME', message);
            	app.moveGameMsg();
            	$("#msgbox").text(message);
            });

            app.initTargetHud();
            $('#nameinput').attr('value', '');
            $('#chatbox').attr('value', '');
           
           // http://stackoverflow.com/questions/7018919/how-to-bind-touchstart-and-click-events-but-not-respond-to-both           
            var flag = false;
            $('#foreground').bind('touchstart mousedown', function(event){
                if (!flag) {
                    flag = true;
                    setTimeout(function(){ flag = false; }, 100);
                    app.center();
                    if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0]) {
                        app.setMouseCoordinates(event.originalEvent.touches[0]);
                    } else {
                        app.setMouseCoordinates(event);
                    }
                    if(game && !app.dropDialogPopuped) {
                        game.click();
                    }
                    app.hideWindows();
                }
                return false
            });           
      
            $('body').unbind('click');
			// close on click
            $('body').click(function(event) {
                var hasClosedParchment = false;

                if($('#parchment').hasClass('credits')) {
                    if(game.started) {
                        app.closeInGameScroll('credits');
                        hasClosedParchment = true;
                    } else {
                        app.toggleScrollContent('credits');
                    }
                }
                
                if($('#parchment').hasClass('whatsnewlist')) {
                    if(game.started) {
                        app.closeInGameScroll('whatsnewlist');
                        hasClosedParchment = true;
                    } else {
                        app.animateParchment('whatsnewlist', app.prevstate);
                    }
                }
				
				if($('#parchment').hasClass('joinidnet')) {
                    if(game.started) {
                        app.closeInGameScroll('joinidnet');
                        hasClosedParchment = true;
                    } else {
                        app.toggleScrollContent('joinidnet');
                    }
                }                      

                if(game.started && !game.renderer.mobile && game.player && !hasClosedParchment) {
                    game.click();
                }
            });

            $('#respawn').click(function(event) {
                game.audioManager.playSound("revive");
                game.respawn();
                $('body').removeClass('death');
            });

            $(document).mousemove(function(event) {
                app.setMouseCoordinates(event);
                if(game.started) {
                  game.movecursor();
                }
            });

            $(document).keyup(function(e) {
                var key = e.which;
                
                if (game.started && !$('#chatbox').hasClass('active'))
                {
                    switch(key) {
                        case Types.Keys.LEFT:
                        case Types.Keys.A:
                        case Types.Keys.KEYPAD_4:
                            game.player.moveLeft = false;
                            game.player.disableKeyboardNpcTalk = false;
                            break;
                        case Types.Keys.RIGHT:
                        case Types.Keys.D:
                        case Types.Keys.KEYPAD_6:
                            game.player.moveRight = false;
                            game.player.disableKeyboardNpcTalk = false;
                            break;
                        case Types.Keys.UP:
                        case Types.Keys.W:
                        case Types.Keys.KEYPAD_8:
                            game.player.moveUp = false;
                            game.player.disableKeyboardNpcTalk = false;
                            break;
                        case Types.Keys.DOWN:
                        case Types.Keys.S:
                        case Types.Keys.KEYPAD_2:
                            game.player.moveDown = false;
                            game.player.disableKeyboardNpcTalk = false;
                            break;
                        default:
                            break;
                    }
                }
            });

            $(document).keydown(function(e) {
                var key = e.which,
                    $chat = $('#chatinput');

                if(key === Types.Keys.ENTER) {
                    if($('#chatbox').is(':visible')) {
						// might want to keep this open
                        //app.hideChat();
                    } else {
                        app.showChat();
						app.showChatInput();
                    }
                }
                if (game.started && !$('#chatbox').is(':visible')) {
					if(game.player){
						// not sure what this is for -Eddie
						pos = {
							x: game.player.gridX,
							y: game.player.gridY
						};
					}
					var hotbar = "div#inventory";

                    switch(key) {
                        case Types.Keys.LEFT:
                        case Types.Keys.A:
                        case Types.Keys.KEYPAD_4:
                            game.player.moveLeft = true;
                            break;
                        case Types.Keys.RIGHT:
                        case Types.Keys.D:
                        case Types.Keys.KEYPAD_6:
                            game.player.moveRight = true;
                            break;
                        case Types.Keys.UP:
                        case Types.Keys.W:
                        case Types.Keys.KEYPAD_8:
                            game.player.moveUp = true;
                            break;
                        case Types.Keys.DOWN:
                        case Types.Keys.S:
                        case Types.Keys.KEYPAD_2:
                            game.player.moveDown = true;
                            break;
                        case Types.Keys.SPACE:
                            game.makePlayerAttackNext();
                            break;
                        case Types.Keys.I:
                            $('#achievementsbutton').click();
                            break;
                        case Types.Keys.L:
                            $('#leaderboard_button.main_cell').click();
                            break;
                        case Types.Keys.M:
                            $('#mutebutton.main_cell').click();
                            break;
                        case Types.Keys.B:
                            $('#potion_button.main_cell').click();
                            break;
                        case Types.Keys.G:
                            $('#players_button.main_cell').click();
                            break;
                        case Types.Keys.E:
                            $('#teleport_button.main_cell').click();
                            break;
                        case Types.Keys.P:
                            app.togglePlayerPage();
                            game.client.getLeaderboards();
                            $('#profile_button.main_cell').click();
                            break;
                        /*case Types.Keys.P:
							if(game.started){
								$('#helpbutton').click();
							}
                            break;*/
						case Types.Keys.KEY_1:
						case Types.Keys.KEY_2:
						case Types.Keys.KEY_3:
						case Types.Keys.KEY_4:
						case Types.Keys.KEY_5:
						case Types.Keys.KEY_6:
						case Types.Keys.KEY_7:
							$(hotbar+(key-Types.Keys.KEY_1)).click();
                            break;
                        case Types.Keys.KEY_8:
                            $('#precisionbutton').click();
                            break;
                        case Types.Keys.KEY_9:
                            $('#chatbutton').click();
                            break;
                        case Types.Keys.KEY_0:
                            $('#menubutton').click();
                            break;
                        default:
                            break;
                    }
                }
            });

             $(document).keyup(function(e) {
            	var key = e.which;
            });
           $('#chatinput').keydown(function(e) {
                var key = e.which,
                    $chat = $('#chatinput');

                if(key === 13) {
                    if($chat.val() !== '') {
                        if(game.player) {
                            game.say($chat.val());
                        }
                        $chat.val('');
                        return false;
                    } else {
						if($chat.is(" :focus ")){
							app.hideChat();
						}
                        return false;
                    }
                }

                if(key === 27) {
                    app.hideChat();
                    return false;
                }
            });

            $('#nameinput').focusin(function() {
                $('#name-tooltip').addClass('visible');
            });

            $('#nameinput').focusout(function() {
                $('#name-tooltip').removeClass('visible');
            });

            $('#nameinput').keypress(function(event) {
                $('#name-tooltip').removeClass('visible');
            });

            $('#mutebutton.main_cell').click(function() {
                game.audioManager.toggle();
            });

            $('#potion_button.main_cell').click(function() {

                if(!$('#potions_menu').hasClass('active'))
                {
                    app.hideWindows();
                    $('#potions_menu').toggleClass('active');
                }
                else
                    app.hideWindows();
            });

            $('#leaderboard_button.main_cell').click(function() {

                if(!$('#leader_menu').hasClass('active'))
                {
                    app.hideWindows();
                    app.leaderBoard.openBoard();
                }
                else
                    app.hideWindows();
            });

            $('#players_button.main_cell').click(function() {

                if(!$('#players_menu').hasClass('active'))
                {
                    app.hideWindows();
                    $('#players_menu').toggleClass('active');
                }
                else
                    app.hideWindows();
            });

			$('#keys_button.main_cell').click(function() {
                if(!$('#key_menu').hasClass('active'))
                {
                    $('#key_menu').toggleClass('active');
                }
                else
                    app.hideWindows();
            });

            $('#profile_button.main_cell').click(function() {

                if(!$('#profile_menu').hasClass('active'))
                {
                    app.hideWindows();
                    game.client.getLeaderboards();
                    $('#profile_menu').toggleClass('active');
                }
                else
                    app.hideWindows();
            });

            $('#teleport_button.main_cell').click(function() {

                if(!$('#waypoint_menu').hasClass('active'))
                {
                    /*app.hideWindows();
                    game.client.getLeaderboards();*/
                    $('#waypoint_menu').toggleClass('active');
                }
                else
                    app.hideWindows();
            });

            $("#potions_menu .swap_order").click(function() {

                if(!$('#potions_menu .swap_order').hasClass('active')) {
                    $('#potions_menu .swap_order').addClass("active");
                }
                else
                    $('#potions_menu .swap_order').removeClass("active");

                var firstLineHtml = $('#potions_menu .first.line').html();
                var thirdLine = $('#potions_menu .third.line');
                $('#potions_menu .first.line').html( thirdLine.html() );
                thirdLine.html(firstLineHtml);
                game.hotbar.updateHotbar();
            });

            $(document).bind("keydown", function(e) {
                var key = e.which,
                    $chat = $('#chatinput');

                if(key === 13) { // Enter
                    if(game.started) {
                        $chat.focus();
                        return false;
                    } else {
                        if(app.loginFormActive() || app.createNewCharacterFormActive()) {
                            $('input').blur();      // exit keyboard on mobile
							app.clearValidationErrors();
                            app.tryStartingGame();
                            return false;           // prevent form submit
                        }
                    }
                }

                if($('#chatinput:focus').size() == 0 && $('#nameinput:focus').size() == 0) {
                    if(key === 27) { // ESC
                        app.hideWindows();
                        _.each(game.player.attackers, function(attacker) {
                            attacker.stop();
                        });
                        return false;
                    }
					
					// test join idnet
					/*
					if(key === 70) { // f key
						app.hideWindows();
						app.toggleScrollContent('joinidnet');
					}
					*/
                }
            });            
            
           if(game.renderer.tablet) {
                $('body').addClass('tablet');
            }
			
			
        });
    };

    initApp();

});
