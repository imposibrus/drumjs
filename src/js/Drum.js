/**
 * Copyright (c) 2013 Marcel Bretschneider <marcel.bretschneider@gmail.com>;
 * Copyright (c) 2017 Keith Maika <keithm@kickenscripts.us>;
 * Licensed under the MIT license
 */

(function(){
    // From http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
    var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));

    function Drum(element, options){
        this.element = element;
        this.settings = this._mergeSettings(options);
        this.transformProp = this._getTransformProperty();
        this._render();


        if (this.settings.interactive){
            var hasHammer = typeof Hammer !== 'undefined';
            if (hasHammer && isTouch){
                this._configureHammer();
            } else {
                this._configureEvents();
            }
        }

        this.setIndex(this.settings.index, false);
    }

    Drum.prototype = {
        setIndex: function(newIndex, fireEvent){
            var max = this.settings.data.length;
            if (newIndex > max){
                newIndex = newIndex % max;
            } else if (newIndex < 0){
                newIndex = max - (Math.abs(newIndex) % max);
            }

            this.index = newIndex;
            this.updateDisplay();

            if (fireEvent === undefined){
                fireEvent = true;
            }

            this._sync(fireEvent);
        }

        , getIndex: function(){
            return this.index;
        }

        , getSelected: function(){
            return this._getItem(this.index).value;
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
                radius: 80,
                wedgeHeight: 30,
                rotateFn: 'rotateX',
                interactive: true,
                dial_w: 20,
                dial_h: 10,
                dial_stroke_color: '#999999',
                dial_stroke_width: 1,
                index: this.element.selectedIndex,
                onChange: null
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
            var wrapper, inner, container, drum;

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
                this._createDialButtons();
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

        , _createDialButtons: function(){
            var width = this.settings.dial_w;
            var height = this.settings.dial_h;
            var color = this.settings.dial_stroke_color;
            var thickness = this.settings.dial_stroke_width;

            this.dialUp = Drum.UpButton(width, height, color, thickness);
            this.wrapper.appendChild(this.dialUp);

            this.dialDown = Drum.DownButton(width, height, color, thickness);
            this.wrapper.appendChild(this.dialDown);
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
            var midpoint = Math.floor(count / 2);

            for (i = 0; i < midpoint; i++){
                items.push(this._getItem(i + selectedIndex));
            }

            for (i = count - midpoint; i > 0; i--){
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
            drumItem.textContent = (item || {}).label || '';
        }

        , _getDrumTransformation: function(radius, fn, degree){
            return 'translateZ(-' + radius + 'px) ' + fn + '(' + degree + 'deg)';
        }

        , _getItemTransformation: function(radius, fn, degree){
            return fn + '(' + degree + 'deg) translateZ(-' + radius + 'px) ';
        }

        , _applyTransformations: function(){
            this._rotateDrum(0);

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

        , _rotateDrum: function(angle){
            this.drum.style[this.transformProp] = this._getDrumTransformation(
                this.settings.radius
                , this.settings.rotateFn
                , angle
            );
        }

        , _configureHammer: function(){
            var pan = new Hammer.Pan({
                direction: Hammer.DIRECTION_VERTICAL
            });

            var manager = new Hammer.Manager(this.drum);
            manager.add(pan);

            manager.on('pan', (function(e){
                var theta = e.deltaY / this.settings.radius;
                theta = (theta * 180) / Math.PI;
                this._rotateDrum(theta);
                if (e.isFinal){
                    var wedges = -Math.round(e.deltaY / this.settings.wedgeHeight);
                    this.setIndex(this.index + wedges);
                    this._rotateDrum(0);
                }
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

            this.wrapper.addEventListener('wheel', (function(e){
                var newIndex = this.index + (e.wheelDelta < 0?-1:1);
                this.setIndex(newIndex);
            }).bind(this));
        }

        , _sync: function(fireEvent){
            var selected = this._getItem(this.index);
            var value = selected.value;

            if (value instanceof HTMLOptionElement){
                value.selected = true;
            } else if (value instanceof HTMLElement){
                value.classList.add('selected');
            }

            if (fireEvent){
                this._fireChangeEvent(value);
            }
        }

        , _fireChangeEvent: function(){
            var event;
            try {
                event = new Event('change');
            } catch (e){
                event = document.createEvent('Event');
                event.initEvent('change', true, false);
            }

            if (this.settings.onChange){
                this.settings.onChange.call(this, event);
            }

            if (this.element.dispatchEvent){
                this.element.dispatchEvent(event);
            }
        }
    };

    this.Drum = Drum;
}());
