DrumJS - no jQuery
======

DrumJs is a jQuery plugin, which allows to replace a simple native HTMLselect Element with 3d cylinder as an alternate selector.
Original version can be found here: https://github.com/3epnm/drumjs

This fork got rid of jQuery dependency. This should work on all modern browsers except IE (due to 3d transformations). Should work on Edge, won't work on IE11 and below, although it's easy to add IE11 support.


##Usage
``` 
var drumjs = new Drum(selector, options)
```
###Options
**selector** is a string that will be used in _document.querySelector_ and **options** is an object, described in original [documentation](https://github.com/3epnm/drumjs#options-and-events)
###Methods

##### getIndex
Will return index of currently selected element
```
drumjs.getIndex()
```
##### setIndex(integer)
Will set the slider to provided value
``` 
drumjs.setIndex(50)
```
