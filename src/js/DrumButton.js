/**
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Copyright (c) 2017 Keith Maika <keithm@kickenscripts.us>;
 * Licensed under the MIT license
 */


(function(){
    function SVG(width, height){
        this._createSVGCanvas(width, height);
    }

    SVG.prototype = {
        getElement: function(){
            return this.element;
        }

        , line: function(p1, p2, color, thickness, cap){
            var line = this._createSVGElement('line');
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', thickness);
            line.setAttribute('stroke-linecap', cap);

            line.setAttribute('x1', p1.x);
            line.setAttribute('y1', p1.y);

            line.setAttribute('x2', p2.x);
            line.setAttribute('y2', p2.y);

            this.graphics.appendChild(line);
        }

        , _createSVGElement: function(name){
            return document.createElementNS("http://www.w3.org/2000/svg", name);
        }

        , _createSVGCanvas: function(width, height){
            this.element = this._createSVGElement("svg");
            this.element.setAttribute("width", width);
            this.element.setAttribute("height", height);

            this.graphics = this._createSVGElement("g");
            this.element.appendChild(this.graphics);
        }
    };


    this.Drum.DownButton = function(width, height, color, thickness){
        var lowerCenter = {
            x: width / 2
            , y: height - thickness
        };

        var upperRight = {
            x: width
            , y: thickness
        };

        var upperLeft = {
            x: thickness
            , y: thickness
        };

        var button = new SVG(width, height);
        button.line(upperLeft, lowerCenter, color, thickness, 'round');
        button.line(lowerCenter, upperRight, color, thickness, 'round');

        var div = document.createElement('div');
        div.classList.add('dial');
        div.classList.add('down');
        div.appendChild(button.getElement());

        return div;
    };

    this.Drum.UpButton = function(width, height, color, thickness){
        var upperCenter = {
            x: width / 2
            , y: thickness
        };

        var lowerRight = {
            x: width
            , y: height - thickness
        };

        var lowerLeft = {
            x: thickness
            , y: height - thickness
        };

        var button = new SVG(width, height);
        button.line(lowerLeft, upperCenter, color, thickness, 'round');
        button.line(upperCenter, lowerRight, color, thickness, 'round');

        var div = document.createElement('div');
        div.classList.add('dial');
        div.classList.add('up');
        div.appendChild(button.getElement());

        return div;
    };
}());
