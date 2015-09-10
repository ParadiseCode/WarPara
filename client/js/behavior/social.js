define(['behavior/behaviorFactory'], function() {

    var Social = Class.extend({
        init: function(mob, game) {
            mob.onTakeDamageEvent = function (damageDealer) {
                var AGRO_DISTANCE = 4;

                game.forEachMob(function(mobInArea) {
                    if (mob.kind == mobInArea.kind && !mobInArea.hasTarget() && mob.getDistanceToEntity(mobInArea) <= AGRO_DISTANCE)
                        game.player.aggro(mobInArea);
                });
            };
        }
    });

    BehaviorFactory.registerFabricObject (
        'social',
        function(mob){
            return new Social(mob, BehaviorFactory.getGameInstance());
        }
    );
    return Social;
});
