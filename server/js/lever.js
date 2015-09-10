var _ = require('underscore');
var Item = require('./item');
var Types = require('../../shared/js/gametypes');
var Utils = require('./utils');
var Messages = require('./message');

var Lever = Item.extend({
    init: function (id, x, y) {
        this._super(id, Types.Entities.LEVER, x, y);
		
		this.state = false; // off position
		this.itemConnect = 0; // what door the lever goes to
    },
	
	setState: function (state){
		this.state = state;
	},
	
	setItemConnect: function (itemConnect){
		this.itemConnect = itemConnect;
	},
	
	setTime: function (time){
		this.time = time;
	},
	
	switchChange: function(){
		var s = 0;
		if(this.state){
			this.state = false;
			s = 0;
		}else{
			this.state = true;
			s = 1;
		}
		return new Messages.SwitchChange(this.id, s, this.itemConnect);
	}

});

module.exports = Lever;
