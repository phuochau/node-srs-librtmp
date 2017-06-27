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

var libfactorial = ffi.Library('./libfactorial', {
  'srs_rtmp_create': [ voidRefPtr, [ 'string' ] ],
  'srs_rtmp_handshake': ['int', [voidRefPtr]],
  'srs_rtmp_connect_app': ['int', [voidRefPtr]],
  'srs_rtmp_get_server_id': ['int', [voidRefPtr, StringRefPtrPtr, IntRefPtr, IntRefPtr]],
  'srs_rtmp_publish_stream': ['int', [voidRefPtr]],
  'srs_rtmp_write_packet': ['int', [voidRefPtr, Char, 'int', 'string', 'int']],
  'srs_h264_write_raw_frames': ['int', [voidRefPtr, 'string', 'int', 'int', 'int']],
  'srs_h264_startswith_annexb': ['int', ['string', 'int', IntRefPtr]],
  'srs_flv_open_read': [voidRefPtr, ['string']],
  'srs_flv_close': ['void', [voidRefPtr]],
  'srs_flv_read_header': ['void', [voidRefPtr, CharPtr]],
  'srs_flv_read_tag_header': ['int', [ voidRefPtr, CharPtr, IntRefPtr, IntRefPtr ]],
  'srs_flv_read_tag_data': ['int', [ voidRefPtr, CharPtr, 'int']],
  'srs_flv_size_tag': ['int', ['int']],
  'srs_flv_lseek': ['void', [voidRefPtr, 'int']],

});
const url = 'rtmp://127.0.0.1:1935/live/flvtest';
const test_file = "./test.flv";

const rtmpCon = libfactorial.srs_rtmp_create(url);
console.log(rtmpCon);
console.log(libfactorial.srs_rtmp_handshake(rtmpCon));
console.log(libfactorial.srs_rtmp_connect_app(rtmpCon));

console.log(libfactorial.srs_rtmp_publish_stream(rtmpCon));

// open flv file
const flv_ref = libfactorial.srs_flv_open_read(test_file);

// read headers
/*
* @param header, @see E.2 The FLV header, flv_v10_1.pdf in SRS doc.
*   3bytes, signature, "FLV",
*   1bytes, version, 0x01,
*   1bytes, flags, UB[5] 0, UB[1] audio present, UB[1] 0, UB[1] video present.
*   4bytes, dataoffset, 0x09, The length of this header in bytes
*/

var flv_header = new Buffer(9);
libfactorial.srs_flv_read_header(flv_ref, flv_header);

let header_signature = new Buffer(3);
flv_header.copy(header_signature, 0, 0, 3);
header_signature = header_signature.toString();

let header_version = new Buffer(1);
flv_header.copy(header_version, 0, 3, 4);
header_version = header_version.readInt8(0);

let header_flags = new Buffer(1);
flv_header.copy(header_flags, 0, 4, 5);
header_flags = header_flags.readInt8(0);

let header_size = new Buffer(4);
flv_header.copy(header_size, 0, 5, 9);
header_size = header_size.readInt32BE(0);

console.log('header_signature', header_signature);
console.log('header_version', header_version);
console.log('header_flags', header_flags);
console.log('header_size', header_size);
if (header_signature.indexOf('FLV') === - 1) {
    libfactorial.srs_flv_close(flv_ref);
    return;
}

let currentPos = header_size + 4; // 4 bytes of prev tag
let continueRead = true;
while(continueRead) {
  console.log('currentPos', currentPos);
  // libfactorial.srs_flv_lseek(flv_ref, currentPos); // no need to seek, autoseek

  var ptype = new Buffer(1);
  var pdata_size = new Buffer(3);
  var ptime = new Buffer(4);
  const r = libfactorial.srs_flv_read_tag_header(flv_ref, ptype, pdata_size, ptime);
  ptype = ptype.readInt8(0);
  pdata_size = pdata_size.readUIntLE(0, 3) // wrong at read data_size, see p75: http://download.macromedia.com/f4v/video_file_format_spec_v10_1.pdf
  ptime = ptime.readInt32LE(0);
  console.log('ptype', ptype);
  console.log('pdata_size', pdata_size);
  console.log('ptime', ptime);
  // return;

  if (r === 0 && ptime >= 0) {
    var flv_data = new Buffer(pdata_size);
    console.log(libfactorial.srs_flv_read_tag_data(flv_ref, flv_data, pdata_size));
    var sizeTag = libfactorial.srs_flv_size_tag(pdata_size);
    console.log('sizeOfTag', sizeTag);
    console.log('========== DATA ===========');
    // console.log(flv_data.toString());
    console.log('===========================')
    currentPos += sizeTag;
    var c = Buffer(4096);
    c.write(flv_data.toString());
    console.log(libfactorial.srs_rtmp_write_packet(rtmpCon, ptype, ptime, c.toString(), pdata_size));
  } else {
    continueRead = false;
  }
  sleep.sleep(3);
}

libfactorial.srs_flv_close(flv_ref);
console.log('end');
//


// let content = null;
// let time = 0;
// while(true) {
//   console.log('next round');
//   if (content) {
//     console.log('prepare to write packet');
//     // var int_with_4 = ref.alloc(ref.types.int, 4096);
//     // console.log(int_with_4);
//     const dts = new Buffer(4096);
//     const pts = new Buffer(4096);
//     console.log('content.length', content.length);
//     console.log(libfactorial.srs_h264_write_raw_frames(rtmpCon, content, content.length, dts, pts));
//     time += 40;
//     console.log('written');
//   } else {
//     // content
//     console.log('prepare to read file');
//     content = fs.readFileSync(test_file);
//     console.log('read file complete', (content != null));
//   }
//   sleep.sleep(3)
// }
//
// console.log('ok');
