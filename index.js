var ffi = require('ffi')
var ref = require('ref')
var fs = require('fs')
var sleep = require('sleep');

var voidRef = ref.types.void;
var voidRefPtr = ref.refType(voidRef);
var voidRefPtrPtr = ref.refType(voidRefPtr);

var StringRef = 'string';
var StringRefPtr = ref.refType(StringRef);
var StringRefPtrPtr = ref.refType(StringRefPtr);

var IntRef = ref.types.int;
var IntRefPtr = ref.refType(IntRef);
var IntRefPtrPtr = ref.refType(IntRefPtr);

var CharRef = ref.types.char;
var CharRefPtr = ref.refType(CharRef);

var librtmp = ffi.Library('./librtmp/librtmp.1', {
  'RTMP_Alloc': [voidRefPtr, []],
  'RTMP_Init': ['void', [voidRefPtr]],
  'RTMP_SetupURL': ['int', [voidRefPtr, 'string']],
  'RTMP_EnableWrite': ['void', [voidRefPtr]],
  'RTMP_NGINX': ['int', []]
});

// define variable
const url = 'rtmp://127.0.0.1:1935/live/node';
const test_file = "./test.flv";

// alloc
librtmp.RTMP_NGINX();

console.log('end');
