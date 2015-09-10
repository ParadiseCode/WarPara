
    var MOB_INDEX = "7"; //  trying to reserve space to avoid conflict with gametypes.js
                         // temporary solution
                         // kind of third Mob is 73

    MobList = {Mobs:0};

    if(!(typeof exports === 'undefined')) {
        module.exports = MobList;
    }

    MobList.getMobIdByName = function (nameMob) {
        var isMob = nameMob.substr(0, 3) == "Mob";

        if(!isMob)
            return null;

        var mobIndex = parseInt(nameMob.substr(4));
        if(this.Mobs[nameMob])
            return MOB_INDEX + mobIndex;
    };

    MobList.getMobById = function (id) {
        if(id != null && id.length > 1){
            var mobId = parseInt(id.substring(1));
            if(mobId < 10)
                mobId = "0"+mobId;
            var MOB_TAG = "Mob_0";
            return this.Mobs[MOB_TAG+mobId];
        }
    };

    MobList.getMobName = function (id) {
        if (name = this.getMobById(id).name)
            return name;

        if(id.length > 1){
            var mobId = parseInt(id.substring(1));

            if(mobId < 10)
                mobId = "0"+mobId;

            var MOB_TAG = "Mob_0";
            return MOB_TAG+mobId;
        }
        return null;
    };

    MobList.getMobType = function(kind) {
        if (mob = MobList.getMobById(kind))
            return mob.entityType;
    },
	
	MobList.getMobAttackRate = function(kind) {
        if (mob = MobList.getMobById(kind))
            return mob.attackRate;
    },

    MobList.getArmorLevel = function(kind) {
        try {
                return MobList.getMobById(kind).armor;
        } catch(e) {
            log.error("No level found for armor: "+Object.keys(this)[kind]);
            log.error('Error stack: ' + e.stack);
        }
    };


    MobList.getWeaponLevel = function(kind) {
        try {
                return MobList.getMobById(kind).weapon;
        } catch(e) {
            log.error("No level found for weapon: "+Object.keys(this)[kind]);
            log.error('Error stack: ' + e.stack);
        }
    };

    MobList.getMobLevel = function(kind) {
        if(this.isMob(kind))
            return this.getMobById(kind).level;
    };
	
	MobList.getShieldLevel = function(kind) {
        if(this.isMob(kind))
            return this.getMobById(kind).shield;
    };
	
	MobList.getRecovery = function(kind) {
        if(this.isMob(kind))
            return this.getMobById(kind).recovery;
    };

    MobList.getMobExp = function(kind) {
        try {
            return this.getMobById(kind).experience;
        } catch(e) {
            log.error("No level found for experience: "+Object.keys(this)[kind]);
            log.error('Error stack: ' + e.stack);
        }
    };


    MobList.getRoamSpeed = function(kind) {
        try {
                return MobList.getMobById(kind).roamSpeed;
        } catch(e) {
            log.error("No roam speed found: "+Object.keys(this)[kind]);
        }
    };

    MobList.getHitPoints = function(kind) { //log.info("Mob: "+MobList.getMobById(kind)+" kind: "+kind);
        return MobList.getMobById(kind).hp;
    };

    MobList.getSpriteName = function(kind) { //log.info("Mob: "+MobList.getMobById(kind)+" kind: "+kind);
        return MobList.getMobById(kind).animation.id;
    };

    MobList.getAnimation = function(kind) { //log.info("Mob: "+MobList.getMobById(kind)+" kind: "+kind);
        return MobList.getMobById(kind).animation;
    };

    MobList.getProjectileData = function(kind) { //log.info("Mob: "+MobList.getMobById(kind)+" kind: "+kind);
        return MobList.getMobById(kind).projectile;
    };

    MobList.isMob = function(kind) { //log.info("Mob: "+MobList.getMobById(kind)+" kind: "+kind);
        return MobList.getMobById(kind) != undefined;
    };
	
	MobList.getMobFollowers = function(kind) {
        return MobList.getMobById(kind).followers;
    };

	MobList.getBehavior = function(kind) {
        if (behavior = MobList.getMobById(kind).behavior)
            return behavior;
        return null;
    };

    MobList.isLarge = function(kind) {
        var isLarge = MobList.getMobById(kind).isLarge;
        return isLarge != 'undefuned' ? isLarge : false;
    };

    MobList.loadMobs = function(mobsFromJSON) {
        if(!mobsFromJSON)
            log.info("Mobs are empty");

        var Mobs = JSON.parse(mobsFromJSON);

        for (mobId in Mobs) {
            Mobs[Mobs[mobId].animation.id] = Mobs[mobId];
            delete Mobs[mobId];
        }

        this.Mobs = Mobs;
    };

    MobList.getMobs = function() {
        return this.Mobs;
    };



