define(['behavior/behaviorFactory'], function() {

    var Leader = Class.extend({
        init: function(mob, game) {

            mob.members = [];

            mob.engage = function(character) {
                this.attackingMode = true;
                this.setTarget(character);

                if (this.isMeleeRange())
                    this.follow(character);

                _.each(mob.getMembers(), function(member) {
                    if (!member.hasTarget())
                        game.player.aggro(member);
                });
            };

            mob.go = function(x, y) {
                this.moveTo_(x, y);

                _.each(this.getMembers(), function(member) {
                    x += game.getRandomInt(-1, 1);
                    y += game.getRandomInt(-1, 1);
                    member.go(x, y);
                });
            };

            mob.getMembers = function() {
                if (_.size(mob.members) === 0) {
                    _.each(mob.behaviorData, function (memberId) {
                        mob.members.push(game.getEntityById(memberId));
                    });
                }

                return mob.members;
            }
        }

    });

    BehaviorFactory.registerFabricObject (
        'leader',
        function(mob){
            return new Leader(mob, BehaviorFactory.getGameInstance());
        }
    );
    return Leader;
});
