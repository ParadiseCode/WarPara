var _ = require('underscore');
var Item = require('./item');
var Types = require('../../shared/js/gametypes');
var Utils = require('./utils');

var RockWall = Item.extend({
    init: function (id, x, y) {
        this._super(id, Types.Entities.ROCKWALL, x, y);
    }
});

module.exports = RockWall;
