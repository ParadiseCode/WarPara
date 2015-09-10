var Utils = require('./utils');

var Formulas = {};

Formulas.dmg = function (weaponLevel, armorLevel) {
    var dealt = weaponLevel * Utils.randomInt(6, 12);
    var absorbed = armorLevel * Utils.randomInt(3, 6);
    var dmg =  dealt - absorbed;

    if (dmg <= 0) {
        return Utils.randomInt(0, 3);
    } else {
        return dmg;
    }
};

Formulas.hp = function (characterLevel) {
    var hp = 90+(characterLevel * 10);
    return hp;
};

Formulas.mp = function (characterLevel) {
    var mp = 90+(characterLevel * 10);
    return mp;
};

if (typeof exports !== 'undefined') {
    module.exports = Formulas;
}
