var cls = require('./lib/class');

var EventManager = cls.Class.extend({
    onMobDeath: function(mob, unlockCallback) {
        var mobName = MobList.getMobName(mob.kind);

        var WP = {
            MOB_TO_UNLOCK: 4
        };

        var result = [];
        Types.waypoints.forEach(function(item, index) {
            if(item[WP.MOB_TO_UNLOCK] == mobName)
                result.push(index);
        });

        if(unlockCallback)
            unlockCallback(result);
    }
});

module.exports = EventManager;
