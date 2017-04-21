/**
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Copyright (c) 2017 Keith Maika <keithm@kickenscripts.us>;
 * Licensed under the MIT license
 */

(function(){
    function Drum(element, options){
        this.element = element;
        this.settings = this._mergeSettings(options);
        this.transformProp = this._getTransformProperty();
        this._render();

        if (typeof Hammer !== 'undefined'){
            this._configureHammer();
        }
        if (this.settings.interactive){
            this._configureEvents();
        }

        this.setIndex(this.settings.index);
    }

    Drum.prototype = {
        setIndex: function(newIndex){
            var max = this.settings.data.length;
            if (newIndex > max){
                newIndex = newIndex % max;
            } else if (newIndex < 0){
                newIndex = max - (Math.abs(newIndex) % max);
            }

            this.index = newIndex;
            this.updateDisplay();
        }

        , getIndex: function(){
            return this.index;
        }

        , updateDisplay: function(){
            var items = this._getVisibleItems(this.index);
            var wedges = this.drum.children;
            var wedgesLength = wedges.length;

            for (var i = 0; i < wedgesLength; i++){
                this._updateDrumItem(wedges[i], items[i]);
            }
        }

        , _mergeSettings: function(options){
            options = options || {};
            var settings = {
                radius: 75,
                wedgeHeight: 30,
                rotateFn: 'rotateX',
                interactive: true,
                dial_w: 20,
                dial_h: 5,
                dial_stroke_color: '#999999',
                dial_stroke_width: 1,
                index: this.element.selectedIndex
            };

            var key;
            for (key in options){
                if (options.hasOwnProperty(key)){
                    settings[key] = options[key];
                }
            }

            settings.data = settings.data || this._getDataFromChildren();
            if (typeof settings.index !== 'number'){
                settings.index = 0;
            }

            return settings;
        }

        , _getDataFromChildren: function(){
            var data = [];
            for (var i = 0; i < this.element.children.length; i++){
                var child = this.element.children[i];
                data.push({
                    value: child
                    , label: child.textContent
                });
            }

            return data;
        }

        , _getTransformProperty: function(){
            var transformProp = false;
            var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
            for (var i = 0; i < prefixes.length; i++){
                if (document.createElement('div').style[prefixes[i]] !== undefined){
                    transformProp = prefixes[i];
                }
            }

            return transformProp || 'transform';
        }

        , _render: function(){
            var wrapper, inner, container, dialUp, dialDown, drum;

            this.element.style.display = "none";
            this.wrapper = wrapper = document.createElement("div");
            wrapper.classList.add("drum-wrapper");

            if (this.settings.id){
                wrapper.setAttribute('id', this.settings.id);
            } else if (this.element.id){
                wrapper.setAttribute('id', 'drum_' + this.element.id);
            } else if (this.element.hasAttribute('name')){
                wrapper.setAttribute('id', 'drum_' + this.element.getAttribute('name'));
            }

            this.inner = inner = document.createElement("div");
            inner.classList.add("inner");
            wrapper.appendChild(inner);

            this.container = container = document.createElement("div");
            container.classList.add("container");
            inner.appendChild(container);

            this.drum = drum = document.createElement("div");
            drum.classList.add("drum");
            container.appendChild(drum);

            if (this.settings.interactive === true){
                this.dialUp = dialUp = Drum.DrumIcon.up(this.settings);
                wrapper.appendChild(dialUp);

                this.dialDown = dialDown = Drum.DrumIcon.down(this.settings);
                wrapper.appendChild(dialDown);
            }

            this.element.parentNode.insertBefore(wrapper, this.element.nextSibling);

            var totalWedges = this._calculateTotalWedges();
            for (var wedgeCounter = 0; wedgeCounter < totalWedges; wedgeCounter++){
                var wedge = document.createElement('div');
                wedge.classList.add('drum-item');
                drum.appendChild(wedge);
            }

            this._applyTransformations();
        }

        , _calculateTotalWedges: function(){
            var radius = this.settings.radius;
            var height = this.settings.wedgeHeight;
            var total = 2 * Math.PI / (height / radius);

            return Math.max(1, Math.floor(total));
        }

        , _getVisibleItems: function(selectedIndex){
            var i;
            var items = [];
            var count = this.drum.children.length;
            var midpoint = Math.floor(count/2);

            for (i = 0; i < midpoint; i++){
                items.push(this._getItem(i + selectedIndex));
            }
            for (i = midpoint; i > 0; i--){
                items.push(this._getItem(selectedIndex - i));
            }

            return items;
        }

        , _getItem: function(index){
            var len = this.settings.data.length;

            if (index < 0){
                index = len + index;
            } else if (index >= len){
                index -= len;
            }

            return this.settings.data[index];
        }

        , _updateDrumItem: function(drumItem, item){
            drumItem.textContent = item.label;
        }

        , _getDrumTransformation: function(radius, fn, degree){
            return 'translateZ(-' + radius + 'px) ' + fn + '(' + degree + 'deg)';
        }

        , _getItemTransformation: function(radius, fn, degree){
            return fn + '(' + degree + 'deg) translateZ(-' + radius + 'px) ';
        }

        , _applyTransformations: function(){
            this.drum.style[this.transformProp] = this._getDrumTransformation(
                this.settings.radius
                , this.settings.rotateFn
                , 0
            );

            var length = this.drum.children.length;
            var theta = 360 / length;
            for (var panelCounter = 0; panelCounter < length; panelCounter++){
                var panel = this.drum.children[panelCounter];
                panel.style[this.transformProp] = this._getItemTransformation(
                    this.settings.radius
                    , this.settings.rotateFn
                    , panelCounter * theta
                );
            }
        }

        , _transform: function(fire_event){
            //this._applyTransform(this.drum, this.settings.rotation);
        }

        , _configureHammer: function(){
            var v = 0,
                interval,
                isDragging;

            var touch = new Hammer(this.wrapper, {
                prevent_default: true,
                no_mouseevents: true
            });

            touch.on("dragstart", (function(){
                this.settings.distance = 0;
                isDragging = true;

                if (!interval){
                    interval = setInterval((function(){

                        this.settings.rotation = (this.settings.rotation + v + 360 ) % 360;

                        if (!isDragging){
                            v /= 1.03;
                        } else {
                            v /= 1.1;
                        }

                        if (!isDragging && Math.pow(v, 2) < 0.001){
                            clearInterval(interval);
                            interval = null;
                        } else if (!isDragging && Math.pow(v,
                                2) < .5 && Math.pow(this.settings.rotation - this._getNearest(),
                                2) < .1){
                            this.settings.rotation = this._getNearest();
                            clearInterval(interval);
                            interval = null;
                            v = 0;
                        }

                        this._transform(true);
                    }).bind(this), 20);
                }
            }).bind(this));

            touch.on("drag", (function(e){
                // var evt = ["up", "down"];
                // if (evt.indexOf(e.gesture.direction) >= 0) {
                // settings.rotation += Math.round(e.gesture.deltaY - settings.distance) * -1;
                v += ( Math.round(e.gesture.deltaY - this.settings.distance) * -1 ) / 25;
                // transform(true);
                this.settings.distance = e.gesture.deltaY;
                // }
            }).bind(this));

            touch.on("dragend", (function(){
                isDragging = false;

                var distance = this.settings.rotation - this._getNearest();

                if (distance > 180){
                    distance = 360 - distance;
                }

                if (Math.pow(v, 2) < .5){
                    v = (distance) / -20;
                }
                // settings.rotation = getNearest();
                // transform(true);
            }).bind(this));
        }

        , _configureEvents: function(){
            this.dialUp.addEventListener("click", (function(){
                this.setIndex(this.getIndex() - 1);
            }).bind(this));

            this.dialDown.addEventListener("click", (function(){
                this.setIndex(this.getIndex() + 1);
            }).bind(this));

            this.wrapper.addEventListener("mouseover", (function(){
                this.dialUp.style.display = "block";
                this.dialDown.style.display = "block";
            }).bind(this));

            this.wrapper.addEventListener("mouseout", (function(){
                this.dialUp.style.display = "none";
                this.dialDown.style.display = "none";
            }).bind(this));
        }
    };

    this.Drum = Drum;
}());

/**
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Copyright (c) 2017 Keith Maika <keithm@kickenscripts.us>;
 * Licensed under the MIT license
 */


(function(){
    var svgelem = function(tagName){
        return document.createElementNS("http://www.w3.org/2000/svg", tagName);
    };
    var svgcanvas = function(width, height){
        var svg = svgelem("svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);

        var g = svgelem("g");
        svg.appendChild(g);

        return svg;
    };
    var container = function(className){
        var container = document.createElement("div");
        container.setAttribute("class", className);
        var inner = document.createElement("div");
        container.appendChild(inner);
        return container;
    };
    var path = function(settings){
        var p = svgelem("path");
        var styles = {
            "fill": "none",
            "stroke": settings.dial_stroke_color,
            "stroke-width": settings.dial_stroke_width + "px",
            "stroke-linecap": "butt",
            "stroke-linejoin": "miter",
            "stroke-opacity": "1"
        };
        var style = "";
        for (var i in styles){
            p.setAttribute(i, styles[i]);
        }
        return p;
    };

    this.Drum.DrumIcon = {
        up: function(settings){
            var width = settings.dial_w;
            var height = settings.dial_h;

            var svg = svgcanvas(width, height);
            var p = path(settings);

            p.setAttribute("d",
                "m0," + (height + settings.dial_stroke_width) + "l" + (width / 2) + ",-" + height + "l" + (width / 2) + "," + height);
            svg.firstChild.appendChild(p);

            var cont = container("dial up");
            cont.firstChild.appendChild(svg);
            return cont;
        },
        down: function(settings){
            var width = settings.dial_w;
            var height = settings.dial_h;

            var svg = svgcanvas(width, height);
            var p = path(settings);

            p.setAttribute("d",
                "m0,-" + settings.dial_stroke_width + "l" + (width / 2) + "," + height + "l" + (width / 2) + ",-" + height);
            svg.firstChild.appendChild(p);

            var cont = container("dial down");
            cont.firstChild.appendChild(svg);
            return cont;
        }
    };
}());
