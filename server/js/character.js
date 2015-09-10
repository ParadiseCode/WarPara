var Entity = require('./entity');
var Messages = require('./message');
var Utils = require('./utils');

var Character = Entity.extend({
    init: function (id, type, kind, x, y) {
        this._super(id, type, kind, x, y);

        this.orientation = Utils.randomOrientation();
        this.attackers = {};
        this.buffs = {};        
        this.target = null;
		this.rangedTarget = null;
    },

    getState: function () {
        var basestate = this._getBaseState(),
            state = [];

        state.push(this.orientation);
        if (this.target) {
            state.push(this.target);
        }
        return basestate.concat(state);
    },

    resetHitPoints: function (maxHitPoints) {
        this.maxHitPoints = maxHitPoints;
        this.hitPoints = this.maxHitPoints;
    },
    
    resetManaPoints: function (maxManaPoints) {
        this.maxManaPoints = maxManaPoints;
        this.manaPoints = this.maxManaPoints;
    },    

    regenHealthBy: function (value) {
        var hp = this.hitPoints,
            max = this.maxHitPoints;

        if (hp < max) {
            if (hp + value <= max) {
                this.hitPoints += value;
            }
            else {
                this.hitPoints = max;
            }
        }
    },
    
    regenManaBy: function (value) {
        var mp = this.manaPoints,
            max = this.maxManaPoints;

        if (mp < max) {
            if (mp + value <= max) {
                this.manaPoints += value;
            }
            else {
                this.manaPoints = max;
            }
        }
    },    

    hasFullHealth: function () {
        return this.hitPoints === this.maxHitPoints;
    },
    
    hasFullMana: function () {
        return this.manaPoints === this.maxManaPoints;
    },    

    setTarget: function (entity) {
        this.target = entity.id;
    },

    clearTarget: function () {
        this.target = null;
		this.rangedTarget = null;
    },

    hasTarget: function () {
        return this.target !== null;
    },

    attack: function () {
        return new Messages.Attack(this.id, this.target);
    },

    health: function () {
        return new Messages.Health(this.hitPoints, false);
    },
    
    mana: function () {
        return new Messages.Mana(this.manaPoints, false);
    },    

    regen: function () {
        return new Messages.Health(this.hitPoints, true);
    },
    
    manaregen: function () {
        return new Messages.Mana(this.manaPoints, true);
    },

    addAttacker: function (entity) {
        if (entity) {
            this.attackers[entity.id] = entity;
        }
    },

    removeAttacker: function (entity) {
        if (entity && entity.id in this.attackers) {
            delete this.attackers[entity.id];
            log.debug(this.id + ' REMOVED ATTACKER ' + entity.id);
        }
    },

    forEachAttacker: function (callback) {
        for (var id = 0; id < this.attackers.length; id++) {
            callback(this.attackers[id]);
        }
    },
    
    // check if character has active buff
    hasBuff: function(buff) {
        
        if (this.buffs[buff]) {
            if (this.buffs[buff].active) {
                return true;
            }
        }
        
        return false;
    },
    
    setBuff: function(buff,duration,server,owner) {
        log.info('setBuff:'+buff+' '+duration+ ' '+owner);
        var self = this;
        self.clearBuff(buff,null);
        self.buffs[buff].active = true;
        self.buffs[buff].duration = duration;
        self.buffs[buff].owner = owner;
        if (duration > 0) {
            self.buffs[buff].timeout = setTimeout(function() {
                self.clearBuff(buff,server);
            }, duration * 1000);
        }
        if (server) {
			var msg = new Messages.Generic(Types.Messages.BUFF_ENABLE,[self.id,buff]);
			var groupId = server.map.getGroupIdFromPosition(self.x, self.y)
			server.pushToGroup(groupId, msg);
			log.info('BUFF_ENABLE '+buff+','+self.id);
        }
        log.info('BUFF_ENABLE');
    },
    
    clearBuff: function(buff,server) {
        var self = this;
        log.info('clearBuff:'+buff+" id:"+self.kind);
        if (this.buffs[buff] != null) {
            if (this.buffs[buff].timeout != null) {
                clearTimeout(this.buffs[buff].timeout);
            }
        }
		if (server) {
			var msg = new Messages.Generic(Types.Messages.BUFF_DISABLE,[self.id,buff]);
			var groupId = server.map.getGroupIdFromPosition(self.x, self.y)
			server.pushToGroup(groupId, msg);
			log.info('BUFF_DISABLE '+buff+','+self.id);
		}
        this.buffs[buff] = {};
        this.buffs[buff].active = false;
        this.buffs[buff].duration = 0;        
    },
    
    isBuffActive: function(buff) {
        if (this.buffs[buff]) {
            return (this.buffs[buff].active === true);
        }
    },
    
    applyDamage: function(dmg) {
        
        if (this.isBuffActive(Types.Buffs.SHIELDED)) {
			// half dammage
			dmg = Math.round(dmg/2);
        }
        
        this.hitPoints -= dmg;
        if (this.hitPoints < 0) this.hitPoints = 0;
    }
    
});

module.exports = Character;

