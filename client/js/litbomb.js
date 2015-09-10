
define(['entity'], function(Entity) {

    var LitBomb = Entity.extend({
        init: function(id, kind) {
            this._super(id, Types.Entities.LITBOMB);
            this.owner = null;
            this.initTime = 0;
            this.hideTimer = false;
        },

        getSpriteName: function() {
            return "litbomb";
        },

        isMoving: function() {
            return false;
        },
        
        // define an explode event
        explode: function() {
        	this.hideTimer = true;
        	if(this.explode_callback) {
                this.explode_callback();
            }
        },

        onExplode: function(callback) {
            this.explode_callback = callback;
        }
        
    });

    return LitBomb;
});
