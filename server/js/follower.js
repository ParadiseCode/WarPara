
var MobFactory = require('./mobFactory');
var Mob = require('./mob');

var Follower = Mob.extend({
    init: function (id, kind, x, y) {
        this._super(id, kind, x, y);
        this.leader = null;
    },

    attachLeader: function(leader) {
        this.leader = leader;
    },

    getLeader: function() {
        return this.leader;
    },

    getState: function () {
        var basestate = this._getBaseState(),
            state = [];

        state.push(this.orientation);
        state.push(this.target);
        state.push({follower: this.leader.id});
        return basestate.concat(state);
    }
});

MobFactory.registerFabricObject(
    'follower',
    function(id, kind, x, y){
        return new Follower(id, kind, x, y);
    }
);

module.exports = Follower;

