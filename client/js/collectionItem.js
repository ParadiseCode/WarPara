
define(['entity'], function(Entity) {

    var CollectionItem = Entity.extend({
        init: function(id, kind, type) {
            this._super(id, kind);

            this.itemKind = kind;

            this.type = Types.ITEM_TYPE.COLLECTION_ITEM;
            this.wasDropped = false;
            this.lootMessage = "You pickup a part of collection!";
        },

        hasShadow: function() {
            return true;
        },

        onLoot: function(player) {

        },

        getSpriteName: function() {
            return this.itemKind;
        },

        getLootMessage: function() {
			if(typeof this.lootMessage != 'undefined'){
				return this.lootMessage;
			}else{
				return null;
			}
        }
    });

    return CollectionItem;
});
