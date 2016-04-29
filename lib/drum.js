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

                this.elem.textContent = this.dataModel.getText();
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
                rotateFn: 'rotateX'
            }

            for (var option in options) {
                if (settings.hasOwnProperty(option)) settings[option] = options[option]
            }


            settings.transformProp = transformProp;
            settings.rotation = 0;
            settings.distance = 0;
            settings.last_angle = 0;
            settings.theta = 360 / settings.panelCount;

            settings.initselect = HTMLselect.selectedIndex;

            settings.data = [];
            for (var i = 0; i < HTMLselect.children.length; i++) {
                settings.data.push(HTMLselect.children[i].textContent);
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

        };

        init();
    }

    this.Drum = Drum;

})();
