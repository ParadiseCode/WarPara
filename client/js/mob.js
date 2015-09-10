
define(['character', 'behavior/behaviorFactory'], function(Character) {

    var Mob = Character.extend({
        init: function(id, kind, data) {
            this._super(id, kind);

            this.isAggressive = true;
            this.loadData(kind, data);
        },
        loadData: function(kind, data) {
            var DATA_ID = {TARGET: 9, BEHAVIOR_FROM_SERVER: 10};
            var mobData = MobList.getMobById(kind);

            this.attackRange = mobData.attackRange || 1;
            // speed on tile map
			this.roamSpeed   = mobData.roamSpeed;
            this.walkMoveSped   = this.moveSpeed = mobData.moveSpeed;
            this.agroMoveSpeed  = mobData.agroMoveSpeed || this.walkMoveSped;
			// see the followers of a mob
			//this.followers  = mobData.followers;
            this.isLarge = mobData.isLarge || false;
            // use in animation
            this.walkSpeed = this.easyMoveAnimSpeed = mobData.walkSpeed; // walkSpeed - bad property name, this is animation speed
            this.atkSpeed  = mobData.atkSpeed;
            this.idleSpeed = mobData.idleSpeed;
            this.aggroRunAnimSpeed = mobData.aggroRunAnimSpeed || this.easyMoveAnimSpeed;
            this.setAttackRate(mobData.attackRate);

            this.shadowOffsetY = mobData.shadowOffsetY;

            this.isAggressive = mobData.isAggressive;
            this.aggroRange = mobData.aggroRange || 1;

			this.isHasProjectile = MobList.getProjectileData(this.kind) !== undefined;

            this.setMaxHitPoints(mobData.hp);
            this.level = mobData.level;
            //
            //if (mobData.behavior)
            //    BehaviorFactory.AttachBehavior(mobData.behavior, this);

            this.pid = data[8];
            this.setOrientation(data[8]);

            if(data[DATA_ID.TARGET] != undefined && data[DATA_ID.TARGET])
                this.target = data[DATA_ID.TARGET];

            var behaviorName = 'undefined';
            var serverBehavior = data[DATA_ID.BEHAVIOR_FROM_SERVER];
            if (serverBehavior != undefined) {
                for (key in serverBehavior)
                    behaviorName = key;
                this.behaviorData = serverBehavior[behaviorName];
            }
            else
                behaviorName = mobData.behavior;

            if (behaviorName != 'undefined')
                BehaviorFactory.AttachBehavior(behaviorName, this);
        },
        getSpriteName: function() {
            return MobList.getSpriteName(this.kind);
        },

        engage: function(character) {
            this.attackingMode = true;
            this.setTarget(character);

            if (this.isMeleeRange())
                this.follow(character);
        },

        canReachTarget: function() {
            if (!this.hasTarget() || this.getState() === this.STATES.RUN_AWAY)
                return false;

            if (this.isMeleeRange())
                return this.isAdjacentNonDiagonal(this.target);

            return this.getDistanceToEntity(this.target) <= this.getAttackRange();
        },

        isMeleeRange: function() {
            return this.getAttackRange() === 1;
        },


        isTargetOnMeleeRange: function() {
            return this.hasTarget() && this.getDistanceToEntity(this.target) < 2;
        },

        getAttackRange: function() {
            return this.attackRange;
        },

        onAttackEvent: function(client) {
            if (this.isHasProjectile)
                client.sendMessage([Types.Messages.REQUEST_MOB_PROJECTILE, this.id, this.target.id]);
        },

        setState: function(state) {
            if (state !== this.getState())
                this.state = state;

            if (this.state !== this.STATES.IDLE) {
                this.moveSpeed = this.agroMoveSpeed;
                this.walkSpeed = this.aggroRunAnimSpeed;
            }
            else {
                this.moveSpeed = this.walkMoveSped;
                this.walkSpeed = this.easyMoveAnimSpeed;
            }
        }
    });

    return Mob;
});
