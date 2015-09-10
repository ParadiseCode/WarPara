var _ = require('underscore');
var cls = require('./lib/class');
var Types = require('../../shared/js/gametypes');

var Messages = {};
module.exports = Messages;

var Message = cls.Class.extend({
});



Messages.Spawn = Message.extend({
    init: function (entity) {
        this.entity = entity;
    },
    serialize: function () {
        var spawn = [Types.Messages.SPAWN];
        return spawn.concat(this.entity.getState());
    }
});

Messages.Despawn = Message.extend({
    init: function (entityId) {
        this.entityId = entityId;
    },
    serialize: function () {
        return [Types.Messages.DESPAWN, this.entityId];
    }
});

Messages.UpdateWaypoints = Message.extend({
    init: function (id) {
        this.openWpId = id;
    },
    serialize: function () {
        return [Types.Messages.WAYPOINTS_UPDATE, this.openWpId];
    }
});

Messages.SwitchChange = Message.extend({
    init: function (entityId, state, itemConnect) {
        this.entityId = entityId;
		this.state = state;
		this.itemConnect = itemConnect;
    },
    serialize: function () {
        return [Types.Messages.SWITCHCHANGE, this.entityId, this.state, this.itemConnect];
    }
});

Messages.Move = Message.extend({
    init: function (entity) {
        this.entity = entity;
    },
    serialize: function () {
        return [Types.Messages.MOVE,
                this.entity.id,
                this.entity.x,
                this.entity.y];
    }
});

Messages.Project = Message.extend({
    init: function (id,projectile,sx,sy,x,y,owner) {
        this._id = id;
        this._projectile = projectile;
        this._sx = sx;
        this._sy = sy;
        this._x = x;
        this._y = y;
        this._owner = owner;
        
    },
    serialize: function () {
        return [Types.Messages.PROJECT,
                this._id,
                this._projectile,
                this._sx,
                this._sy,
                this._x,
                this._y,
                this._owner];
    }
});

Messages.LootMove = Message.extend({
    init: function (entity, item) {
        this.entity = entity;
        this.item = item;
    },
    serialize: function() {
        return [Types.Messages.LOOTMOVE,
                this.entity.id,
                this.item.id];
    }
});

Messages.SendLeader = Message.extend({
    init: function (name1, score1, name2, score2, name3, score3) {
        this.name1 = name1;
		this.score1 = score1;
		this.name2 = name2;
		this.score2 = score2;
		this.name3 = name3;
		this.score3 = score3;
    },
    serialize: function() {
        return [Types.Messages.PVPLEADER,
                this.name1, this.score1,
				this.name2, this.score2,
				this.name3, this.score3];
    }
});

Messages.Attack = Message.extend({
    init: function (attackerId, targetId) {
        this.attackerId = attackerId;
        this.targetId = targetId;
    },
    serialize: function () {
        return [Types.Messages.ATTACK,
                this.attackerId,
                this.targetId];
    }
});

Messages.Health = Message.extend({
    init: function (points, isRegen) {
        this.points = points;
        this.isRegen = isRegen;
    },
    serialize: function() {
        var health = [Types.Messages.HEALTH,
                      this.points];

        if (this.isRegen) {
            health.push(1);
        }
        return health;
    }
});

Messages.Mana = Message.extend({
    init: function (points, isRegen) {
        this.points = points;
        this.isRegen = isRegen;
    },
    serialize: function() {
        var mana = [Types.Messages.MANA, this.points];
        if (this.isRegen) {
            mana.push(1);
        }
        return mana;
    }
});

Messages.HitPoints = Message.extend({
    init: function (maxHitPoints) {
        this.maxHitPoints = maxHitPoints;
    },
    serialize: function () {
        return [Types.Messages.HP,
                this.maxHitPoints];
    }
});

Messages.ManaPoints = Message.extend({
    init: function (maxManaPoints) {
        this.maxManaPoints = maxManaPoints;
    },
    serialize: function () {
        return [Types.Messages.MP, this.maxManaPoints];
    }
});

Messages.Exp = Message.extend({
    init: function (level, exp) {
		this.level = level;
        this.exp = exp;
    },
    serialize: function () {
        return [Types.Messages.EXP, this.level, this.exp];
    }
});

Messages.EquipItem = Message.extend({
    init: function (player, itemKind) {
        this.playerId = player.id;
        this.itemKind = itemKind;
    },
    serialize: function () {
        return [Types.Messages.EQUIP,
                this.playerId,
                this.itemKind];
    }
});

Messages.Drop = Message.extend({
    init: function (mob, item) {
        this.mob = mob;
        this.item = item;
    },
    serialize: function() {
        var drop = [Types.Messages.DROP,
                    this.mob.id,
                    this.item.id,
                    this.item.kind,
                    _.pluck(this.mob.hatelist, 'id')];

        return drop;
    }
});

Messages.Debug_msg = Message.extend({ // only for user without console
    init: function (message) {
        this.message = message;
    },
    serialize: function () {
        return [Types.Messages.CHAT, this.message];
    }
});

Messages.Chat = Message.extend({
    init: function (player, message) {
        this.playerId = player.id;
        this.message = message;
    },
    serialize: function () {
        return [Types.Messages.CHAT,
                this.playerId,
                this.message];
    }
});

Messages.PrivateMessage = Message.extend({
    init: function (player, message, from) {
        this.playerId = player.id;
        this.message = message;
		this.from = from;
    },
    serialize: function () {
        return [Types.Messages.PRIVATEMESSAGE,
                this.playerId,
                this.message,
				this.from];
    }
});

Messages.AdminMessage = Message.extend({
    init: function (message) {
        this.message = message;
    },
    serialize: function () {
        return [Types.Messages.ADMINMSG, this.message];
    }
});

Messages.Teleport = Message.extend({
    init: function (entity) {
        this.entity = entity;
    },
    serialize: function () {
        return [Types.Messages.TELEPORT,
                this.entity.id,
                this.entity.x,
                this.entity.y];
    }
});

Messages.Damage = Message.extend({
    init: function (entity, points, hp, maxHp) {
        this.entity = entity;
        this.points = points;
        this.hp = hp;
        this.maxHitPoints = maxHp;
    },
    serialize: function () {
        return [Types.Messages.DAMAGE,
                this.entity.id,
                this.points,
                this.hp,
                this.maxHitPoints];
    }
});

Messages.Population = Message.extend({
    init: function (world, total) {
        this.world = world;
        this.total = total;
    },
    serialize: function () {
        return [Types.Messages.POPULATION,
                this.world,
                this.total];
    }
});

Messages.Kill = Message.extend({
    init: function (mob, level, exp) {
        this.mob = mob;
        this.level = level;
        this.exp = exp;
    },
    serialize: function () {
        return [Types.Messages.KILL,
                this.mob.kind,
                this.level,
                this.exp];
    }
});

Messages.List = Message.extend({
    init: function (ids) {
        this.ids = ids;
    },
    serialize: function () {
        var list = this.ids;
        log.info("mess: " + this.ids);
        list.unshift(Types.Messages.LIST);
        return list;
    }
});

Messages.Destroy = Message.extend({
    init: function (entity) {
        this.entity = entity;
    },
    serialize: function () {
        return [Types.Messages.DESTROY,
                this.entity.id];
    }
});

Messages.Blink = Message.extend({
    init: function (item) {
        this.item = item;
    },
    serialize: function () {
        return [Types.Messages.BLINK,
                this.item.id];
    }
});

Messages.GuildError = Message.extend({
	init: function (errorType, guildName) {
		this.guildName = guildName;
		this.errorType = errorType;
	},
	serialize: function () {
		return [Types.Messages.GUILDERROR, this.errorType, this.guildName];
	}
});

Messages.Guild = Message.extend({
	init: function (action, info) {
		this.action = action;
		this.info = info;
	},
	serialize: function () {
		return [Types.Messages.GUILD, this.action].concat(this.info);
	}
});

Messages.PVP = Message.extend({
    init: function(isPVP){
        this.isPVP = isPVP;
    },
    serialize: function(){
        return [Types.Messages.PVP,
                this.isPVP];
    }
});

Messages.Generic = Message.extend({
    init: function (msgtype,data) {
        this.msgtype = msgtype;
        this.data = data;
    },
    serialize: function () {
        return [this.msgtype].concat(this.data);
    }
});

