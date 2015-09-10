MobFactory = {};
MobFactory.factory = {};
MobFactory.init = false;

MobFactory.registerFabricObject = function(id, onCreateCallBack) {
    id = id.toLowerCase();
    if(MobFactory.factory[id])
        console.error("Dublicate mobId in mobFactory");

    MobFactory.factory[id] = onCreateCallBack;
};

MobFactory.createMob = function(type, id, kind, x, y) {
    if (this.init === false) {
        require('./mob');
        require('./leader');
        require('./follower');
        this.init = true;
    }

    type = type.toLowerCase();
    try{
        return MobFactory.factory[type](id, kind, x, y);
    }catch(e){
        console.log("Not find mobId "+type+"in mob factory, maybe you forgot add Method registered to factory");
    }

};

module.exports = MobFactory;