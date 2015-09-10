
define(function() {

    var Chat = Class.extend({
        init: function(app) {
            var self = this;
            this.app = app;
            this.lastMessage = {name: '', message: ''};

            $('#main.chat-room-header a').click(function(){
                self.headerRoomClickEvent("main");
            });

            $('#new_message_panel').click(function() {
                $('#new_message_panel').fadeOut( "slow" );
            });
        },

        addChatMessage: function(recipient, message, from){
            if (from === undefined)
                from = "main";

            var self = this;
            if(this.chatFade == null) {
                this.app.showChat();
            }

            var $usernameDiv = $('<a href="#" id="'+recipient+'" class="username"/>').text(recipient);

            $usernameDiv.click(function(){
                self.tryOpenPrivateChatRoom(recipient);
            });

            var $messageBodyDiv = $('<span class="messageBody">').text(' :  '+message);
            var $messageDiv = $('<li class="message"/>').append($usernameDiv, $messageBodyDiv);
            /*if(this.lastMessage.message != message || this.lastMessage.name != recipient)*/{
                this.lastMessage = {name: recipient, message: message};
                this.repeatMessageNum = 0;
                $('#' +from+ '-content .messages').append($messageDiv);
            }/*else{
                this.repeatMessageNum++;
                $('.messages:last-child > .messageBody').html(message+' x'+this.repeatMessageNum);
            }*/
            $('.chatArea')[0].scrollTop = $('.chatArea')[0].scrollHeight;

            if(!self.isChatOwner(recipient) && !$('#chatbox').is(':visible')) {
                $('#new_message_panel').text(recipient+": "+message);
                $('#new_message_panel').fadeIn("slow");
            }

            this.chatFade = setTimeout(function(){
                if(!$('#chatbox').is(':visible')){
                    self.app.hideChat();
                }
            }, 30000);
        },

        addPrivateChatMessage: function(from, message){
            this.tryOpenPrivateChatRoom(from);
            this.addChatMessage(from, message, from);
            $('#'+ from +'.chat-room-header a').addClass("active");
            var $msgCounter = $('#'+ from +'.chat-room-header .msg_counter'); console.log($msgCounter);
            $msgCounter.text(parseInt($msgCounter.text()) + 1);

            if(!this.isChatOwner(from)) {
                var count = this.getNewMessageCount();
                this.setNewMessageCount(count + 1);
            }
        },

        tryOpenPrivateChatRoom: function(name){
            var self = this;

            var ids = this.getOpenRooms();

            var isRoomUnique    = ids.indexOf(name) == -1;

            if (!self.isChatOwner(name) && isRoomUnique) {
                $(".chat-room-headers").append('<div class="chat-room-header" id="' + name + '">' +
                '<div class="room-status"></div>' +
                '<div class="msg_counter">0</div>' +
                '<a href="#">' + name + '</a></div>');

                $(".chatHolder").append('' +
                '<div id="'+ name +'-content" class="chat-room-content">' +
                    '<div class="chatArea">' +
                        '<ul class="messages"></ul>' +
                    '</div>' +
                '</div>');

                $('#'+ name +'.chat-room-header a').click(function(){
                    self.headerRoomClickEvent(name);
                });

                $('#'+ name +'.chat-room-header .room-status').click(function(){ // close button click event

                    var $msgCounter = $('#'+ name +'.chat-room-header .msg_counter');
                    var count = self.getNewMessageCount();
                    var globalMessageCount = count - parseInt($msgCounter.text());
                    self.setNewMessageCount(globalMessageCount);
                    $msgCounter.text(0);

                    $('#'+ name +'.chat-room-header').remove();
                    $('#'+ name +'-content.chat-room-content').remove();
                    self.headerRoomClickEvent("main");
                });
            }
        },

        getOpenRooms: function(){
            var ids = [];
            $(".chat-room-headers > div").each(function(index) {
                ids[index] = $(this).attr('id');
            });
            return ids;
        },

        headerRoomClickEvent: function(headerName){
            // deactivate header and chat room
            $('.chat-room-content.active').removeClass('active');
            $('.chat-room-header.active').removeClass('active');

            // activate header and chat room
            $('#'+ headerName +'-content.chat-room-content').addClass('active');
            $('#'+ headerName +'.chat-room-header').addClass('active');

            $('#'+ headerName +'.chat-room-header a').removeClass("active");

            var $msgCounter = $('#'+ headerName +'.chat-room-header .msg_counter');
            var count = this.getNewMessageCount();
            var globalMessageCount = count - parseInt($msgCounter.text());
            this.setNewMessageCount(globalMessageCount);
            $msgCounter.text(0);
        },

        sendChatMessage: function(message){
            var messageSender = $(".chat-room-header.active").attr("id");


            if(message == "!ch") {
                var gameObj = this.app.game;
                gameObj.player.changeGender(gameObj.sprites);
                return;
            }

            var isPrivateMessage = messageSender !== "main";
            if(isPrivateMessage) {
                this.addChatMessage(this.app.game.player.name, message, messageSender);
                message = "!pm " + messageSender + " " + message;
            }

            var $msgCounter = $('#'+ messageSender +'.chat-room-header .msg_counter');
            var count = this.getNewMessageCount();
            var globalMessageCount = count - parseInt($msgCounter.text());
            this.setNewMessageCount(globalMessageCount);
            $msgCounter.text(0);

            this.app.game.client.sendChat(message);
            return message;
        },

        getNewMessageCount: function(){
            return parseInt($('.new_msg_counter').text());
        },

        setNewMessageCount: function(count) {
            var $counter = $('.new_msg_counter');
            $counter.text(count);

            if (count <= 0) {
                $counter.hide();
                $counter.text(0);
            }
            else
                $counter.show();
        },

        isChatOwner: function(name){
            return this.app.game.player.name == name;
        }
    });

    return Chat;
});
