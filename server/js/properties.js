
var Types = require("../../shared/js/gametypes");

var Properties = {
    Mob_000: {
        drops: {
            HEALTHPOTION1: 20,
            MANAPOTION1: 5,
            HULKPOTION1: 2
        },
        hp: 30,
        armor: 1,
        weapon: 1
    },

    Mob_001: {
        drops: {
            HEALTHPOTION1: 20,
            MANAPOTION1: 5,
            HULKPOTION1: 2
        },
        hp: 20,
        armor: 1,
        weapon: 1
    },

    Mob_002: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_003: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 150,
        armor: 1,
        weapon: 2
	},

    Mob_004: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_005: {
        drops: {
            HEALTHPOTION1: 20,
            MANAPOTION1: 5,
            HULKPOTION1: 2
        },
        hp: 30,
        armor: 1,
        weapon: 1
    },

    Mob_006: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_007: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_008: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_009: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_010: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_011: {
        drops: {
            HEALTHPOTION1: 20,
            MANAPOTION1: 5,
            HULKPOTION1: 2
        },
        hp: 30,
        armor: 1,
        weapon: 1
    },

    Mob_012: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_013: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_014: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_015: {
        drops: {
            HEALTHPOTION1: 20,
            MANAPOTION1: 5,
            HULKPOTION1: 2
        },
        hp: 30,
        armor: 1,
        weapon: 1
    },

    Mob_016: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_017: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_018: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_019: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_020: {
		drops: {
            HEALTHPOTION1: 20,
			MANAPOTION1: 5,
			HULKPOTION1: 2
        },
		hp: 30,
        armor: 1,
        weapon: 1
	},

    Mob_021: {
        drops: {
            HEALTHPOTION1: 20,
            MANAPOTION1: 5,
            HULKPOTION1: 2
        },
        hp: 30,
        armor: 1,
        weapon: 1
    }

};

Properties.getArmorLevel = function(kind,gender) {
    try {
        if(Types.isMob(kind)) {
            return Properties[Types.getKindAsString(kind)].armor;
        } else {
            return Types.getArmorRank(kind,gender);
        }
    } catch(e) {
        log.error("No level found for armor: "+Types.getKindAsString(kind));
        log.error('Error stack: ' + e.stack);
    }
};

Properties.getWeaponLevel = function(kind) {
    try {
        if(Types.isMob(kind)) {
            return Properties[Types.getKindAsString(kind)].weapon;
        } else {
            return Types.getWeaponRank(kind);
        }
    } catch(e) {
        log.error("No level found for weapon: "+Types.getKindAsString(kind));
        log.error('Error stack: ' + e.stack);
    }
};

Properties.getShieldLevel = function(kind) {
    try {
        if(Types.isMob(kind)) {
            return 0;
        } else {
            return Types.getShieldRank(kind);
        }
    } catch(e) {
        log.error("No level found for weapon: "+Types.getKindAsString(kind));
        log.error('Error stack: ' + e.stack);
    }
};

Properties.getAmuletLevel = function(kind) {
    try {
        if(Types.isMob(kind)) {
            return 0;
        } else {
            return Types.getAmuletRank(kind);
        }
    } catch(e) {
        log.error("No level found for weapon: "+Types.getKindAsString(kind));
        log.error('Error stack: ' + e.stack);
    }
};

Properties.getRingLevel = function(kind) {
    try {
        if(Types.isMob(kind)) {
            return 0;
        } else {
            return Types.getRingRank(kind);
        }
    } catch(e) {
        log.error("No level found for weapon: "+Types.getKindAsString(kind));
        log.error('Error stack: ' + e.stack);
    }
};

Properties.getRoamSpeed = function(kind) {
    try {
        if(Types.isMob(kind)) {
            return Properties[Types.getKindAsString(kind)].roamSpeed;
        }
    } catch(e) {
        log.error("No roam speed found: "+Types.getKindAsString(kind));
    }
};

Properties.getHitPoints = function(kind) {
    return Properties[Types.getKindAsString(kind)].hp;
};
Properties.getExp = function(kind){
    return Properties[Types.getKindAsString(kind)].exp;
};

module.exports = Properties;
