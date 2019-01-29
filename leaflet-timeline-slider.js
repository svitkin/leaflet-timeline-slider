// TODO: parameterize timeline colors, overall length, and length between points (css styles)
L.Control.TimeLineSlider = L.Control.extend({

    options: {
        position: 'topright',
        timelineItems: ["Today", "Tomorrow", "The Next Day"],

        valChoice: 'label',
        changeMap: function(val, map) {
            console.log("You are not using the " + val + " from the timeline to change the map.");
        },
        initializeChange: true,
        
        thumbRadius: "4.5px",
        labelWidth: "90.25px",
        labelFontSize: "14px",
        activeColor: "#37adbf",
        inactiveColor: "#b2b2b2",
        
        backgroundOpacity: 0.95,
        backgroundColor: "#ffffff",
        rightBgMargin: "30px",
        leftBgMargin: "30px",
        rightBgPadding: "30px",
        leftBgMPadding: "30px",

    },

    // TODO: Initialize checking of function changeMap and valChoice
    //initialize: function (f, options) {
    //    console.log(this.options.changeMap);
    //    console.log(typeof(this.options.changeMap));
    //    if (typeof this.options.changeMap != "function") {
    //        this.options.changeMap = function (val, map) {
    //            return val;
    //        };
    //    }
    //    if (this.options.valChoice != 'label' | this.options.valChoice != 'value') {
    //        this.options.valChoice = 'label';
    //    }
    //},

    onAdd: function(map) {
        this.map = map;
        this.sheet = document.createElement('style');
        document.body.appendChild(this.sheet);

        this.container = L.DomUtil.create('div', 'control_container');

        /* Prevent click events propagation to map */
        L.DomEvent.disableClickPropagation(this.container);

        /* Prevent right click event propagation to map */
        L.DomEvent.on(this.container, 'control_container', function (ev)
        {
            L.DomEvent.stopPropagation(ev);
        });

        /* Prevent scroll events propagation to map when cursor on the div */
        L.DomEvent.disableScrollPropagation(this.container);

        /* Create html elements for input and labels */
        this.slider = L.DomUtil.create('div', 'range', this.container);
        this.slider.innerHTML = `<input id="rangeinputslide" type="range" min="1" max="${this.options.timelineItems.length}" steps="1" value="1"></input>`

        this.rangeLabels = L.DomUtil.create('ul', 'range-labels', this.container);
        this.rangeLabels.innerHTML = this.options.timelineItems.map((item) => { return "<li>" + item + "</li>" }).join('');

        this.rangeInput = L.DomUtil.get(this.slider).children[0];
        this.rangeLabelArray = Array.from(this.rangeLabels.getElementsByTagName('li'));
        this.sliderLength = this.rangeLabelArray.length;

        this.thumbSize = parseFloat(this.options.thumbRadius) * 2;
        this.activeThumbSize = this.thumbSize * 2;

        this.rangeWidthCSS = parseFloat(this.options.labelWidth) * (this.options.timelineItems.length-1) + (this.thumbSize*2);
        this.rlLabelMargin = parseFloat(this.options.labelWidth)/2 - 2;
        
        this.backgroundRGBA = this.hexToRGBA(this.options.backgroundColor, this.options.backgroundOpacity)
        console.log("The width of the range is " + this.rangeWidthCSS);
        
        this.sheet.textContent = `
            .control_container { 
                background-color: ${this.backgroundRGBA};
                padding: 15px ${this.options.rightBgPadding} 15px ${this.options.leftBgMPadding};
                margin: 15px ${this.optionsleftBgMargin} 15px ${this.options.rightBgMargin};
            }

            .range {
                left: -${this.thumbSize}px;
                opacity: ${this.backgroundOpacity};
                width: ${this.rangeWidthCSS}px;
            }
            .range input {
                opacity: ${this.backgroundOpacity};
            }

            .range input::-webkit-slider-thumb {
                width: ${this.activeThumbSize}px;
                height: ${this.activeThumbSize}px;    
            }
            .range input::-moz-range-thumb {
                width: ${this.activeThumbSize}px;
                height: ${this.activeThumbSize}px;
                
            }
            .range input::-ms-thumb {
                width: ${this.activeThumbSize}px;
                height: ${this.activeThumbSize}px;
            }


            .range input::-webkit-slider-runnable-track {
                background: red;
            }
            .range input::-moz-range-track {
                background: ${this.options.inactiveColor};
            }
            .range input::-ms-track {
                background: ${this.options.inactiveColor};
            }

            .range-labels {
                margin: 18px -${this.rlLabelMargin}px 0;
            }

            .range-labels li {
                color: ${this.options.inactiveColor};
                width: ${this.options.labelWidth};
                font-size: ${this.options.labelFontSize};
            }
            .range-labels li::before {
                background: ${this.options.inactiveColor};
                width: ${this.thumbSize}px;
                height: ${this.thumbSize}px;
            }
            
            .range input::-webkit-slider-thumb {
                background: ${this.options.activeColor};
            }
            .range input::-moz-range-thumb {
                background: ${this.options.activeColor};
            }
            .range input::-ms-thumb {
                background: ${this.options.activeColor};
            }
            .range-labels .active {
                color: ${this.options.activeColor};
            }
            .range-labels .selected::before {
                background: ${this.options.activeColor};
            }`


        that = this;

        /* When input gets changed change styles on slider and trigger user's changeMap function */
        L.DomEvent.on(this.rangeInput, "input", function() {
            
            value = this.value;
            // console.log(value);

            that.sheet.textContent += that.getTrackStyle(this, that.sliderLength);
            var curLabel = that.rangeLabelArray[value-1].innerHTML;
            // console.log("Current value passed in is " + value);
            // console.log("Current label passed in is " + curLabel);
            
            // Change map according to either current label or value chosen
            if (that.options.valChoice === 'label') {
                changeVal = curLabel;
                that.options.changeMap(changeVal, that.map);
            } else if (that.options.valChoice === 'value') {
                changeVal = value;
                that.options.changeMap(changeVal, that.map);
            } else if (that.options.valChoice === 'both') {
                that.options.changeMap(label = curLabel, value = value, map = that.map);
            }

            
        });

        // Add click event to each label so it triggers input change for corresponding value
        for (li of this.rangeLabelArray) {
            L.DomEvent.on(li, "click", function (e) {
                var targetli = e.target;
                var index = that.rangeLabelArray.indexOf(targetli);
                that.rangeInput.value = index + 1;
               
                var inputEvent = new Event('input');
                that.rangeInput.dispatchEvent(inputEvent);
               
            });
        };

        // Initialize input change at start
        if (this.options.initializeChange) {
            var inputEvent = new Event('input');
            this.rangeInput.dispatchEvent(inputEvent);
        }
        //console.log(this.sheet);
        return this.container;

    },
    
    hexToRGBA: function(hex, opacity){
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+opacity+')';
        }
        throw new Error('Bad Hex');
    },

    getTrackStyle: function (el, sliderLength) {  
        prefs = ['webkit-slider-runnable-track', 'moz-range-track', 'ms-track'];

        var curVal = el.value,
            labelIndex = curVal - 1,
            val = (labelIndex) * (100/(sliderLength-1)),
            coverVal = (parseFloat(that.thumbSize)/that.rangeWidthCSS) * 100;
            style = '';

        console.log(coverVal + "% is getting covered up");
        
        // Remove active and selected classes from all labels
        for (li of that.rangeLabelArray) {
            L.DomUtil.removeClass(li, 'active');
            L.DomUtil.removeClass(li, 'selected');
        }

        // Find label that should be active and give it appropriate classes
        var curLabel = that.rangeLabelArray[labelIndex];
        L.DomUtil.addClass(curLabel, 'active');
        L.DomUtil.addClass(curLabel, 'selected');

        // For labels before active label, add selected class
        for (i = 0; i < curVal; i++) {
            L.DomUtil.addClass(that.rangeLabelArray[i], 'selected');
        }

        // Change background gradient
        for (var i = 0; i < prefs.length; i++) {
          style += `.range {background: linear-gradient(to right, ${that.options.backgroundColor} 0%, ${that.options.backgroundColor} ${coverVal}%, ${that.options.activeColor} ${coverVal}%, ${that.options.activeColor} ${val}%,  ${that.options.backgroundColor} 0%, ${that.options.backgroundColor} 100%)}`;
          style += '.range input::-' + prefs[i] + `{background: linear-gradient(to right, ${that.options.backgroundColor} 0%, ${that.options.backgroundColor} ${coverVal}%, ${that.options.activeColor} 0%, ${that.options.activeColor} ${val}%, ${that.options.inactiveColor} ${val}%, ${that.options.inactiveColor} ${100-coverVal}%, ${that.options.backgroundColor} ${100-coverVal}%, ${that.options.backgroundColor} 100%)}`;
        }

        //console.log(style);
        return style;
      }
      
})

L.control.timelineSlider = function(options) {
    return new L.Control.TimeLineSlider(options);
}