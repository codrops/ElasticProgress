// Returns all graphic elements (paths, shapes, text, etc) from a (group of) SVG element(s)
var graphicTypes=["polygon","polyline","path","circle","rect","text","line","ellipse"];

module.exports=function(elements){
  if(!Array.isArray(elements)){
    elements=[elements];
  }
  return elements.map(function(svgObj){
    if(graphicTypes.indexOf(svgObj.nodeName)>-1){
      return svgObj;
    }else{
      return svgObj.querySelectorAll(graphicTypes.join(","));
    }
  });
}
