var fs = require('fs');
var ProductionConfig = require('./productionconfig');
var _ = require('underscore');
var MobList = require("../../shared/js/mobManager");
var ServerStat = require("./serversStatistic");

function main(config) {
    var Log = require('log');

	console.info('                                            ');
	console.info('  __  _   __  _   __  __            _   __  ');
	console.info(' /__)/_| /__)/_| / _ /  )/| ) (   //_| /__) ');
	console.info('/   (  |/ ( (  |(__)(__// |/  |/|/(  |/ (   ');
    console.info('                                            ');
	
    switch(config.debug_level) {
        case "error":
            log = new Log(Log.ERROR); break;
        case "debug":
            log = new Log(Log.DEBUG); break;
        case "info":
            log = new Log(Log.INFO); break;
    };

    var production_config = new ProductionConfig(config);
    if(production_config.inProduction()) {
        _.extend(config, production_config.getProductionSettings());
    }

    var ws               = require("./ws");
    var WorldServer      = require("./worldserver");
    var server           = new ws.WebsocketServer(config.port, config.use_one_port, config.ip);
    var worlds           = [];
    var DatabaseSelector = require("./databaseselector");
 
    log.info("Starting game server... ");
    var selector = DatabaseSelector(config);
    databaseHandler = new selector(config);
	databaseHandler.deleteAllGuests();

    server.onConnect(function(connection) {
        var newPlayer = new Player(connection, worlds, 0, databaseHandler);             
        newPlayer.server.connect_callback(newPlayer);        
    });

    server.onError(function() {
        log.error(Array.prototype.join.call(arguments, ", "));
    });

    var onPopulationChange = function(player) {
        var total = 0;
        _.each(worlds, function(world) {
            total += world.playerCount;
        });

        ServerStat.addPlayer(player, function() {
            _.each(worlds, function(world) {
                world.updatePopulation(total);
            });
        });
    };

    var onPopulationDecrease = function(player) {
        var total = 0;
        _.each(worlds, function(world) {
            total -= world.playerCount;
        });

        ServerStat.removePlayer(player, function() {
            _.each(worlds, function(world) {
                world.updatePopulation(total);
            });
        });
    };

    loadEndCallback = function(){
        for (var mapName in config.maps) {
            var world = new WorldServer(mapName, config.nb_players_per_world, server, databaseHandler, ServerStat);

            world.run(config.maps[mapName]);
            worlds.push(world);

            world.onPlayerAdded(onPopulationChange);
            world.onPlayerRemoved(onPopulationDecrease);

        }

        server.onRequestStatus(function() {
            return JSON.stringify(getWorldDistribution(worlds)) + JSON.stringify(getWorldIds(worlds)) + ' Build:'+ buildNo;
        });

        process.on('uncaughtException', function (e) {
            // Display the full error stack, to aid debugging
            log.error('uncaughtException: ' + e.stack);
        });
    };

    databaseHandler.loadMobs(loadEndCallback);
}

function getWorldDistribution(worlds) {
    var distribution = [];

    _.each(worlds, function(world) {
        distribution.push(world.playerCount);
    });
    return distribution;
}

function getWorldIds(worlds) {
    var ids = [];

    _.each(worlds, function(world) {
        ids.push(world.id);
    });
    return ids;
}

function getConfigFile(path, callback) {
    fs.readFile(path, 'utf8', function(err, json_string) {
        if(err) {
            console.info("This server can be customized by creating a configuration file named: " + err.path);
            callback(null);
        } else {
            callback(JSON.parse(json_string));
        }
    });
}

var defaultConfigPath = './server/config.json';
var customConfigPath = './server/config_local.json';

process.argv.forEach(function (val, index, array) {
    if(index === 2) {
        customConfigPath = val;
    }
});

getConfigFile(defaultConfigPath, function(defaultConfig) {
    getConfigFile(customConfigPath, function(localConfig) {
        if(localConfig) {
            main(localConfig);
        } else if(defaultConfig) {
            main(defaultConfig);
        } else {
            console.error("Server cannot start without any configuration file.");
            process.exit(1);
        }
    });
});
