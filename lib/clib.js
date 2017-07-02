
const ffi = require('ffi');
const {
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
    'srs_rtmp_create': [ VoidRefPtr, [ 'string' ] ],
    'srs_rtmp_destroy': ['void', [VoidRefPtr]],
    'srs_rtmp_handshake': ['int', [VoidRefPtr]],
    'srs_rtmp_connect_app': ['int', [VoidRefPtr]],
    'srs_rtmp_publish_stream': ['int', [VoidRefPtr]],
    'srs_rtmp_write_packet': ['int', [VoidRefPtr, 'int', 'int', 'string', 'int']],
    'srs_flv_open_read': [VoidRefPtr, ['string']],
    'srs_flv_close': ['void', [VoidRefPtr]],
    'srs_flv_read_header': ['void', [VoidRefPtr, CharRefPtr]],
    'srs_flv_read_tag_header': ['int', [ VoidRefPtr, CharRefPtr, IntRefPtr, IntRefPtr ]],
    'srs_flv_read_tag_data': ['int', [ VoidRefPtr, CharRefPtr, 'int']],
    'srs_flv_size_tag': ['int', ['int']],
    'srs_flv_lseek': ['void', [VoidRefPtr, 'int']],
    'srs_rtmp_is_onMetaData': ['bool', ['int', 'string', 'int']]
  });
}
module.exports = loadRTMPLib;