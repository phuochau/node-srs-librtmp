const loadRTMPLib = require('../lib/clib');
var sleep = require('sleep');

var libfactorial = loadRTMPLib('../build/srsrtmp');

const url = 'rtmp://192.168.99.100:32776/live/srs';
const test_file = "../videos/SampleVideo_1280x720_30mb.flv";

const rtmpCon = libfactorial.srs_rtmp_create(url);
libfactorial.srs_rtmp_handshake(rtmpCon);
libfactorial.srs_rtmp_connect_app(rtmpCon);

libfactorial.srs_rtmp_publish_stream(rtmpCon);

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

if (header_signature.indexOf('FLV') === - 1) {
    libfactorial.srs_flv_close(flv_ref);
    return;
}

let continueRead = true;
while(continueRead) {
  var ptype = new Buffer(1);
  var pdata_size = new Buffer(3);
  var ptime = new Buffer(4);
  const r = libfactorial.srs_flv_read_tag_header(flv_ref, ptype, pdata_size, ptime);
  ptype = ptype.readInt8(0);
  pdata_size = pdata_size.readUIntLE(0, 3)
  ptime = ptime.readInt32LE(0);
  console.log('ptype', ptype);

  if (r === 0 && ptime >= 0) {
    var flv_data = new Buffer(pdata_size);
    libfactorial.srs_flv_read_tag_data(flv_ref, flv_data, pdata_size);
    libfactorial.srs_rtmp_write_packet(rtmpCon, ptype, ptime, flv_data, pdata_size);
  } else {
    continueRead = false;
  }
  sleep.msleep(10);
}

libfactorial.srs_flv_close(flv_ref);
libfactorial.srs_rtmp_destroy(rtmpCon);
console.log('end');
