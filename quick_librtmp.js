const { bufPtrToObject } = require('./src/refs');
const loadRTMPLib = require('./src/clib');
var sleep = require('sleep');

const lib = loadRTMPLib('./librtmp/librtmp.1');

lib.RTMP_NGINX();
console.log('end');
