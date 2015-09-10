
define(function() {

    var Storage = Class.extend({
        init: function() {
            this.resetData();
            log.info('Local Init');
        },

        resetData: function() {
			if(!this.synced){
				this.hasPlayed = false;
				this.synced = false;
				this.saveDelay;
				this.data = {
					player: {
						guild: ""
					},
					achievements: {
						unlocked: [],
						chefCount: 0,
						skeletonCount: 0,
						totalKills: 0,
						totalDmg: 0,
						totalRevives: 0
					},
					doorKeys: {
					},
					mute: false
				};
			}
        },
        
        // send "local" data to server
        sendToServer: function() {
            if(this.synced){
                var self = this;
                self.game.client.sendLocal(JSON.stringify(self.data));
                log.info('SENDING LOCAL');
            }
        },

        save: function() {
			var self = this;
			if(this.synced){
				// delay saves to prevent many saves within short period
				if(this.saveDelay){ clearTimeout(this.saveDelay); }
				this.saveDelay = setTimeout(function(){
                    self.sendToServer();
				}, 10000);
			}else{
				log.info('Can not save local until synced');
			}
        },

        // Player

        hasAlreadyPlayed: function() {
            return this.hasPlayed;
        },
		
		setMute: function(bool) {
            this.data.mute = bool;
            this.save();
        },
        
        setPlayerGuild: function(guild) {
			if(typeof guild !== "undefined") {
				this.data.player.guild={id:guild.id, name:guild.name,members:JSON.stringify(guild.members)};
				this.save();
			}
			else{
				delete this.data.player.guild;
				this.save();
			}
		},

        savePlayer: function(img, armor, weapon, guild) {
			this.game.player.image = img;
            this.setPlayerGuild(guild);
        },

        // Achievements

        hasUnlockedAchievement: function(id) {
            return _.include(this.data.achievements.unlocked, id);
        },

        unlockAchievement: function(id) {
            if(!this.hasUnlockedAchievement(id)) {
                this.data.achievements.unlocked.push(id);
                this.save();
                return true;
            }
            return false;
        },

        getAchievementCount: function() {
            return _.size(this.data.achievements.unlocked);
        },

        // Angry rats
        getChefCount: function() {
            return this.data.achievements.chefCount;
        },

        incrementChefCount: function() {
            if(this.data.achievements.chefCount < 100) {
                this.data.achievements.chefCount++;
                this.save();
            }
        },

        // Skull Collector
        getSkeletonCount: function() {
            return this.data.achievements.skeletonCount;
        },

        incrementSkeletonCount: function() {
            if(this.data.achievements.skeletonCount < 10) {
                this.data.achievements.skeletonCount++;
                this.save();
            }
        },

        // Meatshield
        getTotalDamageTaken: function() {
            return this.data.achievements.totalDmg;
        },

        addDamage: function(damage) {
            if(this.data.achievements.totalDmg < 5000) {
                this.data.achievements.totalDmg += damage;
                this.save();
            }
        },

        // Hunter
        getTotalKills: function() {
            return this.data.achievements.totalKills;
        },

        incrementTotalKills: function() {
            if(this.data.achievements.totalKills < 50) {
                this.data.achievements.totalKills++;
                this.save();
            }
        },

        // Still Alive
        getTotalRevives: function() {
            return this.data.achievements.totalRevives;
        },

        incrementRevives: function() {
            if(this.data.achievements.totalRevives < 5) {
                this.data.achievements.totalRevives++;
                this.save();
            }
        },
		
		// allow npcs to save local data
		saveToLocal: function (key, value){
			this.data[key] = value;
			this.save();
            if (value == '1') this.game.client.sendNpcLoot(key); // For clarity, this should be handled in npc.js
			console.log(this.data);
			return true;
		},
		getFromLocal: function (key){
			return this.data.key;
		},
		hasKey: function(key){
			if(this.data.hasOwnProperty(key)){
				return true;
			}else{
				return false;
			}
		},
		deleteKey: function(key){
			delete this.data[key];
			return true;
		},
		
		SaveDoorKey: function(key){
			this.data.doorKeys[key] = 1;
			this.save();
            this.game.client.sendNpcLoot('doorkey'); // also should be handled in npc.js
			return true;
		},
    });

    return Storage;
});
