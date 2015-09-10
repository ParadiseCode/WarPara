var _ = require('underscore');
var Character = require('./character');
var ChestArea = require('./chestarea');
var Messages = require('./message');
var MobArea = require('./mobarea');
//var Properties = require('./properties');
var MobList = require('../../shared/js/mobManager');
var MobFactory = require('./mobFactory');
var Utils = require('./utils');

var Mob = Character.extend({
    init: function (id, kind, x, y) {
        this._super(id, 'mob', kind, x, y);
        this.updateHitPoints();
        this.spawningX = x;
        this.spawningY = y;
        this.armorLevel = MobList.getArmorLevel(this.kind);
        this.weaponLevel = MobList.getWeaponLevel(this.kind);
		this.Level = MobList.getMobLevel(this.kind);
		this.Shield = MobList.getShieldLevel(this.kind);
		this.Recovery = MobList.getRecovery(this.kind);
		this.roamSpeed = MobList.getRoamSpeed(this.kind) || 10;
		this.isLarge = MobList.isLarge(this.kind);
		this.attackRate = MobList.getMobAttackRate(this.kind);
        this.hatelist = [];
        this.respawnTimeout = null;
        this.returnTimeout = null;
        this.isDead = false;
        this.hateCount = 0;
        this.tankerlist = [];
		this.attackerList = {}; // used to count number of drops needed
		this.minions = {};
		this.minionCount = 0;
		this.followers = MobList.getMobFollowers(this.kind);
    },

    destroy: function () {
		// remove link from summoners link to minions
		if (typeof this.summoner != 'undefined'){
			delete this.summoner.minions[this.id];
		}
		this.minionCount = 0;
		this.minions = {};
        this.isDead = true;
        this.hatelist = [];
        this.tankerlist = [];
        this.clearTarget();
        this.updateHitPoints();
        this.resetPosition();
		this.attackerList = [];
        this.handleRespawn();
    },
	
	addAttackerList: function(id){
		if(id){
			this.attackerList[id] = 1;
		}
	},

    hates: function (playerId) {
        return _.any(this.hatelist, function(obj) {
            return obj.id === playerId;
        });
    },

    increaseHateFor: function (playerId, points) {
        if (this.hates(playerId)) {
            _.detect(this.hatelist, function (obj) {
                return obj.id === playerId;
            }).hate += points;
        }
        else {
            this.hatelist.push({ id: playerId, hate: points });
        }

        /*
        log.debug("Hatelist : "+this.id);
        _.each(this.hatelist, function(obj) {
            log.debug(obj.id + " -> " + obj.hate);
        });*/

        if (this.returnTimeout) {
            // Prevent the mob from returning to its spawning position
            // since it has aggroed a new player
            clearTimeout(this.returnTimeout);
            this.returnTimeout = null;
        }
    },
    addTanker: function(playerId){
      var i=0;
      for(i=0; i<this.tankerlist.length; i++){
        if(this.tankerlist[i].id === playerId){
          this.tankerlist[i].points++;
          break;
        }
      }
      if(i >= this.tankerlist.length){
        this.tankerlist.push({id: playerId, points: 1});
      }
    },
    getMainTankerId: function(){
      var i=0;
      var mainTanker = null;
      for(i=0; i<this.tankerlist.length; i++){
        if(mainTanker === null){
          mainTanker = this.tankerlist[i];
          continue;
        }
        if(mainTanker.points < this.tankerlist[i].points){
          mainTanker = this.tankerlist[i];
        }
      }

      if(mainTanker){
        return mainTanker.id;
      } else{
        return null;
      }
    },
    
    getHatedPlayerId: function(hateRank) {
        var i, playerId,
            sorted = _.sortBy(this.hatelist, function(obj) { return obj.hate; }),
            size = _.size(this.hatelist);
        
        if(hateRank && hateRank <= size) {
            i = size - hateRank;
        }
        else {
            if(size === 1){
              i = size - 1;
            } else{
              this.hateCount++;
              if(this.hateCount > size*1.3){
                this.hateCount = 0;
                i = size - 1 - Utils.random(size-1);
                log.info("CHANGE TARGET: " + i);
              } else{
                return 0;
              }
            }
        }
        if(sorted && sorted[i]) {
            playerId = sorted[i].id;
        }
        
        return playerId;
    },
    
    forgetPlayer: function(playerId, duration) {
        this.hatelist = _.reject(this.hatelist, function(obj) { return obj.id === playerId; });
        this.tankerlist = _.reject(this.tankerlist, function(obj) { return obj.id === playerId; });

        if (this.hatelist.length === 0) {
            this.returnToSpawningPosition(duration);
        }
    },

    forgetEveryone: function () {
        this.hatelist = [];
        this.tankerlist = [];
		this.clearTarget();
        this.returnToSpawningPosition(1);
    },

    drop: function (item) {
        if (item) {
            return new Messages.Drop(this, item);
        }
    },

    handleRespawn: function () {
        var delay = 45000;
        var self = this;

        if (this.area && this.area instanceof MobArea) {
            // Respawn inside the area if part of a MobArea
            this.area.respawnMob(this, delay);
        }
        else {
            if (this.area && this.area instanceof ChestArea) {
                this.area.removeFromArea(this);
            }

            setTimeout(function () {
                if (self.respawnCallback) {
                    self.respawnCallback();
                }
            }, delay);
        }
    },

    onRespawn: function (callback) {
        this.respawnCallback = callback;
    },

    resetPosition: function () {
        this.setPosition(this.spawningX, this.spawningY);
    },

    returnToSpawningPosition: function (waitDuration) {
        var self = this;
        var delay = waitDuration || 1000;

        this.clearTarget();

        this.returnTimeout = setTimeout(function () {
            self.resetPosition();
            self.move(self.x, self.y);
        }, delay);
    },

    onMove: function (callback) {
        this.moveCallback = callback;
    },

    move: function (x, y) {
        this.setPosition(x, y);
        if (this.moveCallback) {
            this.moveCallback(this);
        }
    },

    updateHitPoints: function () {
        //log.info("upd: "+this.kind);
        this.resetHitPoints(MobList.getHitPoints(this.kind));
    },

    distanceToSpawningPoint: function (x, y) {
        return Utils.distanceTo(x, y, this.spawningX, this.spawningY);
    }
});

MobFactory.registerFabricObject(
    'mob',
    function(id, kind, x, y){
        return new Mob(id, kind, x, y);
    }
);

module.exports = Mob;
