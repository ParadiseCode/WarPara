var exists, existsSync;
(function () {
    require('fs');

    exists = module.exists;
    existsSync = module.existsSync;
})();

if (!(typeof exports === 'undefined')) {
    module.exports.exists = exists;
    module.exports.existsSync = existsSync;
}
