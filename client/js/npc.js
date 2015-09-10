define(['character'], function(Character) {

    var NpcTalk = {
		"queen": [
			{"text": [//default
				"doesn't work without this?"
			]},
			{"condition": function(game){
				if(game.storage.hasKey('savedPrincess')){
					game.storage.saveToLocal('canRemort', '1');
					game.client.sendKey(1);
					game.client.sendKey(2);
					return true;
				}else{
                    game.client.sendKey(1); //game.client.sendKey(1);
					return false;
				}
			},
			"text": [
				"Thank you for saving my daughter, *name*!",
				"She is waiting for you in her room.",
				"It's the first door on the right hallway.",
				
			]},
			{"condition": function(game){ return game.storage.saveToLocal('startPrincess', '1'); },
			"text": [
				"Ever since the King died,<br/>the Princess has been consumed with grief.",
				"She went to visit his tomb.<br/>That was two days ago, and I fear that she is lost.",
				"Here's the key to the courtyard.<br/>Please find her!",
                "Also... If you ever feel stuck or lost<br/>Type !castle in your chat window",
                "You will be teleported back here<br/>Good luck *name*!",
			]}
        ],
		
		"princess": [{"text": [//default
			""
		]},
        {"condition": function(game){  
            if (game.storage.hasKey('canRemort') && !game.app.guestPlay) {
                setTimeout(function() {
                    game.showRemortDialog();
                }, 2000);
                return true;
            }
            return false;
         },
         "text": [
            "My hero! You have completed the game."
        ]},
        {"condition": function(game){  if (game.storage.hasKey('canRemort') && game.app.guestPlay) return true; },
         "text": [
            "You must be logged in with an id.net account to remort my dear."
        ]},
		{"condition": function(game){
			if(game.storage.hasKey('startPrincess')){
				game.storage.saveToLocal('savedPrincess', '1'); 
                game.storage.deleteKey('startPrincess');
                game.client.sendKey(2);
                return true;
			}else{ 
                return false;
			} 
        },
		"text": [
			"Thank you! Please talk to the my mother, the Queen.",
			"And please visit me in the castle"
		]}
		],
		
		"writer": [
			{"text": [//default
				"doesn't work without this?"
			]},
			{"condition": function(game){ return !game.storage.hasKey('hasBook'); },
			"text": [
				"I am a writer. Here let me show you my book.",
				"Oh no! I must have misplaced it.",
				"Can you find it and return it to me?"
			]},
			{"condition": function(game){ return game.storage.hasKey('bookDone') && !game.inventoryContains(Types.Entities.BOOK)},
			"text": [
				"I will always remember you!"
			]},
			{"condition": function(game){ if( game.storage.hasKey('bookDone') && game.inventoryContains(Types.Entities.BOOK) ){ game.client.sendInventoryUse(Types.Entities.BOOK); return true; }else{ return false; } },
			"text": [
				"Oh you found another copy? Let me lighten your load."
			]},
			{"condition": function(game){
                if(game.inventoryContains(Types.Entities.BOOK)) {
                    game.client.sendInventoryUse(Types.Entities.BOOK);
                    game.tryUnlockingAchievement('BOOK');
					game.storage.saveToLocal('bookDone', '1')
                    return true;
                } else {
                    return false;
                }
            },
			"text": [
				"Thank you so much. This is my life's work.",
			]}
		],

		
		"guard": [
			{"text": [//default
				"doesn't work without this?"
			]},
			{"condition": function(game){ return game.storage.hasKey

('startPrincess') },
            "text": [
				"I can't believe it ! she slapped me right in the face !<br/>My necklace isn't good enough for a princess like her she said<br/>I have mud on my clothes even, and i smell funky !<br/>Of course i do, i'm an adventurer ... but you understand me.<br/>She throwed the necklace away before she left the room<br/>You can have it if you want, i don't want to see it ever again."
			]},
			{"condition": function(game){ return !game.storage.hasKey

('startPrincess') },
			"text": [
				"You have arrived!",
				"Quickly! Go speak to the Queen."
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 1)/*dungeon 1 entrance guard */{
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"You need at least Leather Armor and Plain Ring equipped to enter this dungeon."
			]},
				{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 2)/*dungeon 1 boss room guard */{
					return true;
				}else{
					return false;
				}
			},
			
			"text":[
				"You need to have sword2 and the fireball spell equipped to fight the boss in this dungeon."
			]},
			
			
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num ==3)/*dungeon 2 entrance guard */{
					return true;
				}else{
					return false;
				}
			},
			
			"text":[
				"Hold your horses lad!",
				"You cannot go in unless you have good gears equipped.",
				"You need an Axe, Mail Armor, White Ring and a healing spell equipped.",
			]},
			
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 4)/*dungeon 2 boss room guard */{
					return true;
				}else{
					return false;
				}
			},
			
			"text":[
				"There's a strong enemy behind that door.",
				"If you have shield2 and necklace2.",
				"I'll let you enter that room and defeat it."
				
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 5)/*dungeon 3 entrance guard */{
					return true;
				}else{
					return false;
				}
			},
			
			"text":[
				"Hey there adventurer.",
				"Do you want to get in?",
				"You need Plate Armor, Morning Star, Green Ring and Terror Spell equipped."
				
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 6)/*dungeon 3 boss room guard */{
					return true;
				}else{
					return false;
				}
			},
			
			"text":[
				"I've been waiting for you.",
				"The creepy monster is behind this door.",
				"Wait a minute!",
				"You're not ready yet.",
				"You must have shield3 and necklace3.",
				"So we can be sure you will defeat that monster."
				
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 7)/*dungeon 4 entrance guard */{
					return true;
				}else{
					return false;
				}
			},
			
			"text":[
			  "You are not allowed to enter unless you have Blue Sword, Blue Armor, Blue Ring and Ice Spell equipped."
				
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 8)/*dungeon 4 boss room guard */{
					return true;
				}else{
					return false;
				}
			},
			
			"text":[
				"Halt!",
				"You're gonna get yourself killed.",
				"And I won't let that happen.",
				"You're not ready yet.",
				"But if you have shield4 and necklace4 equipped.",
				"I'll let you enter."
				
			]}
        ],

		
		"fairy3": [
            {"text": [//default
				"The Fairy Queen needs your help!",
				"Go north.  She is waiting for you."
			]}
        ],
		
		"fairyqueen": [
			{"condition": function(game){ 
				if(!game.inventoryContains(Types.Entities.WARDEN) && !game.storage.hasKey('wardenDone')){ 
					return true;
				}else{ 
					return false;
				}
			},
			"text" : [
				"I am the Fairy Queen.",
				"The mists give us long life,",			
				"They show us visions of distant lands and possible futures.",
				"Undead monsters have stolen the Mist Warden!",
				"Retrieve the Mist Warden, please!"
			]},
			{"condition": function(game){ 
				if(game.inventoryContains(Types.Entities.WARDEN)){ 
                    game.client.sendInventoryUse(Types.Entities.WARDEN);
					game.tryUnlockingAchievement("MIST_WARDEN");
					game.storage.saveToLocal('wardenDone', '1');
					return true;
				}else{ 
					return false;
				}
			},
			"text" : [
				"Oh! Thank you for bringing the Mist Warden back to me.",
				"But... the mists have not returned...",
				"Something is wrong.",
				"Something more evil plagues this land."
			]},
			{"condition": function(game){ return game.storage.hasKey('wardenDone') },
			"text": [
				"Even with the Mist Warden, the mist has not returned.",
				"Something else awaits you."
			]}
        ],

        "king": [
			{"text": [//default
				"doesn't work without this?"
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 1){
					game.client.sendKey(2);
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"Hi *name*, click on me!",
				"It's important to talk to us.",
				"We can give you clues or items.",
				"Like this key for example.",
				"This key open that door.",
				"To open it, you just have to click on the door."
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 2){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"That door is closed.",
				"You can open it with the lever though."
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 3){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"Have you found a bomb?",
				"There's some in those chests.",
				"Do you know you can make a hole in some walls with a bomb?",
				"Click between those two altars to move there.",
				"Then click on the bomb icon in your inventory at the bottom."
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 4){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"I'm afraid of rats!",
				"Please, kill them!",
				"You just have to click on it."
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 5){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"When you lose your life,",
				"You can heal by using a red potion."
				
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 6){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"With this new sword in the chest,",
				"You make more damage."
				
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 7){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"Armors give you better defense and more life."
				
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 8){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"You don't have to do anything with rings.",
				"They will constantly heal you."
				
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 9){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"You just have to click on this spell in your inventory.",
				"To recover some life."
				
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 10){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"Try this fireball spell.",
				"You will love it!"
			]}
		],

        "priest": [
            "Behold! The latest miracle of science...",
			"The magnificent, exploding, BOMB!",
			"To use a bomb, pick one up and tab it in your hotbar.",
			"Then the bomb will be placed under your feet!",
			"Bombs can reveal hidden doors!",
			"In fact, there's a hidden door very close.",
			"Find it, and enjoy your reward!"
        ],

		"guard2": [
            "Fight for glory and experience in the PVP arena",
			"On the left portal, you can try for free to fight other players.",
			"On the right portal, it coast you 100 crystals to enter.",
			"But, you can earn lots of crystals by defeating other players."
        ],

        "sorcerer": [
            "I'm not in the game... yet."
        ],
		
		"matilda": [
			{"text": [//default
				"doesn't work without this?"
			]},
			{"condition": function(game){ return game.storage.hasKey('savedPrincess') },
			"text": [
				"So, you found the Princess and killed the Baron.",
				"But you don't think it's over, do you?",
				"The Baron was a sadist and a cannibal,",
				"but he's certainly not the source of all this evil.",
				"Listen. You need help.  Go find my son, Rupert.",
				"He'll be wandering through the forest,",
				"probably scaring the rabbits.",
				"He's got an old sword laying around somewhere."
			]},
			{"condition": function(game){  return !game.storage.hasKey('clothDone') && !game.inventoryContains(Types.Entities.CLOTH) && game.storage.saveToLocal('startCloth' , '1') },
			 "text": [
				"I am Matilda, and this is my home.",
				"Yes, I sensed the Princess's arrival, but she soon left my forest.",
				"I have a deal for you --",
				"Bring me some cloth, and I will help you find her."
			]},
			{"condition": function(game){ 
				if(!game.storage.hasKey('clothDone') && game.inventoryContains(Types.Entities.CLOTH)){ 
                    game.client.sendInventoryUse(Types.Entities.CLOTH);
                    game.client.sendKey('1');
					game.tryUnlockingAchievement("MATILDA_CLOTH");
					game.storage.saveToLocal('clothDone', '1');
					game.showNotification("You pick up a key to Matilda's house");
					return true;
				}else{ 
					return false;
				}
			},
			 "text": [
				"Thank you *name*."
			]},
			{"condition": function(game){  return game.storage.hasKey('clothDone') },
			 "text": [
                "With this cloth, I can make new pants for my son.",
				"I left a gift for you inside my home."
			]},            
		],
		
		"weaver": [
			{"text": [// This default message shouldn't ever show
				"hello"
			]},
			{"condition": function(game){ return !game.inventoryContains(Types.Entities.CLOTH) && !game.storage.hasKey('startCloth') && !game.storage.hasKey('clothDone') },
			"text": [
				"I am the spinner and weaver for this village.",
				"I turn wool into yarn and fabric."	
			]},
			{"condition": function(game){ return game.inventoryContains(Types.Entities.CLOTH) && game.storage.hasKey('startCloth') && !game.storage.hasKey('clothDone') },
			"text": [
				"Oh yes, please deliver the cloth to Matilda."
			]},
			{"condition": function(game){ 
				if(game.storage.hasKey('startCloth') && !game.storage.hasKey('clothDone')){ 
					game.client.sendNpcLoot('cloth');
					return true; 
				}else{ 
					return false; 
				}
			},
			"text": [
				"Here, take this cloth.",
				"Give it to Matilda,",
				"and say 'Hello' to her for me."
			]},
			{"condition": function(game){ return game.storage.hasKey('clothDone') && !game.inventoryContains(Types.Entities.CLOTH) },
			 "text": [
				"Thank you *name* for delivering the cloth to Matilda.",
				"Oh she made pants for her son?",
				"That boy's trousers were looking bad."
			]},
			{"condition": function(game){ if( game.storage.hasKey('clothDone') && game.inventoryContains(Types.Entities.CLOTH) ){ game.client.sendInventoryUse(Types.Entities.CLOTH); return true; }else{ return false; } },
			 "text": [
				"Oh you have extra cloth? I will take that back.",
			]},
        ],
		
		"bandaged": [
            "It looks like the Baron is preparing for another one of his parties.",
			"His chefs have been busy all day.",
			"That's odd...",
			"A few of his guests look a lot like the ones who attacked us."
        ],
		
		"blindwoman": [
            "I may be blind, but I know every inch of these mountains.",
			"Through the maze, go South, West, North, and West."
        ],
		
		"caretaker": [
            "I am the Caretaker of the King's tomb.",
            "Yes, the Princess was here.",
			"She was crying with sadness.",
			"She went North when she heard the music of travelling carnival."
        ],
		
		"dirtykid": [
            {"text": [//default
				"doesn't work without this?"
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 1){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
			"I heard there's a Hermit who lives in the desert.",
			"They say he's very wise.",
			"To find him, go South from the castle,",
			"then through the desert maze."
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 2){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"Pst!",
				"Let me tell you a secret.",
				"But don't tell anybody.",
				"Me and my brother is making a secret tunnel.",
				"It connects to the other side of this wall.",
				"Cool huh?",
				"But it's not done yet.",
				"Come back later. Ok?"
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				game.client.sendKey(67);
				if(dialog && dialog.num == 3){
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"Phew!",
				"The tunnel is done.",
				"Go through here if you want to go city quickly.",
			]}
        ],
		
		"fortuneteller": [
            "The Princess joined us for a few songs",
			"but we were attacked on the road.",
			"We fled to this spot.",
			"I created this portal and sent the Princess to Matilda's forest.",
			"My brother cannot be moved,",
			"So I stayed to care for him."
        ],
		
		"ghostking": [
            "I came to you in your dream to teach you how to defend my kingdom.",
			"You are now ready",
			"Go! My family needs your help!"
        ],
		
		"hermit": [
            "What's that you say?  The Princess is lost?  Attacked?!",
			"Such terrible news to my ears!",
			"See that chest?  Inside you'll find my old armor.  Take it.",
			"I'll also give you some advice...",
			"Find a friend.",
			"Only a fool would fight this battle alone."
        ],
		
		"jester": [
            "There's an evil force behind this door.",
            "But you can't enter without the golden key.",
            "If you make it out of there alive I'll be amazed."
        ],
		
		"wounded": [
            "Matilda's magic is most potent.",
			"If the Princess can find her, she will be safe."
        ],
		
		"faun": [
			{"text": [//default
				"Hello again."
			]},
			{"condition": function(game){ return game.storage.hasKey('savedPrincess') },
			"text": [
				"The Princess must be so happy",
				"now that she won't be chopped up",
				"and baked into a delicious pie.",
				"Mmmmmmmmmmm....  Princess Pie.",
				"You better go tell that Dwarven girl that the wedding is off."
			]},
			{"condition": function(game){ return game.storage.hasKey('baronKilled') },
			"text": [
				"The Baron is dead, yes...",
				"But what about the Princess?",
				"Do you think she's in another dungeon?",
				"I think there's a dungeon in the mines.",
				"Go!"				
			]},
			{"condition": function(game){ return !game.inventoryContains(Types.Entities.WARDEN);  },
			"text": [
				"The Princess?",
				"Hmmm... maybe I've seen her...",
				"or maybe not.",
				"Maybe I ate her...",
				"or maybe not.",
				"Go ask the Fairy Queen.",
				"She loves these storybook quests."
			]},
			{"condition": function(game){ if(game.inventoryContains(Types.Entities.WARDEN)){ return true; }else{ return false; } },
			"text": [
				"So the Fairy Queen has made you her errand boy?",
				"And I thought you were a warrior.",
				"How silly of me.",
				"Run along now, errand boy."
			]},
        ],
        
		"vendor1": [
        	{"text": [
				"index 0. conditions supported only on index 1 and higher"
			]},
            {"condition": function(game){  game.showStore(); return true; },
			 "text": [
				""
			]},
        ],

		"vendor2": [
        	{"text": [
				""
			]},
            {"condition": function(game){  game.showCrystalStore(); return true; },
			 "text": [
				""
			]},
        ],

		"vendor3": [
        	{"text": [
				""
			]},
            {"condition": function(game){  game.showStore(); return true; },
			 "text": [
				""
			]},
        ],

		"vendor4": [
        	{"text": [
				""
			]},
            {"condition": function(game){  game.showStore(); return true; },
			 "text": [
				""
			]},
        ],
        
		"morty": [
        	{"text": [
				"Red pill?"
			]},
            {"condition": function(game){  if (game.app.guestPlay) return false; game.showRemortDialog(); return true; },
			 "text": [
				""
			]},
            {"condition": function(game){  if (game.app.guestPlay) return true; },
			 "text": [
				"You must be logged in to remort my friend."
			]},            
        ],        
		
		"witchesson": [
            {"text": [//default
				"Derp derp derp."
			]},
			{"condition": function(game){ return game.storage.hasKey('savedPrincess') },
			"text": [
				"Sword?",
				"Derp derp derp.",
				"Down the rabbit hole!",
				"Derp derp derp.",
				"Hide in the hole.",
				"Derp derp derp.",
				"You never find."
			]},
        ],
		
		"dwarf1": [
            {"text": [//default
				"Pull that lever to open the door."
			]}
        ],
		
		"dwarf3": [
            {"condition": function(game){  return !game.storage.hasKey('baronKilled') },
			 "text": [
				"Welcome to the Kingdom of the Dwarves!",
				"Please stay a while.",
				"My niece will soon marry the Baron,",
				"and his wealth will help restore my kingdom.",
				"It is a joyous day!"
			]},
			{"condition": function(game){  return game.storage.hasKey('baronKilled') && game.client.sendKey(41) },
			 "text": [
				"Fine, fine! I'll stop the wedding.",
				"Listen! I saw Baron's henchmen going into the mines.",
				"Here's the key to the mines.",
				"I think they're up to something not good!"
			]}
           
        ],
		

		"dwarf5": [
			{"text": [//default
				"doesn't work without this?"
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 1)/*blacksmith npc palceholder dwarf5 */{
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"I'm worried sick about the princess.",
				"I'd make some better armor for you, but I lost my tools.",
				"Go find my scissors and hammer, and then I will help you.",
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 2)/*real dialog of dwarf5 */{
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"Thank you *name*!",
				"But the princess is in another dungeon!"
			]},
			{"condition": function(game){
				var dialog = game.playerDialogArea();
				if(dialog && dialog.num == 3)/*treasure hunter placeholder of dwarf5 */{
					return true;
				}else{
					return false;
				}	
			},
			"text":[
				"I lost my lucky items while digging some treasures.",
				"Would you mind finding my lost items?",
				"Find my four leaf clover, rabbit's foot, golden coin and my lucky teapot!.",
				"I'll give you my key for my hidden door behind me.",
			]}
			
		],
		
		"dwarf8": [
			{"condition": function(game){  return !game.storage.hasKey('baronKilled') },
			 "text": [
				"Are you really a hero?",
				"Please! You must help me!",
				"My parents have promised me to the Baron.",
				"Soon we will be married,",
				"but he is a terrible man!",
				"Please, go to his mansion and see for yourself.",
			]},
			{"condition": function(game){  return game.storage.hasKey('baronKilled') },
			 "text": [
				"You saw what?!",
				"Quickly, go tell the Dwarven King what you saw!",
				"Then he will stop this insane marriage."
			]}
           
        ],
		
    };

    var Npc = Character.extend({
        init: function(id, kind) {
            this._super(id, kind, 1);
            this.itemKind = Types.getKindAsString(this.kind);
            if(typeof NpcTalk[this.itemKind][0] === 'string'){
				this.discourse = -1;
				this.talkCount = NpcTalk[this.itemKind].length;
			}
			else{
				this.discourse = 0;
				this.talkCount = NpcTalk[this.itemKind][this.discourse]["text"].length;
			}
            this.talkIndex = 0;
        },
        
        selectTalk: function(game){
			var change = false;
			if(this.discourse != -1){
				var found = false;
				for(var i = 1; !found && i<NpcTalk[this.itemKind].length; i++){
					if(NpcTalk[this.itemKind][i]["condition"](game)){
						if(this.discourse != i){
							change = true;
							this.discourse = i;
							this.talkCount = NpcTalk[this.itemKind][this.discourse]["text"].length;
						}
						found = true;
					}
				}
				if(!found){
					if(this.discourse != 0){
						change = true;
						this.discourse = 0;
						this.talkCount = NpcTalk[this.itemKind][this.discourse]["text"].length;
					}
				}
			}
			return change;
		},

        talk: function(game) {
            var msg = "";

            if(this.selectTalk(game) || (this.talkIndex > this.talkCount) ){
                this.talkIndex = 0;
            }
            if(this.talkIndex < this.talkCount) {
				if(this.discourse == -1){
					msg = NpcTalk[this.itemKind][this.talkIndex];
				}
				else{
					msg = NpcTalk[this.itemKind][this.discourse]["text"][this.talkIndex];
				}
            }
            this.talkIndex += 1;

            return msg.replace('*name*',game.player.name);
        }
    });

    return Npc;
});
