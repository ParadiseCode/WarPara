var fs = require("fs"),
    _ = require('underscore'),
    Types = require("../../shared/js/gametypes");

var map, mode;
var collidingTiles = {};
var staticEntities = {};
var mobsFirstGid = -1;

var isNumber = function(o) {
    return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
};

module.exports = function processMap(json, options) {
    var self = this, TiledJSON = json;
    var layerIndex = 0, tileIndex = 0;
    var INTERACTIVE_LAYERS = ["newmobs", "equipement", "mobs", 'envirements', 'questitems'];

    var staticTileId = 0;
    var TILE_SIZE = 16; // tile 16 X 16

    map = {
        width: 0,
        height: 0,
        collisions: [],
        doors: [],
		keys: [],
        checkpoints: [],
		lockedDoors: []
    };
    mode = options.mode;
    
    if(mode === "client") {
        map.data = [];
        map.high = [];
        map.hidden = []; // sparse
        map.animated = {};
        map.blocking = [];
        map.plateau = [];
        map.musicAreas = [];
		map.dialogAreas = [];
    }
    if(mode === "server") {
        map.roamingAreas = [];
        map.chestAreas = [];
        map.staticChests = [];
        map.staticTraps = [];
        map.emitters = [];
        map.levers = [];
        map.staticEntities = {};
    }

    console.log("Processing map info...");
    map.width = TiledJSON.width;
    map.height = TiledJSON.height;
    map.tilesize = TiledJSON.tilewidth;
    console.log("Map is [" + map.width + "x" + map.height + "] Tile Size: " + map.tilesize);

    // Tile properties (collision, z-index, animation length...)
    var handleTileProp = function(propName, propValue, tileId) {
        if(propName === "c") {
            collidingTiles[tileId] = true;
        }
        
        if(mode === "client") {
            if(propName === "v") {
                map.high.push(tileId);
            }
            if(propName === "length") {
                if(!map.animated[tileId]) {
                    map.animated[tileId] = {};
                }
                map.animated[tileId].l = propValue;
            }
            if(propName === "delay") {
                if(!map.animated[tileId]) {
                    map.animated[tileId] = {};
                }
                map.animated[tileId].d = propValue;
            }
        }
    }

    // iterate through tilesets and process
    console.log("* Phase 1 Tileset Processing")
    if (TiledJSON.tilesets instanceof Array) {
        _.each(TiledJSON.tilesets, function(tileset) {
            var tileSetName = tileset.name.toLowerCase();

            if (tileSetName === "tilesheet") {
                console.log("** Processing map tileset properties...");

                // iterate through tileset tile properties
                _.each(tileset.tileproperties, function(value, name) {
                    var tileId = parseInt(name, 10) + 1;
                    //console.log("*** Processing Tile ID " + tileId);

                    // iterate through individual properties
                    _.each(value, function(value, name) {
                        handleTileProp(name, (isNumber(parseInt(value, 10))) ? parseInt(value, 10) : value, tileId);
                    });
                });
            }
            else if (_.contains(INTERACTIVE_LAYERS, tileSetName) && mode === "server") { // is tileset mobs or item

                if(tileSetName === INTERACTIVE_LAYERS[0])
                    mobsFirstGid = tileset.firstgid;

                console.log("** Processing static entity properties tileSetName: " + tileSetName);

                // iterate through tileset tile properties
                console.log("Tiles: " +staticTileId+ " + staticTileId");

                var tileCountOnSet = Math.floor(tileset.imagewidth / TILE_SIZE) * Math.floor(tileset.imageheight / TILE_SIZE);

                _.each(tileset.tileproperties, function(value, name) {
                    var tileId = parseInt(name, 10) + 1 + staticTileId;
                    console.log("*** Processing Entity ID " + tileId + " type " + value.type + "name: "+name);
                    var isMob            = value.type.substr(0, 4) === "Mob_";  // temporary solution, wait when all items was add in mongo
                    var isCollectionItem = Types.isCollectionItem(value.type); // temporary solution, wait when all items was add in mongo
                    if (Types.getKindFromString(value.type) || isMob || isCollectionItem)
                        staticEntities[tileId] = value.type;
                });
                staticTileId += tileCountOnSet;
            }
        });
    } else {
        console.log("A tileset is missing");
    }

    // iterate through layers and process
    console.log("* Phase 2 Layer Processing");
    _.each(TiledJSON.layers, function(layer) {
        var layerName = layer.name.toLowerCase();
        var layerType = layer.type;

        // Door Layers
        if (layerName === "doors" && layerType === "objectgroup") {
            console.log("** Processing doors...");
            var doors = layer.objects;

            // iterate through the doors
            for (var j = 0; j < doors.length; j += 1) {
                map.doors[j] = {
                    x: doors[j].x / map.tilesize,
                    y: doors[j].y / map.tilesize,
                    p: (doors[j].type === 'portal') ? 1 : 0,
                    k: (typeof doors[j].properties.k == 'undefined') ? 0 : doors[j].properties.k,
                    keyitem: (typeof doors[j].properties.keyitem == 'undefined') ? 0 : Types.getKindFromString(doors[j].properties.keyitem)
                }

                // iterate through the door properties
                var doorProperties = doors[j].properties;
                _.each(doorProperties, function(value, name) {
                    map.doors[j]['t'+name] = (isNumber(parseInt(value, 10))) ? parseInt(value, 10) : value;
                });
            }
        }
        // Roaming Mob Areas
        else if (layerName === "roaming" && layerType === "objectgroup" && mode == "server") {
            console.log("** Processing roaming mob areas...");
            var areas = layer.objects;

            // iterate through areas
            var index = 0;
            for (var j = 0; j < areas.length, area = areas[j]; j++) {
                if(area.properties)
                    var nb = parseInt(area.properties.nb, 10);
                var polylines = area.polyline;
                for (var i in polylines){
                    var poly = polylines[i];
                    poly.x = Math.round(poly.x / map.tilesize);
                    poly.y = Math.round(poly.y / map.tilesize);
                }

                var members = [];
                if (area.properties.members)
                    members = area.properties.members.split(', ');

                map.roamingAreas[index] = {
                    id: index,
                    x: Math.floor(area.x / map.tilesize),
                    y: Math.floor(area.y / map.tilesize),
                    polylines: polylines,
                    width: Math.floor(area.width / map.tilesize),
                    height: Math.floor(area.height / map.tilesize),
                    members: members,
                    type: area.type,
                    nb: nb
                };
                index++;
            }
        }
        // Chest Areas
        else if (layerName === "chestareas" && mode === "server") {
            console.log("** Processing chest areas...");
            var areas = layer.objects;

            // iterate through areas
            _.each(areas, function(area) {
                var chestArea = {
                    x: area.x / map.tilesize,
                    y: area.y / map.tilesize,
                    w: area.width / map.tilesize,
                    h: area.height / map.tilesize
                };

                // get items
                chestArea['i'] = _.map(area.properties.items.split(','), function(name) {
                    return Types.getKindFromString(name);
                });

                // iterate through remaining area's properties
                _.each(area.properties, function(value, name) {
                    if (name !== 'items') {
                        chestArea['t'+name] = (isNumber(parseInt(value, 10))) ? parseInt(value, 10) : value;
                    }
                });

                map.chestAreas.push(chestArea);
            });
        }
        // Static Chests
        else if (layerName === "chests" && mode === "server") {
            console.log("** Processing static chests...");
            var chests = layer.objects;

            // iterate through the static chests
            _.each(chests, function(chest) {
                var newChest = {
                    x: chest.x / map.tilesize,
                    y: chest.y / map.tilesize,
                    i: null,
                    chanceItems: null,
                    dropChance: null

                }

                // get items
                /**
                 * semantic from tiled: items  firespell,icespell
                 * (can be dropped 1 item)
                 */
                if (chest.properties.items)
                    newChest['i'] = _.map(chest.properties.items.split(','), function(name) {
                        return Types.getKindFromString(name);
                    });

                /**
                 * semantic from tiled: dropChance  firespell 10%,icespell 20%
                 * firespell can drops with 10% chance and icespell 20% chance
                 * (can be dropped 2 items)
                 */
                if (chest.properties.dropChance)
                    newChest['chanceItems'] = _.map(chest.properties.dropChance.split(','), function(name) {
                        var item = name.split(' ');
                        var id = Types.getKindFromString(item[0]);
                        /** remove symbol % from int */
                        var chanceItem = parseInt(item[1].replace('%',''));
                        return {id: id, chance: chanceItem};
                    });

                /**
                 * semantic from tiled: dropChance  firespell 10%,icespell 90%
                 * firespell can drops with 10% chance and icespell 90% chance
                 * (can be dropped 1 item)
                 */
                if (chest.properties.summaryDrop)
                    newChest['summaryDrop'] = _.map(chest.properties.summaryDrop.split(','), function(name) {
                        var item = name.split(' ');
                        var id = Types.getKindFromString(item[0]);
                        /** remove symbol % from int */
                        var chanceItem = parseInt(item[1].replace('%',''));
                        return {id: id, chance: chanceItem};
                    });

                map.staticChests.push(newChest);
            });
        }
        // Traps
        else if (layerName === "traps" && mode === "server") {
            console.log("** Processing static traps...");
            var traps = layer.objects;

            // iterate through the static chests
            _.each(traps, function(trap) {
                var newTrap = {
                    x: trap.x / map.tilesize,
                    y: trap.y / map.tilesize
                }

                map.staticTraps.push(newTrap);
            });
        }
		// Levers
        else if (layerName === "levers" && mode === "server") {
            console.log("** Processing levers...");
            var levers = layer.objects;

            // iterate through the levers
            _.each(levers, function(lever) {
                var newLever = {
                    x: lever.x / map.tilesize,
                    y: lever.y / map.tilesize,
					s: lever.properties.state,
					c: lever.properties.connection
                }
				if(lever.properties.hasOwnProperty('time')){
					newLever.t = lever.properties.time;
				}

                map.levers.push(newLever);
            });
        }
        // Emitters
        else if (layerName === "emitters" && mode === "server") {
            console.log("** Processing emitters...");
            var emitters = layer.objects;
            _.each(emitters, function(emitter) {
                var newEmitter = {
                    p: emitter.type,
                    f: emitter.properties.frequency,
                    sx: emitter.x + emitter.polyline[0].x,
                    sy: emitter.y + emitter.polyline[0].y,
                    tx: emitter.x + emitter.polyline[1].x,
                    ty: emitter.y + emitter.polyline[1].y,
                }
                map.emitters.push(newEmitter);
            });
        }        
		// Locked Doors
        else if (layerName === "lockeddoors") {
            console.log("** Processing locked doors...");
            var ldoors = layer.objects;
			console.log('LDOORS DATA '+ldoors);

            // iterate through the locked doors
            _.each(ldoors, function(ldoor) {
				console.log('LDOOR DATA '+ldoor);
                var newLockedDoor = {
                    x: ldoor.x / map.tilesize,
                    y: ldoor.y / map.tilesize,
					c: ldoor.properties.connection,
					o: ldoor.properties.direction
                }

                map.lockedDoors.push(newLockedDoor);
            });
        }
		// key objects
        else if (layerName === "keys") {
            console.log("** Processing keys...");
            var keys = layer.objects;
			console.log('KEYS DATA '+keys);

            // iterate through the keys
            _.each(keys, function(key) {
				console.log('KEY DATA '+key);
				if(mode === "client") {
					var newKey = {
						x: key.x / map.tilesize,
						y: key.y / map.tilesize,
						k: key.properties.k,
						m: key.properties.m
					}
				}else{
					var newKey = {
						x: key.x / map.tilesize,
						y: key.y / map.tilesize
					}
				}

                map.keys.push(newKey);
            });
        }
        // Music Trigger Areas
        else if (layerName === "music" && mode === "client") {
            console.log("** Processing music trigger areas...");
            var areas = layer.objects;

            // iterate through the music areas
            _.each(areas, function(music) {
                var musicArea = {
                    x: music.x / map.tilesize,
                    y: music.y / map.tilesize,
                    w: music.width / map.tilesize,
                    h: music.height / map.tilesize,
                    id: music.properties.id
                };

                map.musicAreas.push(musicArea);
            });
        }
		// npc Dialog Trigger Areas
        else if (layerName === "dialog" && mode === "client") {
            console.log("** Processing dialog trigger areas...");
            var areas = layer.objects;

            // iterate through the dialog areas
            _.each(areas, function(dialog) {
                var dialogArea = {
                    x: dialog.x / map.tilesize,
                    y: dialog.y / map.tilesize,
                    w: dialog.width / map.tilesize,
                    h: dialog.height / map.tilesize,
                    id: dialog.properties.id
                };
				if(dialog.properties.autostart){
					dialogArea.auto = 1;
				}

                map.dialogAreas.push(dialogArea);
            });
        }
        // Map Checkpoints
        else if (layerName === "checkpoints") {
            console.log("** Processing map checkpoints...");
            var checkpoints = layer.objects;
            var count = 0;

            // iterate through the checkpoints
            _.each(checkpoints, function(checkpoint) {
                var cp = {
                    id: ++count,
                    x: checkpoint.x / map.tilesize,
                    y: checkpoint.y / map.tilesize,
                    w: checkpoint.width / map.tilesize,
                    h: checkpoint.height / map.tilesize
                };

                if (mode === "server") {
                    cp.s = checkpoint.type ? 1 : 0;
                }

                map.checkpoints.push(cp);
            });
        }
    });

    // iterate through remaining layers
    console.log("* Phase 3 Tile Map Processing");
    for(var i = TiledJSON.layers.length - 1; i >= 0; i -= 1) {
        processLayer(TiledJSON.layers[i]);
    }

    if(mode === "client") {
        console.log("* Phase 4 Map Data Fixup");

        // set all undefined tiles to 0
        for (var i = 0, max = map.data.length; i < max; i += 1) {
            if(!map.data[i]) {
                map.data[i] = 0;
            }
        }
    }

    return map;
};

var processLayer = function(layer) {
    var layerName = layer.name.toLowerCase();
    var layerType = layer.type;
    console.log("** Processing layer: " + layerName);

    if (mode === "server" && layerName === "entities") {
        console.log("*** Processing positions of static entities...");
        var tiles = layer.data;

        for(var j = 0; j < tiles.length; j += 1) {
            var gid = tiles[j] - mobsFirstGid + 1;
            if(gid && gid > 0) {
                map.staticEntities[j] = staticEntities[gid];
                console.log("--staticEntities: " + map.staticEntities[j] + " gid: " + gid + "stat: "+staticEntities[gid]);
                //if(staticEntities[gid] == "healthpotion1") console.log("--staticEntities: " + map.staticEntities[j] + " gid: " + gid + "stat: "+staticEntities[gid]);
            }
        }
    }

    var tiles = layer.data;
    if(mode === "client" && layerName === "blocking") {
        console.log("*** Processing blocking tiles...");

        for(var i = 0; i < tiles.length; i += 1) {
            var gid = tiles[i];
            if(gid && gid > 0) {
                map.blocking.push(i);
            }
        }
    }
    else if(mode === "client" && layerName === "plateau") {
        console.log("*** Processing plateau tiles...");
        for(var i = 0; i < tiles.length; i += 1) {
            var gid = tiles[i];

            if(gid && gid > 0) {
                map.plateau.push(i);
            }
        }
    }
    else if(layerName === "hiddendoors") {
        console.log("*** Process hiddendoors layer data...");
        for(var j = 0; j < tiles.length; j += 1) {
            var gid = tiles[j];

            if(mode === "client") {
                if(gid > 0) {
                    var x = j % map.width;
                    var y = Math.floor(j / map.width);
                    map.hidden.push({
                        x: x,
                        y: y,
                        gid: gid
                    });
                }
            }

        }
    }
    else if(layerType == "tilelayer" && layerName !== "entities") {
        console.log("*** Process raw layer data...");
        for(var j = 0; j < tiles.length; j += 1) {
            var gid = tiles[j];

            if(mode === "client") {
                // set tile gid in the tilesheet
                if(gid > 0) {
                    if(map.data[j] === undefined) {
                        map.data[j] = gid;
                    }
                    else if(map.data[j] instanceof Array) {
                        map.data[j].unshift(gid);
                    }
                    else {
                        map.data[j] = [gid, map.data[j]];
                    }
                }
            }

            // colliding tiles
            if(gid in collidingTiles) {
                map.collisions.push(j);
            }
        }
    }
}

