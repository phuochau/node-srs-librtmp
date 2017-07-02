var ffi = require('ffi')
var ref = require('ref')
var fs = require('fs')
var sleep = require('sleep');

var voidRef = ref.types.void;
var voidRefPtr = ref.refType(voidRef);

var StringRef = 'string';
var StringRefPtr = ref.refType(StringRef);
var StringRefPtrPtr = ref.refType(StringRefPtr);

var IntRef = ref.types.int;
var IntRefPtr = ref.refType(IntRef);
var IntRefPtrPtr = ref.refType(IntRefPtr);

var Char = ref.types.char;
var CharPtr = ref.refType(Char);

var lib = ffi.Library('./srsrtmp', {
  'srs_rtmp_create': [ 'void', [ 'string' ] ],
  'srs_injecter': ['int', []]
});

lib.srs_injecter();
console.log('end');
