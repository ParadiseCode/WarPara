var _ = require('underscore');
var Item = require('./item');
var Types = require('../../shared/js/gametypes');
var Utils = require('./utils');

var Trap = Item.extend({
    init: function (id, x, y) {
        this._super(id, Types.Entities.TRAP, x, y);
        this.damageLevel = 15;
    }
});

module.exports = Trap;
