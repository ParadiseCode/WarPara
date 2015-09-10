var _ = require('underscore');
var cls = require('./lib/class');
var Messages = require('./message');
var Utils = require('./utils');
var Types = require("../../shared/js/gametypes");

var Emitter = cls.Class.extend({

    init: function (config) {
        this.projectileName = config.p;
        this.kind = Types.getProjectileKindFromString(this.projectileName);
        this.frequency = config.f;
        this.sourcePos = { x: config.sx, y:config.sy };
        this.targetPos = { x: config.tx, y:config.ty };
        this.scheduleEmit(this.frequency);
    },
    
    destroy: function () {

    },
    
    // define an emitProjectile event
    emitProjectile: function() {
        if(this.emitProjectile_callback) {
            this.emitProjectile_callback(this.kind,this.sourcePos,this.targetPos);
        }
        // repeat
        this.scheduleEmit(this.frequency);
    },

    onEmitProjectile: function(callback) {
        this.emitProjectile_callback = callback;
    },
        
    scheduleEmit: function (delay) {
        var self = this;
        setTimeout(function () {
            self.emitProjectile();
        }, delay);
    }

});

module.exports = Emitter;