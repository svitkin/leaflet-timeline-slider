// TODO: parameterize timeline colors, overall length, and length between points (css styles)
L.Control.TimeLineSlider = L.Control.extend({

    options: {
        position: 'topright',
        valChoice: 'label',
        changeMap: function(val, map) {
            console.log("You are not using the " + val + "from the timeline to change the map.");
        },
        initializeChange: true,
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
        this.slider.innerHTML = '<input id="rangeinputslide" type="range" min="1" max="2" steps="1" value="1"></input>'

        this.rangeLabels = L.DomUtil.create('ul', 'range-labels', this.container);
        this.rangeLabels.innerHTML = '<li>2000 BC</li><li>1776</li>';

        this.rangeInput = L.DomUtil.get(this.slider).children[0];
        this.rangeLabelArray = Array.from(this.rangeLabels.getElementsByTagName('li'));
        this.sliderLength = this.rangeLabelArray.length;
        

        that = this;

        /* When input gets changed change styles on slider and trigger user's changeMap function */
        L.DomEvent.on(this.rangeInput, "input", function() {
            
            value = this.value;
            // console.log(value);

            that.sheet.textContent = that.getTrackStyle(this, that.sliderLength);
            var curLabel = that.rangeLabelArray[value-1].innerHTML;
            console.log(that.sheet);
            // console.log("Current value passed in is " + value);
            // console.log("Current label passed in is " + curLabel);
            
            // Change map according to either current label or value chosen
            if (that.options.valChoice == 'label') {
                changeVal = curLabel;
            } else {
                changeVal = value;
            }
            console.log(that.options.changeMap);
            that.options.changeMap(changeVal, that.map);
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
            this.rangeInput.dispatchEvent(inputEvent)
        }
        //console.log(this.sheet);
        return this.container;

    },

    getTrackStyle: function (el, sliderLength) {  
        prefs = ['webkit-slider-runnable-track', 'moz-range-track', 'ms-track'];

        var curVal = el.value,
            labelIndex = curVal - 1,
            val = (labelIndex) * (100/(sliderLength-1)),
            style = '';
        
        // Remove active and selected classes from all labels
        for (li of that.rangeLabelArray) {
            L.DomUtil.removeClass(li, 'active');
            L.DomUtil.removeClass(li, 'selected');
        }

        // Find label that should be active and give it appropriate classes
        var curLabel = that.rangeLabelArray[labelIndex];
        console.log(curLabel);
        L.DomUtil.addClass(curLabel, 'active');
        L.DomUtil.addClass(curLabel, 'selected');

        // For labels before active label, add selected class
        for (i = 0; i < curVal; i++) {
            L.DomUtil.addClass(that.rangeLabelArray[i], 'selected');
        }

        // Change background gradient
        for (var i = 0; i < prefs.length; i++) {
          style += '.range {background: linear-gradient(to right, #37adbf 0%, #37adbf ' + val + '%, #fff ' + val + '%, #fff 100%)}';
          style += '.range input::-' + prefs[i] + '{background: linear-gradient(to right, #37adbf 0%, #37adbf ' + val + '%, #b2b2b2 ' + val + '%, #b2b2b2 100%)}';
        }

        //console.log(style);
        return style;
      }
      
})

L.control.timelineSlider = function(options) {
    return new L.Control.TimeLineSlider(options);
}