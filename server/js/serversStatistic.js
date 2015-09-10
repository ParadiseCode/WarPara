
ServerStat = {};

/** @type {number} */
ServerStat.totalPlayers      = 0;
ServerStat.totalGuestPlayers = 0;

/**
 * @param onlinePlayers {Object} player object,
 * key - nickname,
 * level    {Integer} current player level,
 * location {String} current player location
*/
ServerStat.onlinePlayers  = {};

/**
 * @param currentPlayer {Object} Player instance
 */
ServerStat.addPlayer = function (currentPlayer, callback) {
    try {
        this.totalPlayers++;

        if (this.isGuest(currentPlayer))
            ++this.totalGuestPlayers;

        this.onlinePlayers[currentPlayer.name] = { level: currentPlayer.level, location: currentPlayer.map };

        if (callback)
            callback();
    } catch(e) {
        log.error('Error stack: ' + e.stack);
    }
};

/**
 * @param currentPlayer {Object} Player instance
 */
ServerStat.removePlayer = function (currentPlayer, callback) {
    try {
        this.totalPlayers--;

        if (this.isGuest(currentPlayer))
            --this.totalGuestPlayers;

        delete this.onlinePlayers[currentPlayer.name];

        if (callback)
            callback();
    } catch(e) {
        log.error('Error stack: ' + e.stack);
    }
};

/**
 * @param currentPlayer {Object} Player instance
 * @return {Boolean}
 */
ServerStat.isGuest = function (currentPlayer) {
    var GUEST_PREFIX = '_Guest';
    return currentPlayer.name.substring(0, GUEST_PREFIX.length) === GUEST_PREFIX;
};

ServerStat.getGuestCount = function () {
    return this.totalGuestPlayers;
};

ServerStat.getPlayersCount = function () {
    return this.totalPlayers;
};

ServerStat.getOnlinePlayersData = function () {
    return this.onlinePlayers;
};

module.exports = ServerStat;
