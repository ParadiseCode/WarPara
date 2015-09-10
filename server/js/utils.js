var sanitizer = require('sanitizer');
var Types = require('../../shared/js/gametypes');
var Utils = {};

module.exports = Utils;

Utils.sanitize = function (string) {
    // Strip unsafe tags, then escape as html entities.
    return sanitizer.escape(sanitizer.sanitize(string));
};

Utils.random = function (range) {
    return Math.floor(Math.random() * range);
};

Utils.randomRange = function (min, max) {
    return min + (Math.random() * (max - min));
};

Utils.randomInt = function (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

Utils.clamp = function (min, max, value) {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
};

Utils.randomOrientation = function () {
    var o, r = Utils.random(4);

    if (r === 0) {
        o = Types.Orientations.LEFT;
    }
    if (r === 1) {
        o = Types.Orientations.RIGHT;
    }
    if (r === 2) {
        o = Types.Orientations.UP;
    }
    if (r === 3) {
        o = Types.Orientations.DOWN;
    }

    return o;
};

Utils.Mixin = function (target, source) {
    if (source) {
        for (var key, keys = Object.keys(source), l = keys.length; l--;) {
            key = keys[l];

            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

Utils.distanceTo = function (x, y, x2, y2) {
    var distX = Math.abs(x - x2),
        distY = Math.abs(y - y2);

    return (distX > distY) ? distX : distY;
};

Utils.NaN2Zero = function(num){
    if(isNaN(num*1)){
        return 0;
    } else{
        return num*1;
    }
};

Utils.trueFalse = function(bool){
    return bool === "true" ? true : false;
};

Utils.shallowStringify = function(obj, onlyProps, skipTypes) {
  var objType = typeof(obj);
  if(['function', 'undefined'].indexOf(objType)>=0) {
    return objType;
  } else if(['string', 'number', 'boolean'].indexOf(objType)>=0) {
    return obj; // will toString
  }
  // objType == 'object'
  var res = '{';
  for (p in obj) { // property in object
    if(typeof(onlyProps)!=='undefined' && onlyProps) {
      // Only show property names as values may show too much noise.
      // After this you can trace more specific properties to debug
      res += p+', ';
    } else {
      var valType = typeof(obj[p]);
      if(typeof(skipTypes)=='undefined') {
        skipTypes = ['function'];
      }
      if(skipTypes.indexOf(valType)>=0) {
        res += p+': '+valType+', ';
      } else {
        res += p+': '+obj[p]+', ';
      }
    }
  }
  res += '}';
  return res;
};
