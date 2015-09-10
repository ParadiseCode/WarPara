define(['entity'], function(Entity) {

    var Lever = Entity.extend({
        init: function(id, kind) {
            this._super(id, Types.Entities.LEVER);
			this.itemConnect = 0;
			this.state = false;
			this.isSwitching = false;
        },

        getSpriteName: function() {
            return "lever";
        },

        isMoving: function() {
            return false;
        },
		
		setItemConnect: function(itemConnect){
			this.itemConnect = itemConnect;
		}
		
    });

    return Lever;
});