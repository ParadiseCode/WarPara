
define(['entity'], function(Entity) {

    var RockWall = Entity.extend({
        init: function(id, kind) {
            this._super(id, Types.Entities.ROCKWALL);
        },

        getSpriteName: function() {
            return "rockwall";
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

    return RockWall;
});
