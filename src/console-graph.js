var history=[];

function logr(){
    var i = -1, l = arguments.length, args = [], fn = 'console.log(args)';
    while(++i<l){
        args.push('args['+i+']');
    };
    fn = new Function('args',fn.replace(/args/,args.join(',')));
    fn(arguments);
};

module.exports=function(y){
  var data=history.concat(y);
  console.clear();

  logr.apply(null,
    [data.map(function(){
      return "%c#";
    }).join("")].concat(
      data.map(function(cur){
        return "text-shadow:0 "+(200-(cur*200))+"px red"
      })
    )
  )

  history=data;
}
