# leaflet-timeline-slider
Leaflet plugin that creates a customizable timeline slider.
Original implementation of timeline at https://codepen.io/trevanhetzel/pen/rOVrGK.

### Requirements 
- Leafelt 1.4.0
- jQuery 3.3.1
- Tested with Mozilla Firefox and Google Chrome
- Compatible with Microsoft Edge, Mozilla Firefox, and Google Chrome

### Instructions for Use
After loading leaflet css, leaflet js and jQuery in your HTML, include the downloaded js file from this repository:
```
    <script
    src="https://code.jquery.com/jquery-3.3.1.min.js"
    integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
    crossorigin="anonymous"></script>

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.4.0/dist/leaflet.css"
    integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA=="
    crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"
    integrity="sha512-QVftwZFqvtRNi0ZyCtsznlKSWOStnDORoefr1enyq5mVL4tmKB3S/EnC3rRJcxCPavG10IcrVGSmPh6Qw5lwrg=="
    crossorigin=""></script>

    <script src="leaflet-timeline-slider.min.js"></script>
```

### Demos
https://svitkin.github.io/leaflet-timeline-slider/

### Example Usage
```
L.control.timelineSlider({
                timelineItems: ["Day 1", "The Next Day", "Amazing Event", "1776", "12/22/63", "1984"],
                valChoice: "both", 
                changeMap: changeMapFunction })
            .addTo(mymap);
```
### Options
Options get passed to the timeline slider function in an options object. See table below for full description of customizable options for your timeline.


| Option | Description      | Default             |
| ----- | ----------- | ----------- |
| position      | Corner of map timeline will go | "bottomright" |
| timelineItems   | Array of names that will be used as timeline events | ["Today", "Tomorrow", "The Next Day"] |
| valChoice   | TODO        | "label" |
| changeMap   | Function that will execute when element of timeline is chosen  | `function(val, map) { console.log("You are not using the value or label from the timeline to change the map."); }` |
| initializeChange   | Boolean indicating whether you want changeMap function to run when timeline is first loaded  | true |
| thumbHeight   | Height in pixels of moving thumb | "4.5px" |
| labelWidth   | Width in pixels between labels on timeline | "80px" |
| betweenLabelAndRangeSpace | Size in pixels of space between timeline and labels | "20px" |
| labelFontSize | Size in pixels of timeline labels | "14px" |
| activeColor   | Color of timeline and labels when active | "#37adbf" |
| inactiveColor   | Color of timeline and labels when inactive | "#8e8e8e" |
| backgroundOpacity   | Opacity of background of timeline | 0.75 |
| backgroundColor   | Color of background of timeline | "#ffffff" |
| topBgPadding   | Top padding in pixels for background | "10px"  |
| bottomBgPadding   | Bottom padding in pixels for background | "0px" |
| rightBgPadding   | Right padding in pixels for background | "30px" |
| leftBgPadding   | Right padding in pixels for background | "30px" |