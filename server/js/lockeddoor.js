var _ = require('underscore');
var Item = require('./item');
var Types = require('../../shared/js/gametypes');
var Utils = require('./utils');
var Messages = require('./message');

var LockedDoor = Item.extend({
    init: function (id, x, y) {
        this._super(id, Types.Entities.LOCKEDDOOR, x, y);
		
		this.itemConnect = 0; // what lever the door connects to
    },
	
	setItemConnect: function (itemConnect){
		this.itemConnect = itemConnect;
	},
	

});

module.exports = LockedDoor;
