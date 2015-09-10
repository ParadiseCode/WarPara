
define(function() {

    var Leaderboard = Class.extend({
        init: function() {
            var self        = this;
            this.allData    = null;
            this.sortedData = null;
            this.leaderbordServerRequest = null;
            this.SORT_CONDITIONS = [
                ['remortCrystals', 'crystalsPerRemorte', 'crystalsPerWeek'],
                ['winCrystals', 'spendCrystals', 'profit'],
                ['exp', 'remortexp', 'expPerRemort']
            ];

            this.MAIN_HEADERS = ['rank', 'name', 'lvl', 'remorts'];
            this.SECONDARY_HEADERS = [
                ['crystals',     'crystals&nbsp;/&nbsp;remorts', 'crystals&nbsp;/&nbsp;week'],
                ['crystals&nbsp;win', 'entered&nbsp;the&nbsp;arena',      '%&nbsp;Profit'],
                ['Actual&nbsp;EXP',   'Total&nbsp;EXP',          'EXP&nbsp;/&nbsp;Remort']
            ];

            var headersHtmlContent = "";
            this.MAIN_HEADERS.forEach( function(item) {
                headersHtmlContent += '<th>' +item+ '</th>';
            });
            $('#leader_stat thead').append('<tr>' +headersHtmlContent+ '</tr>');

            var $backs = $('#leader_menu .content_type .back');

            $backs.click(function(){
                self.bookmarkClick($(this));
            });

            $('#leader_menu .date_separator a').click(function(){
                $('#leader_menu .date_separator a').removeClass('active');
                $(this).addClass('active');
                self.updateBody();
            });
        },

        updateHeaders: function(chosenState) {
            var self = this;
            var secondaryHeaders   = this.SECONDARY_HEADERS[chosenState];
            var headersHtmlContent = '';

            if ($('#leader_stat thead th').length > this.MAIN_HEADERS.length)
                for (var i = secondaryHeaders.length; i > 0; i--)
                    $('#leader_stat thead th:last-child').remove();

            secondaryHeaders.forEach(function (item, index) {
                headersHtmlContent += '<th><a href="#" id ="'+index+'">' + item + '</a></th>';
            });
            $('#leader_stat thead tr').append(headersHtmlContent);

            $('#leader_stat thead a').click(function () {
                self.sortButtonClick($(this));
            });
        },

        dateIntervalPrepare: function() {
            var self = this;
            var indexActiveDate = $('#leader_menu a.active').index();
            var STATE = {DAY: 0, WEEK: 1, MONTH: 2, MAX: 3};

            if (indexActiveDate === STATE.MAX)
                return;

            var convertMillisecToDay = (1000*60*60*24);
            var CONVERTE = [convertMillisecToDay, convertMillisecToDay * 7, convertMillisecToDay * 7 * 4];

            var time = new Date().getTime();
            this.sortedData.forEach(function (item, index) {
                var itemCreateTime = new Date(item.date).getTime();
                if ((time - itemCreateTime) / CONVERTE[indexActiveDate] < 1)
                    delete self.sortedData[index];
            });
        },

        updateBody: function () {
            var self = this;
            var bookmarkId  = this.getActiveBookmark();
            var sortBtnId   = this.getActiveSortButton();
            var headers = this.MAIN_HEADERS.concat(this.SECONDARY_HEADERS[bookmarkId]);
            var statisticContent   = '';
            $('#leader_stat tbody').html('');

            //date prepared
            this.sortedData = this.allData[this.SORT_CONDITIONS[bookmarkId][sortBtnId]].slice(0);
            this.dateIntervalPrepare();

            this.sortedData.forEach(function (row) {
                headers.forEach(function (paramName) {
                    statisticContent += '<td>' + row[paramName] + '</td>';
                });
                $('#leader_stat tbody').append('<tr>' +statisticContent+ '</tr>');
                statisticContent = '';
            });
        },

        updateBoardData: function(data) {
            var self = this;

            this.SORT_CONDITIONS[0].forEach(function(rowName) {
                data[rowName].forEach(function (item, index) {
                    item[self.MAIN_HEADERS[0]] = index + 1;
                    item[self.MAIN_HEADERS[2]] = item.level;
                    item[self.SECONDARY_HEADERS[0][0]] = item.remortCrystals;
                    item[self.SECONDARY_HEADERS[0][1]] = item.crystalsPerRemorte || 0;
                    item[self.SECONDARY_HEADERS[0][2]] = item.crystalsPerWeek    || 0;
                });
            });

            this.SORT_CONDITIONS[1].forEach(function(rowName) {
                data[rowName].forEach(function (item, index) {
                    item[self.MAIN_HEADERS[0]] = index + 1;
                    item[self.MAIN_HEADERS[2]] = item.level;
                    item[self.SECONDARY_HEADERS[1][0]] = item.winCrystals;
                    item[self.SECONDARY_HEADERS[1][1]] = item.spendCrystals / 100;
                    item[self.SECONDARY_HEADERS[1][2]] = item.profit || 0;
                    item[self.SECONDARY_HEADERS[1][2]] += '%';
                });
            });

            this.SORT_CONDITIONS[2].forEach(function(rowName) {
                data[rowName].forEach(function (item, index) {
                    item[self.MAIN_HEADERS[0]] = index + 1;
                    item[self.MAIN_HEADERS[2]] = item.level;
                    item[self.SECONDARY_HEADERS[2][0]] = item.exp;
                    item[self.SECONDARY_HEADERS[2][1]] = item.remortexp;
                    item[self.SECONDARY_HEADERS[2][2]] = item.expPerRemort || 0;
                });
            });

            this.allData = data;

            $('#leader_menu .content_type .back').first().click();
            this.timerReset();
        },

        sortButtonClick: function($button) {
            var self = this;
            if ($button.hasClass(''))
                $('#leader_stat thead a').removeAttr('class');

            var idBookmark = this.getActiveBookmark();
            var buttomName = this.SORT_CONDITIONS[idBookmark][$button.attr('id')];
            var fieldName = $button.html();

            var sortNeeding = function(isAbc) {
                var temp = self.allData[buttomName];

                return isAbc
                    ? temp[0][fieldName] < temp[temp.length - 1][fieldName]
                    : temp[0][fieldName] > temp[temp.length - 1][fieldName];
            };

            var isNeedSort = false;
            if ($button.hasClass('abc')){
                $button.removeClass('abc');
                $button.addClass('desc');
                isNeedSort = sortNeeding(false);
            }
            else {
                $button.removeClass('desc');
                $button.addClass('abc');
                isNeedSort = sortNeeding(true);
            }

            if (isNeedSort)
                this.allData[buttomName].reverse();

            this.updateBody();
        },

        bookmarkClick: function($bookmark) {
            var index = $bookmark.index();
            $('#leader_menu .content_type .back').removeClass('active');
            $bookmark.addClass('active');
            this.updateHeaders(index);
            this.sortButtonClick($('#leader_stat thead a').first());
        },

        getActiveBookmark: function() {
            return $('#leader_menu .content_type .back.active').index();
        },

        getActiveSortButton: function() {
            var result = $('#leader_stat thead .abc, .desc').attr('id');
            return result >= 0 ? result : 0 ;
        },

        timerReset: function() {
            var self = this;

            var counter = DURATION = 60 * 60;
            var intervalId = null;
            var SEC_PER_TICK = 1;
            function onEnd()
            {
                clearInterval(intervalId);
                $('.timer .time').text('Waiting for server request');
                self.sendRequest();
            }

            function tick()
            {
                var minutes = Math.floor(counter / 60);
                var seconds = (counter % 60) < 10 ? '0' + (counter % 60) : (counter % 60);

                $('.timer .time').text(minutes + " : " + seconds);
                counter -= SEC_PER_TICK;
            }

            function start()
            {
                intervalId = setInterval(tick, SEC_PER_TICK * 1000);
                setTimeout(onEnd, counter * SEC_PER_TICK * 1000);
            }
            start();
        },

        openBoard: function() {
            $('#leader_menu').addClass('active');
        },

        closeBoard: function() {
            $('#leader_menu').removeClass('active');
        },

        setLeaderBoardRequst : function(callback) {
            this.leaderbordServerRequest = callback;
        },

        sendRequest: function() {
            if (this.leaderbordServerRequest) {
                this.leaderbordServerRequest();
            }
        }
    });

    return Leaderboard;
});
