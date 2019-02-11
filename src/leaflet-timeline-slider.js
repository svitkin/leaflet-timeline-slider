// TODO: parameterize timeline colors, overall length, and length between points (css styles)
L.Control.TimeLineSlider = L.Control.extend({

    options: {
        position: 'bottomright',
        timelineItems: ["Today", "Tomorrow", "The Next Day"],

        changeMap: function({label, value, map}) {
            console.log("You are not using the value or label from the timeline to change the map.");
        },
        extraChangeMapParams: {},
        initializeChange: true,
        
        thumbHeight: "4.5px",
        labelWidth: "80px",
        betweenLabelAndRangeSpace: "20px",

        labelFontSize: "14px",
        activeColor: "#37adbf",
        inactiveColor: "#8e8e8e",
        
        backgroundOpacity: 0.75,
        backgroundColor: "#ffffff",

        topBgPadding: "10px",
        bottomBgPadding: "0px",
        rightBgPadding: "30px",
        leftBgPadding: "30px",

    },

    initialize: function (options) {
        if (typeof options.changeMap != "function") {
            options.changeMap = function ({label, value, map}) {
                console.log("You are not using the value or label from the timeline to change the map.");
            };
        }
        
        if (parseFloat(options.thumbHeight) <= 2) {
            console.log("The nodes on the timeline will not appear properly if its radius is less than 2px.")
        }

        L.setOptions(this, options);
    },
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

        this.thumbSize = parseFloat(this.options.thumbHeight) * 2;
        // double the thumb size when its active
        this.activeThumbSize = this.thumbSize * 2;
  
        // make the width of the range div holding the input the number of intervals * the label width and add the thumb size on either end of the range
        this.rangeWidthCSS = parseFloat(this.options.labelWidth) * (this.options.timelineItems.length-1) + (this.thumbSize*2);
        
        // move labels over to the left so they line up; move half the width of the label and adjust for thumb radius
        this.rlLabelMargin = parseFloat(this.options.labelWidth)/2 - (parseFloat(this.options.thumbHeight)/2);
        
        // 2.5 because that is half the height of the range input
        this.topLabelMargin = parseFloat(this.options.betweenLabelAndRangeSpace) - parseFloat(this.options.thumbHeight) - 2.5;
        
        this.backgroundRGBA = this.hexToRGBA(this.options.backgroundColor, this.options.backgroundOpacity);
        this.coverBackgroundRGBA = this.hexToRGBA(this.options.backgroundColor, 0);
        
        that = this;

        this.sheet.textContent = this.setupStartStyles();

        /* When input gets changed change styles on slider and trigger user's changeMap function */
        L.DomEvent.on(this.rangeInput, "input", function() {
            
            curValue = this.value;

            that.sheet.textContent += that.getTrackStyle(this, that.sliderLength);
            var curLabel = that.rangeLabelArray[curValue-1].innerHTML;
            
            // Change map according to either current label or value chosen
            mapParams = {value: curValue, label: curLabel, map: map}
            allChangeMapParameters = {...mapParams, ...that.options.extraChangeMapParams};
            that.options.changeMap(allChangeMapParameters);
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

        return this.container;

    },

    onRemove: function() {
        // remove control html element
        L.DomUtil.remove(this.container);
    },
    
    hexToRGBA: function(hex, opacity){
        // from https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
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

    setupStartStyles: function() {
        style = `
            .control_container { 
                background-color: ${that.backgroundRGBA};
                padding: ${that.options.topBgPadding} ${that.options.rightBgPadding} ${that.options.bottomBgPadding} ${that.options.leftBgPadding};
            }

            .range {
                position: relative;
                left: -${that.thumbSize}px;
                height: 5px;
                width: ${that.rangeWidthCSS}px;
            }

            .range input {
                width: 100%;
                position: absolute;
                height: 0;
                -webkit-appearance: none;
            }

            /* -1 because the height is 2 (half the height) */
            .range input::-webkit-slider-thumb {
                background: ${that.options.activeColor};
                margin: -${that.thumbSize - 1}px 0 0;
                width: ${that.activeThumbSize}px;
                height: ${that.activeThumbSize}px;    
                -webkit-appearance: none;
                border-radius: 50%;
                cursor: pointer;
                border: 0 !important;
            }
            .range input::-moz-range-thumb {
                background: ${that.options.activeColor};
                margin: -${that.thumbSize - 1}px 0 0;
                width: ${that.activeThumbSize}px;
                height: ${that.activeThumbSize}px;
                border-radius: 50%;
                cursor: pointer;
                border: 0 !important;
            }
            .range input::-ms-thumb {
                background: ${that.options.activeColor};
                margin: -${that.thumbSize - 1}px 0 0;
                width: ${that.activeThumbSize}px;
                height: ${that.activeThumbSize}px;
                border-radius: 50%;
                cursor: pointer;
                border: 0 !important;
            }


            .range input::-webkit-slider-runnable-track {
                background: ${that.options.backgroundColor};
                width: 100%;
                height: 2px;
                cursor: pointer;
            }
            .range input::-moz-range-track {
                background: ${that.options.backgroundColor};
                width: 100%;
                height: 2px;
                cursor: pointer;
            }
            .range input::-ms-track {
                background: ${that.options.backgroundColor};
                width: 100%;
                height: 2px;
                cursor: pointer;
                background: transparent;
                border-color: transparent;
                color: transparent;
            }

            .range input:focus {
                background: none;
                outline: none;
            }

            . range input[type=range]::-moz-focus-outer {
                border: 0;
            }

            .range-labels {
                margin: ${that.topLabelMargin}px -${that.rlLabelMargin}px 0;
                padding: 0;
                list-style: none;
            }

            .range-labels li {
                color: ${that.options.inactiveColor};
                width: ${that.options.labelWidth};
                font-size: ${that.options.labelFontSize};
                position: relative;
                float: left;
                text-align: center;
                cursor: pointer;
            }
            .range-labels li::before {
                background: ${that.options.inactiveColor};
                width: ${that.thumbSize}px;
                height: ${that.thumbSize}px;
                position: absolute;
                top: -${that.options.betweenLabelAndRangeSpace};
                right: 0;
                left: 0;
                content: "";
                margin: 0 auto;
                border-radius: 50%;
            }
            .range-labels .active {
                color: ${that.options.activeColor};
            }
            .range-labels .selected::before {
                background: ${that.options.activeColor};
            }
            .range-labels .active.selected::before {
                display: none;
            }
            `;
            

            return style;

    },

    getTrackStyle: function (el, sliderLength) {  
        prefs = ['webkit-slider-runnable-track', 'moz-range-track', 'ms-track'];

        var curVal = el.value,
            labelIndex = curVal - 1,
            val = (labelIndex) * (100/(sliderLength-1)),
            coverVal = (parseFloat(that.thumbSize)/that.rangeWidthCSS) * 100;
            style = '';

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
          style += `.range {background: linear-gradient(to right, ${that.coverBackgroundRGBA} 0%, ${that.coverBackgroundRGBA} ${coverVal}%, ${that.options.activeColor} ${coverVal}%, ${that.options.activeColor} ${val}%,  ${that.coverBackgroundRGBA} 0%, ${that.coverBackgroundRGBA} 100%)}`;
          style += '.range input::-' + prefs[i] + `{background: linear-gradient(to right, ${that.coverBackgroundRGBA} 0%, ${that.coverBackgroundRGBA} ${coverVal}%, ${that.options.activeColor} 0%, ${that.options.activeColor} ${val}%, ${that.options.inactiveColor} ${val}%, ${that.options.inactiveColor} ${100-coverVal}%, ${that.coverBackgroundRGBA} ${100-coverVal}%, ${that.coverBackgroundRGBA} 100%)}`;
        }

        return style;
    }
      
})

L.control.timelineSlider = function(options) {
    return new L.Control.TimeLineSlider(options);
}