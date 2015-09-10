
define(function() {

    var PlayersBoard = Class.extend({
        init: function(chat) {
            /** @constants */
            this.BONUS_MULTIPLAYER = 2;

            /**
             * @type this.data.guestCount {Integer} guest count
             * @type this.data.friends    {Objects} array of friends by name
             * @type this.data.players    {Objects} array of player by name
             */
            this.data = null;
            this.chat = chat;
        },

        /** @param data {Object} received from server */
        updateBoardData: function(data) {
            this.data = data;
            this.bodyOnlinePlayersGenerate();
            this.friendsBodyGenerate();
        },

        bodyOnlinePlayersGenerate: function () {
            $('#players_stat tbody').html('');
            for (name in this.data.players) {
                var item = this.data.players[name];

                var name     = '<td>'+name+'</td>';
                var level    = '<td>'+item.level+'</td>';
                var location = '<td>'+item.location+'</td>';

                /** Row with online player data (name, level, location) */
                //for (var i = 150; i > 0; i--)
                $('#players_stat tbody').append('<tr>'+ name + level + location +'</tr>');

                /** Online players counter */
                $('.online_players .title').html('Online players: '+Object.keys(this.data.players).length);

                /** Online guests counter */
                $('#players_menu .footer').html('+'+this.data.guestCount+ ' Guests');
            }
        },

        friendsBodyGenerate: function () {
            var self = this;
            $('.friend_panel').html('');
            for (var i = 20; i > 0; i--)
            for (pid in this.data.friends) {
                if (!self.getFriendOnlineCharacter(pid))
                    continue;

                var item = this.data.friends[pid];
                var charName = self.getFriendOnlineCharacter(pid)
                var nickname = '<div class="nickname">' + item.ni + '</div>';
                var name = '<div class="name">' + (item.name || 'Roberto') + '</div>';
                var avatar = '<img class="avatar_pic" src="' + (item.avatar || '#') + '">';

                /** friends list */
                $('.friend_panel').append(
                    '<div class="friend_cell">' + avatar + '<div class="friend_info">' + (nickname + name) + '</div><img id="' + charName + '" class="chat_btn"></div>'
                );
            }

            $('.friends_counter').html($('.friend_cell').length);
            $('.bonus_counter').html($('.friend_cell').length * this.BONUS_MULTIPLAYER);

            $('.friend_cell .chat_btn').click(function() {
                $('#chatbutton').click();
                self.chat.tryOpenPrivateChatRoom(this.id);
                self.chat.headerRoomClickEvent(this.id);
            });
        },

        /**
         * @param friendPid {String} pid friend
         * @returns {String|null} as character name or null if all char offline
         */
        getFriendOnlineCharacter: function(friendPid) {
            var characters = this.data.friends[friendPid].characters;

            for (var i = 0; i < characters.length, name = characters[i]; i++)
                for (var playerName in this.data.players) {
                    if (playerName == name)
                        return name;
                }
            return null;
        }
    });

    return PlayersBoard;
});
