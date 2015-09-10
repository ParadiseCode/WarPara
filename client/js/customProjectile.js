
define(['projectile'], function(Projectile) {

    var CustomProjectile = Projectile.extend({

        init: function(id, owner, target) {
            /** @constants */
                this.TILE_WIDTH = 16;

            var type = Types.Projectiles.MOB6ARROW;
            this._super(id, type);

            var sx  = owner.x  + this.TILE_WIDTH / 2,
            sy      = owner.y  + this.TILE_WIDTH / 2,
            targetX = target.x + this.TILE_WIDTH / 2,
            targetY = target.y + this.TILE_WIDTH / 2;

            this.setPosition(sx, sy);
            this.setTarget(targetX, targetY);
            this.owner = owner;
            this.targetEntityId = target.id;
        },

        /** @override
         *
         * @param game {Object}
         */
        impact: function(game){
            this.impactAnimCompleted();
            return null;
        },

        setSpeed: function(speed) {
            this.speed = speed;
        }
    });

    CustomProjectile.getProjectile = function(id, sprites, audio, owner, target) {
        /** @constants */
            this.DEFAULT_SPEED  = this.TILE_WIDTH * 30;
            this.DEFAULT_SPRITE = "projectile-mob6arrow";
            this.DEFAULT_SOUND  = "arrowshot";

        var data = MobList.getProjectileData(owner.kind);
        var resultProjectile = new CustomProjectile(id, owner, target);

        var dataValidate = function(paramName) {
            return data !== undefined && typeof data == 'object' && paramName in data;
        };
        var spriteName = dataValidate('spriteName') ? data.spriteName : this.DEFAULT_SPRITE;
        var sprite = sprites[spriteName];
        var speed = dataValidate('speed') ? data.speed : this.DEFAULT_SPEED;
        var sound = dataValidate('shootSound') ? data.shootSound : this.DEFAULT_SOUND;

        resultProjectile.setSpeed(speed);
        resultProjectile.setSprite(sprite);
        resultProjectile.setAnimation("travel", 60, 0, null);
        audio.playSound(sound);


        return resultProjectile;
    };

    return CustomProjectile;
});

