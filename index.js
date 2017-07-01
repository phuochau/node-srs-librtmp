const { bufPtrToObject } = require('./src/refs');
const loadRTMPLib = require('./src/clib');
var sleep = require('sleep');

const lib = loadRTMPLib('./librtmp/librtmp.1');

if (!lib) {
  console.log('Cannot load library');
}

const serverURL = 'rtmp://127.0.0.1:1935/live/bravo';

const rtmp = lib.RTMP_Alloc();
lib.RTMP_Init(rtmp);

if (!lib.RTMP_SetupURL(rtmp, serverURL)) {
  lib.RTMP_Log(1, "SetupURL Err\n");
  lib.RTMP_Free(rtmp);
  return -1;
}

// enable write
lib.RTMP_EnableWrite(rtmp);
//1hour
lib.RTMP_SetBufferMS(rtmp, 3600 * 1000);

if (!lib.RTMP_Connect(rtmp, null)) {
    lib.RTMP_Log(1, "Connect Err\n");
    lib.RTMP_Free(rtmp);
    return -1;
}

if (!lib.RTMP_ConnectStream(rtmp, 0)) {
    lib.RTMP_Log(1, "ConnectStream Err\n");
    lib.RTMP_Close(rtmp);
    lib.RTMP_Free(rtmp);
    return -1;
}

console.log('start sending data...');

const metadata = lib.build_metadata();

while(true) {
    if (!lib.RTMP_Write(rtmp, metadata, metadata.length)) {
        lib.RTMP_Log(1, "Cant send metadata Err\n");
        lib.RTMP_Close(rtmp);
        lib.RTMP_Free(rtmp);
        break;
    }
    console.log('sent');
    sleep.sleep(1);
}

if (rtmp != null) {
    lib.RTMP_Close(rtmp);
    lib.RTMP_Free(rtmp);
}

console.log('end process');
