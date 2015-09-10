define(['entity'], function(Entity) {
	
	var Trap = Entity.extend({
        init: function(id, kind) {
            this._super(id, Types.Entities.TRAP);
			this.type = "explosion";
			this.damage = 10;
        },

        getSpriteName: function() {
            return "trap";
        },

        isMoving: function() {
            return false;
        },

        activate: function() {
            if(this.activate_callback) {
                this.activate_callback();
            }
        },

        onActivate: function(callback) {
        	this.activate_callback = callback;
        }
	});
	
	return Trap;
});