var _ = require('underscore');
var Types = require('../../shared/js/gametypes');

// Validates message format for messages received by the server
// referenced by player and guild server classes, though guild class does not appear to use

(function () {
    FormatChecker = Class.extend({
        init: function () {
            this.formats = [];
            this.formats[Types.Messages.CREATE] = ['s', 's', 's', 's'],
            this.formats[Types.Messages.LOGIN] = ['s', 's'],
            this.formats[Types.Messages.MOVE] = ['n', 'n'],
            this.formats[Types.Messages.LOOTMOVE] = ['n', 'n', 'n'],
            this.formats[Types.Messages.AGGRO] = ['n'],
            this.formats[Types.Messages.AGGRORANGED] = ['n'],			
            this.formats[Types.Messages.ATTACK] = ['n'],
            this.formats[Types.Messages.HIT] = ['n'],
            this.formats[Types.Messages.HITBOMB] = ['n'],
            this.formats[Types.Messages.HITHEAL] = ['n'],
            this.formats[Types.Messages.HITRANGED] = ['n', 'n', 'n', 'n'],
            this.formats[Types.Messages.HITWORLDPROJECTILE] = ['n', 'n'],                
            this.formats[Types.Messages.HURT] = ['n'],
            this.formats[Types.Messages.CHAT] = ['s'],
            this.formats[Types.Messages.DEBUG_MSG] = ['s'],
            this.formats[Types.Messages.LOOT] = ['n'],
            this.formats[Types.Messages.KEY] = ['n'],
            this.formats[Types.Messages.NPC_LOOT] = ['s'],
            this.formats[Types.Messages.TELEPORT] = ['n', 'n'],
            this.formats[Types.Messages.WAYPOINT_ENTER] = ['n'],
            this.formats[Types.Messages.ZONE] = [],
            this.formats[Types.Messages.OPEN] = ['n'],
            this.formats[Types.Messages.ACTIVATETRAP] = ['n'],
            this.formats[Types.Messages.CHECK] = ['n'],
            this.formats[Types.Messages.ACHIEVEMENT] = ['n', 's'],
            this.formats[Types.Messages.SWITCH] = ['n'],
            this.formats[Types.Messages.RETREAT] = ['n'],
            this.formats[Types.Messages.REMORT] = ['n'],
            this.formats[Types.Messages.CASTSPELL] = ['n','n','n','n','n','n'],
            this.formats[Types.Messages.CONVERT] = ['s','s','s','s'],
            this.formats[Types.Messages.INVENTORYUSE] = ['n'],
            this.formats[Types.Messages.DROPBOMB] = ['n', 'n'],
            this.formats[Types.Messages.PROFILE] = ['s'],
            this.formats[Types.Messages.LOCAL] = ['s'],
            this.formats[Types.Messages.DETAIL] = ['s'],
            this.formats[Types.Messages.PVPLEADER] = [],
            this.formats[Types.Messages.WAYPOINTS_UPDATE] = ['n'],
			this.formats[Types.Messages.LEADERBOARDS] = [],
			this.formats[Types.Messages.PLAYERS_STAT_REQUEST] = [],
            this.formats[Types.Messages.USEDOORTOMAP] = ['s','n','n'],
			this.formats[Types.Messages.INVENTORYSORT] = ['s'],
			this.formats[Types.Messages.GETCHECKOUT] = ['n'],
			this.formats[Types.Messages.UPDATEFRIENDS] = [],
            this.formats[Types.Messages.STOREPURCHASE] = ['n','n','n'],
			this.formats[Types.Messages.IDNETTOKEN] = ['s'],
            this.formats[Types.Messages.PREAUTH] = ['s'],
            this.formats[Types.Messages.ARENAPURCHASE] = ['n','n'],
            this.formats[Types.Messages.ARENAEXIT] = [],
            this.formats[Types.Messages.DELETECHARACTER] = ['s','s'],
			this.formats[Types.Messages.SPEED] = ['n'],
			this.formats[Types.Messages.SPEEDPOTION] = ['n','n'],
			this.formats[Types.Messages.REQUEST_MOB_PROJECTILE] = ['n','n']
        },

        check: function (msg) {
            var message = msg.slice(0),
                type = message[0],
                format = this.formats[type];

            message.shift();

            if (format) {
                if (message.length !== format.length) {
                    return false;
                }
                for (var i = 0, n = message.length; i < n; i += 1) {
                    if (format[i] === 'n' && !_.isNumber(message[i])) {
                        return false;
                    }
                    if (format[i] === 's' && !_.isString(message[i])) {
                        return false;
                    }
                }
                return true;
            }
            else if (type === Types.Messages.WHO) {
                // WHO messages have a variable amount of params, all of which must be numbers.
                return message.length > 0 && _.all(message, function (param) { return _.isNumber(param); });
            }
            else if (type === Types.Messages.LOGIN) {
                // LOGIN with or without guild
                return _.isString(message[0]) && _.isNumber(message[1]) && _.isNumber(message[2]) && (message.length == 3 || (_.isNumber(message[3]) && _.isString(message[4]) && message.length == 5) );
            }
            else if (type === Types.Messages.GUILD) {
                if (message[0] === Types.Messages.GUILDACTION.CREATE){
                    return (message.length === 2 && _.isString(message[1]));
                }
                else if (message[0] === Types.Messages.GUILDACTION.INVITE){
                    return (message.length === 2 && _.isString(message[1]));
                }
                else if (message[0] === Types.Messages.GUILDACTION.JOIN){
                    return (message.length === 3 && _.isNumber(message[1]) && _.isBoolean(message[2]));
                }
                else if (message[0] === Types.Messages.GUILDACTION.LEAVE){
                    return (message.length === 1);
                }
                else if (message[0] === Types.Messages.GUILDACTION.TALK){
                    return (message.length === 2 && _.isString(message[1]));
                }
                else {
                    log.error('Unknown message type: ' + type);
                    return false;
                }
            }
            else {
                log.error('Unknown message type: ' + type);
                return false;
            }
        }
    });

    var checker = new FormatChecker();

    exports.check = checker.check.bind(checker);
})();
