
var MobFactory = require('./mobFactory');
var Mob = require('./mob');

var Leader = Mob.extend({
    init: function (id, kind, x, y) {
        this._super(id, kind, x, y);
        this.members = [];
    },

    addMember: function(member) {
        this.members.push(member);
    },

    getMembers: function() {
        return this.members;
    },

    getState: function () {
        var basestate = this._getBaseState(),
            state = [];

        state.push(this.orientation);
        state.push(this.target);

        var members = [];
        for (var i in this.members)
            members.push(this.members[i].id);

        state.push({leader: members});
        return basestate.concat(state);
    }
});

MobFactory.registerFabricObject(
    'leader',
    function(id, kind, x, y){
        return new Leader(id, kind, x, y);
    }
);

module.exports = Leader;

