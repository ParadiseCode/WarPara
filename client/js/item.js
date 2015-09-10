
define(['entity'], function(Entity) {

    var Item = Entity.extend({
        init: function(id, kind, type) {
            this._super(id, kind);

            this.itemKind = Types.getKindAsString(kind);

            this.type = type;
            this.wasDropped = false;
        },

        hasShadow: function() {
            return true;
        },

        onLoot: function(player) {
            if(this.type === "weapon") {
                player.switchWeapon(this.itemKind);
            }
            else if(this.type === "armor") {
                player.armorloot_callback(this.itemKind);
            }
            else if(this.type === "ring") {
                player.swithRing(this.itemKind);
            }
            else if(this.type === "amulet") {
                player.swithAmulet(this.itemKind);
            }
            else if(this.type === "shield") {
                player.switchShield(this.itemKind);
            }
        },

        getSpriteName: function() {
            return "item-"+ this.itemKind;
        },

        getLootMessage: function() {
			if(typeof this.lootMessage != 'undefined'){
				return this.lootMessage;
			}else{
				return null;
			}
        }
    });

    return Item;
});
