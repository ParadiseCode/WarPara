#!/usr/bin/env node

var util = require('util'),
    path = require("path"),
    fs = require("fs"),
    file = require("../../shared/js/file"),
    MobList = require("../../shared/js/mobManager"),
    processMap = require('./processmap');
    
var source = process.argv[2],
    mode = process.argv[3],
    destination = process.argv[4];

var maps = [];
var counterMaps = 0;

if(!mode){
	mode = "direct";
}

if(source == "allMaps") mode ="allMaps";

if(mode != "allMaps")
if((!source || (mode!="direct" && mode!="both" && mode!="client" && mode!="server") || (mode=="direct" && !destination))) {
    util.puts("Usage : ./exportmap.js tiled_json_file [mode] [destination]");
    util.puts("Optional parameters : mode & destination. Values:");
    util.puts("    - \"direct\" (default) → updates current server and map files (WARNING: SHOULD ONLY BE CALLED FROM BrowserQuest/tools/maps !!!);");
    util.puts("    - \"client destination_file\" → will generate destination_file.js and destination_file.json for client side map;");
    util.puts("    - \"server destination_file.json\" → will generate destination_file.json for server side map;");
    util.puts("    - \"both destination_directory\" → will generate world_client.js, world_client.json and world_server.json in directory.");
    process.exit(0);
}

function main() {
    if (mode == "allMaps") {
        nextMap();
    }
    else
        getTiledJSONmap(source, callback_function);
}

function callback_function(json, name) {
    switch (mode) {
        case "client":
            processClient(json, "../../client/maps/" + name + "_client");
            break;
        case "allMaps":
            processClient(json, "../../client/maps/" + name + "_client");
            processServer(json, "../../server/maps/" + name + "_server.json");
            nextMap();
            break;
        case "server":
            processServer(json, "../../server/maps/" + name + "_server.json");
            break;
        case "direct":
            processClient(json, "../../client/maps/world_client");
            processServer(json, "../../server/maps/world_server.json");
            break;

        case "both":
            var directory = destination.replace(/\/+$/, '');//strip last path slashes
            processClient(json, directory + "/world_client");
            processServer(json, directory + "/world_server.json");
            break;
        default:
            util.puts("Unrecognized mode, how on earth did you manage that ?");
    };
}

function processClient(json, dest){

	var jsonMap = JSON.stringify(processMap(json, {mode:"client"})); // Save the processed map object as JSON data
	// map in a .json file for ajax loading
	fs.writeFile(dest+".json", jsonMap, function(err, file) {
		if(err){
			console.log(JSON.stringify(err));
		}
		else{
			console.log("Finished processing map file: "+ dest + ".json was saved.");
		}
	});
}

function processServer(json, dest){

    var jsonMap = JSON.stringify(processMap(json, {mode:"server"})); // Save the processed map object as JSON data
    fs.writeFile(dest, jsonMap, function(err, file) {
        if(err){
            console.log(JSON.stringify(err));
        }
        else{
            console.log("Finished processing map file: "+ dest + " was saved.");
        }
    });
}

function getTiledJSONmap(filename, callback) {
    var self = this;
    var filePath = "original-plus-dungeon/"+filename+".json";
    util.puts("path: "+filePath);
    fs.exists(filePath, function(exists) {
    
        fs.readFile(filePath, function(err, file) {
            callback(JSON.parse(file.toString()), filename);
        });
    });
}
/*

function getConfigFile(path, callback) {
    fs.readFile(path, 'utf8', function(err, json_string) {
        if(err) {
            console.info("This server can be customized by creating a configuration file named: " + err.path);
            callback(null);
        } else {
            callback(JSON.parse(json_string));
        }
    });
}*/

function nextMap(){
    var file = require("../../server/config.json");

    if(maps.length == 0)
        for(map in file.maps)
            maps.push(map);

    if(maps[counterMaps])
        getTiledJSONmap(maps[counterMaps], callback_function);

    counterMaps++;
}

main();
