
define(['../keylist'], function(Keys) {

    var KeyList = Class.extend({
        init: function() {
            var self = this;
            this.lootedKeys = [];

            this.KEY_SLOT = {
                OPEN: "open",
                LOCKED: "locked"
            };

            Keys.forEach(function(item, index) {
                $('#key_list').append('<div id="key_' + (index+1) + '" class="key_body"><div id="status" class="locked"><img src="../img/3/item-key.png"></div><div class="key"></div></div><div style="clear: both"></div>');
                $('#key_' + (index+1) + '.key_body .key').text(item[0]['name']);
            });
            this.updateCounter();
        },

        unlockKeySlot: function(id) {
            var $key = $('#key_'+id+'.key_body #status');
            $key.removeClass(this.KEY_SLOT.LOCKED);
            $key.addClass(this.KEY_SLOT.OPEN);
            this.updateCounter();
        },

        updateCounter: function() {
            var unlockedKeyCount = $('#key_list #status.open').length;
            var KeyCount         = Keys.length;
            $('#key_counter').text(unlockedKeyCount+"/"+KeyCount);
        },

        updateKeylist: function(keysFromInventory) {
            var self = this;
            this.lootedKeys = keysFromInventory;
            keysFromInventory.forEach(function(item, index) {
                var $keyCell = $('#key_'+item+'.key_body #status');

                if ($keyCell.hasClass(self.KEY_SLOT.LOCKED)) {
                    $keyCell.removeClass(self.KEY_SLOT.LOCKED);
                    $keyCell.addClass(self.KEY_SLOT.OPEN);
                }
                self.updateCounter();
            });
        },

        hasKey: function(key){
            return this.lootedKeys.indexOf(key) >= 0;
        }
    });

    return KeyList;
});
