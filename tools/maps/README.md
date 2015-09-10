Paragon War map exporter
=========================

***Disclaimer: due to popular demand we are open sourcing this tool, but please be aware that it was never meant to be publicly released. Therefore the code is messy/non-optimized and the exporting process can be very slow with large map files.***


Editing the map
---------------

Install the Tiled editor: http://www.mapeditor.org/

Open the `tmx/map.tmx` file in Tiled and start editing.

**Note:** Some unexhaustive documentation can be found in the [wiki of the repository](https://github.com/browserquest/BrowserQuest/wiki/Create-a-map-using-tiled-map-editor).

Editing the map
---------------
Pre-process map allows to create attributes patterns to reuse various times in your tilesheet. And also to create rectangles of tiles of same attributes…

Using the exporter
------------------

This tool is to be used from the command line after the map has been exported in .json format from tiled map editor (the functionnality was added in v0.8, but should work with later versions if they do not change the specifications for json export).

**Usage:**

1. `cd tools/maps/`

2. `./exportmap.js tiled_exported_file [mode] [destination].

mode & destination values:
* `direct` (default) → updates current server and map files (WARNING: SHOULD ONLY BE CALLED FROM `BrowserQuest/tools/maps` see 1);
* `client destination_file` → will generate `destination_file.js` and `destination_file.json` for client side map;
* `server destination_file.json` → will generate `destination_file.json` for server side map;
* `both destination_directory` → will generate `world_client.js`, `world_client.json` and `world_server.json` in `destination_directory`, which must exist, otherwise an error is triggered.
* `allMaps` → will generate all maps which are listed in (../server/config.json).maps.

    Field [destination] is not necessary. Need only for `direct` mode.
    Do not need to specify the full path and extension for `tiled_exported_file`.

    EXAMPLE:
        nodejs exportmap.js dungeon1 client
        nodejs exportmap.js allMaps
        nodejs exportmap.js dungeon1 server

Things to know
--------------

The client map export will create two almost identical files: `world_client.js` and `world_client.json`
These are both required because, depending on the browser, the game will load the map either by using a web worker (loading `world_client.js`), or via Ajax (loading `world_client.json`).

The client map file contains data about terrain tile layers, collision cells, doors, music areas, etc.
The server map file contains data about static entity spawning points, spawning areas, collision cells, etc.

Depending on what you want to change, it's therefore not always needed to export both maps. Also, each `world_server.json` file change requires a server restart.

Contributing / Ideas for improvement
------------------------------------

Here are a few ideas for anyone who might want to help make this tool better:

- Write documentation on how to use the exporter on Windows.

- Write documentation about map editing in the Tiled editor (ie. editing BrowserQuest-specific properties of doors, chests, spawning areas, etc.)

- Write documentation about the BrowserQuest map JSON format, both for client and server map types.

- A complete rewrite of this tool using a custom Tiled plugin would surely be a better approach than the current one. Being able to export directly from Tiled would be much easier to use. Also, the export process is currently too slow.


**Additional resources:**

- Tiled editor wiki: https://github.com/bjorn/tiled/wiki
- TMX map format documentation: https://github.com/bjorn/tiled/wiki/TMX-Map-Format


*** Paragon War: How to add projectile emitters ***

Andrew McCormick:
i'm having trouble adding boulder emitters to dungeon 6.  I added two of them, but when I try to export the _server.json file, I get an error: "sx: emitter.x + emitter.polyline[0].x," TypeError: Cannot read property '0' of undefined
Any ideas?
 
Adam Cheong: did you use polyline tool in tiled?
expects an object layer "emitters"
each a 2 point polyline
with type "boulder" or "fireball"
and a property "frequency" a number in ms e.g 4000 = 4s
or look in gauntlet.json text editor
search "emitters"
compare with yours


