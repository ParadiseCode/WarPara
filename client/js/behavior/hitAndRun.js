define(['behavior/behaviorFactory'], function() {

    var HitAndRun = Class.extend({
        init: function(mob) {

            mob.runFromTarget = function () {
                if (!mob.isMoving()) {
                    var distance = Math.round(mob.getAttackRange() * 0.75);
                    var runningDirection = {x: (mob.gridX - mob.target.gridX) * distance,
                                            y: (mob.gridY - mob.target.gridY) * distance};

                    mob.moveTo_(mob.gridX + runningDirection.x, mob.gridY + runningDirection.y);
                }
            };

            mob.lookAtTarget = function (targetPosition) {
                if (mob.getState() !== mob.STATES.RUN_AWAY && this.isTargetOnMeleeRange()) {
                    mob.setState(mob.STATES.RUN_AWAY);
                    mob.runFromTarget();
                    return;
                }
                if (mob.getState() !== mob.STATES.RUN_AWAY) this._turnToTarget(targetPosition);
            };

        }

    });

    BehaviorFactory.registerFabricObject(
        'hitAndRun',
        function(mob){
            if (!mob.isMeleeRange())
                return new HitAndRun(mob);
            else
                throw console.error(mob.kind + 'is not melee mob, melee mob can`t hit and run.');
        }
    );
    return HitAndRun;
});
