var Entity = require('./entity');
var Types = require('../../shared/js/gametypes');

module.exports = Item = Entity.extend({
    init: function (id, kind, x, y) {
        var type = Types.isCollectionItem(kind) ? Types.ITEM_TYPE.COLLECTION_ITEM : Types.ITEM_TYPE.ITEM;
        this._super(id, type, kind, x, y);
        this.isStatic = false;
        this.isFromChest = false;
    },

    handleDespawn: function (params) {
        var self = this;

        this.blinkTimeout = setTimeout(function () {
            params.blinkCallback();
            self.despawnTimeout = setTimeout(params.despawnCallback, params.blinkingDuration);
        }, params.beforeBlinkDelay);
    },

    destroy: function () {
        if (this.blinkTimeout) {
            clearTimeout(this.blinkTimeout);
        }
        if (this.despawnTimeout) {
            clearTimeout(this.despawnTimeout);
        }

        if (this.isStatic) {
            this.scheduleRespawn(15000);
        }
    },

    scheduleRespawn: function (delay) {
        var self = this;
        setTimeout(function () {
            if (self.respawnCallback) {
                self.respawnCallback();
            }
        }, delay);
    },

    onRespawn: function (callback) {
        this.respawnCallback = callback;
    }
});
