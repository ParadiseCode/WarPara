define(['behavior/behaviorFactory'], function() {

    var Follower = Class.extend({
        init: function(mob, game) {
            mob.leader = null;

            mob.engage = function(character) {
                this.attackingMode = true;
                this.setTarget(character);

                if (this.isMeleeRange())
                    this.follow(character);

                if (!mob.getLeader().hasTarget())
                    game.player.aggro(mob.getLeader());
            };

            mob.getLeader = function() {
                if (mob.leader == null)
                    mob.leader = game.getEntityById(mob.behaviorData);
                return mob.leader;
            };

            //mob.die = function() {
            //    this.removeTarget();
            //    this.isDead = true;
            //
            //    if(this.death_callback) {
            //        this.death_callback();
            //    }
            //};
        }
    });

    BehaviorFactory.registerFabricObject (
        'follower',
        function(mob){
            return new Follower(mob, BehaviorFactory.getGameInstance());
        }
    );
    return Follower;
});
