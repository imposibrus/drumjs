/*! Drum.JS - v0.1dev - 2014-01-09
 * http://mb.aquarius.uberspace.de/drum.js
 *
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Licensed under the MIT license */



(function() {

    var Drum = function(selector, options) {

        var that = this;
        var init = function() {

            var element = document.querySelector(selector);

            that.drum = new Drum(element, options);

        }

        var PanelModel = function(index, text) {
            this.index = index;

            this.elem = document.createElement('figure');   
            this.elem.textContent = text; 

        };

        var Drum = function(element, options) {
            var HTMLselect = element;
            var obj = this;
            var options = options || {};
            var settings = {};

            //set options

            for (var option in options) {
                if (settings.hasOwnProperty(option)) settings[option] = options[option]
            }
           
            settings.rotation = 0;
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

            var container = document.createElement("div");
            container.classList.add("container");
            wrapper.appendChild(container);

            var drum = document.createElement("div");
            drum.classList.add("drum");
            container.appendChild(drum);

            /* insert wrapper AFTER select */
            HTMLselect.parentNode.insertBefore(wrapper, HTMLselect.nextSibling);            

            settings.mapping = [];

            for (var i = 0; i < settings.data.length; i++) {
                var panel = new PanelModel(i, settings.data[i] );
                settings.mapping.push(panel);
                drum.appendChild(panel.elem);
            }

            settings.unit = settings.mapping[0].elem.clientHeight;
            settings.height = settings.unit * settings.mapping.length;

            var getNearest = function() {            	
            	if (settings.rotation < 0) return 0;
            	if (settings.rotation > (settings.height - 1)) return settings.height - settings.unit;
            	return Math.round(settings.rotation / settings.unit) * settings.unit;
            }

            var getSelected = function() {
                var nearest = getNearest();
                return settings.mapping[nearest/settings.unit];
            };

            var transform = function(fire_event) {

                drum.style.top = -settings.rotation + "px";

                var selected = getSelected();
                if (selected) {                                   	
                    var last_index = HTMLselect.selectedIndex;
                    HTMLselect.selectedIndex = selected.index;

                    if (fire_event && last_index != selected.index && settings.onChange)
                        settings.onChange(HTMLselect);

                    var figures = drum.querySelectorAll("figure");
                    for (var i = 0; i < figures.length; i++) {
                        figures[i].classList.remove('selected');
                    }

                    selected.elem.classList.add('selected')
                }
            };

            that.setIndex = function(dataindex) {
                settings.rotation = dataindex * settings.unit;
                settings.rotation = getNearest();
                transform(false);
            };

            that.setIndex(settings.initselect);

            
            that.getIndex = function() {                
                return getSelected().index;                
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
