# Elastic Progress
Creates a button that turns into a progress bar with a elastic effect. Based on a [Dribbble shot](https://dribbble.com/shots/1887815-Download) by [xjw](https://dribbble.com/xjw). By Lucas Bebber.

[Article on Codrops](http://tympanus.net/codrops/?p=25030)

[Demo](http://tympanus.net/Development/ElasticProgress/)

![Elastic Progress](http://codropspz.tympanus.netdna-cdn.com/codrops/wp-content/uploads/2015/09/elasticprogress.gif)

## Instructions

This project requires [GSAP](http://greensock.com/gsap). You can use either  TweenMax...

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/TweenMax.min.js"></script>
```

...or TweenLite, with EasePack and the CSS and attr plugins:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/TweenLite.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/easing/EasePack.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/plugins/CSSPlugin.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/plugins/AttrPlugin.min.js"></script>
```

Then, include the `elastic-progress.min.js` file, located in the `dist` folder:

```html
<script src="path/to/js/elastic-progress.min.js"></script>
```

### Usage

Create the element you want to turn into a button:

```html
<div class="Upload" role="button" aria-label="Upload file"></div>
```
<sub> **Note:** We are using a `div` element with `role="button"` instead of a `button` element because, according to W3C recommendation, `button` elements should have no interactive elements as descendants. </sub>

Then, via JS:

```js
var element=document.querySelector('.Upload');
var progress=new ElasticProgress(element, { /*options*/ });

// or...

var progress=new ElasticProgress('.Upload', { /*options*/});
```

Or, in case you are using jQuery:

```js
$('.Upload').ElasticProgress({/*options*/});
```

### Setting Options

Options are set on the constructor, like this:
```js
var progress=new ElasticProgress('.Upload', {
  colorFg:"#FF0000",
  buttonSize:80,
  //...
})
```

A [complete list of options](#options) can be found below.

### Calling Methods

The button doesn't do much by itself - controlling the opening, bar progress, etc. is in your charge.

```js
var progress=new ElasticProgress('.Upload', {
  // ...
  onClick:function(){
    progress.open();
  }
});
function theFunctionYouAreUsingToCheckProgress(){
  // ...
  progress.set(value);
}


// with jQuery
$(".Upload").ElasticProgress({
  // ...
  onClick:function(){
    $(this).ElasticProgress('open');
  }
});

function theFunctionYouAreUsingToCheckProgress(){
  // ...
  $(".Upload").ElasticProgress('set',value);
}

```

A [complete list of methods](#methods) can be found below.

## Options

* **arrowDirection** `string`  
Either `'up'` or `'down'`. Defaults to `'down'`.

#### Colors

* **colorFg**, **colorBg** `string`  
Colors of the foreground (the arrow, the filled part of the progress bar) and the background (the circle, the empty part of the progress bar), respectively.
Defaults are white and black.

* **highlightColor** `string`  
Color of the highlight outline. Defaults to `#08F`.

* **background** `string`  
Color of the overlay during the "pop" animation. Defaults to the background color of the `body`.

#### Size

* **buttonSize** `number`  
Circumference of the button. Defaults to the height of the element.

* **width** `number`  
Width of the expanded progress bar. Defaults to the width of the element.

* **labelHeight** `number`  
Height of the label, in pixels. Defaults to 53.

* **barHeight** `number`  
Thickness of the progress bar. Defaults to 4.

* **barInset** `number`  
Inset of the filled part of the progress bar. Defaults to -0.5 <sub>Helps covering jagged edges</sub>.

* **bleedTop**, **bleedRight**, **bleedLeft** and **bleedBottom** `number`  
Margin to draw the graphics. If there's clipping during the animation, increase these values. Performance might take a hit for values too large.
Defaults to 100, 50, 50 and 60 respectively.

#### Text

* **fontFamily** `string`  
Font used for the label. Defaults to `'Helvetica Neue','Helvetica','Arial',sans-serif`. This default is added to the value set, so there's no need to manually set these as fallback.

* **fontWeight** `string`  
Defaults to `'bold'`.

* **textComplete**, **textFail** and **textCancel** `string`  
Texts that will be shown on these events. Defaults are `'Done'`, `'Failed'` and `'Canceled'`.

#### Animation

* **barStretch** `number`  
The maximum distance the bar will stretch. Defaults to 20.

* **jumpHeight** `number`  
How hight the arrow/label will jump. Defaults to 50.

* **barElasticOvershoot** and **barElasticPeriod** `number`  
Settings for the elastic animation. Defaults are 1.8 and 0.15, respectively.

* **labelWobbliness** `number`  
Setting for the animation of the label during progress. Defaults to 40.

* **arrowHangOnFail** and **arrowHangOnCancel** `boolean`  
Whether the arrow should 'fall' on these events or not. Default is `true` for both.

#### Events

* **onClick** `function`  
Called when the user clicks the button only.

* **onOpen** `function`  
Called when the progress bar finishes the opening animation.

* **onChange** `function`  
Called when the bar value is changed.

* **onComplete** `function`  
Called when the bar is full.

* **onClose** `function`  
Called when the close animation is finished.

* **onFail** `function`  
Called when the fail animation starts.

* **onCancel** `function`  
Called when the cancel animation starts.

## Methods

* **open()**  
Starts the opening animation (turns the button into a progress bar).

* **close()**  
Turns the progress bar back into a button.

* **setValue(value`number`)**  
Sets the percentage loaded of the progress bar. From 0 to 1.

* **getValue()** `number`  
Returns the current value of the progress bar.

* **fail()** and **cancel()**  
Runs the fail and the cancel animations, respectively.

* **complete()**  
Runs the complete animation, regardless of the progress. You should probably call `setValue(1)` instead.

* **onClick(callback`function`)**, **onOpen(callback`function`)**, **onChange(callback`function`)**, **onComplete(callback`function`)**, **onClose(callback`function`)**, **onFail(callback`function`)** and **onCancel(callback`function`)**  
Aliases to the options of the same name.

## Build

You need [node and npm](https://nodejs.org/) installed. Clone the repo, and on the terminal enter:

```
$ npm install
$ npm run build
```

## License

Integrate or build upon it for free in your personal or commercial projects. Don't republish, redistribute or sell "as-is".

Read more here: [License](http://tympanus.net/codrops/licensing/)

## Misc

Follow Lucas: [Twitter](https://twitter.com/lucasbebber), [Codepen](http://codepen.io/lbebber/), [GitHub](https://github.com/lbebber)

Follow Codrops: [Twitter](http://www.twitter.com/codrops), [Facebook](http://www.facebook.com/pages/Codrops/159107397912), [Google+](https://plus.google.com/101095823814290637419), [GitHub](https://github.com/codrops), [Pinterest](http://www.pinterest.com/codrops/)

[© Codrops 2015](http://www.codrops.com)
