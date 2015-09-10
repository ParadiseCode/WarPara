define(['behavior/behaviorFactory'], function() {

    var Neutral = Class.extend({
        init: function(mob) {
            mob.isAggressive = false;
        }

    });

    BehaviorFactory.registerFabricObject (
        'neutral',
        function(mob){
            return new Neutral(mob);
        }
    );
    return Neutral;
});
