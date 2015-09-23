// Interface for the actual Elastic Progress

'use strict';

var extend=require('extend');
var toArray=require('./to-array');
var isSet=require('./is-set');
var ElasticProgressGfx=require('./elastic-progress');

function addInstance(instance){
  instances.push(instance);
}

var api={
  open:function(){
    return this.instance.open();
  },
  close:function(){
    return this.instance.close();
  },
  setValue:function(value){
    return this.instance.setValue(value);
  },
  getValue:function(){
    return this.instance.getValue();
  },
  fail:function(){
    return this.instance.fail();
  },
  complete:function(){
    return this.instance.complete();
  },
  cancel:function(){
    return this.instance.cancel();
  },
  onClick:function(f){
    this.instance.options.onClick=f;
  },
  onOpen:function(f){
    this.instance.options.onOpen=f;
  },
  onClose:function(f){
    this.instance.options.onClose=f;
  },
  onComplete:function(f){
    this.instance.options.onComplete=f;
  },
  onCancel:function(f){
    this.instance.options.onCancel=f;
  },
  onFail:function(f){
    this.instance.options.onFail=f;
  },
  onChange:function(f){
    this.instance.options.onChange=f;
  },
  addEventListener:function(event,handler){
    this.instance.addEventListener(event,handler);
  },
  removeEventListener:function(event,handler){
    this.instance.removeEventListener(event,handler);
  }
};

var ElasticProgress=function(target,options){
  if(!isSet(target)){
    return;
  }
  if(target.jquery){
    target=target.get(0);
  }
  this.instance=new ElasticProgressGfx(target,options);
}

ElasticProgress.prototype=extend(
  {
    instance:null
  },
  api
);

// jQuery plugin, in case jQuery is available
if(isSet(jQuery)){
  (function($){
    $.fn.ElasticProgress=function(optionsOrMethod){
      var target=toArray($(this));

      if(typeof optionsOrMethod=="string"){
        var method=optionsOrMethod;

        var f=api[method];

        var args=arguments;
        // if function exists, calls it. Else, error
        if(typeof f=="function"){
          var returnValue=null;
          $(this).each(function(){
            var instance=$(this).data("elastic-progress");

            if(instance!=null){
              returnValue=instance[method].apply(instance,toArray(args).slice(1));
            }
          });
          return returnValue;
        }else{
          ElasticProgressGfx.prototype.error("Unknown function '"+method+"'");
        }
      }else{
        var options=optionsOrMethod;

        $(this).each(function(){
          var instance=new ElasticProgress($(this),options);
          $(this).data("elastic-progress",instance);

        })

        return $(this);
      }
    }
  }(jQuery));
}

module.exports=ElasticProgress;
