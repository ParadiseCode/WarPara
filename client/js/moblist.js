define(['text!/../shared/Mobs.json', '../../shared/js/mobManager'], function(Mobs) {
    MobList.loadMobs(Mobs);
    return MobList;
});
