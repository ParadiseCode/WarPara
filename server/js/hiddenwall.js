var _ = require('underscore');
var Item = require('./item');
var Types = require('../../shared/js/gametypes');
var Utils = require('./utils');

var HiddenWall = Item.extend({
    init: function (id, x, y) {
        this._super(id, Types.Entities.HIDDENWALL, x, y);
    }
});

module.exports = HiddenWall;
