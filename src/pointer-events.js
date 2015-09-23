var debug=true;
var blockedEvents=[];
var listeners=[];

function blockEvent(el,type,dur){
  if(typeof dur!="number") dur=1000

  blockedEvents.push({
    el:el,
    type:type
  });
  setTimeout(function(){
    blockedEvents.shift();
  },dur);
}
function isBlocked(el,type){
  return blockedEvents.some(function(cur){
    return cur.type==type && cur.el==el;
  });
}

function registerEvent(type,el,callback,listener){
  el.addEventListener(type,listener);

  listeners.push({
    type:type,
    el:el,
    callback:callback,
    listener:listener
  });
}
function unregisterEvent(type,el,callback){
  listeners.filter(function(listener){
    return (listener.type==type && listener.el==el && listener.callback==callback);
  }).forEach(function(listener){
    console.log(listener);
    listener.el.removeEventListener(listener.type,listener.listener);
  });

  listeners=listeners.filter(function(listener){
    return !(listener.type==type && listener.el==el && listener.callback==callback);
  })
}

var pointerEvents={
  down:function(add,el,callback){
    if(add){
      var touchstartListener=function(event){
        if(typeof event.touches != "undefined"){
          var touches=event.touches;
          if(touches.length>0){
            event.clientX=touches[0].clientX;
            event.clientY=touches[0].clientY;

            callback.call(el,event);
            blockEvent(el,"mousedown");
          }
        }
      }
      registerEvent("touchstart",el,callback,touchstartListener);

      var mousedownListener=function(event){
        if(!isBlocked(el,"mousedown")){
          callback.call(el,event);
        }
      }
      registerEvent("mousedown",el,callback,mousedownListener);

    }else{
      unregisterEvent("touchstart",el,callback);
      unregisterEvent("mousedown",el,callback);
    }
  },

  up:function(add,el,callback){
    if(add){
      var touchendListener=function(event){
        if(typeof event.touches != "undefined"){
          var touches=event.touches;
          if(touches.length>0){
            event.clientX=touches[0].clientX;
            event.clientY=touches[0].clientY;

          }
          callback.call(el,event);
          blockEvent(el,"mouseup");
        }
      };
      registerEvent("touchend",el,callback,touchendListener);

      var mouseupListener=function(event){
        if(!isBlocked(el,"mouseup")){
          callback.call(el,event);
        }
      };
      registerEvent("mouseup",el,callback,mouseupListener);
    }else{
      unregisterEvent("touchend",el,callback);
      unregisterEvent("mouseup",el,callback);
    }
  },

  click:function(add,el,callback){
    if(add){
      function clickListener(event){
        if(!isBlocked(el,"click")){
          callback.call(el,event);
        }
      };
      registerEvent('click',el,callback,clickListener)
    }else{
      unregisterEvent('click',el,callback);
    }
  },

  mouseover:function(add,el,callback){
    if(add){
      function mouseoverListener(event){
        callback.call(el,event);
      }
      registerEvent('mouseover',el,callback,mouseoverListener);
    }else{
      unregisterEvent('mouseover',el,callback);
    }
  },
  mouseout:function(add,el,callback){
    if(add){
      function mouseoutListener(event){
        callback.call(el,event);
      }
      registerEvent('mouseout',el,callback,mouseoutListener);
    }else{
      unregisterEvent('mouseout',el,callback);
    }
  }
}

var api={
  on:function(eventType,el,callback){
    pointerEvents[eventType].call(this,true,el,callback);
  },
  off:function(eventType,el,callback){
    pointerEvents[eventType].call(this,false,el,callback);
  }
};

module.exports=api;
