
define(function() {

    var WayPointList = Class.extend({
        init: function(client, waypointsStatus) {
            this.waypointsStatus = waypointsStatus;
            this.client = client;
            var self = this;

            this.WAYPOINTS = {
                TITLE: 0
            };

            var WP_STATUS = {
                LOCK: false,
                OPEN: true
            }

            Types.waypoints.forEach(function(item, index) {
                $('#waypoint_list').append('<div id="wp_' + index + '" class="waypoint_body"><div id="status" class="locked"><img src="../img/3/active_waypoint.png"></div><div class="waypoint"></div></div><div style="clear: both"></div>');
                $('#wp_' + index + '.waypoint_body .waypoint').text(item[self.WAYPOINTS.TITLE]);

                if(self.waypointsStatus[index] == WP_STATUS.OPEN)
                {
                    $('#wp_'+index+'.waypoint_body #status').removeClass("locked");
                    $('#wp_'+index+'.waypoint_body #status').addClass("open");

                    $('#waypoint_list #wp_'+index).click(function(){
                        var id = this.id.substr(3);
                        self.client.sendWaypointEnter(id);
                    });
                }
            });
            this.updateCounter();
        },

        unlockWayPoint: function(id) {
            var self = this;
            var $wp = $('#wp_'+id+'.waypoint_body #status');
            $wp.removeClass("locked");
            $wp.addClass("open");
            $('#waypoint_list #wp_'+id).click(function(){
                self.client.sendWaypointEnter(id);
            });
            this.updateCounter();
        },

        updateCounter: function() {
            var unlockedWpCount = $('#status.open').length;
            var WpCount         = Types.waypoints.length;
            $('#wp_counter').text(unlockedWpCount+"/"+WpCount);
        }
    });

    return WayPointList;
});
