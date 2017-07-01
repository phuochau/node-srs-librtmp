const loadRTMPLib = require('./src/clib');

const lib = loadRTMPLib('./librtmp/librtmp.1');

console.log(lib.RTMP_NGINX());