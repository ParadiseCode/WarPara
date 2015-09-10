Paragon War
============

[![Dependency Status](https://gemnasium.com/webgroup-limited/paragon-war.png)](https://gemnasium.com/webgroup-limited/paragon-war)

Paragon is the evolution of the origial Browserquest experiement funded by Mozilla. The following is how Paragon War came to exist.

- https://github.com/mozilla/BrowserQuest
- https://github.com/browserquest/BrowserQuest
- Idnet Browserquest (does not have a seperate repo)
- https://github.com/webgroup-limited/paragon-war/tree/v2-paragon-crusade
- https://github.com/webgroup-limited/paragon-war (current location)

Paragon War uses these primary technologies

- the server side, which runs using Node.js
- the client side, which runs using javascript in your browser
- the database side, which runs using Mongo

How to get started
-------------------

Start by downloading the github app for Windows or Mac. If using Linux make sure to download git from your distros package manager.

    https://desktop.github.com/

Clone the repository:

    Window and Mac, click the Clone in Desktop button on the main Paragon Github page.
    
    Linux use the command line.

    $ git clone git@github.com:webgroup-limited/paragon-war.git
    $ cd paragon-war

Once you have the repo setup, try making a small change to test. Add white space to a text file and save it.

Submit your first commit:

    In Windows or Mac click the sync button in the Github app. This will upload your change and restart the paragon server to reflect any changes. Try reverting b clicking the revert button on your commit in the Github app, then sync again.

    For Linux:
    
    $ git pull
    $ git add --all
    $ git commit
    Then write a commit message and save the text document
    $ git push

Running a Server (Red Hat Linux)
-------------------------------------------------------------------

Assuming your computer has at least 4 GB of ram, we suggest installing a Desktop version of RHEL (Fedora 16+ or RHEL/CentOS/SL 6.x) as a virtual machine with something like VirtualBox. For computers with 4 GB of ram give the linux VM 1024 MB of ram. For computers with 8 GB of ram, give the VM 2 GB of ram.

For RHEL/CentOS/SL 6.x, you need to add the EPEL repo first.  Not needed for Fedora:

    $ rpm -Uvh http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
    
You may need Python installed before installing Node.js:

    http://toomuchdata.com/2014/02/16/how-to-install-python-on-centos/

Then install Node.js and everything else needed:

    $ yum install zlib-devel gcc gcc-c++ autoconf automake make nodejs npm

Install MongoDb by following their directions:

    https://docs.mongodb.org/manual/tutorial/install-mongodb-on-red-hat/

Now continue on with the normal steps to clone the git repo, and start the game like so:

    $ npm install -d
    $ node server/js/main.js

Running a Server (Windows)
-------

Because socket.io has some hard dependancies, running a server on Windows is not recommend until someone comes up with great instructions to make it work. For now, it is recommended to use Linux to run the server or just submit commits and test on the live development server.

Deploying Paragon
----------------------

TODO

Browser Support
---------------

* Firefox - Works well.
* Chrome - Works well.
* Chromium - Works well.
* Opera 15.x - Works well.
* Opera 12.16 - Background music doesn't play.  Everything else works (Very slow though).
* Safari 6.x - Background music doesn't play.  Everything else works well.
* IE 10.x - Doesn't work.  Other versions untested.
    
Documentation
-------------

Lots of useful info on the [wiki](https://github.com/browserquest/BrowserQuest/wiki).

Credits
-------
Originally created by [Little Workshop](http://www.littleworkshop.fr):

* Franck Lecollinet - [@whatthefranck](http://twitter.com/whatthefranck)
* Guillaume Lecollinet - [@glecollinet](http://twitter.com/glecollinet)

All of the music in BrowserQuest comes from Creative Commons [Attribution 3.0 Unported (CC BY 3.0)](http://creativecommons.org/licenses/by/3.0/) sources.

* [Aaron Krogh](http://soundcloud.com/aaron-anderson-11) - [beach](http://soundcloud.com/aaron-anderson-11/310-world-map-loop)
* [Terrel O'Brien](http://soundcloud.com/gyrowolf) - [boss](http://soundcloud.com/gyrowolf/gyro-scene001-ogg), [cave](http://soundcloud.com/gyrowolf/gyro-dungeon004-ogg), [desert](http://soundcloud.com/gyrowolf/gyro-dungeon003-ogg), [lavaland](http://soundcloud.com/gyrowolf/gyro-scene002-ogg)
* [Dan Tilden](http://www.dantilden.com) - [forest](http://soundcloud.com/freakified/what-dangers-await-campus-map)
* [Joel Day](http://blog.dayjo.org) - [village](http://blog.dayjo.org/?p=335)

Many other people are contributing through GitHub:

* Myles Recny [@mkrecny](https://github.com/mkrecny)
* Ben Noordhuis [@bnoordhuis](https://github.com/bnoordhuis)
* Taylor Fausak [@tfausak](https://github.com/tfausak)
* William Bowers [@willurd](https://github.com/willurd)
* Steve Gricci [@sgricci](https://github.com/sgricci)
* Dave Eddy [@bahamas10](https://github.com/bahamas10)
* Mathias Bynens [@mathiasbynens](https://github.com/mathiasbynens)
* Rob McCann [@unforeseen](https://github.com/unforeseen)
* Scott Noel-Hemming [@frogstarr78](https://github.com/frogstarr78)
* Kornel Lesiński [@pornel](https://github.com/pornel)
* Korvin Szanto [@KorvinSzanto](https://github.com/KorvinSzanto)
* Jeff Lang [@jeffplang](https://github.com/jeffplang)
* Tom McKay [@thomasmckay](https://github.com/thomasmckay)
* Justin Clift [@justinclift](https://github.com/justinclift)
* Brynn Bateman [@brynnb](https://github.com/brynnb)
* Dylen Rivera [@dylenbrivera](https://github.com/dylenbrivera)
* Mathieu Loiseau [@lzbk](https://github.com/lzbk)
* Jason Culwell [@Mawgamoth](https://github.com/Mawgamoth)
* Bryan Biedenkapp [@gatekeep](https://github.com/gatekeep)
* Aaron Hill [@Aaron1011](https://github.com/Aaron1011)
* Fredrik Svantes [@speedis](https://github.com/speedis)
* Sergey Krilov [@sergkr](https://github.com/sergkr)
