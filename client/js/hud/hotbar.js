
define(function() {
    var Hotbar = Class.extend({
        init: function (client, game) {
            this.resetItems();

            this.ATACK_ITEMS_LIST = {
                'inventoryitem-firespell': Types.Entities.FIRESPELL,
                'inventoryitem-shortbow': Types.Entities.SHORTBOW,
                'inventoryitem-tornadospell': Types.Entities.TORNADOSPELL,
                'inventoryitem-terrorspell': Types.Entities.TERRORSPELL,
                'inventoryitem-poisonspell': Types.Entities.POISONSPELL,
                'inventoryitem-blackholespell': Types.Entities.BLACKHOLESPELL,
                'inventoryitem-transformspell': Types.Entities.TRANSFORMSPELL,
                'inventoryitem-stunspell': Types.Entities.STUNSPELL,
                'inventoryitem-icespell': Types.Entities.ICESPELL
            };

            for (var i = 0; i < Types.rankedWeapons.length; i++)
                this.ATACK_ITEMS_LIST['inventoryitem-weapon'+i] = Types.Entities.WEAPON0;

            this.DEFENSE_ITEMS_LIST = {
                'inventoryitem-help': Types.Action.SOCIAL_STATE,
                'inventoryitem-healspell': Types.Projectiles.HEALBALL1,
                'inventoryitem-shieldspell': Types.Projectiles.SHIELD
            };

            var self = this;
            this.client = client;
            this.game = game;

            $('.inventoryitem-general').click(function () {
                self.game.inventoryItemClicked($(this));
            });

            this.client.onSpells(function (spells) {
                var SPELL = {
                        ID : 0,
                        LEVEL: 1
                };

                self.resetItems();
                self.game.player.spells = spells;
                for (var spellIndex in spells) {
                    var spellId = spells[spellIndex][SPELL.ID];
                    if(Types.isAttackItem(spellId))
                        self.attackItems.push(Types.getKindAsString(spellId));

                    if(Types.isDefenseItem(spellId))
                        self.defenseItems.push(Types.getKindAsString(spellId));
                }

                self.updateHotbar();
            });
        },

        hotbarItemClicked: function (elem) {
            if (elem.parent().hasClass('hotbar')) {
                //hotbar item click
                var inventoryUsage =
                {
                    'inventoryitem-bombpotion': Types.Entities.BOMBPOTION,
                    'inventoryitem-firepotion': Types.Entities.FIREPOTION,

                    'inventoryitem-healthpotion1': Types.Entities.HEALTHPOTION1,
                    'inventoryitem-healthpotion2': Types.Entities.HEALTHPOTION2,
                    'inventoryitem-healthpotion3': Types.Entities.HEALTHPOTION3,

                    'inventoryitem-manapotion1': Types.Entities.MANAPOTION1,
                    'inventoryitem-manapotion2': Types.Entities.MANAPOTION2,
                    'inventoryitem-manapotion3': Types.Entities.MANAPOTION3,

                    'inventoryitem-restorepotion1': Types.Entities.RESTOREPOTION1,
                    'inventoryitem-restorepotion2': Types.Entities.RESTOREPOTION2,
                    'inventoryitem-restorepotion3': Types.Entities.RESTOREPOTION3,

                    'inventoryitem-hulkpotion1': Types.Entities.HULKPOTION1,
                    'inventoryitem-hulkpotion2': Types.Entities.HULKPOTION2,
                    'inventoryitem-hulkpotion3': Types.Entities.HULKPOTION3
                };

                var selectedSkill = elem.attr('class').split(' ')[1];
                this.setPanelIconActive( $('li.'+selectedSkill, "aaaa") );

                if (inventoryUsage[selectedSkill] == Types.Entities.BOMBPOTION) {
                    this.client.sendDropBomb(this.game.player.gridX, this.game.player.gridY);
                    return;
                }

                if (sendItem = inventoryUsage[selectedSkill]) {
                    this.client.sendInventoryUse(sendItem);
                    return;
                }

                var $panelToUse = this.ATACK_ITEMS_LIST[selectedSkill] ? $(".attackwin") : $(".defensewin");

                if ($panelToUse.hasClass('active'))
                    this.hideWindow($panelToUse);
                else
                    this.showWindow($panelToUse);
            }
        },

        itemClicked: function (elem) {
            var elementClasses = elem.attr('class').split(" ");
            var itemClass = elementClasses[1];
            log.info("attackItemClicked " + itemClass);

            this.hideAllWindows();

            var isAttackButton = elementClasses[0] == "attackbutton";
            var $hotbarButton = isAttackButton ? $("#inventory0") : $("#inventory1");
            var uniqueHotbarClass = $hotbarButton.attr('class').split(" ")[1];

            if (uniqueHotbarClass !== itemClass) {
                $hotbarButton.removeClass(uniqueHotbarClass);
            }
            if (!$hotbarButton.hasClass(itemClass)) {
                $hotbarButton.addClass(itemClass);
            }

            this.setPanelIconActive(elem);

            var selectedSkill = elem.attr('class').split(' ')[1];

            if (activeItem = this.ATACK_ITEMS_LIST[selectedSkill])
                this.game.inventoryActiveItem = activeItem;

            if (defenseItem = this.DEFENSE_ITEMS_LIST[selectedSkill])
                this.game.defenseItem = defenseItem;

            log.info("set inventoryActiveItem " + Types.getKindAsString(this.inventoryActiveItem) + "(" + this.inventoryActiveItem + ")");
        },

        updateHotbar: function () {
            var inventory = this.game.player.getInventory();
            if(!inventory || !inventory.getPotions())
                return;

            var allPotions = inventory.getPotions();
            var self = this;
            var potions = {};

            var POTIONS = {
                    KIND:     0,
                    QUANTITY: 1
            };

            for (var i = 0; i < allPotions.length; i++) {
                var item = allPotions[i];
                var itemName = Types.getKindAsString(item[POTIONS.KIND]);
                var itemKind = item[POTIONS.KIND];
                var quantity = item[POTIONS.QUANTITY];

                if (Types.isPotion(itemKind) || Types.isBombPotion(itemKind)) {

                    switch (itemName) {
                        case "flask":
                            itemName = "healthpotion1";
                            break;
                        case "firepotion":
                            itemName = "hulkpotion3";
                            break;
                        case "manapotion":
                            itemName = "manapotion1";
                            break;
                    }

                    if (potions[itemName] !== undefined) {
                        potions[itemName] += quantity;
                    } else {
                        potions[itemName] = quantity;
                    }
                }
            }

            var activeItemIndex = $('.attackbutton.inventoryitem-active').index();
            // add attack items to attack menu
            $('#attackbuttons').html('');

            for (var index = 0; index < this.attackItems.length; index++) {
                var itemName = this.attackItems[index];
                if (isActiveItem = activeItemIndex == index)
                    itemName += " inventoryitem-active";
                $('#attackbuttons').append('<li class="attackbutton inventoryitem-' + itemName + '"/></li>');
            }

            //if(activeItemIndex < 1)
                this.updateWeaponIcon();

            var defenseItemIndex = $('.defensebutton.inventoryitem-active').index();
            // add defence items to defence menu
            $('#defensebuttons').html('');
            for (var index in this.defenseItems) {
                var itemName = this.defenseItems[index];
                if (isActiveItem = defenseItemIndex == index)
                    itemName += " inventoryitem-active";
                $('#defensebuttons').append('<li class="defensebutton inventoryitem-' + itemName + '"/></li>');
            }

            $('.attackbutton').add('.defensebutton').click(function () {
                self.itemClicked($(this));
            });

            // add potions to potion menu
            for (var itemName in potions) {
                if (item !== "bombpotion") {
                    $("#potions_menu ." + itemName + " .bottle_count").html(potions[itemName]); // add potion to pot inventory

                    if(potions[itemName] > 0 && !$("#potions_menu ." + itemName).hasClass("instock"))
                        $("#potions_menu ." + itemName).addClass("instock");
                }

                log.info("set potions " + itemName + " " + potions[itemName]);
            }

            // add bombs and potions to hotbar
            var hotbarItems = {bombpotion: 0, healthpotion: 0, manapotion: 0, restorepotion: 0, hulkpotion: 0};

            var itemCounter = 2;
            for (var itemType in hotbarItems) {
                var quantity = 0;
                var potLevel = 1;

                if (itemType === "bombpotion" && potions[itemType] !== undefined) {
                    quantity = potions[itemType];
                } else if ($("#potions_menu .swap_order").hasClass("active")) {
                    for (potLevel = 1; potLevel < 4 && quantity == 0; ++potLevel) {
                        var potItem = itemType + potLevel;
                        if (potions[potItem] === undefined) {// is potion not found in all items
                            $("#potions_menu ." + potItem + " .bottle_count").html("0");     // type 0
                            $('.main_cell.' + potItem).removeClass("instock");
                        } else {
                            quantity = potions[potItem];
                        }
                    }
                    --potLevel;
                }
                else {
                    for (potLevel = 3; potLevel > 0 && quantity == 0; --potLevel) {
                        var potItem = itemType + potLevel;
                        if (potions[potItem] === undefined) {// is potion not found in all items
                            $("#potions_menu ." + potItem + " .bottle_count").html("0");     // type 0
                            $('.main_cell.' + potItem).removeClass("instock");
                        } else {
                            quantity = potions[itemType + potLevel];
                        }
                    }
                    potLevel++;
                }

                if (quantity == 0) {
                    quantity = "";
                    potLevel = 1;
                }

                if (itemType === "bombpotion") {
                    potLevel = "";
                }

                var invCell = $('#inventory' + itemCounter);
                invCell.removeAttr('class');
                invCell.addClass('inventoryitem-general');
                invCell.addClass('inventoryitem-' + itemType + potLevel);
                $('#inventory' + itemCounter + ' .quantitylabel').text(quantity);
                log.info("set item " + itemType + " " + quantity);
                itemCounter++;
            }
        },

        showWindow: function ($elem) {
            if(this.game.started) {
             this.hideAllWindows();

            $elem.addClass('active');
            $elem.fadeIn(250);
            }
        },

        hideWindow: function ($elem) {
            if(this.game.started) {
                $elem.removeClass('active');
                $elem.fadeOut(250);
            }
        },

        hideAllWindows: function () {
            if(this.game.started) {
                this.hideWindow($(".attackwin"));
                this.hideWindow($(".defensewin"));
            }
        },

        setPanelIconActive: function ($elem, iconClass) {
            var isElemNotNull = $elem.length > 0;

            if(isElemNotNull) {
                var parentId = $elem.parent().attr('id');
                $('#'+parentId+' .inventoryitem-active').removeClass('inventoryitem-active');
                $elem.addClass('inventoryitem-active');
            }
        },

        updateWeaponIcon: function () {
            var $weaponIcon = $(".attackbutton").first();
            if(!$('#attackbuttons li').hasClass('inventoryitem-active'))
                $weaponIcon.addClass('inventoryitem-active');

            var weaponClass = $weaponIcon.attr('class').split(" ")[1];
            var clsasses = $weaponIcon.attr('class').split(" ");
            var test = $weaponIcon.attr('class').split(" ")[2];
            var isActive = $weaponIcon.attr('class').split(" ")[2] === 'inventoryitem-active';
            $weaponIcon.removeClass(weaponClass);
            $weaponIcon.removeClass('inventoryitem-active');

            var currentWeaponId = Types.getKindFromString(this.game.player.getWeaponName());
            var currentRank     = Types.getWeaponRank(currentWeaponId);

            $weaponIcon.addClass('inventoryitem-weapon'+currentRank);

            if(isActive)
                this.itemClicked($weaponIcon);
        },

        resetItems: function() {
            this.attackItems  = ["Sword_00", "shortbow"];
            this.defenseItems = ["help"];
        }
    });
    return Hotbar;
});
