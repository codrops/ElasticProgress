(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ElasticProgress = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],4:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : (function () {
      function Bar () {}
      try {
        var arr = new Uint8Array(1)
        arr.foo = function () { return 42 }
        arr.constructor = Bar
        return arr.foo() === 42 && // typed array instances can be augmented
            arr.constructor === Bar && // constructor can be set
            typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
            arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
      } catch (e) {
        return false
      }
    })()

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":1,"ieee754":8,"is-array":10}],5:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return Buffer.isBuffer(arg);
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
}).call(this,{"isBuffer":require("/Users/lucasbebber/Dropbox-Garden/Dropbox/Garden/www/codrops-buttons-github/ElasticProgress/node_modules/is-buffer/index.js")})
},{"/Users/lucasbebber/Dropbox-Garden/Dropbox/Garden/www/codrops-buttons-github/ElasticProgress/node_modules/is-buffer/index.js":11}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],8:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],9:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],10:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],11:[function(require,module,exports){
/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

module.exports = function (obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],12:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],13:[function(require,module,exports){
(function (process){
'use strict';
module.exports = nextTick;

function nextTick(fn) {
  var args = new Array(arguments.length - 1);
  var i = 0;
  while (i < args.length) {
    args[i++] = arguments[i];
  }
  process.nextTick(function afterTick() {
    fn.apply(null, args);
  });
}

}).call(this,require('_process'))
},{"_process":14}],14:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],15:[function(require,module,exports){
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
/*</replacement>*/


module.exports = Duplex;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/



/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method])
    Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

},{"./_stream_readable":17,"./_stream_writable":19,"core-util-is":5,"inherits":9,"process-nextick-args":13}],16:[function(require,module,exports){
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./_stream_transform":18,"core-util-is":5,"inherits":9}],17:[function(require,module,exports){
(function (process){
'use strict';

module.exports = Readable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/


/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;

/*<replacement>*/
if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/



/*<replacement>*/
var Stream;
(function (){try{
  Stream = require('st' + 'ream');
}catch(_){}finally{
  if (!Stream)
    Stream = require('events').EventEmitter;
}}())
/*</replacement>*/

var Buffer = require('buffer').Buffer;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/



/*<replacement>*/
var debug = require('util');
if (debug && debug.debuglog) {
  debug = debug.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var StringDecoder;

util.inherits(Readable, Stream);

function ReadableState(options, stream) {
  var Duplex = require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  var Duplex = require('./_stream_duplex');

  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function')
    this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function() {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      if (!addToFront)
        state.reading = false;

      // if we want the data now, just emit it.
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit('data', chunk);
        stream.read(0);
      } else {
        // update the buffer info.
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront)
          state.buffer.unshift(chunk);
        else
          state.buffer.push(chunk);

        if (state.needReadable)
          emitReadable(stream);
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (n === null || isNaN(n)) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else {
      return state.length;
    }
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  debug('read', n);
  var state = this._readableState;
  var nOrig = n;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended)
      endReadable(this);
    else
      emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  }

  if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read pushed data synchronously, then `reading` will be false,
  // and we need to re-evaluate how much data we can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we tried to read() past the EOF, then emit end on the next tick.
  if (nOrig !== n && state.ended && state.length === 0)
    endReadable(this);

  if (ret !== null)
    this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!(Buffer.isBuffer(chunk)) &&
      typeof chunk !== 'string' &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync)
      processNextTick(emitReadable_, stream);
    else
      emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    processNextTick(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain &&
        (!dest._writableState || dest._writableState.needDrain))
      ondrain();
  }

  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    if (false === ret) {
      debug('false write response, pause',
            src._readableState.awaitDrain);
      src._readableState.awaitDrain++;
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  // This is a brutally ugly hack to make sure that our error handler
  // is attached before any userland ones.  NEVER DO THIS.
  if (!dest._events || !dest._events.error)
    dest.on('error', onerror);
  else if (isArray(dest._events.error))
    dest._events.error.unshift(onerror);
  else
    dest._events.error = [onerror, dest._events.error];



  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain)
      state.awaitDrain--;
    if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  // If listening to data, and it has not explicitly been paused,
  // then call resume to start the flow of data on the next tick.
  if (ev === 'data' && false !== this._readableState.flowing) {
    this.resume();
  }

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading)
    stream.read(0);
}

Readable.prototype.pause = function() {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  if (state.flowing) {
    do {
      var chunk = stream.read();
    } while (null !== chunk && state.flowing);
  }
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    debug('wrapped data');
    if (state.decoder)
      chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined))
      return;
    else if (!state.objectMode && (!chunk || !chunk.length))
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }; }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require('_process'))
},{"./_stream_duplex":15,"_process":14,"buffer":4,"core-util-is":5,"events":6,"inherits":9,"isarray":12,"process-nextick-args":13,"string_decoder/":21,"util":2}],18:[function(require,module,exports){
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);


function TransformState(stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined)
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function')
      this._transform = options.transform;

    if (typeof options.flush === 'function')
      this._flush = options.flush;
  }

  this.once('prefinish', function() {
    if (typeof this._flush === 'function')
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./_stream_duplex":15,"core-util-is":5,"inherits":9}],19:[function(require,module,exports){
// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Writable.WritableState = WritableState;


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/



/*<replacement>*/
var Stream;
(function (){try{
  Stream = require('st' + 'ream');
}catch(_){}finally{
  if (!Stream)
    Stream = require('events').EventEmitter;
}}())
/*</replacement>*/

var Buffer = require('buffer').Buffer;

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  var Duplex = require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;
}

WritableState.prototype.getBuffer = function writableStateGetBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function (){try {
Object.defineProperty(WritableState.prototype, 'buffer', {
  get: require('util-deprecate')(function() {
    return this.getBuffer();
  }, '_writableState.buffer is deprecated. Use ' +
      '_writableState.getBuffer() instead.')
});
}catch(_){}}());


function Writable(options) {
  var Duplex = require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function')
      this._write = options.write;

    if (typeof options.writev === 'function')
      this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;

  if (!(Buffer.isBuffer(chunk)) &&
      typeof chunk !== 'string' &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = nop;

  if (state.ended)
    writeAfterEnd(this, cb);
  else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function() {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function() {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing &&
        !state.corked &&
        !state.finished &&
        !state.bufferProcessing &&
        state.bufferedRequest)
      clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string')
    encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64',
'ucs2', 'ucs-2','utf16le', 'utf-16le', 'raw']
.indexOf((encoding + '').toLowerCase()) > -1))
    throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret)
    state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev)
    stream._writev(chunk, state.onwrite);
  else
    stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync)
    processNextTick(cb, er);
  else
    cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished &&
        !state.corked &&
        !state.bufferProcessing &&
        state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      processNextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var buffer = [];
    var cbs = [];
    while (entry) {
      cbs.push(entry.callback);
      buffer.push(entry);
      entry = entry.next;
    }

    // count the one we are adding, as well.
    // TODO(isaacs) clean this up
    state.pendingcb++;
    state.lastBufferedRequest = null;
    doWrite(stream, state, true, state.length, buffer, '', function(err) {
      for (var i = 0; i < cbs.length; i++) {
        state.pendingcb--;
        cbs[i](err);
      }
    });

    // Clear buffer
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null)
      state.lastBufferedRequest = null;
  }
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined)
    this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(state) {
  return (state.ending &&
          state.length === 0 &&
          state.bufferedRequest === null &&
          !state.finished &&
          !state.writing);
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      processNextTick(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

},{"./_stream_duplex":15,"buffer":4,"core-util-is":5,"events":6,"inherits":9,"process-nextick-args":13,"util-deprecate":26}],20:[function(require,module,exports){
var Stream = (function (){
  try {
    return require('st' + 'ream'); // hack to fix a circular dependency issue when used with browserify
  } catch(_){}
}());
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":15,"./lib/_stream_passthrough.js":16,"./lib/_stream_readable.js":17,"./lib/_stream_transform.js":18,"./lib/_stream_writable.js":19}],21:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":4}],22:[function(require,module,exports){
function SVGPathData(content) {
  this.commands = SVGPathData.parse(content);
}

SVGPathData.prototype.encode = function() {
  return SVGPathData.encode(this.commands);
};

SVGPathData.prototype.round = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.ROUND].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.toAbs = function() {
  return this.transform(SVGPathData.Transformer.TO_ABS);
};

SVGPathData.prototype.toRel = function() {
  return this.transform(SVGPathData.Transformer.TO_REL);
};

SVGPathData.prototype.translate = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.TRANSLATE].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.scale = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.SCALE].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.rotate = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.ROTATE].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.matrix = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.MATRIX].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.skewX = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.SKEW_X].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.skewY = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.SKEW_Y].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.xSymetry = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.X_AXIS_SIMETRY].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.ySymetry = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.Y_AXIS_SIMETRY].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.aToC = function() {
  return this.transform.apply(this, [SVGPathData.Transformer.A_TO_C].concat(
    [].slice.call(arguments, 0)));
};

SVGPathData.prototype.transform = function(transformFunction) {
  var newCommands = []
    , transformFunction = transformFunction.apply(null, [].slice.call(arguments, 1))
    , curCommands = []
    , commands = this.commands;
  for(var i=0, ii=commands.length; i<ii; i++) {
    curCommands = transformFunction(commands[i]);
    if(curCommands instanceof Array) {
      newCommands = newCommands.concat(curCommands);
    } else {
      newCommands.push(curCommands);
    }
  }
  this.commands = newCommands;
  return this;
};

// Static methods
SVGPathData.encode = function(commands) {
  var content = '', encoder = new SVGPathData.Encoder();
  encoder.on('readable', function () {
    var str;
    do {
      str = encoder.read();
      if(str !== null) {
        content += str;
      }
    } while(str !== null);
  });
  encoder.write(commands);
  encoder.end();
  return content;
};

SVGPathData.parse = function(content) {
  var commands = [], parser = new SVGPathData.Parser();
  parser.on('readable', function () {
    var command;
    do {
      command = parser.read();
      if(command !== null) {
        commands.push(command);
      }
    } while(command !== null);
  });
  parser.write(content);
  parser.end();
  return commands;
};

// Commands static vars
SVGPathData.CLOSE_PATH = 1;
SVGPathData.MOVE_TO = 2;
SVGPathData.HORIZ_LINE_TO = 4;
SVGPathData.VERT_LINE_TO = 8;
SVGPathData.LINE_TO = 16;
SVGPathData.CURVE_TO = 32;
SVGPathData.SMOOTH_CURVE_TO = 64;
SVGPathData.QUAD_TO = 128;
SVGPathData.SMOOTH_QUAD_TO = 256;
SVGPathData.ARC = 512;
SVGPathData.DRAWING_COMMANDS =
  SVGPathData.HORIZ_LINE_TO | SVGPathData.VERT_LINE_TO | SVGPathData.LINE_TO |
  SVGPathData.CURVE_TO | SVGPathData.SMOOTH_CURVE_TO | SVGPathData.QUAD_TO |
  SVGPathData.SMOOTH_QUAD_TO | SVGPathData.ARC;

// Export the main contructor first (tests are failing otherwise)
module.exports = SVGPathData;

// Expose the internal constructors
SVGPathData.Parser = require('./SVGPathDataParser.js');
SVGPathData.Encoder = require('./SVGPathDataEncoder.js');
SVGPathData.Transformer = require('./SVGPathDataTransformer.js');


},{"./SVGPathDataEncoder.js":23,"./SVGPathDataParser.js":24,"./SVGPathDataTransformer.js":25}],23:[function(require,module,exports){
(function (Buffer){
// Encode SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

// Access to SVGPathData constructor
var SVGPathData = require('./SVGPathData.js');

// TransformStream inherance required modules
var TransformStream = require('readable-stream').Transform;
var util = require('util');

// Private consts : Char groups
var WSP = ' ';

// Inherit of writeable stream
util.inherits(SVGPathDataEncoder, TransformStream);

// Constructor
function SVGPathDataEncoder(options) {

  // Ensure new were used
  if(!(this instanceof SVGPathDataEncoder)) {
    return new SVGPathDataEncoder(options);
  }

  // Parent constructor
  TransformStream.call(this, {
    objectMode: true
  });

  // Setting objectMode separately
  this._writableState.objectMode = true;
  this._readableState.objectMode = false;

}


// Read method
SVGPathDataEncoder.prototype._transform = function(commands, encoding, done) {
  var str = '';
  if(!(commands instanceof Array)) {
    commands = [commands];
  }
  for(var i=0, j=commands.length; i<j; i++) {
    // Horizontal move to command
    if(commands[i].type === SVGPathData.CLOSE_PATH) {
      str += 'z';
      continue;
    // Horizontal move to command
    } else if(commands[i].type === SVGPathData.HORIZ_LINE_TO) {
      str += (commands[i].relative?'h':'H') +
        commands[i].x;
    // Vertical move to command
    } else if(commands[i].type === SVGPathData.VERT_LINE_TO) {
      str += (commands[i].relative?'v':'V') +
        commands[i].y;
    // Move to command
    } else if(commands[i].type === SVGPathData.MOVE_TO) {
      str += (commands[i].relative?'m':'M') +
        commands[i].x + WSP + commands[i].y;
    // Line to command
    } else if(commands[i].type === SVGPathData.LINE_TO) {
      str += (commands[i].relative?'l':'L') +
        commands[i].x + WSP + commands[i].y;
    // Curve to command
    } else if(commands[i].type === SVGPathData.CURVE_TO) {
      str += (commands[i].relative?'c':'C') +
        commands[i].x2 + WSP + commands[i].y2 +
        WSP + commands[i].x1 + WSP + commands[i].y1 +
        WSP + commands[i].x + WSP + commands[i].y;
    // Smooth curve to command
    } else if(commands[i].type === SVGPathData.SMOOTH_CURVE_TO) {
      str += (commands[i].relative?'s':'S') +
        commands[i].x2 + WSP + commands[i].y2 +
        WSP + commands[i].x + WSP + commands[i].y;
    // Quadratic bezier curve to command
    } else if(commands[i].type === SVGPathData.QUAD_TO) {
      str += (commands[i].relative?'q':'Q') +
        commands[i].x1 + WSP + commands[i].y1 +
        WSP + commands[i].x + WSP + commands[i].y;
    // Smooth quadratic bezier curve to command
    } else if(commands[i].type === SVGPathData.SMOOTH_QUAD_TO) {
      str += (commands[i].relative?'t':'T') +
        commands[i].x + WSP + commands[i].y;
    // Elliptic arc command
    } else if(commands[i].type === SVGPathData.ARC) {
      str += (commands[i].relative?'a':'A') +
        commands[i].rX + WSP + commands[i].rY +
        WSP + commands[i].xRot +
        WSP + commands[i].lArcFlag + WSP + commands[i].sweepFlag +
        WSP + commands[i].x + WSP + commands[i].y;
    // Unkown command
    } else {
      this.emit('error', new Error('Unexpected command type "' +
        commands[i].type + '" at index ' + i + '.'));
    }
  }
  this.push(new Buffer(str, 'utf8'));
  done();
};

module.exports = SVGPathDataEncoder;


}).call(this,require("buffer").Buffer)
},{"./SVGPathData.js":22,"buffer":4,"readable-stream":20,"util":28}],24:[function(require,module,exports){
(function (Buffer){
// Parse SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

// Access to SVGPathData constructor
var SVGPathData = require('./SVGPathData.js');

// TransformStream inherance required modules
var TransformStream = require('readable-stream').Transform;
var util = require('util');

// Private consts : Char groups
var WSP = [' ', '\t', '\r', '\n'];
var DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
var SIGNS = ['-', '+'];
var EXPONENTS = ['e', 'E'];
var DECPOINT = ['.'];
var FLAGS = ['0', '1'];
var COMMA = [','];
var COMMANDS = [
  'm', 'M', 'z', 'Z', 'l', 'L', 'h', 'H', 'v', 'V', 'c', 'C',
  's', 'S', 'q', 'Q', 't', 'T', 'a', 'A'
];

// Inherit of transform stream
util.inherits(SVGPathDataParser, TransformStream);

// Constructor
function SVGPathDataParser(options) {

  // Ensure new were used
  if(!(this instanceof SVGPathDataParser)) {
    return new SVGPathDataParser(options);
  }

  // Parent constructor
  TransformStream.call(this, {
    objectMode: true
  });

  // Setting objectMode separately
  this._writableState.objectMode = false;
  this._readableState.objectMode = true;

  // Parsing vars
  this.state = SVGPathDataParser.STATE_COMMAS_WSPS;
  this.curNumber = '';
  this.curCommand = null;
  this._flush = function(callback) {
    this._transform(new Buffer(' '), 'utf-8', function() {});
    // Adding residual command
    if(null !== this.curCommand) {
      if(this.curCommand.invalid) {
        this.emit('error',
          new SyntaxError('Unterminated command at the path end.'));
      }
      this.push(this.curCommand);
      this.curCommand = null;
      this.state ^= this.state&SVGPathDataParser.STATE_COMMANDS_MASK;
    }
    callback();
  };
  this._transform = function(chunk, encoding, callback) {
    var str = chunk.toString(encoding !== 'buffer' ? encoding : 'utf8');
    for(var i=0, j=str.length; i<j; i++) {
      // White spaces parsing
      if(this.state&SVGPathDataParser.STATE_WSP ||
        this.state&SVGPathDataParser.STATE_WSPS) {
          if(-1 !== WSP.indexOf(str[i])) {
            this.state ^= this.state&SVGPathDataParser.STATE_WSP;
            // any space stops current number parsing
            if('' !== this.curNumber) {
              this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
            } else {
              continue;
            }
          }
      }
      // Commas parsing
      if(this.state&SVGPathDataParser.STATE_COMMA ||
        this.state&SVGPathDataParser.STATE_COMMAS) {
          if(-1 !== COMMA.indexOf(str[i])) {
            this.state ^= this.state&SVGPathDataParser.STATE_COMMA;
            // any comma stops current number parsing
            if('' !== this.curNumber) {
              this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
            } else {
              continue;
            }
          }
      }
      // Numbers parsing : -125.25e-125
      if(this.state&SVGPathDataParser.STATE_NUMBER) {
        // Reading the sign
        if((this.state&SVGPathDataParser.STATE_NUMBER_MASK) ===
          SVGPathDataParser.STATE_NUMBER) {
          this.state |= SVGPathDataParser.STATE_NUMBER_INT |
            SVGPathDataParser.STATE_NUMBER_DIGITS;
          if(-1 !== SIGNS.indexOf(str[i])) {
            this.curNumber += str[i];
            continue;
          }
        }
        // Reading the exponent sign
        if(this.state&SVGPathDataParser.STATE_NUMBER_EXPSIGN) {
          this.state ^= SVGPathDataParser.STATE_NUMBER_EXPSIGN;
          this.state |= SVGPathDataParser.STATE_NUMBER_DIGITS;
          if(-1 !== SIGNS.indexOf(str[i])) {
            this.curNumber += str[i];
            continue;
          }
        }
        // Reading digits
        if(this.state&SVGPathDataParser.STATE_NUMBER_DIGITS) {
          if(-1 !== DIGITS.indexOf(str[i])) {
            this.curNumber += str[i];
            continue;
          }
          this.state ^= SVGPathDataParser.STATE_NUMBER_DIGITS;
        }
        // Ended reading left side digits
        if(this.state&SVGPathDataParser.STATE_NUMBER_INT) {
          this.state ^= SVGPathDataParser.STATE_NUMBER_INT;
          // if got a point, reading right side digits
          if(-1 !== DECPOINT.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= SVGPathDataParser.STATE_NUMBER_FLOAT |
              SVGPathDataParser.STATE_NUMBER_DIGITS;
            continue;
          // if got e/E, reading the exponent
          } else if(-1 !== EXPONENTS.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= SVGPathDataParser.STATE_NUMBER_EXP |
              SVGPathDataParser.STATE_NUMBER_EXPSIGN;
            continue;
          }
          // else we're done with that number
          this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
        }
        // Ended reading decimal digits
        if(this.state&SVGPathDataParser.STATE_NUMBER_FLOAT) {
          this.state ^= SVGPathDataParser.STATE_NUMBER_FLOAT;
          // if got e/E, reading the exponent
          if(-1 !== EXPONENTS.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= SVGPathDataParser.STATE_NUMBER_EXP |
              SVGPathDataParser.STATE_NUMBER_EXPSIGN;
            continue;
          }
          // else we're done with that number
          this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
        }
        // Ended reading exponent digits
        if(this.state&SVGPathDataParser.STATE_NUMBER_EXP) {
          // we're done with that number
          this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
        }
      }
      // New number
      if(this.curNumber) {
        // Horizontal move to command (x)
        if(this.state&SVGPathDataParser.STATE_HORIZ_LINE_TO) {
          if(null === this.curCommand) {
            this.push({
              type: SVGPathData.HORIZ_LINE_TO,
              relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
              x: Number(this.curNumber)
            });
          } else {
            this.curCommand.x = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= SVGPathDataParser.STATE_NUMBER;
        // Vertical move to command (y)
        } else if(this.state&SVGPathDataParser.STATE_VERT_LINE_TO) {
          if(null === this.curCommand) {
            this.push({
              type: SVGPathData.VERT_LINE_TO,
              relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
              y: Number(this.curNumber)
            });
          } else {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= SVGPathDataParser.STATE_NUMBER;
        // Move to / line to / smooth quadratic curve to commands (x, y)
        } else if(this.state&SVGPathDataParser.STATE_MOVE_TO ||
          this.state&SVGPathDataParser.STATE_LINE_TO ||
          this.state&SVGPathDataParser.STATE_SMOOTH_QUAD_TO) {
          if(null === this.curCommand) {
            this.curCommand = {
              type: (this.state&SVGPathDataParser.STATE_MOVE_TO ?
                SVGPathData.MOVE_TO :
                  (this.state&SVGPathDataParser.STATE_LINE_TO ?
                    SVGPathData.LINE_TO : SVGPathData.SMOOTH_QUAD_TO
                  )
                ),
              relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
              x: Number(this.curNumber)
            };
          } else if('undefined' === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else {
            delete this.curCommand.invalid;
            this.curCommand.y = Number(this.curNumber);
            this.push(this.curCommand);
            this.curCommand = null;
            // Switch to line to state
            if(this.state&SVGPathDataParser.STATE_MOVE_TO) {
              this.state ^= SVGPathDataParser.STATE_MOVE_TO;
              this.state |= SVGPathDataParser.STATE_LINE_TO;
            }
          }
          this.state |= SVGPathDataParser.STATE_NUMBER;
        // Curve to commands (x1, y1, x2, y2, x, y)
        } else if(this.state&SVGPathDataParser.STATE_CURVE_TO) {
          if(null === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.CURVE_TO,
              relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
              invalid: true,
              x2:  Number(this.curNumber)
            };
          } else if('undefined' === typeof this.curCommand.x2) {
            this.curCommand.x2 = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.y2) {
            this.curCommand.y2 = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.x1) {
            this.curCommand.x1 = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.y1) {
            this.curCommand.y1 = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.y) {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= SVGPathDataParser.STATE_NUMBER;
        // Smooth curve to commands (x1, y1, x, y)
        } else if(this.state&SVGPathDataParser.STATE_SMOOTH_CURVE_TO) {
          if(null === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.SMOOTH_CURVE_TO,
              relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
              invalid: true,
              x2:  Number(this.curNumber)
            };
          } else if('undefined' === typeof this.curCommand.x2) {
            this.curCommand.x2 = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.y2) {
            this.curCommand.y2 = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.y) {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= SVGPathDataParser.STATE_NUMBER;
        // Quadratic bezier curve to commands (x1, y1, x, y)
        } else if(this.state&SVGPathDataParser.STATE_QUAD_TO) {
          if(null === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.QUAD_TO,
              relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
              invalid: true,
              x1:  Number(this.curNumber)
            };
          } else if('undefined' === typeof this.curCommand.x1) {
            this.curCommand.x1 = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.y1) {
            this.curCommand.y1 = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.y) {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= SVGPathDataParser.STATE_NUMBER;
        // Elliptic arc commands (rX, rY, xRot, lArcFlag, sweepFlag, x, y)
        } else if(this.state&SVGPathDataParser.STATE_ARC) {
          if(null === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.ARC,
              relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
              invalid: true,
              rX:  Number(this.curNumber)
            };
          } else if('undefined' === typeof this.curCommand.rX) {
            if(Number(this.curNumber) < 0) {
              this.emit('error', new SyntaxError('Expected positive number,' +
                ' got "' + this.curNumber + '" at index "' + i + '"'));
            }
            this.curCommand.rX = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.rY) {
            if(Number(this.curNumber) < 0) {
              this.emit('error', new SyntaxError('Expected positive number,' +
                ' got "' + this.curNumber + '" at index "' + i + '"'));
            }
            this.curCommand.rY = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.xRot) {
            this.curCommand.xRot = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.lArcFlag) {
            if('0' !== this.curNumber && '1' !== this.curNumber) {
              this.emit('error', new SyntaxError('Expected a flag, got "' +
                this.curNumber + '" at index "' + i + '"'));
            }
            this.curCommand.lArcFlag = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.sweepFlag) {
            if('0' !== this.curNumber && '1' !== this.curNumber) {
              this.emit('error', new SyntaxError('Expected a flag, got "' +
                this.curNumber +'" at index "' + i + '"'));
            }
            this.curCommand.sweepFlag = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else if('undefined' === typeof this.curCommand.y) {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= SVGPathDataParser.STATE_NUMBER;
        }
        this.curNumber = '';
        // Continue if a white space or a comma was detected
        if(-1 !== WSP.indexOf(str[i]) || -1 !== COMMA.indexOf(str[i])) {
          continue;
        }
        // if a sign is detected, then parse the new number
        if(-1 !== SIGNS.indexOf(str[i])) {
          this.curNumber = str[i];
          this.state |= SVGPathDataParser.STATE_NUMBER_INT |
            SVGPathDataParser.STATE_NUMBER_DIGITS;
          continue;
        }
        // if the decpoint is detected, then parse the new number
        if(-1 !== DECPOINT.indexOf(str[i])) {
          this.curNumber = str[i];
          this.state |= SVGPathDataParser.STATE_NUMBER_FLOAT |
            SVGPathDataParser.STATE_NUMBER_DIGITS;
          continue;
        }
      }
      // End of a command
      if(-1 !== COMMANDS.indexOf(str[i])) {
        // Adding residual command
        if(null !== this.curCommand) {
          if(this.curCommand.invalid) {
            this.emit('error',
              new SyntaxError('Unterminated command at index ' + i + '.'));
          }
          this.push(this.curCommand);
          this.curCommand = null;
          this.state ^= this.state&SVGPathDataParser.STATE_COMMANDS_MASK;
        }
      }
      // Detecting the next command
      this.state ^= this.state&SVGPathDataParser.STATE_COMMANDS_MASK;
      // Is the command relative
      if(str[i]===str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_RELATIVE;
      } else {
        this.state ^= this.state&SVGPathDataParser.STATE_RELATIVE;
      }
      // Horizontal move to command
      if('z' === str[i].toLowerCase()) {
        this.push({
          type: SVGPathData.CLOSE_PATH
        });
        this.state = SVGPathDataParser.STATE_COMMAS_WSPS;
        continue;
      // Horizontal move to command
      } else if('h' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_HORIZ_LINE_TO;
        this.curCommand = {
          type: SVGPathData.HORIZ_LINE_TO,
          relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
          invalid: true
        };
      // Vertical move to command
      } else if('v' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_VERT_LINE_TO;
        this.curCommand = {
          type: SVGPathData.VERT_LINE_TO,
          relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
          invalid: true
        };
      // Move to command
      } else if('m' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_MOVE_TO;
        this.curCommand = {
          type: SVGPathData.MOVE_TO,
          relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
          invalid: true
        };
      // Line to command
      } else if('l' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_LINE_TO;
        this.curCommand = {
          type: SVGPathData.LINE_TO,
          relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
          invalid: true
        };
      // Curve to command
      } else if('c' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_CURVE_TO;
        this.curCommand = {
          type: SVGPathData.CURVE_TO,
          relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
          invalid: true
        };
      // Smooth curve to command
      } else if('s' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_SMOOTH_CURVE_TO;
        this.curCommand = {
          type: SVGPathData.SMOOTH_CURVE_TO,
          relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
          invalid: true
        };
      // Quadratic bezier curve to command
      } else if('q' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_QUAD_TO;
        this.curCommand = {
          type: SVGPathData.QUAD_TO,
          relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
          invalid: true
        };
      // Smooth quadratic bezier curve to command
      } else if('t' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_SMOOTH_QUAD_TO;
        this.curCommand = {
          type: SVGPathData.SMOOTH_QUAD_TO,
          relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
          invalid: true
        };
      // Elliptic arc command
      } else if('a' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_ARC;
        this.curCommand = {
          type: SVGPathData.ARC,
          relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
          invalid: true
        };
      // Unkown command
      } else {
        this.emit('error', new SyntaxError('Unexpected character "' + str[i] +
          '" at index ' + i + '.'));
      }
      // White spaces can follow a command
      this.state |= SVGPathDataParser.STATE_COMMAS_WSPS |
        SVGPathDataParser.STATE_NUMBER;
    }
    callback();
  };
}

// Static consts
// Parsing states
SVGPathDataParser.STATE_WSP = 1;
SVGPathDataParser.STATE_WSPS = 2;
SVGPathDataParser.STATE_COMMA = 4;
SVGPathDataParser.STATE_COMMAS = 8;
SVGPathDataParser.STATE_COMMAS_WSPS =
  SVGPathDataParser.STATE_WSP | SVGPathDataParser.STATE_WSPS |
  SVGPathDataParser.STATE_COMMA | SVGPathDataParser.STATE_COMMAS;
SVGPathDataParser.STATE_NUMBER = 16;
SVGPathDataParser.STATE_NUMBER_DIGITS = 32;
SVGPathDataParser.STATE_NUMBER_INT = 64;
SVGPathDataParser.STATE_NUMBER_FLOAT = 128;
SVGPathDataParser.STATE_NUMBER_EXP = 256;
SVGPathDataParser.STATE_NUMBER_EXPSIGN = 512;
SVGPathDataParser.STATE_NUMBER_MASK = SVGPathDataParser.STATE_NUMBER |
  SVGPathDataParser.STATE_NUMBER_DIGITS | SVGPathDataParser.STATE_NUMBER_INT |
  SVGPathDataParser.STATE_NUMBER_EXP | SVGPathDataParser.STATE_NUMBER_FLOAT;
SVGPathDataParser.STATE_RELATIVE = 1024;
SVGPathDataParser.STATE_CLOSE_PATH = 2048; // Close path command (z/Z)
SVGPathDataParser.STATE_MOVE_TO = 4096; // Move to command (m/M)
SVGPathDataParser.STATE_LINE_TO = 8192; // Line to command (l/L=)
SVGPathDataParser.STATE_HORIZ_LINE_TO = 16384; // Horizontal line to command (h/H)
SVGPathDataParser.STATE_VERT_LINE_TO = 32768; // Vertical line to command (v/V)
SVGPathDataParser.STATE_CURVE_TO = 65536; // Curve to command (c/C)
SVGPathDataParser.STATE_SMOOTH_CURVE_TO = 131072; // Smooth curve to command (s/S)
SVGPathDataParser.STATE_QUAD_TO = 262144; // Quadratic bezier curve to command (q/Q)
SVGPathDataParser.STATE_SMOOTH_QUAD_TO = 524288; // Smooth quadratic bezier curve to command (t/T)
SVGPathDataParser.STATE_ARC = 1048576; // Elliptic arc command (a/A)
SVGPathDataParser.STATE_COMMANDS_MASK =
  SVGPathDataParser.STATE_CLOSE_PATH | SVGPathDataParser.STATE_MOVE_TO |
  SVGPathDataParser.STATE_LINE_TO | SVGPathDataParser.STATE_HORIZ_LINE_TO |
  SVGPathDataParser.STATE_VERT_LINE_TO | SVGPathDataParser.STATE_CURVE_TO |
  SVGPathDataParser.STATE_SMOOTH_CURVE_TO | SVGPathDataParser.STATE_QUAD_TO |
  SVGPathDataParser.STATE_SMOOTH_QUAD_TO | SVGPathDataParser.STATE_ARC;

module.exports = SVGPathDataParser;


}).call(this,require("buffer").Buffer)
},{"./SVGPathData.js":22,"buffer":4,"readable-stream":20,"util":28}],25:[function(require,module,exports){
// Transform SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

// Access to SVGPathData constructor
var SVGPathData = require('./SVGPathData.js');

// TransformStream inherance required modules
var TransformStream = require('readable-stream').Transform;
var util = require('util');

// Inherit of transform stream
util.inherits(SVGPathDataTransformer, TransformStream);

function SVGPathDataTransformer(transformFunction) {
  // Ensure new were used
  if(!(this instanceof SVGPathDataTransformer)) {
    return new (SVGPathDataTransformer.bind.apply(SVGPathDataTransformer,
      [SVGPathDataTransformer].concat([].slice.call(arguments, 0))));
  }

  // Transform function needed
  if('function' !== typeof transformFunction) {
    throw new Error('Please provide a transform callback to receive commands.');
  }
  this._transformer = transformFunction.apply(null, [].slice.call(arguments, 1));
  if('function' !== typeof this._transformer) {
    throw new Error('Please provide a valid transform (returning a function).');
  }

  // Parent constructor
  TransformStream.call(this, {
    objectMode: true
  });
}

SVGPathDataTransformer.prototype._transform = function(commands, encoding, done) {
  if(!(commands instanceof Array)) {
    commands = [commands];
  }
  for(var i=0, j=commands.length; i<j; i++) {
    this.push(this._transformer(commands[i]));
  }
  done();
};

// Predefined transforming functions
// Rounds commands values
SVGPathDataTransformer.ROUND = function roundGenerator(roundVal) {
  roundVal = roundVal || 10e12;
  return function round(command) {
    // x1/y1 values
    if('undefined' !== typeof command.x1) {
      command.x1 = Math.round(command.x1*roundVal)/roundVal;
    }
    if('undefined' !== typeof command.y1) {
      command.y1 = Math.round(command.y1*roundVal)/roundVal;
    }
    // x2/y2 values
    if('undefined' !== typeof command.x2) {
      command.x2 = Math.round(command.x2*roundVal)/roundVal;
    }
    if('undefined' !== typeof command.y2) {
      command.y2 = Math.round(command.y2*roundVal)/roundVal;
    }
    // Finally x/y values
    if('undefined' !== typeof command.x) {
      command.x = Math.round(command.x*roundVal,12)/roundVal;
    }
    if('undefined' !== typeof command.y) {
      command.y = Math.round(command.y*roundVal,12)/roundVal;
    }
    return command;
  };
};

// Relative to absolute commands
SVGPathDataTransformer.TO_ABS = function toAbsGenerator() {
  var prevX = 0, prevY = 0, pathStartX = NaN, pathStartY = NaN;
  return function toAbs(command) {
    if(isNaN(pathStartX) && (command.type&SVGPathData.DRAWING_COMMANDS)) {
      pathStartX = prevX;
      pathStartY = prevY;
    }
    if((command.type&SVGPathData.CLOSE_PATH) && !isNaN(pathStartX)) {
      prevX = isNaN(pathStartX) ? 0 : pathStartX;
      prevY = isNaN(pathStartY) ? 0 : pathStartY;
      pathStartX = NaN;
      pathStartY = NaN;
    }
    if(command.relative) {
      // x1/y1 values
      if('undefined' !== typeof command.x1) {
        command.x1 = prevX + command.x1;
      }
      if('undefined' !== typeof command.y1) {
        command.y1 = prevY + command.y1;
      }
      // x2/y2 values
      if('undefined' !== typeof command.x2) {
        command.x2 = prevX + command.x2;
      }
      if('undefined' !== typeof command.y2) {
        command.y2 = prevY + command.y2;
      }
      // Finally x/y values
      if('undefined' !== typeof command.x) {
        command.x = prevX + command.x;
      }
      if('undefined' !== typeof command.y) {
        command.y = prevY + command.y;
      }
      command.relative = false;
    }
    prevX = ('undefined' !== typeof command.x ? command.x : prevX);
    prevY = ('undefined' !== typeof command.y ? command.y : prevY);
    return command;
  };
};

// Absolute to relative commands
SVGPathDataTransformer.TO_REL = function toRelGenerator() {
  var prevX = 0, prevY = 0;
  return function toRel(command) {
    if(!command.relative) {
      // x1/y1 values
      if('undefined' !== typeof command.x1) {
        command.x1 = command.x1 - prevX;
      }
      if('undefined' !== typeof command.y1) {
        command.y1 = command.y1 - prevY;
      }
      // x2/y2 values
      if('undefined' !== typeof command.x2) {
        command.x2 = command.x2 - prevX;
      }
      if('undefined' !== typeof command.y2) {
        command.y2 = command.y2 - prevY;
      }
      // Finally x/y values
      if('undefined' !== typeof command.x) {
        command.x = command.x - prevX;
      }
      if('undefined' !== typeof command.y) {
        command.y = command.y - prevY;
      }
    command.relative = true;
    }
    prevX = ('undefined' !== typeof command.x ? prevX + command.x : prevX);
    prevY = ('undefined' !== typeof command.y ? prevY + command.y : prevY);
    return command;
  };
};

// SVG Transforms : http://www.w3.org/TR/SVGTiny12/coords.html#TransformList
// Matrix : http://apike.ca/prog_svg_transform.html
SVGPathDataTransformer.MATRIX = function matrixGenerator(a, b, c, d, e, f) {
  var prevX, prevY;
  if('number' !== typeof a, 'number' !== typeof b,
    'number' !== typeof c, 'number' !== typeof d,
    'number' !== typeof e, 'number' !== typeof f) {
    throw new Error('A matrix transformation requires parameters' +
      ' [a,b,c,d,e,f] to be set and to be numbers.');
  }
  return function matrix(command) {
    var origX = command.x, origX1 = command.x1, origX2 = command.x2;
    if('undefined' !== typeof command.x) {
      command.x =  command.x * a +
        ('undefined' !== typeof command.y ?
          command.y : (command.relative ? 0 : prevY || 0)
        ) * c +
        (command.relative && 'undefined' !== typeof prevX ? 0 : e);
    }
    if('undefined' !== typeof command.y) {
      command.y = ('undefined' !== typeof origX ?
          origX : (command.relative ? 0 : prevX || 0)
        ) * b +
        command.y * d +
        (command.relative && 'undefined' !== typeof prevY ? 0 : f);
    }
    if('undefined' !== typeof command.x1) {
      command.x1 = command.x1 * a + command.y1 * c +
        (command.relative && 'undefined' !== typeof prevX ? 0 : e);
    }
    if('undefined' !== typeof command.y1) {
      command.y1 = origX1 * b + command.y1 * d +
        (command.relative && 'undefined' !== typeof prevY ? 0 : f);
    }
    if('undefined' !== typeof command.x2) {
      command.x2 = command.x2 * a + command.y2 * c +
        (command.relative && 'undefined' !== typeof prevX ? 0 : e);
    }
    if('undefined' !== typeof command.y2) {
      command.y2 = origX2 * b + command.y2 * d +
        (command.relative && 'undefined' !== typeof prevY ? 0 : f);
    }
    prevX = ('undefined' !== typeof command.x ?
      (command.relative ? (prevX || 0) + command.x : command.x) :
      prevX || 0);
    prevY = ('undefined' !== typeof command.y ?
      (command.relative ? (prevY || 0) + command.y : command.y) :
      prevY || 0);
    return command;
  };
};

// Rotation
SVGPathDataTransformer.ROTATE = function rotateGenerator(a, x, y) {
  if('number' !== typeof a) {
    throw new Error('A rotate transformation requires the parameter a' +
      ' to be set and to be a number.');
  }
  return (function(toOrigin, doRotate, fromOrigin) {
    return function rotate(command) {
      return fromOrigin(doRotate(toOrigin(command)));
    };
  })(SVGPathDataTransformer.TRANSLATE(-(x || 0), -(y || 0)),
    SVGPathDataTransformer.MATRIX(Math.cos(a), Math.sin(a),
      -Math.sin(a), Math.cos(a), 0, 0),
    SVGPathDataTransformer.TRANSLATE(x || 0, y || 0)
  );
};

// Translation
SVGPathDataTransformer.TRANSLATE = function translateGenerator(dX, dY) {
  if('number' !== typeof dX) {
    throw new Error('A translate transformation requires the parameter dX' +
      ' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(1, 0, 0, 1, dX, dY || 0);
};

// Scaling
SVGPathDataTransformer.SCALE = function scaleGenerator(dX, dY) {
  if('number' !== typeof dX) {
    throw new Error('A scale transformation requires the parameter dX' +
      ' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(dX, 0, 0, dY || dX, 0, 0);
};

// Skew
SVGPathDataTransformer.SKEW_X = function skewXGenerator(a) {
  if('number' !== typeof a) {
    throw new Error('A skewX transformation requires the parameter x' +
      ' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(1, 0, Math.atan(a), 1, 0, 0);
};
SVGPathDataTransformer.SKEW_Y = function skewYGenerator(a) {
  if('number' !== typeof a) {
    throw new Error('A skewY transformation requires the parameter y' +
      ' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(1, Math.atan(a), 0, 1, 0, 0);
};

// Symetry througth the X axis
SVGPathDataTransformer.X_AXIS_SIMETRY = function xSymetryGenerator(xDecal) {
  return (function(toAbs, scale, translate) {
    return function xSymetry(command) {
      return translate(scale(toAbs(command)));
    };
  })(SVGPathDataTransformer.TO_ABS(),
    SVGPathDataTransformer.SCALE(-1, 1),
    SVGPathDataTransformer.TRANSLATE(xDecal || 0, 0)
  );
};

// Symetry througth the Y axis
SVGPathDataTransformer.Y_AXIS_SIMETRY = function ySymetryGenerator(yDecal) {
  return (function(toAbs, scale, translate) {
    return function ySymetry(command) {
      return translate(scale(toAbs(command)));
    };
  })(SVGPathDataTransformer.TO_ABS(),
    SVGPathDataTransformer.SCALE(1, -1),
    SVGPathDataTransformer.TRANSLATE(0, yDecal || 0)
  );
};

// Convert arc commands to curve commands
SVGPathDataTransformer.A_TO_C = function a2CGenerator() {
  var prevX = 0, prevY = 0, args;
  return (function(toAbs) {
    return function a2C(command) {
      var commands = [];
      command = toAbs(command);
      if(command.type === SVGPathData.ARC) {
        args = a2c(prevX, prevY, command.rX, command.rX, command.xRot,
          command.lArcFlag, command.sweepFlag, command.x, command.y);
        prevX = command.x; prevY = command.y;
        for(var i=0, ii=args.length; i<ii; i+=6) {
          commands.push({
            type: SVGPathData.CURVE_TO,
            relative: false,
            x2: args[i],
            y2: args[i+1],
            x1: args[i+2],
            y1: args[i+3],
            x: args[i+4],
            y: args[i+5]
          });
        }
        return commands;
      } else {
        prevX = command.x; prevY = command.y;
        return command;
      }
    };
  })(SVGPathDataTransformer.TO_ABS());
};

function a2c (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
  var PI = Math.PI;
  // Borrowed from https://github.com/PPvG/svg-path/blob/master/lib/Path.js#L208
  // that were borrowed from https://github.com/DmitryBaranovskiy/raphael/blob/4d97d4ff5350bb949b88e6d78b877f76ea8b5e24/raphael.js#L2216-L2304
  // (MIT licensed; http://raphaeljs.com/license.html).
  // --------------------------------------------------------------------------
  // for more information of where this math came from visit:
  // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
  var _120 = PI * 120 / 180,
      rad = PI / 180 * (+angle || 0),
      res = [],
      xy,
      rotate = function (x, y, rad) {
        var X = x * Math.cos(rad) - y * Math.sin(rad),
        Y = x * Math.sin(rad) + y * Math.cos(rad);
        return {x: X, y: Y};
      };
  if (!recursive) {
    xy = rotate(x1, y1, -rad);
    x1 = xy.x;
    y1 = xy.y;
    xy = rotate(x2, y2, -rad);
    x2 = xy.x;
    y2 = xy.y;
    var cos = Math.cos(PI / 180 * angle),
        sin = Math.sin(PI / 180 * angle),
        x = (x1 - x2) / 2,
        y = (y1 - y2) / 2;
    var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
    if (h > 1) {
      h = Math.sqrt(h);
      rx = h * rx;
      ry = h * ry;
    }
    var rx2 = rx * rx,
        ry2 = ry * ry,
        k = (large_arc_flag == sweep_flag ? -1 : 1) *
          Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) /
          (rx2 * y * y + ry2 * x * x))),
        cx = k * rx * y / ry + (x1 + x2) / 2,
        cy = k * -ry * x / rx + (y1 + y2) / 2,
        f1 = Math.asin(((y1 - cy) / ry).toFixed(9)),
        f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

    f1 = x1 < cx ? PI - f1 : f1;
    f2 = x2 < cx ? PI - f2 : f2;
    f1 < 0 && (f1 = PI * 2 + f1);
    f2 < 0 && (f2 = PI * 2 + f2);
    if (sweep_flag && f1 > f2) {
      f1 = f1 - PI * 2;
    }
    if (!sweep_flag && f2 > f1) {
      f2 = f2 - PI * 2;
    }
  } else {
    f1 = recursive[0];
    f2 = recursive[1];
    cx = recursive[2];
    cy = recursive[3];
  }
  var df = f2 - f1;
  if (Math.abs(df) > _120) {
    var f2old = f2,
        x2old = x2,
        y2old = y2;
    f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
    x2 = cx + rx * Math.cos(f2);
    y2 = cy + ry * Math.sin(f2);
    res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old,
      [f2, f2old, cx, cy]);
  }
  df = f2 - f1;
  var c1 = Math.cos(f1),
      s1 = Math.sin(f1),
      c2 = Math.cos(f2),
      s2 = Math.sin(f2),
      t = Math.tan(df / 4),
      hx = 4 / 3 * rx * t,
      hy = 4 / 3 * ry * t,
      m1 = [x1, y1],
      m2 = [x1 + hx * s1, y1 - hy * c1],
      m3 = [x2 + hx * s2, y2 - hy * c2],
      m4 = [x2, y2];
  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];
  if (recursive) {
    return [m2, m3, m4].concat(res);
  } else {
    res = [m2, m3, m4].concat(res).join().split(',');
    var newres = [];
    for (var i = 0, ii = res.length; i < ii; i++) {
      newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y :
        rotate(res[i], res[i + 1], rad).x;
    }
    return newres;
  }
}

module.exports = SVGPathDataTransformer;


},{"./SVGPathData.js":22,"readable-stream":20,"util":28}],26:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  if (!global.localStorage) return false;
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],28:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":27,"_process":14,"inherits":9}],29:[function(require,module,exports){
var extend=require("extend");

module.exports=function(obj){
  return extend(true,{},obj);
}

},{"extend":7}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
module.exports=function(v,min,max){
  return Math.max(Math.min(v,max),min);
}

},{}],32:[function(require,module,exports){
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

},{"./clone":29,"./create-svg":30,"./cutoff":31,"./gfx-of":33,"./is-set":34,"./pointer-events":36,"./svg/bt.svg":37,"extend":7,"gsap/src/uncompressed/TweenLite":3,"gsap/src/uncompressed/easing/EasePack":3,"gsap/src/uncompressed/plugins/CSSPlugin":3,"svg-pathdata":22}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
module.exports=function(v){
  return typeof v!="undefined";
}

},{}],35:[function(require,module,exports){
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

},{"./elastic-progress":32,"./is-set":34,"./to-array":38,"extend":7}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
function format(text) {return function(x, y) {x = (+x|0);y = (+y|0);var el = document.createElement("div");el.innerHTML = "<svg><g><g>" + text + "</g></g></svg>";el = el.childNodes[0].childNodes[0];el.childNodes[0].setAttribute("transform", "translate(" + x + "," + y + ")");return el}}
module.exports = format("\n<g id=\"container\">\n	<g id=\"circle\">\n		<g id=\"background\">\n			<path id=\"bg\" fill=\"#231F20\" d=\"M0-50c27.614,0,50,22.386,50,50S27.614,50,0,50c-27.615,0-50-22.386-50-50S-27.615-50,0-50z\"/>\n		</g>\n		<g id=\"overlay\">\n			<path fill=\"#47FF03\" d=\"M50,0c0,27.584-22.461,50-50,50c-27.636,0-50-22.416-50-50c0-27.594,22.364-50,50-50\n				C27.539-50,50-27.594,50,0z\"/>\n		</g>\n		<g id=\"border\">\n			<path fill=\"none\" stroke=\"#231F20\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M-23.833,21.445\n				c-80.313,1.374,7.956,104.833,89.191,104.833c81.7,0,191.842-105.833,110.142-105.833\"/>\n		</g>\n		<g id=\"fill-line\">\n			<path fill=\"none\" stroke=\"#FF00FF\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M-138.487,110.945l105,2\"/>\n		</g>\n	</g>\n	<g id=\"arrow\">\n		<g id=\"head\">\n			<polygon fill=\"#FF00FF\" points=\"-30.035,-31.56 0,0 30.035,-31.56 			\"/>\n		</g>\n		<g id=\"line\">\n			<rect x=\"-12.374\" y=\"-68.78\" fill=\"#FF00FF\" width=\"24.749\" height=\"41.552\"/>\n		</g>\n		<g id=\"label\">\n			<text transform=\"matrix(1 0 0 1 -0.7007 -41.584)\" fill=\"#231F20\" font-family=\"'Arial-BoldMT'\" font-size=\"18\">1</text>\n		</g>\n	</g>\n</g>\n<g id=\"hit-area\">\n	<path fill=\"#00FFDA\" d=\"M50,0c0,27.584-22.461,50-50,50c-27.636,0-50-22.416-50-50c0-27.594,22.364-50,50-50\n		C27.539-50,50-27.594,50,0z\"/>\n</g>\n")
},{}],38:[function(require,module,exports){
// Converts NodeList/jQuery collections/etc to array
function toArray(obj){
  return [].slice.call(obj);
}

module.exports=toArray;

},{}]},{},[35])(35)
});