define(['behavior/behaviorFactory'], function() {

    var Peaceful = Class.extend({
        init: function(mob) {
            mob.isAggressive = false;

            mob.follow = function (entity) {
                return false;
            };

            mob.onTakeDamageEvent = function (damageDealer) {
                if (!mob.isMoving()) {
                    var DISTANCE = 4;
                    var runningDirection = {x: (mob.gridX - damageDealer.gridX) * DISTANCE,
                                            y: (mob.gridY - damageDealer.gridY) * DISTANCE};

                    mob.moveTo_(mob.gridX + runningDirection.x, mob.gridY + runningDirection.y);
                    mob.setState(mob.STATES.RUN_AWAY);
                }
            };

            mob.engage = function(character) {
                return false;
            };
        }

    });

    BehaviorFactory.registerFabricObject(
        'peaceful',
        function(mob) {
            return new Peaceful(mob);
        }
    );
    return Peaceful;
});
