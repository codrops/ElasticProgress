// Converts NodeList/jQuery collections/etc to array
function toArray(obj){
  return [].slice.call(obj);
}

module.exports=toArray;
