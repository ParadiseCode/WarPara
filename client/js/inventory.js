
define(function() {

    var Inventory = Class.extend({
        init: function() {
            this.data = null;
        },

        load: function(inventory) {
            this.data = inventory;
        },

        getData: function() {
            return this.data;
        },

        getPotions: function() {
            if(this.getData())
                return this.data.potions;

            return null;
        },

        getKeys: function() {
            if(this.getData())
                return this.data.keys;

            return null;
        },

        getItems: function() {
            if(this.getData())
                return this.data.items;

            return null;
        },

        isItemExist: function(itemKind) {
            var items = this.getItems();

            for (var index = 0; index < items.length, item = items[index]; index++) {
                if (item[0] == itemKind)
                    return true;
            }
            return false;
        },

        hasKey: function(key){
            return this.getKeys().indexOf(parseInt(key)) >= 0;
        }
    });

    return Inventory;
});
