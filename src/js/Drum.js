/*! Drum.JS - v0.1dev - 2014-01-09
 * http://mb.aquarius.uberspace.de/drum.js
 *
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Licensed under the MIT license */


(function(){
    function Drum(element, options, transformProp){
        var HTMLselect = element;
        var that = this;
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

        for (var option in options){
            // if (settings.hasOwnProperty(option))
            settings[option] = options[option]
        }


        settings.transformProp = transformProp;
        settings.rotation = 0;
        settings.distance = 0;
        settings.last_angle = 0;
        settings.theta = 360 / settings.panelCount;

        settings.initselect = settings.initselect | HTMLselect.selectedIndex;

        if (!settings.data){
            settings.data = [];
            for (var i = 0; i < HTMLselect.children.length; i++){
                settings.data.push(HTMLselect.children[i].textContent);
            }
        }

        element.style.display = "none";

        var wrapper = document.createElement("div");
        wrapper.classList.add("drum-wrapper");

        if (settings.id){
            wrapper.setAttribute('id', settings.id);
        } else if (HTMLselect.id){
            wrapper.setAttribute('id', 'drum_' + HTMLselect.id);
        } else if (HTMLselect.getAttribute('name')){
            wrapper.setAttribute('id', 'drum_' + HTMLselect.getAttribute('name'));
        }

        var inner = document.createElement("div");
        inner.classList.add("inner");
        wrapper.appendChild(inner);

        var container = document.createElement("div");
        container.classList.add("container");
        inner.appendChild(container);

        var drum = document.createElement("div");
        drum.classList.add("drum");
        container.appendChild(drum);

        if (settings.interactive === true){
            var dialUp = Drum.DrumIcon.up(settings);
            wrapper.appendChild(dialUp);

            var dialDown = Drum.DrumIcon.down(settings);
            wrapper.appendChild(dialDown);

            wrapper.addEventListener("mouseover", function(){

                this.querySelector(".up").style.display = "block";
                this.querySelector(".down").style.display = "block";

            })

            wrapper.addEventListener("mouseout", function(){

                this.querySelector(".up").style.display = "none";
                this.querySelector(".down").style.display = "none";

            })
        }

        HTMLselect.parentNode.insertBefore(wrapper, HTMLselect.nextSibling);
        /* insert wrapper AFTER select */

        settings.radius = Math.round((drum.offsetHeight / 2) / Math.tan(Math.PI / settings.panelCount));
        settings.mapping = [];
        var c = 0;
        for (var i = 0; i < settings.panelCount; i++){
            if (settings.data.length == i){
                break;
            }
            var j = c;
            if (c >= (settings.panelCount / 2)){
                j = settings.data.length - (settings.panelCount - c);
            }
            c++;

            var panel = new Drum.PanelModel(i, j, settings);
            panel.init();
            settings.mapping.push(panel);

            drum.appendChild(panel.elem);
        }


        var getNearest = function(deg){
            deg = deg || settings.rotation;
            var th = (settings.theta / 2);
            var n = 360;
            var angle = ((deg + th) % n + n) % n;
            angle = angle - angle % settings.theta;
            var l = (settings.data.length - 1) * settings.theta;
            if (angle > l){
                if (deg > 0){
                    return l;
                } else {
                    return 0;
                }
            }
            return angle;
        };
        var getSelected = function(){
            var nearest = getNearest();
            for (var i in settings.mapping){
                if (settings.mapping[i].angle == nearest){
                    return settings.mapping[i];
                }
            }
        };
        var update = function(selected){
            var c, list = [],
                pc = settings.panelCount,
                ph = settings.panelCount / 2,
                l = settings.data.length;
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
            for (var i = 0; i < settings.mapping.length; i++){
                settings.mapping[i].update(list[i]);
            }
        };
        var transform = function(fire_event){
            drum.style[settings.transformProp] = 'translateZ(-' + settings.radius + 'px) ' + settings.rotateFn + '(' + settings.rotation + 'deg)';

            var selected = getSelected();
            if (selected){
                var data = selected.dataModel;

                var last_index = HTMLselect.selectedIndex;
                HTMLselect.selectedIndex = data.index;

                if (fire_event && last_index != data.index && settings.onChange)
                // settings.onChange(HTMLselect);
                {
                    settings.onChange(data.index);
                }

                // selected.elem.style.opacity = 1;

                var figures = drum.querySelectorAll("figure");
                for (var i = 0; i < figures.length; i++){
                    // figures[i].style.opacity = 0.5;
                    figures[i].classList.remove('active');
                }

                selected.elem.classList.add('active');

                if (selected.angle != settings.last_angle && [0, 90, 180, 270].indexOf(selected.angle) >= 0){
                    settings.last_angle = selected.angle;
                    update(selected);
                }
            }
        };

        that.setIndex = function(dataindex){

            if (dataindex == that.getIndex()){
                transform(false);
                return;
            }

            var page = Math.floor(dataindex / settings.panelCount);
            var index = dataindex - (page * settings.panelCount);
            var selected = new Drum.PanelModel(index, dataindex, settings);
            update(selected);
            settings.rotation = index * settings.theta;
            transform(false);
        };


        that.getIndex = function(){
            return getSelected()?getSelected().dataModel.index:null;
        };

        that.setIndex(settings.initselect);

        that.updateItems = function(data){

            HTMLselect.parentNode.removeChild(wrapper);

            options.data = data;
            var drum = new Drum(element, options, transformProp);
            // element.data('drum', drum);
        }


        if (typeof(Hammer) != "undefined"){
            var v = 0,
                interval,
                isDragging;

            settings.touch = new Hammer(wrapper, {
                prevent_default: true,
                no_mouseevents: true
            });

            settings.touch.on("dragstart", function(e){

                settings.distance = 0;
                isDragging = true;

                if (!interval){
                    interval = setInterval(function(argument){

                        settings.rotation = ( settings.rotation + v + 360 ) % 360;

                        if (!isDragging){
                            v /= 1.03;
                        } else {
                            v /= 1.1;
                        }

                        if (!isDragging && Math.pow(v, 2) < 0.001){
                            clearInterval(interval);
                            interval = null;
                        } else if (!isDragging && Math.pow(v, 2) < .5 && Math.pow(settings.rotation - getNearest(),
                                2) < .1){
                            settings.rotation = getNearest();
                            clearInterval(interval);
                            interval = null;
                            v = 0;
                        }

                        transform(true);

                    }, 20)
                }

            });

            settings.touch.on("drag", function(e){
                // var evt = ["up", "down"];
                // if (evt.indexOf(e.gesture.direction) >= 0) {
                // settings.rotation += Math.round(e.gesture.deltaY - settings.distance) * -1;
                v += ( Math.round(e.gesture.deltaY - settings.distance) * -1 ) / 25;
                // transform(true);
                settings.distance = e.gesture.deltaY;
                // }
            });

            settings.touch.on("dragend", function(e){
                isDragging = false;

                var distance = settings.rotation - getNearest();

                if (distance > 180){
                    distance = 360 - distance;
                }

                if (Math.pow(v, 2) < .5){
                    v = (distance) / -20;
                }
                // settings.rotation = getNearest();
                // transform(true);
            });
        }

        if (settings.interactive){
            dialUp.addEventListener("click", function(e){
                var deg = settings.rotation + settings.theta + 1;
                settings.rotation = getNearest(deg);
                transform(true);
            });
            dialDown.addEventListener("click", function(e){
                var deg = settings.rotation - settings.theta - 1;
                settings.rotation = getNearest(deg);
                transform(true);
            });
        }
    }

    this.Drum = Drum;
}());
