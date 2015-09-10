
define(['npc'], function(Npc) {

    var NPCs = {

        Guard: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.GUARD, 1);
				this.nameOffsetY = -10;
				this.name = "Guard";
            }
        }),

        King: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.KING, 1);
				this.nameOffsetY = -10;
				this.name = "The King";
            }
        }),

        Sorcerer: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.SORCERER, 1);
                this.idleSpeed = 150;
				this.nameOffsetY = -10;
				this.name = "Sorcerer";
            }
        }),

        Priest: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.PRIEST, 1);
				this.nameOffsetY = -10;
				this.name = "Priest";
            }
        }),

        Octocat: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.OCTOCAT, 1);
				this.nameOffsetY = -10;
				this.name = "Octocat";
            }
        }),
		
		Fairy3: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.FAIRY3, 1);
				this.nameOffsetY = -10;
				this.name = "Fairy";
            }
        }),
		
		Fairyqueen: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.FAIRYQUEEN, 1);
				this.nameOffsetY = -8;
				this.name = "Fairy Queen";
            }
        }),
		
		Bandaged: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.BANDAGED, 1);
				this.nameOffsetY = -10;
				this.name = "Bandaged Man";
            }
        }),
		
		Blindwoman: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.BLINDWOMAN, 1);
				this.nameOffsetY = -10;
				this.name = "Blind Woman";
            }
        }),
		
		Caretaker: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.CARETAKER, 1);
				this.nameOffsetY = -10;
				this.name = "Caretaker";
            }
        }),
		
		Dirtykid: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.DIRTYKID, 1);
				this.nameOffsetY = -10;
				this.name = "Peasant Boy";
            }
        }),
		
		Fortuneteller: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.FORTUNETELLER, 1);
				this.nameOffsetY = -10;
				this.name = "Fortune Teller";
            }
        }),
		
		Ghostking: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.GHOSTKING, 1);
				this.nameOffsetY = -10;
				this.name = "King's Ghost";
            }
        }),
		
		Hermit: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.HERMIT, 1);
				this.nameOffsetY = -10;
				this.name = "Hermit";
            }
        }),
		
		Jester: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.JESTER, 1);
				this.nameOffsetY = -10;
				this.name = "Jester";
            }
        }),
		
		Weaver: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.WEAVER, 1);
				this.nameOffsetY = -10;
				this.name = "Weaver";
            }
        }),
		
		Wounded: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.WOUNDED, 1);
				this.nameOffsetY = 2;
				this.name = "Wounded Man";
            }
        }),
		
		Faun: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.FAUN, 1);
				this.idleSpeed = 100;
				this.nameOffsetY = -14;
				this.name = "Faun";
            }
        }),
		
		Princess: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.PRINCESS, 1);
				this.nameOffsetY = -10;
				this.name = "Princess";
            }
        }),
		
		Queen: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.QUEEN, 1);
				this.nameOffsetY = -10;
				this.name = "Queen";
            }
        }),
		
		WitchesSon: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.WITCHESSON, 1);
				this.nameOffsetY = -10;
				this.name = "Rupert";
            }
        }),
		
		Matilda: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.MATILDA, 1);
				this.nameOffsetY = -10;
				this.name = "Matilda";
            }
        }),
		
		Dwarf1: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.DWARF1, 1);
				this.nameOffsetY = -10;
				this.name = "Dwarven Guard";
            }
        }),
		
		Dwarf3: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.DWARF3, 1);
				this.nameOffsetY = -10;
				this.name = "Dwarven King";
            }
        }),
		
		Dwarf5: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.DWARF5, 1);
				this.nameOffsetY = -10;
				this.name = "Dwarven Peasant";
            }
        }),
		
		Dwarf8: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.DWARF8, 1);
				this.nameOffsetY = -10;
				this.name = "Dwarven Girl";
            }
        }),
		
		Writer: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.WRITER, 1);
				this.nameOffsetY = -10;
				this.name = "Writer";
            }
        }),
		
		Guard2: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.GUARD2, 1);
				this.nameOffsetY = -10;
				this.name = "Arena Guard";
            }
        }),
        
		Vendor1: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.VENDOR1, 1);
				this.nameOffsetY = -10;
				this.name = "Merchant";
            }
        }),

		Vendor2: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.VENDOR2, 1);
				this.nameOffsetY = -10;
				this.name = "Merchant";
            }
        }),

		Vendor3: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.VENDOR3, 1);
				this.nameOffsetY = -10;
				this.name = "Merchant";
            }
        }),
        
		Vendor4: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.VENDOR4, 1);
				this.nameOffsetY = -10;
				this.name = "Merchant";
            }
        }),

		Morty: Npc.extend({
            init: function(id) {
                this._super(id, Types.Entities.MORTY, 1);
				this.nameOffsetY = -10;
				this.name = "Morty";
            }
        })           
		
    };

    return NPCs;
});
