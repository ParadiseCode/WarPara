var _ = require('underscore');
var Item = require('./item');
var Types = require('../../shared/js/gametypes');
var Utils = require('./utils');

var Chest = Item.extend({
    init: function (id, x, y) {
        this._super(id, Types.Entities.CHEST, x, y);
        this.items       = null;
        this.chanceItems = null;
        this.summaryDrop = null;
    },

    setItems: function (items, chanceItems, summaryDrop) {
        this.items = items;

        var sortFunc = function(a, b) {
            if (a.chance < b.chance)
                return -1;
            if (a.chance > b.chance)
                return 1;
            return 0;
        };

        if (chanceItems) {
            chanceItems.sort(sortFunc);
            this.chanceItems = chanceItems;
        }

        this.summaryDrop = summaryDrop;
    },

    getRandomItem: function () {
        var nbItems = _.size(this.items),
            item = null;

        if (nbItems > 0) {
            item = this.items[Utils.random(nbItems)];
        }
        return item;
    },

    getItems: function () {
        var items = [];
        if (_.size(this.chanceItems) !== 0)
            items = this.getChanceItems();
        else if (_.size(this.summaryDrop) !== 0)
            items.push(this.getSummaryItem());
        else
            items.push(this.getRandomItem());

        return items;
    },


    getChanceItems: function() {
        var items = [];
        if (_.size(this.chanceItems) !== 0) {
            for (var itemName in this.chanceItems) {
                var chance = Utils.random(100);
                var item = this.chanceItems[itemName];

                if (item.chance >= chance)
                    items.push(item.id);
            }
        }

        return items;
    },

    getSummaryItem: function() {
        if (_.size(this.summaryDrop) !== 0) {
            var chance = Utils.random(100);
            var totalChance = 0;
            for (var itemName in this.summaryDrop) {
                var item = this.summaryDrop[itemName];

                if (item.chance + totalChance >= chance)
                    return item.id;
                totalChance += item.chance;
            }
        }
        return null;
    }
});

module.exports = Chest;
