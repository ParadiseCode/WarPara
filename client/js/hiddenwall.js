
define(['entity'], function(Entity) {

    var HiddenWall = Entity.extend({
        init: function(id, kind) {
            this._super(id, Types.Entities.HIDDENWALL);
        },

        getSpriteName: function() {
            return "hiddenwall";
        },

        isMoving: function() {
            return false;
        },

        // define a smash event
        smash: function() {
            if(this.smash_callback) {
                this.smash_callback();
            }
        },

        onSmash: function(callback) {
            this.smash_callback = callback;
        }
        
    });

    return HiddenWall;
});
