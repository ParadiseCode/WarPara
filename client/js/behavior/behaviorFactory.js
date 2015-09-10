BehaviorFactory = {};
BehaviorFactory.factory = {};

BehaviorFactory.registerFabricObject = function(id, onCreateCallBack) {
    id = id.toLowerCase();
    if(BehaviorFactory.factory[id]) {
        console.error("Duplicate behaviorId in Factory");
        return false;
    }

    BehaviorFactory.factory[id] = onCreateCallBack;
};

BehaviorFactory.AttachBehavior = function(type, mob) {
    if(type == undefined) type = 'neutral';
	type = type.toLowerCase();
    try{
        return BehaviorFactory.factory[type](mob);
    }catch(e){
        console.error("Not find behaviorId "+type+" in factory, maybe you forgot add Method registered to factory");
    }
};

BehaviorFactory.getGameInstance = function() {
    if (this.gameInstance)
        return this.gameInstance;
};

BehaviorFactory.AttachGameInstance = function(game) {
    if (!this.gameInstance)
        this.gameInstance = game;
};


BehaviorFactory.init = function() {
    require(['behavior/hitAndRun', 'behavior/neutral', 'behavior/peaceful', 'behavior/social', 'behavior/leader', 'behavior/follower']);
};
BehaviorFactory.init();


if(!(typeof exports === 'undefined')) {
    module.exports = BehaviorFactory;
}