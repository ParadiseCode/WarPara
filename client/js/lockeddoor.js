define(['entity'], function(Entity) {

    var LockedDoor = Entity.extend({
        init: function(id, kind) {
            this._super(id, Types.Entities.LOCKEDDOOR);
			this.itemConnect = 0;
        },

        getSpriteName: function() {
            return "lockeddoor";
        },

        isMoving: function() {
            return false;
        },
		
		setItemConnect: function(itemConnect){
			this.itemConnect = itemConnect;
		},
		
		setDirection: function(orientation){
			var self = this;
			if(orientation == 'd'){
				self.flipSpriteY = true;
			}
			if(orientation == 'r' || orientation == 'l'){
				if(orientation == 'l'){
					self.flipSpriteX = true;
				}
				self.setAnimation("idle_right", 150);
			}
			
		}
		
    });

    return LockedDoor;
});