var _ = require('underscore');
var Area = require('./area');
var Types = require('../../shared/js/gametypes');
var MobList = require('../../shared/js/mobManager');
//var MobFactory = require('./mobFactory');
var Utils = require('./utils');

var MobArea = Area.extend({
    init: function (id, nb, kind, x, y, width, height, world, members) {
        this._super(id, x, y, width, height, world);
        this.nb = nb;
        this.members = members;
        this.kind = kind;
        this.respawns = [];
        this.setNumberOfEntities(this.nb);

        // Enable random roaming for monsters
        // (comment this out to disable roaming)
        this.initRoaming();
    },

    spawnMobs: function () {
        var role = _.size(this.members) > 0 ? 'leader' : null;

        for (var i = 0; i < this.nb; i++) {
            var kind = MobList.getMobIdByName(this.kind);
            var leader = this._createMobInsideArea(role, kind);
            this.addToArea(leader);

            if (role == 'leader')
            for (var index = 0; index < this.members.length; index++) {
                var memberName = this.members[index];
                kind = MobList.getMobIdByName(memberName);
                var member = this._createMobInsideArea('follower', kind);
                this.addToArea(member);
                leader.addMember(member);
                member.attachLeader(leader);
                member.roamSpeed = 0; // disable roaming
            }
        }
    },

    _createMobInsideArea: function (role, kind) {

        var pos = this._getRandomPositionInsideArea();

        if (!pos)
            return null;
        if (role == null || role == undefined)
            role = MobList.getMobType(kind);

        var mobId = '1' + this.id + '' + kind + '' + this.entities.length;
        var mob = MobFactory.createMob(role, mobId, kind, pos.x, pos.y);

        mob.onMove(this.world.onMobMoveCallback.bind(this.world));
		
		// allow wizard to summon fireballs
		/*if(mob.kind == Types.Entities.WIZARD){
			this.initSummoning(mob);
		}*/
		
        return mob;
    },

    respawnMob: function (mob, delay) {
        var self = this;

        this.removeFromArea(mob);

        setTimeout(function () {
            var pos = self._getRandomPositionInsideArea();

            mob.x = pos.x;
            mob.y = pos.y;
            mob.isDead = false;
            self.addToArea(mob);
            self.world.addMob(mob);
        }, delay);
    },

    initRoaming: function (mob) {
        var self = this;

        setInterval(function () {
            _.each(self.entities, function (mob) {
				var canRoam = (Utils.random(mob.roamSpeed) === 1);
                var pos;

                if (canRoam) {
                    if (!mob.hasTarget() && !mob.isDead) {
                        pos = self._getRandomPositionInsideArea();
                        if (pos)
                            mob.move(pos.x, pos.y);
                    }
                }
            });
        }, 500);
    },
	
	initSummoning: function(mob){
		var self = this;
		
		setInterval(function () {
            _.each(self.entities, function (mob) {
                
				var minionCount = Object.keys(mob.minions).length;
				if(minionCount < 4){
					self.world.forEachPlayer(function (player){
						if(Utils.distanceTo(player.x, player.y, mob.x, mob.y) < 5){
							self.world.spawnMinion(mob, Types.Entities.FIREBALL);
						}
					});
				}
				
            });
        }, 500);
		
	},

    createReward: function () {
        var pos = this._getRandomPositionInsideArea();

        return { x: pos.x, y: pos.y, kind: Types.Entities.CHEST };
    },


    _getRandomPositionInsideArea: function () {
        var freeTiles = this.getFreeTiles();
        var randomFreeTile = Utils.random(freeTiles.length);

        if (randomFreeTile >= 0)
            return freeTiles[randomFreeTile];

        console.log("mobtype "+this.kind+" was block on spawn "+this.x+" / "+this.y);
        return null;
    },

    getFreeTiles: function () {
        var self = this;
        var X1Tile = this.width  + this.x;
        var Y1Tile = this.height + this.y;

        var result = [];

        var isBig = MobList.isLarge(MobList.getMobIdByName(self.kind));

        //if (isBig === true)
        //    var checkFunction = function(positionX, positionY) { return self.isFreeAround(positionX, positionY); };
        //else
        //    var checkFunction = function(positionX, positionY) {
        //        return self.world.isValidPosition(positionX, positionY) && !self.isMobAlreadySpawnHere(positionX, positionY);
        //    };

        for (var xTile = this.x; xTile < X1Tile; xTile++)
            for (var yTile = this.y; yTile < Y1Tile; yTile++) {
                if (this.isValidPosition(xTile, yTile)) {
                    var pos = {x: xTile, y: yTile};
                    result.push(pos);
                }
            }

        return result;
    },

    isFreeAround: function (xPos, yPos) {

        for (var xTile = xPos - 1; xTile <= xPos + 1; xTile++)
            for (var yTile = yPos - 1; yTile <= yPos + 1; yTile++) {
                if (!this.world.isValidPosition(xTile , yTile) || this.isMobAlreadySpawnHere(xTile, yTile)) {
                    return false;
                }
            }

        return true;
    },

    isMobAlreadySpawnHere: function(x, y) {
        for (mobIndex in this.world.mobs){
            var mob = this.world.mobs[mobIndex];
            if ((mob.x == x && mob.y == y))
                return true;
        }
        return false;
    },

    isValidPosition: function (positionX, positionY) {
        var isBig = MobList.isLarge(MobList.getMobIdByName(this.kind));

        if (isBig === true)
            return this.isFreeAround(positionX, positionY);

        return this.world.isValidPosition(positionX, positionY) && !this.isMobAlreadySpawnHere(positionX, positionY);
    }
});

MobArea.createMobArea = function(id, nb, kind, x, y, width, height, world, polyline, members) {
    if (polyline === undefined)
        return new MobArea(id, nb, kind, x, y, width, height, world, members);

    var MobAreaPolyline = require('./mobareapolyline');
    return new MobAreaPolyline(id, nb, kind, x, y, world, polyline, members);
};

module.exports = MobArea;
