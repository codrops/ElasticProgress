'use strict';

var CSSPlugin=require('gsap/src/uncompressed/plugins/CSSPlugin');
var EasePack=require('gsap/src/uncompressed/easing/EasePack');
var TweenLite=require('gsap/src/uncompressed/TweenLite');
var SVGPathData=require('svg-pathdata');
var extend=require('extend');
var clone=require('./clone');
var createSVG=require('./create-svg');
var gfxOf=require('./gfx-of');
var isSet=require('./is-set');
var cutoff=require('./cutoff');
var pointerEvents=require('./pointer-events');

// Load SVG Graphic
var generateGraphic=require('./svg/bt.svg');

// Setup GSAP
// use either TweenLite or TweenMax, which one is available
var Tween=TweenLite;
if(Object.keys(Tween).length==0){ // if TweenLite is not bundled
  if(isSet(window.TweenLite))
    Tween=window.TweenLite;
  else if(isSet(window.TweenMax))
    Tween=window.TweenMax;
  else
    this.error("GSAP could not be found.");
}

// Utils
function updatePath(path,pathData){
  path.setAttribute("d",pathData.encode());
}

function getD(path){
  return path.getAttribute("d");
}

function getPathData(path){
  return new SVGPathData(getD(path)).toAbs();
}
function setVisibility(visible,obj){
  if(!isSet(obj)){
    return function(obj){
      setVisibility(visible,obj);
    }
  }
  Tween.set(obj,{
    display:visible?"inline":"none"
  });
}
var hide=setVisibility(false);
var show=setVisibility(true);

function setTransformOrigin(origin,obj){
  if(!isSet(obj)){
    return function(obj){
      setTransformOrigin(origin,obj);
    }
  }
  Tween.set(obj,{
    transformOrigin:origin
  });
}
var originCenter=setTransformOrigin("50% 50%");
var originBottomCenter=setTransformOrigin("50% 100%");

function tweenTheseTo(groups,options){
  var dur=1;
  var value=0;
  if(isSet(options.duration)){
    dur=options.duration;
    delete options.duration;
  }
  if(isSet(options.value)){
    value=options.value;
    delete options.value;
  }

  groups.forEach(function(item){
    var props={};
    if(isSet(item.prop)){
      item.props=item.prop;
    }
    if(!Array.isArray(item.props)){
      item.props=[item.props];
    }
    item.props.forEach(function(propName){
      props[propName]=value;
    });

    Tween.to(item.obj,dur,extend(
      props,
      options
    ));
  });
}

var defaultOptions={
  colorFg:"#fff",
  colorBg:"#000",
  background:getComputedStyle(document.body).getPropertyValue("background-color"),
  highlightColor:"#08F",

  progressbar:null,
  progressbarLabel:"",

  buttonSize:-1,
  width:-1,
  align:"center",

  barStretch:20,
  barElasticOvershoot:1.8,
  barElasticPeriod:0.15,
  barHeight:4,
  barInset:-0.5,

  labelHeight:53,
  labelWobbliness:40,

  bleedTop:100,
  bleedBottom:50,
  bleedLeft:60,
  bleedRight:60,

  fontFamily:"",
  fontWeight:"bold",

  jumpHeight:50,
  arrowDirection:"down",
  arrowHangOnFail:true,
  arrowHangOnCancel:true,

  textComplete:"Done",
  textFail:"Failed",
  textCancel:"Canceled",

  onClick:function(event){},
  onOpen:function(event){},
  onComplete:function(event){},
  onClose:function(event){},
  onFail:function(event){},
  onCancel:function(event){},
  onChange:function(event){}
};
var vars={
  logPrefix:"ElasticProgress",
  eventPrefix:"elasticProgress.",
  options:null,
  target:null,
  progress:null,
  progressbar:null,
  progressbarLabel:"",
  canvas:null,
  lastValue:0,
  value:0,
  visibleValue:0, // used for tweening the displayed value
  lastVisibleValue:0,
  state:{ // default states obj / will be cloned for each instance
    animating:false,
    opening:false,
    open:false,
    closing:false,
    completing:false,
    complete:false,
    pressed:false,
    hover:false,
    focused:false,
    failing:false,
    failed:false,
    calceling:false,
    canceled:false
  },
  graphics:null,
  buttonRadius:null,
  buttonScale:null,
  containerX:null,
  barOverstretch:0,
  base:null, // y position of the bar
  arrowRelativeScale:0.8, // rescaling of the arrow relative to the button
  arrowRatio:null, // scale of the arrow relative to the button size
  arrowScale:null, // calculated scale of the arrow
  arrowPos:null, // calculated pos Y of the arrow
  arrowUp:false,
  arrowRotation:null, // initial rotation of the arrow, in case it points up
  labelScale:null, // calculated scale of the arrow when open
  labelRegularHeight:53, // default size of the label, used for calculation
  queue:null // next queued function
}

var defaultFontFamily="'Helvetica Neue','Helvetica','Arial'";

function ElasticProgress(target,options){
  if(!isSet(options)){
    options={};
  };
  this.options=extend(
    {},
    defaultOptions,
    options
  );
  // shortcut to options
  options=this.options;

  this.target=target;

  //// setup options
  // format align in case it's a string
  // if(typeof options.align=="string"){
  //   switch(options.align){
  //     case "left":
  //       options.align=0;
  //       break;
  //     case "right":
  //       options.align=1;
  //       break;
  //     default:
  //       options.align=0.5;
  //       break;
  //   }
  // }
  // ... however, align is not supported for now
  options.align=0.5;

  // width by default is the element's width...
  if(options.width <= -1){
    options.width = target.clientWidth;
  }else{
    // otherwise it sets the element's width
    target.style.width = options.width+"px";
  }

  // buttonSize by default is the element's height
  if(options.buttonSize <= -1){
    options.buttonSize = target.clientHeight;
  }else{
    // otherwise it sets the element's height
    target.style.height = options.buttonSize+"px";
  }

  var progressbar=target.getAttribute("data-progressbar");
  if(progressbar!=null){
    options.progressbar=progressbar;
  }

  var progressbarLabel=target.getAttribute("data-progressbar-label");
  if(progressbarLabel!=null){
    options.progressbarLabel=progressbarLabel;
  }

  this.graphics={};
  this.state=clone(this.state);

  this.init();
}

ElasticProgress.prototype=extend(
  {},
  vars,{
  init:function(){
    var
      instance=this,
      options=this.options,
      target=this.target,
      state=this.state,
      graphics=this.graphics;

    this.styleTarget();
    this.createProgressElement();
    this.createCanvas();
    this.setupGraphicsShortcuts();

    // set registration points
    originCenter([graphics.circle, graphics.overlay, graphics.hitArea, graphics.bgCircle, graphics.overlayCircle,graphics.label]);
    originBottomCenter(graphics.arrow);
    originBottomCenter([graphics.arrowHead,graphics.arrowShaft]);

    // hide elements not visible at the start
    hide([graphics.label, graphics.fillLine, graphics.overlay]);

    this.calculateValues();

    // draw stuff
    this.updateColors();
    this.updateBarHeight();
    this.updateButtonSize();
    this.updateAlign();

    // format container after formatting the button, cause we have its correct size
    Tween.set(graphics.container,{
      transformOrigin:"50% 50%",
      y:options.bleedTop,
      x:options.bleedLeft
    });
    originCenter(graphics.circle);

    graphics.labelText.setAttribute("text-anchor","middle");
    graphics.labelText.setAttribute("font-family",options.fontFamily+","+defaultFontFamily);
    graphics.labelText.setAttribute("font-weight",options.fontWeight);

    graphics.hitArea.style.pointerEvents="fill";
    graphics.hitArea.style.cursor="pointer";
    graphics.hitAreaCircle.style.fill="transparent";

    this.setupEvents();

    return this;
  },
  addToQueue:function(f){
    this.queue=f;
  },
  processQueue:function(){
    if(this.queue!=null){
      var q=this.queue;
      this.queue=null;
      q.call(this);
    }
  },
  styleTarget:function(){
    var
      target=this.target,
      style=target.style;

    style.border="none";
    style.background="transparent";
    style.outline="none";
    style.pointerEvents="none";
    style.webkitTapHighlightColor="transparent";
    style.textAlign="left";
  },
  createProgressElement:function(){
    var
      options=this.options,
      target=this.target;

    if(options.progressbar){
      this.progress=options.progressbar;
    }else{
      this.progress=document.createElement("progress");
      this.progress.style.position="absolute";
      this.progress.style.left="-99999px";
      this.progress.setAttribute("aria-label",options.progressbarLabel);
    }
    this.progress.setAttribute("value",0);
    this.progress.setAttribute("max",1);
    this.progress.setAttribute("aria-hidden",true);

    target.parentNode.insertBefore(this.progress, target.nextSibling);
  },
  createCanvas:function(){
    var options=this.options;

    var svg = createSVG(
      options.width + options.bleedLeft + options.bleedRight,
      options.buttonSize + options.bleedTop + options.bleedBottom
    );
    svg.appendChild(generateGraphic());
    this.target.appendChild(svg);
    svg.style.position="relative";
    //svg.style.top=-options.bleedTop;
    svg.style.marginRight=-options.bleedRight+"px";
    svg.style.marginLeft=-options.bleedLeft+"px";
    svg.style.marginTop=-options.bleedTop+"px";
    svg.style.marginBottom=-options.bleedBottom+"px";

    this.canvas=svg;
  },
  setupGraphicsShortcuts:function(){
    var
      graphics=this.graphics,
      canvas=this.canvas;

    graphics.container         = canvas.querySelector("#container");
    graphics.hitArea           = canvas.querySelector("#hit-area");
    graphics.hitAreaCircle     = graphics.hitArea.querySelector("path");
    graphics.circle            = canvas.querySelector("#circle");
    graphics.arrow             = canvas.querySelector("#arrow");
    graphics.arrowHead         = graphics.arrow.querySelector("#head");
    graphics.arrowShaft        = graphics.arrow.querySelector("#line");
    graphics.label             = graphics.arrow.querySelector("#label");
    graphics.labelText         = graphics.label.querySelector("text");
    graphics.overlay           = canvas.querySelector("#overlay");
    graphics.overlayCircle     = graphics.overlay.querySelector("path");
    graphics.bg                = canvas.querySelector("#background");
    graphics.bgCircle          = graphics.bg.querySelector("path");
    graphics.line              = canvas.querySelector("#border path");
    graphics.fillLineContainer = canvas.querySelector("#fill-line");
    graphics.fillLine          = graphics.fillLineContainer.querySelector("path");
  },
  calculateValues:function(){
    var
      graphics=this.graphics,
      options=this.options;

    var originalCircleHeight=graphics.bgCircle.getBBox().height;
    var originalArrowHeight=graphics.arrow.getBBox().height;

    this.buttonRadius=options.buttonSize/2;
    this.arrowRatio=((originalArrowHeight/originalCircleHeight)+0.05)*this.arrowRelativeScale;
    this.buttonScale=options.buttonSize/originalCircleHeight;
    this.arrowScale=this.buttonScale*this.arrowRelativeScale;
    this.arrowUp=options.arrowDirection=="up";
    this.arrowPos=options.buttonSize*(1-((1-this.arrowRatio)/2)); // dang
    var arrowSize=options.buttonSize*this.arrowRatio;
    if(this.arrowUp) this.arrowPos-=arrowSize;
    this.arrowRotation=this.arrowUp?180:0;
    this.base=options.buttonSize/2;
    this.labelScale=options.labelHeight/this.labelRegularHeight;
  },
  updateColors:function(){
    var
      graphics = this.graphics,
      options = this.options;

    Tween.set(gfxOf([graphics.arrowHead, graphics.arrowShaft]),{
      fill: options.colorFg
    });
    Tween.set(gfxOf(graphics.fillLine),{
      stroke: options.colorFg
    });
    Tween.set(gfxOf([graphics.bg, graphics.labelText]),{
      fill: options.colorBg
    });
    Tween.set(gfxOf(graphics.line),{
      stroke: options.colorBg
    });
    Tween.set(gfxOf(graphics.overlay),{
      fill:options.background
    });
  },
  updateBarHeight:function(){
    var
      graphics=this.graphics,
      options=this.options;

    graphics.line.setAttribute("stroke-width",options.barHeight);
    graphics.fillLine.setAttribute("stroke-width",options.barHeight-options.barInset);
  },
  updateButtonSize:function(){
    var
      graphics = this.graphics,
      options = this.options,
      r = this.buttonRadius,
      r2 = options.buttonSize;

    Tween.set([graphics.bgCircle,graphics.overlayCircle],{
      x:0,
      y:r,
      scale:this.buttonScale
    });

    Tween.set(graphics.arrow,{
      scale: this.arrowScale,
      rotation:this.arrowRotation,
      y: this.arrowPos
    });

    var linePath=this.getPathPointsCirclingCircle();
    updatePath(graphics.line,linePath);
  },
  getPathPointsCirclingCircle:function(){
    var
      options=this.options,
      graphics=this.graphics,
      r=this.buttonRadius,
      r2=r*2;

    var linePath=getPathData(graphics.line);
    var points=linePath.commands;

    //svg strokes are drawn "around" their paths
    //this offset squishes the line inside the circle a little
    var offset=(options.barHeight/2)+1;
    //more or less how far along the x axis the bezier control points have to be from the center of the circle
    var p=1.318;
    var rp=(r-offset)*p;

    points[0].x=0;
    points[0].y=offset;

    points[1].x=0;
    points[1].y=r2-offset;
    points[1].x1=-rp;
    points[1].y1=r2-offset;
    points[1].x2=-rp;
    points[1].y2=offset;

    points[2].x=points[0].x;
    points[2].y=points[0].y;
    points[2].x1=rp;
    points[2].y1=offset;
    points[2].x2=rp;
    points[2].y2=r2-offset;

    return linePath;
  },
  updateAlign:function(){
    var
      graphics = this.graphics,
      options = this.options;

    this.containerX=(options.width*options.align)+(options.buttonSize*(((1-options.align))-0.5));
    Tween.set([graphics.circle,graphics.arrow],{
      x:this.containerX
    });

    Tween.set(graphics.hitArea,{
      x:options.bleedLeft+this.containerX,
      y:options.bleedTop+(options.buttonSize/2),
      scale:this.buttonScale
    });

  },
  setupEvents:function(){
    var
      instance=this,
      graphics=this.graphics;

    pointerEvents.on("down",graphics.hitArea,function(event){
      instance.setState("pressed",true);
      instance.setState("hover",false);
    });
    pointerEvents.on("up",document,function(){
      instance.setState("pressed",false);
    });
    pointerEvents.on("mouseover",graphics.hitArea,function(){
      instance.setState("hover",true);
    });
    pointerEvents.on("mouseout",graphics.hitArea,function(){
      instance.setState("hover",false);
    });
    pointerEvents.on("click",graphics.hitArea,function(event){
      instance.triggerClick(event);
    });
    this.addEventListener("keydown",function(event){
      if(event.keyCode=="13" || event.keyCode=="32"){
        event.preventDefault();
        this.triggerClick(event);
      }
    });
    this.addEventListener("focus",function(event){
      this.setState("focused",true);
    });
    this.addEventListener("blur",function(event){
      this.setState("focused",false);
    });

    this.addEventListener(this.eventPrefix+"animatingFinish",this.processQueue);

    this.setupEventHandlers();
  },
  triggerClick:function(event){
    var state=this.state;

    if(!state.open){
      this.dispatchEvent('click');
      this.options.onClick.call(this.target,event);
    }
  },
  setupEventHandlers:function(){
    var options=this.options;

    this.setupEventHandler('openingFinish','onOpen');
    this.setupEventHandler('closingFinish','onClose');
    this.setupEventHandler('complete','onComplete');
    this.setupEventHandler('fail','onFail');
    this.setupEventHandler('cancel','onCancel');
    this.setupEventHandler('change','onChange');
  },
  setupEventHandler:function(eventType,handler){
    var
      instance=this,
      target=this.target,
      options=this.options;

    target.addEventListener(this.eventPrefix+eventType,function(event){
      options[handler].call(target,event);
    });
  },
  addEventListener:function(event,callback){
    this.target.addEventListener(event,callback.bind(this));
  },
  dispatchEvent:function(event){
    this.target.dispatchEvent(new Event(this.eventPrefix+event));
  },
  setState:function(states,value){
    if(!Array.isArray(states)){
      states=[states];
    }

    var hasAnyStateChanged=false;
    states.forEach(function(name){
      var previousValue=this.state[name];
      this.state[name] = value;

      if(value!=previousValue){
        this.checkStateEvents(name)
        hasAnyStateChanged=true;
      }

    },this);
    if(hasAnyStateChanged){
      this.dispatchEvent("stateChange");
    }
    this.updateStates();
  },
  updateStates:function(){
    var
      target=this.target,
      state=this.state,
      options=this.options,
      graphics=this.graphics;

    if(state.focused && !state.pressed && !state.open && !state.hover){
      graphics.hitAreaCircle.setAttribute("stroke",options.highlightColor);
      Tween.to(graphics.hitAreaCircle,0.05,{attr:{
        "stroke-width":2/Math.max(0.01,this.buttonScale)
      }})
    }else{
      Tween.to(graphics.hitAreaCircle,0.05,{attr:{
        "stroke-width":0
      }})
    }

    if(state.pressed && !state.open){
      Tween.to(graphics.container,0.1,{
        scale:0.82,
        ease:Quint.easeOut
      });
      Tween.to(graphics.circle,0.1,{
        scale:1.06,
        ease:Quint.easeOut
      });
    }else{
      Tween.to([graphics.container,graphics.circle],0.1,{
        scale:1,
        ease:Quint.easeOut
      });
    }

    if(state.hover && !state.pressed && !state.open){
      Tween.to(graphics.container,0.2,{
        scale:1.15,
        ease:Quint.easeOut
      });
      Tween.to(graphics.circle,0.2,{
        scale:0.92,
        ease:Quint.easeOut
      });
    }else if(!state.pressed){
      Tween.to([graphics.circle,graphics.container],0.2,{
        scale:1,
        ease:Quint.easeOut
      });
    }

    if(!state.open){
      show(graphics.hitArea);
    }else{
      hide(graphics.hitArea);
    }
  },
  checkStateEvents:function(name){
    var
      instance=this,
      state=this.state;

    var value=state[name];
    function checkStateEvent(nameCheck,ifTrue,ifFalse){
      if(name==nameCheck){
        instance.dispatchEvent(value?ifTrue:ifFalse);
      }
    }

    checkStateEvent("open","open","close");
    checkStateEvent("press","press","release");
    checkStateEvent("animating","animatingStart","animatingFinish");
    checkStateEvent("opening","openingStart","openingFinish");
    checkStateEvent("closing","closingStart","closingFinish");
    checkStateEvent("failing","failingStart","failingFinish");
    checkStateEvent("canceling","cancelingStart","cancelingFinish");
  },
  setText:function(text,upsideDown){
    var graphics=this.graphics;

    if(!isSet(upsideDown)) upsideDown=false;
    graphics.labelText.textContent=text;
    if(upsideDown){
      var labelBBox=graphics.label.getBBox();
      var arrowShaftBBox=graphics.arrowShaft.getBBox();
      Tween.set(graphics.label,{
        x:-parseFloat(graphics.labelText.getAttribute("font-size"))/2,
        rotation:180
      })
    }else{
      Tween.set(graphics.label,{
        x:0,
        rotation:0
      })
    }
  },
  setPercentage:function(v){
    this.setText(Math.floor(v*100)+"%");
  },
  changeText:function(text,upsideDown){
    var
      instance=this,
      graphics=this.graphics;

    var t=0.15;
    // fade out text
    Tween.to(graphics.label,t,{
      opacity:0,
      onComplete:function(){
        instance.setText(text,upsideDown);
        var textBB=graphics.label.getBBox();
        var boxBB=graphics.arrowShaft.getBBox();
        var targetSize=textBB.width+40;
        var targetScale=targetSize/boxBB.width;
        // resize text box
        Tween.to(graphics.arrowShaft,t,{
          scaleX:targetScale,
          ease:Quad.easeInOut,
          onComplete:function(){
            // fade in text
            Tween.to(graphics.label,t,{
              opacity:1
            });
          }
        })
      }
    })
  },
  open:function(){
    var
      instance=this,
      options=this.options,
      graphics=this.graphics,
      state=this.state;

    if(state.open && !state.closing && !state.failed && !state.canceled){
      return false;
    }
    if(state.animating){
      this.addToQueue(this.open);
      return false;
    }
    this.progress.setAttribute("aria-hidden",false);

    Tween.killTweensOf(this);
    this.setState(["animating","opening","open"],true);
    this.value=this.visibleValue=this.lastValue=this.lastVisibleValue=0;

    if(state.open && (state.failed || state.canceled)){
      this.setState(["failed","canceled"],false);

      hide(graphics.fillLine);

      this.animOpenArrowJump(false);
      this.changeText("0%");
      this.animOpenBar();

    }else{
      this.animOpenOverlay();
      this.animOpenArrowJump();
      this.animLabelExpand();

      Tween.delayedCall(0.2,function(){
        instance.animOpenBar();
      });
    }

    Tween.delayedCall(1.3,function(){
      this.resetFillLine();

      this.setState(["animating","opening"],false);

      instance.setValue(instance.value);
    },null,this);

    return true;
  },
  animOpenBar:function(){
    var
      graphics=this.graphics,
      options=this.options,
      containerX=this.containerX,
      base=this.base,
      width=options.width;

    var halfWidth=width/2;
    var sixthWidth=width/6;

    var linePath = getPathData(graphics.line);
    var linePoints = linePath.commands;

    var lineStart=linePoints[0];
    var lineMiddle=linePoints[1];
    var lineEnd=linePoints[2];

    var baseCurveOffset=(options.buttonSize/4)*3;

    //// expand
    // x
    var openDur=0.25;
    Tween.to(lineStart,openDur,{
      x:-containerX,
      ease:Quad.easeOut
    });
    Tween.to(lineMiddle,openDur,{
      x:-containerX+halfWidth,
      x2:-containerX+sixthWidth,
      x1:-containerX+sixthWidth+sixthWidth,
      ease:Quad.easeOut
    });
    Tween.to(lineEnd,openDur,{
      x:-containerX+width,
      x2:-containerX+halfWidth+sixthWidth,
      x1:-containerX+halfWidth+sixthWidth+sixthWidth,
      ease:Quad.easeOut
    });

    // y
    tweenTheseTo([
        {obj:lineStart,prop:"y"},
        {obj:lineMiddle,prop:"y2"},
        {obj:lineEnd,props:["y","y1"]}
      ],{
        duration:openDur,
        value:base,
        ease:Quad.easeInOut
      }
    );

    tweenTheseTo([
        {obj:lineMiddle,prop:"y1"},
        {obj:lineEnd,prop:"y2"}
      ],{
        duration:openDur,
        value:base+baseCurveOffset,
        ease:Quad.easeInOut
      }
    );

    //spring up
    tweenTheseTo([
        {obj:lineMiddle,props:["y","y1"]},
        {obj:lineEnd,prop:"y2"}
      ],{
        duration:1.05,
        value:base,
        delay:0.05,
        ease:Elastic.easeOut,
        easeParams:[options.barElasticOvershoot,options.barElasticPeriod]
      }
    );

    var updateLinePath=function(){
      updatePath(graphics.line,linePath)
    };
    Tween.to({},1.1,{
      onUpdate:updateLinePath,
      onComplete:updateLinePath
    });
  },
  animOpenOverlay:function(){
    var graphics=this.graphics;

    // "overlay" is the the graphic resposible for the "carving out" anim
    // makes overlay visible before setting any of its other properties
    show(graphics.overlay);
    // expand the overlay
    Tween.fromTo(graphics.overlay,0.2,{
      transformOrigin:"50% 50%",
      scale:0.2
    },{
      scale:1,
      ease:Sine.easeIn,
      onComplete:function(){
        hide([graphics.overlay,graphics.bg]);
      }
    });
  },
  animOpenArrowJump:function(anticipation){
    var
      instance=this,
      graphics=this.graphics,
      options=this.options;

    if(!isSet(anticipation)) anticipation=true;
    var delay=anticipation?0.25:0;

    if(anticipation){
      Tween.to(graphics.arrow,0.4,{
        y:"+="+(options.buttonSize*0.2),
        ease:Quad.easeInOut
      });
    }

    Tween.to(graphics.arrow,0.75,{
      x:0,
      ease:Quad.easeOut,
      delay:delay
    });
    Tween.to(graphics.arrow,0.5,{
      rotation:0,
      delay:delay
    });

    Tween.to(graphics.arrow,0.25,{
      y:-options.jumpHeight,
      ease:Quad.easeOut,
      delay:delay,
      onComplete:function(){
        Tween.to(graphics.arrow,0.5,{
          y:instance.base - (options.barHeight/2),
          ease:Bounce.easeOut,
        });
      }
    });
  },
  animLabelExpand:function(){
    var
      instance=this,
      graphics=this.graphics,
      options=this.options;

    Tween.to(graphics.arrow,0.5,{
      scaleX:instance.labelScale,
      scaleY:instance.labelScale
    });
    Tween.to(graphics.arrowHead,0.5,{
      scale:0.5,
      ease:Quad.easeInOut
    });
    Tween.to(graphics.arrowShaft,0.5,{
      scaleX:3,
      y:15,
      ease:Quad.easeInOut
    });

    show(graphics.label);
    this.setText("0%");

    Tween.fromTo(graphics.label,0.5,{
      scale:0.01,
      x:0,
      y:0
    },{
      scale:1,
      x:0,
      y:15
    });
  },
  resetFillLine:function(){
    var graphics=this.graphics;

    var fillPath=getPathData(graphics.fillLine);
    var fillPoints=fillPath.commands;

    fillPoints[0].x = fillPoints[1].x = -this.containerX;
    fillPoints[0].y = fillPoints[1].y = this.base;
    updatePath(graphics.fillLine,fillPath);

    show(graphics.fillLine);
  },
  close:function(){
    var
      options=this.options,
      state=this.state,
      graphics=this.graphics;

    if(state.closing || !state.open){
      return false;
    }
    if(state.animating){
      this.addToQueue(this.close);
      return false;
    }
    this.progress.setAttribute("aria-hidden",true);
    Tween.killTweensOf(this);

    this.setState(["animating","closing"],true);

    this.animCloseArrow();
    this.animLabelCollapse();
    this.animCloseBar();
    Tween.delayedCall(0.31,function(){
      this.animCloseCircle();
    },null,this);

    Tween.delayedCall(0.8,function(){
      this.setState(["animating","open","closing","failed","canceled","complete"],false);
    },null,this);

    return true
  },
  animCloseBar:function(){
    var
      instance=this,
      graphics=this.graphics,
      options=this.options;

    var fillPath=getPathData(graphics.fillLine);
    var fillPoints=fillPath.commands;
    Tween.to(fillPoints[0],0.17,{
      x:fillPoints[1].x,
      y:fillPoints[1].y,
      ease:Quad.easeIn,
      onUpdate:function(){
        updatePath(graphics.fillLine,fillPath);
      },
      onComplete:function(){
        hide(graphics.fillLine);
        collapseBar();
      }
    });

    var collapseBar=function(){
      var linePath=getPathData(graphics.line);
      var linePoints=linePath.commands;

      var t=0.17;

      tweenTheseTo([
        {obj:linePoints[1],props:["y","y1"]},
        {obj:linePoints[2],props:["y","y2"]}
      ],{
        duration:t/2,
        value:instance.base,
        ease:Quad.easeOut
      });

      tweenTheseTo([
        {obj:linePoints[0],props:["x"]},
        {obj:linePoints[1],props:["x","x1","x2"]},
        {obj:linePoints[2],props:["x","x1","x2"]}
      ],{
        duration:t,
        value:(options.width/2)-instance.containerX,
        ease:Quad.easeIn,
      });
      Tween.to({},t,{
        onUpdate:function(){
          updatePath(graphics.line,linePath);
        },
        onComplete:collapseBarComplete
      });
    }
    var collapseBarComplete=function(){
      Tween.delayedCall(0.3,function(){
        var circlePath=instance.getPathPointsCirclingCircle();
        updatePath(graphics.line,circlePath);
      });
    }

  },
  animLabelCollapse:function(){
    var
      instance=this,
      graphics=this.graphics,
      options=this.options;

    Tween.to(graphics.arrow,0.5,{
      scale:instance.arrowScale
    });
    Tween.to(graphics.arrowHead,0.5,{
      scale:1,
      ease:Quad.easeInOut
    });
    Tween.to(graphics.arrowShaft,0.5,{
      scaleX:1,
      y:0,
      ease:Quad.easeInOut
    });

    Tween.to(graphics.label,0.5,{
      scale:0.01,
      onComplete:function(){
        hide(graphics.label);
      }
    });
  },
  animCloseArrow:function(){
    var
      instance=this,
      graphics=this.graphics,
      options=this.options;

    Tween.to(graphics.arrow,0.5,{
      x:options.width/2,
      ease:Quad.easeOut,
      delay:0,
      rotation:0
    });

    Tween.to(graphics.arrow,0.25,{
      y:-options.jumpHeight,
      ease:Quad.easeOut,
      onComplete:function(){
        Tween.to(graphics.arrow,0.8,{
          y:instance.arrowPos,
          scaleY:instance.arrowScale*(instance.arrowUp?-1:1),
          ease:Elastic.easeOut,
          easeParams:[1.1,0.6],
          onComplete:function(){
            Tween.set(graphics.arrow,{
              scaleY:instance.arrowScale,
              rotation:instance.arrowRotation
            })
          }
        });
      }
    });
  },
  animCloseCircle:function(){
    var
      instance=this,
      graphics=this.graphics;

    show(graphics.bg);

    Tween.fromTo(graphics.bgCircle,0.8,{
      scale:0.1,
    },{
      scale:instance.buttonScale,
      ease:Elastic.easeOut,
      easeParams:[1.2,0.7]
    })
  },
  setValue:function(v){
    var
      instance=this,
      options=this.options,
      graphics=this.graphics,
      state=this.state;

    if(!state.open){
      //this.warn("The preloader resets the value when it opens. Please call the function 'open' before setting a value.");
      return false;
    }
    if(state.failed || state.canceled || state.complete || state.animating){
      return false;
    }

    // check if the value has changed considering the limits (i.e. do nothing if it goes from 1 to 1.1)
    var lastValue=this.value;
    var newValue=cutoff(v,0,1);
    if(lastValue==newValue){
      return false;
    }
    this.lastValue=lastValue;
    this.value=newValue;
    this.progress.setAttribute("value",this.value);

    if(state.opening || state.closing){
      this.dispatchEvent("change");
      return true;
    }

    var d=this.value-this.lastVisibleValue;
    if(d<0.01 && this.value<1){
      return true;
    }

    var t=0.2+(1*Math.abs(d));

    Tween.to(graphics.arrow,t*0.5,{
      rotation:-d*options.labelWobbliness,
      ease:Quad.easeOut,
      onComplete:function(){
        Tween.to(graphics.arrow,1.5,{
          rotation:0,
          ease:Elastic.easeOut,
          easeParams:[2,0.4]
        });
      }
    });

    Tween.to(this,t*1,{
      barOverstretch:d*2,
      ease:Quad.easeInOut,
      onComplete:function(){
        Tween.to(instance,1.5,{
          barOverstretch:0,
          ease:Elastic.easeOut,
          easeParams:[2,0.2]
        });
      }
    });

    Tween.to(this,t,{
      visibleValue:this.value,
      ease:Quad.easeOut,
      onUpdate:this.updateValue.bind(this),
      onComplete:this.updateValue.bind(this)
    });

    this.dispatchEvent("change");
    return true;
  },
  getValue:function(){
    return this.value;
  },
  updateValue:function(){
    this.lastVisibleValue=this.visibleValue;
    this.renderValue(this.visibleValue);
  },
  renderValue:function(){
    var
      instance=this,
      state=this.state,
      options=this.options,
      graphics=this.graphics,
      value=this.visibleValue

    if(value>=1 && !state.complete){
      Tween.killTweensOf(this,{visibleValue:true});
      this.complete();
    }else if(value>=1 && state.complete){
      return false;
    }

    Tween.to(this,1.5,{
      onUpdate:this.renderBarStretch.bind(this)
    })

    this.dispatchEvent("valueRender");
    this.setPercentage(value);
  },
  renderBarStretch:function(v){
    var
      instance=this,
      state=this.state,
      options=this.options,
      graphics=this.graphics,
      value=this.visibleValue

    var stretch=options.barStretch * Math.sin(value*3.14)*(1+this.barOverstretch);

    var middlePoint={
      x: value * options.width,
      y: instance.base + stretch
    };

    var linePath=getPathData(graphics.line);
    var linePoints=linePath.commands;

    var fillPath=getPathData(graphics.fillLine);
    var fillPoints=fillPath.commands;

    linePoints[1].x = linePoints[1].x1 = linePoints[2].x2 = fillPoints[1].x = (middlePoint.x - this.containerX);
    linePoints[1].y = linePoints[1].y1 = linePoints[2].y2 = fillPoints[1].y = middlePoint.y;

    linePoints[1].x2 = linePoints[0].x;
    linePoints[1].y2 = linePoints[0].y;
    linePoints[2].x1 = linePoints[2].x;
    linePoints[2].y1 = linePoints[2].y;

    // avoid line cap bug at the end point
    if(linePoints[1].x+(options.barHeight/2)>=linePoints[2].x){
      linePoints[1].x=linePoints[2].x-(options.barHeight/2);
    }

    updatePath(graphics.fillLine,fillPath);
    updatePath(graphics.line,linePath);

    Tween.set(graphics.arrow,{
      x:middlePoint.x,
      y:middlePoint.y - (options.barHeight/2)
    });
  },
  complete:function(){
    var
      instance=this,
      state=this.state,
      options=this.options;

    if(!state.open || state.failed || state.complete || state.canceled){
      return false;
    }
    if(state.animating){
      this.addToQueue(this.complete);
      return false;
    }
    Tween.killTweensOf(this);
    this.setState(["animating","completing","complete"],true);
    this.dispatchEvent("complete");

    this.changeText(options.textComplete);

    Tween.delayedCall(2.5,function(){
      instance.setState(["animating","completing"],false);
    });

    return true;
  },
  fail:function(){
    var
      instance=this,
      state=this.state,
      options=this.options;


    if(state.failed || state.canceled || state.complete || !state.open || state.closing){
      return false;
    }

    if(state.animating){
      this.addToQueue(this.fail);
      return false;
    }
    Tween.killTweensOf(this);
    this.setState(["animating","failed","failing"],true);
    this.dispatchEvent("fail");

    if(options.arrowHangOnFail){
      this.animArrowHang();
    }

    this.changeText(options.textFail,options.arrowHangOnFail);
    Tween.delayedCall(2.5,function(){
      instance.setState(["animating","failing"],false);
    });
    return true;
  },
  cancel:function(){
    var
      instance=this,
      state=this.state,
      options=this.options;

    if(state.failed || state.complete || state.canceled || !state.open || state.closing){
      return false;
    }
    if(state.animating){
      this.addToQueue(this.cancel);
      return false;
    }
    Tween.killTweensOf(this);
    this.setState(["animating","canceled","canceling"],true);
    this.dispatchEvent("cancel");

    if(options.arrowHangOnCancel){
      this.animArrowHang();
    }

    this.changeText(options.textCancel,options.arrowHangOnCancel);
    Tween.delayedCall(2.5,function(){
      instance.setState(["canceling","animating"],false);
    });
    return true;
  },
  animArrowHang:function(){
    var
      instance=this,
      graphics=this.graphics;

    Tween.killTweensOf(this);
    Tween.killTweensOf(graphics.arrow);

    Tween.to(graphics.arrow,0.25,{
      rotation:90,
      ease:Quad.easeIn,
      onComplete:function(){
        Tween.to(graphics.arrow,2,{
          rotation:180,
          ease:Elastic.easeOut,
          easeParams:[1.6,0.4]
        });
      }
    });

    Tween.to(this,0.25,{
      barOverstretch:1.2,
      onUpdate:this.renderBarStretch.bind(this),
      onComplete:function(){
        Tween.to(instance,1.5,{
          barOverstretch:0,
          ease:Elastic.easeOut,
          easeParams:[1.1,0.4],
          onUpdate:instance.renderBarStretch.bind(instance)
        })
      }
    });
  },
  error:function(msg){
    console.error(this.logPrefix+": "+msg);
  },
  warn:function(msg){
    console.warn(this.logPrefix+": "+msg);
  },
  log:function(msg){
    console.log(this.logPrefix+": "+msg);
  }
});

module.exports=ElasticProgress;
