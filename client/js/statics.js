define(['entity'], function(Entity) {
    var Statics = {
        Portal: Entity.extend({
            init: function(id) {
                this._super(id, Types.Entities.PORTAL);
            },
        }),
	};
	return Statics;
});