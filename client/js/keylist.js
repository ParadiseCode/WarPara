define(function() {
// Hi, ask Matt to add keys (this file will be removed soon)
var Keylist = 
[
	[{
		id: 1,
		name: "Courtyard Key",
		world: "centralarea",
		type: "1g",
		desc: "Talk to the queen for the first time."
	}],
	[{
		id: 2,
		name: "Princess Room Key",
		world: "centralarea",
		type: "1g",
		desc: "Talk to the queen after saving the princess."
	}],
	[{
		id: 3,
		name: "Dungeon 1 Entrance Key",
		world: "dungeon1",
		type: "1g",
		desc: "Talk to dungeon 1 guard and finish the quest."
	}],
	[{
		id: 4,
		name: "Dungeon 1 Boss Key",
		world: "dungeon1",
		type: "1g",
		desc: "Talk to dungeon 1 guard and finish the quest."
	}],
	[{
		id: 5,
		name: "1st Key of Dungeon 1",
		world: "dungeon1",
		type: "1g",
		desc: ""
	}],
	[{
		id: 6,
		name: "2nd Key of Dungeon 1",
		world: "dungeon1",
		type: "1g",
		desc: ""
	}],
	[{
		id: 7,
		name: "Sick Person's Room Key",
		world: "Forest",
		type: "1g",
		desc: "Finish Sick Person Quest."
	}],
	[{
		id: 8,
		name: "1st Key of Forest",
		world: "Forest",
		type: "1g",
		desc: ""
	}],
	[{
		id: 9,
		name: "2nd Key of Forest",
		world: "Forest",
		type: "1g",
		desc: ""
	}],
	[{
		id: 10,
		name: "3rd Key of Forest",
		world: "Forest",
		type: "1g",
		desc: ""
	}],
	[{
		id: 11,
		name: "4th Key of Forest",
		world: "Forest",
		type: "1g",
		desc: ""
	}],
	[{
		id: 12,
		name: "Dungeon 2 Entrance Key",
		world: "dungeon2",
		type: "1g",
		desc: "Talk to dungeon 2 guard and finish the quest."
	}],
	[{
		id: 13,
		name: "Dungeon 2 Boss Key",
		world: "dungeon2",
		type: "1g",
		desc: "Talk to dungeon 2 guard and finish the quest."
	}],
	[{
		id: 14,
		name: "1st Key of Dungeon 2",
		world: "dungeon2",
		type: "1g",
		desc: ""
	}],
	[{
		id: 15,
		name: "2nd Key of Dungeon 2",
		world: "dungeon2",
		type: "1g",
		desc: ""
	}],
	[{
		id: 16,
		name: "3rd Key of Dungeon 2",
		world: "dungeon2",
		type: "1g",
		desc: ""
	}],
	[{
		id: 17,
		name: "4th Key of Dungeon 2",
		world: "dungeon2",
		type: "1g",
		desc: ""
	}],
	[{
		id: 18,
		name: "Treasure Hunter's Stash Room Key",
		world: "Desert",
		type: "1g",
		desc: "Finish Collect Lucky Item Quest"
	}],
	[{
		id: 19,
		name: "1st Key of Desert",
		world: "Desert",
		type: "1g",
		desc: ""
	}],
	[{
		id: 20,
		name: "2nd Key of Desert",
		world: "Desert",
		type: "1g",
		desc: ""
	}],
	[{
		id: 21,
		name: "3rd Key of Desert",
		world: "Desert",
		type: "1g",
		desc: ""
	}],
	[{
		id: 22,
		name: "4th Key of Desert",
		world: "Desert",
		type: "1g",
		desc: ""
	}],
	[{
		id: 23,
		name: "Dungeon 3 Entrance Key",
		world: "dungeon3",
		type: "1g",
		desc: "Talk to dungeon 3 guard and finish the quest."
	}],
	[{
		id: 24,
		name: "Dungeon 3 Boss Key",
		world: "dungeon3",
		type: "1g",
		desc: "Talk to dungeon 3 guard and finish the quest."
	}],
	[{
		id: 25,
		name: "1st Key of Dungeon 3",
		world: "dungeon3",
		type: "1g",
		desc: ""
	}],
	[{
		id: 26,
		name: "2nd Key of Dungeon 3",
		world: "dungeon3",
		type: "1g",
		desc: ""
	}],
	[{
		id: 27,
		name: "3rd Key of Dungeon 3",
		world: "dungeon3",
		type: "1g",
		desc: ""
	}],
	[{
		id: 28,
		name: "4th Key of Dungeon 3",
		world: "dungeon3",
		type: "1g",
		desc: ""
	}],
	[{
		id: 29,
		name: "Chimaera Key",
		world: "fairyland",
		type: "1g",
		desc: "Finish Hunting Chimaera Quest"
	}],
	[{
		id: 30,
		name: "1st Key of Fairyland",
		world: "fairyland",
		type: "1g",
		desc: ""
	}],
	[{
		id: 31,
		name: "2nd Key of Fairyland",
		world: "fairyland",
		type: "1g",
		desc: ""
	}],
	[{
		id: 32,
		name: "3rd Key of Fairyland",
		world: "fairyland",
		type: "1g",
		desc: ""
	}],
	[{
		id: 33,
		name: "4th Key of Fairyland",
		world: "fairyland",
		type: "1g",
		desc: ""
	}],
	[{
		id: 34,
		name: "Dungeon 4 Entrance Key",
		world: "dungeon4",
		type: "1g",
		desc: "Talk to dungeon 4 guard and finish the quest."
	}],
	[{
		id: 35,
		name: "Dungeon 4 Boss Key",
		world: "dungeon4",
		type: "1g",
		desc: "Talk to dungeon 4 guard and finish the quest."
	}],
	[{
		id: 36,
		name: "1st Key of Dungeon 4",
		world: "dungeon4",
		type: "1g",
		desc: ""
	}],
	[{
		id: 37,
		name: "2nd Key of Dungeon 4",
		world: "dungeon4",
		type: "1g",
		desc: ""
	}],
	[{
		id: 38,
		name: "3rd Key of Dungeon 4",
		world: "dungeon4",
		type: "1g",
		desc: ""
	}],
	[{
		id: 39,
		name: "1st Key of Baron's Valley",
		world: "baronsvalley",
		type: "1g",
		desc: ""
	}],
	[{
		id: 40,
		name: "Wizard's Room Key",
		world: "baronsvalley",
		type: "1g",
		desc: "Finish Collect Horror Books"
	}],
	[{
		id: 41,
		name: "Dungeon 5 Entrance Key",
		world: "dungeon5",
		type: "1g",
		desc: "Talk to dungeon 5 guard and finish the quest."
	}],
	[{
		id: 42,
		name: "Dungeon 5 Boss Key",
		world: "dungeon5",
		type: "1g",
		desc: "Talk to dungeon 5 guard and finish the quest."
	}],
	[{
		id: 43,
		name: "1st Key of Dungeon 5",
		world: "dungeon5",
		type: "1g",
		desc: ""
	}],
	[{
		id: 44,
		name: "2nd Key of Dungeon 5",
		world: "dungeon5",
		type: "1g",
		desc: ""
	}],
	[{
		id: 45,
		name: "Key to the Armory",
		world: "dungeon5",
		type: "1g",
		desc: ""
	}],
	[{
		id: 46,
		name: "3rd Key of Dungeon 5",
		world: "dungeon5",
		type: "1g",
		desc: "one of the 3 keys for 1 door"
	}],
	[{
		id: 47,
		name: "4th Key of Dungeon 5",
		world: "dungeon5",
		type: "1g",
		desc: "one of the 3 keys for 1 door"
	}],
	[{
		id: 48,
		name: "5th Key of Dungeon 5",
		world: "dungeon5",
		type: "1g",
		desc: "one of the 3 keys for 1 door"
	}],
	[{
		id: 49,
		name: "6th Key of Dungeon 5",
		world: "dungeon5",
		type: "1g",
		desc: ""
	}],
	[{
		id: 50,
		name: "7th Key of Dungeon 5",
		world: "dungeon5",
		type: "1g",
		desc: ""
	}],
	[{
		id: 51,
		name: "8th Key of Dungeon 5",
		world: "dungeon5",
		type: "1g",
		desc: ""
	}],
	[{
		id: 52,
		name: "9th key of Dungeon 5",
		world: "dungeon5",
		type: "1g",
		desc: ""
	}],
	[{
		id: 53,
		name: "Key to Dungeon 5 Prison Cell",
		world: "dungeon5",
		type: "1g",
		desc: ""
	}],
	[{
		id: 54,
		name: "1st Key of Dwarven Kingdom",
		world: "dwarvenkingdom",
		type: "1g",
		desc: ""
	}],
	[{
		id: 55,
		name: "Key to Mines 1 and 2",
		world: "dwarvenkingdom",
		type: "1g",
		desc: "Kill Baron Quest"
	}],
	[{
		id: 56,
		name: "Key to Armor Shop",
		world: "dwarvenkingdom",
		type: "1g",
		desc: "Finish Deliver Bombs Quest"
	}],
	[{
		id: 57,
		name: "2nd Key of Dwarven Kingdom",
		world: "dwarvenkingdom",
		type: "1g",
		desc: ""
	}],
	[{
		id: 58,
		name: "Dungeon 6 Entrance Key",
		world: "dungeon6",
		type: "1g",
		desc: "Talk to dungeon 6 guard and finish the quest."
	}],
	[{
		id: 59,
		name: "Dungeon 6 Boss Key",
		world: "dungeon6",
		type: "1g",
		desc: "Talk to dungeon 6 guard and finish the quest."
	}],
	[{
		id: 60,
		name: "1st Key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 61,
		name: "2nd Key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 62,
		name: "3rd key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 63,
		name: "4th Key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 64,
		name: "5th Key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 65,
		name: "6th Key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 66,
		name: "7th Key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 67,
		name: "8th Key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 68,
		name: "9th Key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 69,
		name: "10th Key of Dungeon 6",
		world: "dungeon6",
		type: "1g",
		desc: ""
	}],
	[{
		id: 70,
		name: "Ghost Castle Key",
		world: "GhostRealm",
		type: "1g",
		desc: "Finish Ghost King Request Quest"
	}],
	[{
		id: 71,
		name: "Dungeon 7 Entrance Key",
		world: "dungeon7",
		type: "1g",
		desc: "Talk to dungeon 7 guard and finish the quest."
	}],
	[{
		id: 72,
		name: "Dungeon 7 Boss Key",
		world: "dungeon7",
		type: "1g",
		desc: "Talk to dungeon 7 guard and finish the quest."
	}],
	[{
		id: 73,
		name: "1st Key of Dungeon 7",
		world: "dungeon7",
		type: "1g",
		desc: ""
	}],
	[{
		id: 74,
		name: "2nd Key of Dungeon 7",
		world: "dungeon7",
		type: "1g",
		desc: ""
	}],
	[{
		id: 75,
		name: "3rd Key of Dungeon 7",
		world: "dungeon7",
		type: "1g",
		desc: ""
	}],
	[{
		id: 76,
		name: "4th Key of Dungeon 7",
		world: "dungeon7",
		type: "1g",
		desc: ""
	}],
	[{
		id: 77,
		name: "5th Key of Dungeon 7",
		world: "dungeon7",
		type: "1g",
		desc: ""
	}],
	[{
		id: 78,
		name: "6th Key of Dungeon 7",
		world: "dungeon7",
		type: "1g",
		desc: ""
	}],
	[{
		id: 79,
		name: "7th Key of Dungeon 7",
		world: "dungeon7",
		type: "1g",
		desc: ""
	}],
	[{
		id: 80,
		name: "8th Key of Dungeon 7",
		world: "dungeon7",
		type: "1g",
		desc: ""
	}],
	[{
		id: 81,
		name: "1st Key of Beach",
		world: "beach",
		type: "1g",
		desc: ""
	}],
	[{
		id: 82,
		name: "2nd Key of Beach",
		world: "beach",
		type: "1g",
		desc: ""
	}],
	[{
		id: 83,
		name: "3rd Key of Beach",
		world: "beach",
		type: "1g",
		desc: "Finish MonkeyTag Quest"
	}],
	[{
		id: 84,
		name: "Dungeon 8 Entrance Key",
		world: "dungeon8",
		type: "1g",
		desc: "Talk to dungeon 8 guard and finish the quest."
	}],
	[{
		id: 85,
		name: "Dungeon 8 Boss Key",
		world: "dungeon8",
		type: "1g",
		desc: "Talk to dungeon 8 guard and finish the quest."
	}],
	[{
		id: 86,
		name: "1st Key of Dungeon 8",
		world: "dungeon8",
		type: "1g",
		desc: ""
	}],
	[{
		id: 87,
		name: "2nd Key of Dungeon 8",
		world: "dungeon8",
		type: "1g",
		desc: ""
	}],
	[{
		id: 88,
		name: "3rd Key of Dungeon 8",
		world: "dungeon8",
		type: "1g",
		desc: ""
	}]
];
return Keylist;
});