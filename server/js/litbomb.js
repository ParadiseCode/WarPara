var _ = require('underscore');
var Item = require('./item');
var Types = require('../../shared/js/gametypes');
var Utils = require('./utils');

var LitBomb = Item.extend({
    init: function (id, x, y) {
        this._super(id, Types.Entities.LITBOMB, x, y);
        
        // owner
        this.owner = null;
        
        // self destruct after 3 seconds 3000 (i change to 100 for now, better for testing map)
        this.scheduleDetonate(100);
    },
    
    // define an detonate event
    detonate: function() {
        if(this.detonate_callback) {
            this.detonate_callback(this.owner);
        }
    },

    onDetonate: function(callback) {
        this.detonate_callback = callback;
    },
        
    scheduleDetonate: function (delay) {
        var self = this;
        setTimeout(function () {
  
            self.detonate();

        }, delay);
    },
    
    // append owner id to spawn msgs
    getState: function () {
        var basestate = this._getBaseState(),
            state = [];
        state.push(this.owner);
        return basestate.concat(state);
    }
});

module.exports = LitBomb;
