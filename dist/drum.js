/**
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Copyright (c) 2017 Keith Maika <keithm@kickenscripts.us>;
 * Licensed under the MIT license
 */

(function(){
    function Drum(element, options){
        this.element = element;
        this.settings = this._mergeSettings(options);
        this._render();

        this.settings.radius = Math.round((this.drum.offsetHeight / 2) / Math.tan(Math.PI / this.settings.panelCount));
        this._renderData();

        if (typeof Hammer !== 'undefined'){
            this._configureHammer();
        }
        if (this.settings.interactive){
            this._configureEvents();
        }
    }

    Drum.prototype = {
        setIndex: function(newIndex){
            if (newIndex === this.getIndex()){
                this._transform(false);
                return;
            }

            var page = Math.floor(newIndex / this.settings.panelCount);
            var index = newIndex - (page * this.settings.panelCount);
            var selected = new Drum.PanelModel(index, newIndex, this.settings);
            this._update(selected);
            this.settings.rotation = index * this.settings.theta;
            this._transform(false);
        }

        , getIndex: function(){
            return this._getSelected()?this._getSelected().dataModel.index:null;
        }

        , updateItems: function(data){
            this.element.parentNode.removeChild(this.wrapper);
            this.settings.data = data;

            return new Drum(this.element, this.settings);
        }

        , _mergeSettings: function(options){
            options = options || {};
            var settings = {
                transformProp: this._getTransformProperty(),
                panelCount: 16,
                rotateFn: 'rotateX',
                interactive: true,
                dial_w: 20,
                dial_h: 5,
                dial_stroke_color: '#999999',
                dial_stroke_width: 1,
                initselect: undefined,
                mapping: []
            };

            var key;
            for (key in options){
                if (options.hasOwnProperty(key)){
                    settings[key] = options[key];
                }
            }

            settings.rotation = 0;
            settings.distance = 0;
            settings.last_angle = 0;
            settings.theta = 360 / settings.panelCount;
            settings.initselect = settings.initselect || this.element.selectedIndex;

            if (!settings.data){
                settings.data = [];
                for (var i = 0; i < this.element.children.length; i++){
                    settings.data.push(this.element.children[i].textContent);
                }
            }

            return settings;
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
        }

        , _renderData: function(){
            var c, i;
            for (i = 0, c = 0; i < this.settings.panelCount; i++){
                if (this.settings.data.length === i){
                    break;
                }

                var j = c;
                if (c >= (this.settings.panelCount / 2)){
                    j = this.settings.data.length - (this.settings.panelCount - c);
                }
                c++;

                var panel = new Drum.PanelModel(i, j, this.settings);
                panel.init();
                this.settings.mapping.push(panel);

                this.drum.appendChild(panel.elem);
            }
        }

        , _getNearest: function(deg){
            deg = deg || this.settings.rotation;
            var th = (this.settings.theta / 2);
            var n = 360;
            var angle = ((deg + th) % n + n) % n;
            angle = angle - angle % this.settings.theta;
            var l = (this.settings.data.length - 1) * this.settings.theta;
            if (angle > l){
                if (deg > 0){
                    return l;
                } else {
                    return 0;
                }
            }
            return angle;
        }

        , _getSelected: function(){
            var nearest = this._getNearest();
            for (var i in this.settings.mapping){
                if (this.settings.mapping[i].angle === nearest){
                    return this.settings.mapping[i];
                }
            }

            return -1;
        }

        , _update: function(selected){
            var c, list = [],
                pc = this.settings.panelCount,
                ph = this.settings.panelCount / 2,
                l = this.settings.data.length;
            var i = selected.index;
            var j = selected.dataModel.index;
            for (var k = j - ph; k <= j + ph - 1; k++){
                c = k;
                if (k < 0){
                    c = l + k;
                }
                if (k > l - 1){
                    c = k - l;
                }
                list.push(c);
            }
            var t = list.slice(ph - i);
            list = t.concat(list.slice(0, pc - t.length));

            for (i = 0; i < this.settings.mapping.length; i++){
                this.settings.mapping[i].update(list[i]);
            }
        }

        , _getTransformCss: function(radius, fn, degree){
            return 'translateZ(-' + radius + 'px) ' + fn + '(' + degree + 'deg)';
        }

        , _transform: function(fire_event){
            this.drum.style[this.settings.transformProp] = this._getTransformCss(
                this.settings.radius
                , this.settings.rotateFn
                , this.settings.rotation
            );

            var selected = this._getSelected();
            if (selected){
                var data = selected.dataModel;

                var last_index = this.element.selectedIndex;
                this.element.selectedIndex = data.index;

                if (fire_event && last_index !== data.index && this.settings.onChange){
                    this.settings.onChange(data.index);
                }

                var figures = this.drum.querySelectorAll("figure");
                for (var i = 0; i < figures.length; i++){
                    figures[i].classList.remove('active');
                }

                selected.elem.classList.add('active');

                if (selected.angle !== this.settings.last_angle && [0, 90, 180, 270].indexOf(selected.angle) >= 0){
                    this.settings.last_angle = selected.angle;
                    this._update(selected);
                }
            }
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
                var deg = this.settings.rotation + this.settings.theta + 1;
                this.settings.rotation = this._getNearest(deg);
                this._transform(true);
            }).bind(this));

            this.dialDown.addEventListener("click", (function(){
                var deg = this.settings.rotation - this.settings.theta - 1;
                this.settings.rotation = this._getNearest(deg);
                this._transform(true);
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

/**
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Copyright (c) 2017 Keith Maika <keithm@kickenscripts.us>;
 * Licensed under the MIT license
 */


(function(){
    function PanelModel(index, data_index, settings){
        this.index = index;
        this.dataModel = new (function(data, i){
            this.data = data;
            this.index = i;
            this.getText = function(){
                return this.data[this.index];
            };
        })(settings.data, data_index);

        this.init = function(){
            this.angle = settings.theta * index;
            this.elem = document.createElement('figure');
            this.elem.classList.add('a' + this.angle * 100);
            // this.elem.style.opacity = 0.5;
            this.elem.style[settings.transformProp] = settings.rotateFn + '(' + -this.angle + 'deg) translateZ(' + settings.radius + 'px)';
            this.setText();
        };
        this.setText = function(){

            this.elem.innerHTML = this.dataModel.getText();
        };
        this.update = function(data_index){
            if (this.dataModel.index !== data_index){
                this.dataModel.index = data_index;
                this.setText();
            }
        };
    }

    this.Drum.PanelModel = PanelModel;
}());
