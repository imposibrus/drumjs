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
