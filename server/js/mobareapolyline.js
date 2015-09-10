
var MobArea = require('./mobarea');

var MobAreaPoly = MobArea.extend({
    init: function (id, nb, kind, x, y, world, polyline, members) {
        this._super(id, nb, kind, x, y, 0, 0, world, members);

        this.polyline = polyline;
    },

    getFreeTiles: function () {
        var self = this;

        if (this.polyline.length < 3)
            return;

        var x0 = Math.min.apply(Math, self.polyline.map( function(vertex){return vertex.x;} ));
        var y0 = Math.min.apply(Math, self.polyline.map( function(vertex){return vertex.y;} ));

        var x1 = Math.max.apply(Math, self.polyline.map( function(vertex){return vertex.x;} ));
        var y1 = Math.max.apply(Math, self.polyline.map( function(vertex){return vertex.y;} ));

        var startSegment = this.polyline[0];

        isRayCollide = function(xTile, yTile) {
            var result = 0;

            for(var i = 1; i < self.polyline.length, segmentEnd = self.polyline[i]; i++) {
                var ray = {
                    begin:     {x: xTile,     y: yTile},
                    direction: {x: xTile + 1, y: yTile}
                };

                var segment = {
                    begin: {x: startSegment.x, y: startSegment.y},
                    end:   {x: segmentEnd.x,   y: segmentEnd.y}
                };

                if (self.rayIntersection(ray, segment)) {
                    result++;
                }
                startSegment = segment.end;
            }
            return result % 2 == 1;
        };

        var tilesInPolygone = Array();

        for(var yTile = y0; yTile <= y1; yTile++)
            for(var xTile = x0; xTile <= x1; xTile++) {
                if (isRayCollide(xTile + 0.1, yTile + 0.1) && this.isValidPosition(xTile + self.x, yTile + self.y)) {
                    var pos = {x: xTile + self.x, y: yTile + self.y};
                    tilesInPolygone.push(pos);
                }
            }

        return tilesInPolygone;
    },

    /**
         use ray with line intersection formula
         ray V0 -> V1, line (X0, Y1) -> (X1, Y1)
         t * V1x - U(x1 - x0) = x0 - V0x
         t * V1y - U(y1 - y0) = y0 - V0y
     */
    rayIntersection: function(ray, segment) {

        var matrix = Array();
        matrix[0] = Array();
        matrix[1] = Array();

        matrix[0][0] = ray.direction.x;
        matrix[0][1] = (segment.end.x - segment.begin.x) * (-1);
        matrix[1][0] = ray.direction.y;
        matrix[1][1] = (segment.end.y - segment.begin.y) * (-1);

        var mainMatrix = matrix;

        var res = Array();
        res[0] = segment.begin.x - ray.begin.x;
        res[1] = segment.begin.y - ray.begin.y;

        // use Cramer's rule
        var Determinant = this.determinant2(matrix);

        if (Determinant == 0)
            return false;

        matrix[0][0] = res[0];
        matrix[1][0] = res[1];
        var D1 = this.determinant2(matrix);

        mainMatrix[0][0] = ray.direction.x;
        mainMatrix[0][1] = res[0];
        mainMatrix[1][0] = ray.direction.y;
        mainMatrix[1][1] = res[1];
        var D2 = this.determinant2(mainMatrix);

        var T1 = D1/Determinant;
        var T2 = D2/Determinant;

        if (T1 >= 0 && (T2 >= 0 && T2 <= 1))
            return true;

        return false;
    },

    determinant2: function (matrix) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
});

module.exports = MobAreaPoly;
