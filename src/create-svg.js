function createSVG(width,height){
  if(typeof width=="undefined") width=1200;
  if(typeof height=="undefined") height=1200;

  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  return svg;
}

module.exports=createSVG;
