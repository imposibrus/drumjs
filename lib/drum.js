/*! Drum.JS - v0.1dev - 2014-01-09
 * http://mb.aquarius.uberspace.de/drum.js
 *
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Licensed under the MIT license */



(function() {

    var Drum = function(selector, options) {

        var that = this;
        var init = function() {

            var transformProp = false;

            var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
            for (var i = 0; i < prefixes.length; i++) {
                if (document.createElement('div').style[prefixes[i]] !== undefined) {
                    transformProp = prefixes[i];
                }
            }
            var element = document.querySelector(selector);

            that.drum = new Drum(element, options, transformProp);

        }

        var DrumIcon = (function() {
            var svgelem = function(tagName) {
                return document.createElementNS("http://www.w3.org/2000/svg", tagName);
            };
            var svgcanvas = function(width, height) {
                var svg = svgelem("svg");
                svg.setAttribute("width", width);
                svg.setAttribute("height", height);

                var g = svgelem("g");
                svg.appendChild(g);

                return svg;
            };
            var container = function(className) {
                var container = document.createElement("div");
                container.setAttribute("class", className);
                var inner = document.createElement("div");
                container.appendChild(inner);
                return container;
            };
            var path = function(settings) {
                var p = svgelem("path");
                var styles = {
                    "fill": "none",
                    "stroke": settings.dail_stroke_color,
                    "stroke-width": settings.dail_stroke_width + "px",
                    "stroke-linecap": "butt",
                    "stroke-linejoin": "miter",
                    "stroke-opacity": "1"
                };
                var style = "";
                for (var i in styles) {
                    p.setAttribute(i, styles[i]);
                }
                return p;
            };
            return {
                up: function(settings) {
                    var width = settings.dail_w;
                    var height = settings.dail_h;

                    var svg = svgcanvas(width, height);
                    var p = path(settings);

                    p.setAttribute("d", "m0," + (height + settings.dail_stroke_width) + "l" + (width / 2) + ",-" + height + "l" + (width / 2) + "," + height);
                    svg.firstChild.appendChild(p);

                    var cont = container("dial up");
                    cont.firstChild.appendChild(svg);
                    return cont;
                },
                down: function(settings) {
                    var width = settings.dail_w;
                    var height = settings.dail_h;

                    var svg = svgcanvas(width, height);
                    var p = path(settings);

                    p.setAttribute("d", "m0,-" + settings.dail_stroke_width + "l" + (width / 2) + "," + height + "l" + (width / 2) + ",-" + height);
                    svg.firstChild.appendChild(p);

                    var cont = container("dial down");
                    cont.firstChild.appendChild(svg);
                    return cont;
                }
            };
        })();

        var PanelModel = function(index, data_index, settings) {
            this.index = index;
            this.dataModel = new(function(data, i) {
                this.data = data;
                this.index = i;
                this.getText = function() {
                    return this.data[this.index];
                };
            })(settings.data, data_index);

            this.init = function() {
                this.angle = settings.theta * index;
                this.elem = document.createElement('figure');
                this.elem.classList.add('a' + this.angle * 100);
                this.elem.style.opacity = 0.5;
                this.elem.style[settings.transformProp] = settings.rotateFn + '(' + -this.angle + 'deg) translateZ(' + settings.radius + 'px)';
                this.setText();
            };
            this.setText = function() {

                this.elem.innerHTML = this.dataModel.getText();
            };
            this.update = function(data_index) {
                if (this.dataModel.index != data_index) {
                    this.dataModel.index = data_index;
                    this.setText();
                }
            };
        };

        var Drum = function(element, options, transformProp) {
            var HTMLselect = element;
            var obj = this;
            var options = options || {};
            var settings = {
                panelCount: 16,
                rotateFn: 'rotateX',
                interactive: true,
                dail_w: 20,
                dail_h: 5,
                dail_stroke_color: '#999999',
                dail_stroke_width: 1
            }

            for (var option in options) {
                // if (settings.hasOwnProperty(option))
                    settings[option] = options[option]
            }


            settings.transformProp = transformProp;
            settings.rotation = 0;
            settings.distance = 0;
            settings.last_angle = 0;
            settings.theta = 360 / settings.panelCount;

            settings.initselect = settings.initselect | HTMLselect.selectedIndex;

            if ( !settings.data ) {
                settings.data = [];
                for (var i = 0; i < HTMLselect.children.length; i++) {
                    settings.data.push(HTMLselect.children[i].textContent);
                }
            }

            element.style.display = "none";

            var wrapper = document.createElement("div");
            wrapper.classList.add("drum-wrapper");

            if (settings.id)
                wrapper.setAttribute('id', settings.id);
            else if (HTMLselect.id)
                wrapper.setAttribute('id', 'drum_' + HTMLselect.id);
            else if (HTMLselect.getAttribute('name'))
                wrapper.setAttribute('id', 'drum_' + HTMLselect.getAttribute('name'));

            var inner = document.createElement("div");
            inner.classList.add("inner");
            wrapper.appendChild(inner);

            var container = document.createElement("div");
            container.classList.add("container");
            inner.appendChild(container);

            var drum = document.createElement("div");
            drum.classList.add("drum");
            container.appendChild(drum);

            if (settings.interactive === true) {
                var dialUp = DrumIcon.up(settings);
                wrapper.appendChild(dialUp);

                var dialDown = DrumIcon.down(settings);
                wrapper.appendChild(dialDown);

                wrapper.addEventListener("mouseover", function() {

                    this.querySelector(".up").style.display = "block";
                    this.querySelector(".down").style.display = "block";

                })

                wrapper.addEventListener("mouseout", function() {

                    this.querySelector(".up").style.display = "none";
                    this.querySelector(".down").style.display = "none";

                })
            }

            HTMLselect.parentNode.insertBefore(wrapper, HTMLselect.nextSibling);
            /* insert wrapper AFTER select */

            settings.radius = Math.round((drum.offsetHeight / 2) / Math.tan(Math.PI / settings.panelCount));
            settings.mapping = [];
            var c = 0;
            for (var i = 0; i < settings.panelCount; i++) {
                if (settings.data.length == i) break;
                var j = c;
                if (c >= (settings.panelCount / 2)) {
                    j = settings.data.length - (settings.panelCount - c);
                }
                c++;

                var panel = new PanelModel(i, j, settings);
                panel.init();
                settings.mapping.push(panel);

                drum.appendChild(panel.elem);
            }


            var getNearest = function(deg) {
                deg = deg || settings.rotation;
                var th = (settings.theta / 2);
                var n = 360;
                var angle = ((deg + th) % n + n) % n;
                angle = angle - angle % settings.theta;
                var l = (settings.data.length - 1) * settings.theta;
                if (angle > l) {
                    if (deg > 0) return l;
                    else return 0;
                }
                return angle;
            };
            var getSelected = function() {
                var nearest = getNearest();
                for (var i in settings.mapping) {
                    if (settings.mapping[i].angle == nearest) {
                        return settings.mapping[i];
                    }
                }
            };
            var update = function(selected) {
                var c, list = [],
                    pc = settings.panelCount,
                    ph = settings.panelCount / 2,
                    l = settings.data.length;
                var i = selected.index;
                var j = selected.dataModel.index;
                for (var k = j - ph; k <= j + ph - 1; k++) {
                    c = k;
                    if (k < 0) c = l + k;
                    if (k > l - 1) c = k - l;
                    list.push(c);
                }
                var t = list.slice(ph - i);
                list = t.concat(list.slice(0, pc - t.length));
                for (var i = 0; i < settings.mapping.length; i++) {
                    settings.mapping[i].update(list[i]);
                }
            };
            var transform = function(fire_event) {
                drum.style[settings.transformProp] = 'translateZ(-' + settings.radius + 'px) ' + settings.rotateFn + '(' + settings.rotation + 'deg)';

                var selected = getSelected();
                if (selected) {
                    var data = selected.dataModel;

                    var last_index = HTMLselect.selectedIndex;
                    HTMLselect.selectedIndex = data.index;

                    if (fire_event && last_index != data.index && settings.onChange)
                        settings.onChange(HTMLselect);

                    selected.elem.style.opacity = 1;

                    var figures = drum.querySelectorAll("figure:not(.a" + (selected.angle * 100));
                    for (var i = 0; i < figures.length; i++) {
                        figures[i].style.opacity = 0.5;
                    }

                    if (selected.angle != settings.last_angle && [0, 90, 180, 270].indexOf(selected.angle) >= 0) {
                        settings.last_angle = selected.angle;
                        update(selected);
                    }
                }
            };

            that.setIndex = function(dataindex) {            	
                var page = Math.floor(dataindex / settings.panelCount);
                var index = dataindex - (page * settings.panelCount);
                var selected = new PanelModel(index, dataindex, settings);
                update(selected);
                settings.rotation = index * settings.theta;
                transform(false);
            };

            that.setIndex(settings.initselect);

            
            that.getIndex = function() {                
                    return getSelected().dataModel.index;                
            };


            if (typeof(Hammer) != "undefined") {
                settings.touch = new Hammer(wrapper, {
                    prevent_default: true,
                    no_mouseevents: true
                });

                settings.touch.on("dragstart", function(e) {
                    settings.distance = 0;
                });

                settings.touch.on("drag", function(e) {
                    var evt = ["up", "down"];
                    if (evt.indexOf(e.gesture.direction) >= 0) {
                        settings.rotation += Math.round(e.gesture.deltaY - settings.distance) * -1;
                        transform(true);
                        settings.distance = e.gesture.deltaY;
                    }
                });

                settings.touch.on("dragend", function(e) {
                    settings.rotation = getNearest();
                    transform(true);
                });
            }

            if (settings.interactive) {
                dialUp.addEventListener("click", function(e) {
                    var deg = settings.rotation + settings.theta + 1;
                    settings.rotation = getNearest(deg);
                    transform(true);
                });
                dialDown.addEventListener("click", function(e) {
                    var deg = settings.rotation - settings.theta - 1;
                    settings.rotation = getNearest(deg);
                    transform(true);
                });
            }

        };

        init();
    }

    this.Drum = Drum;

})();
