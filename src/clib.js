
const ffi = require('ffi');
const {
  ObjectRef,
  ObjectRefPtr,
  VoidRef,
  VoidRefPtr,
  VoidRefPtrPtr,
  IntRef,
  IntRefPtr,
  IntRefPtrPtr,
  CharRef,
  CharRefPtr,
  CharRefPtrPtr,
  DoubleRef,
  DoubleRefPtr
} = require('./refs');

const loadRTMPLib = (path) => {
  return ffi.Library(path, {
    'RTMP_Alloc': [ObjectRefPtr, []],
    'RTMP_Init': ['void', [ObjectRefPtr]],
    'RTMP_SetupURL': ['int', [ObjectRefPtr, 'string']],
    'RTMP_EnableWrite': ['void', [ObjectRefPtr]],
    'RTMP_SetBufferMS': ['void', [ObjectRefPtr, 'int']],
    'RTMP_Connect': ['int', [ObjectRefPtr, ObjectRefPtr]],
    'RTMP_Close': ['void', [ObjectRefPtr]],
    'RTMP_ConnectStream': ['int', [ObjectRefPtr, 'int']],
    'RTMP_Free': ['void', [ObjectRefPtr]],
    'RTMP_Log': ['void', ['int', 'string']],
    'RTMP_Write': ['int', [ObjectRefPtr, 'string', 'int']],

    'enc_num_val': ['void', [CharRefPtrPtr, 'int', 'string', 'double']],
    'enc_str_val': ['void', [CharRefPtrPtr, 'int', 'string', 'string']],
    'build_metadata': ['int', [CharRefPtrPtr]],
    'RTMP_NGINX': ['int', []]
  });
}
module.exports = loadRTMPLib;