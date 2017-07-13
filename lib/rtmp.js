const libRTMP = require('./clib');

var method = RTMP.prototype;

function RTMP(host, port, appName, streamKey) {
    this._host = host;
    this._port = port;
    this._appName = appName;
    this._streamKey = streamKey;
    this._rtmpURL = `rtmp://${host}:${port}/${appName}/${streamKey}`;
}

method.connect = function() {
    this._conn = libRTMP.srs_rtmp_create(this._rtmpURL);
    if (!this._conn) throw "Can't create connection.";

    if (libRTMP.srs_rtmp_handshake(this._conn) !== 0) throw "Handshake failed.";

    if (libRTMP.srs_rtmp_connect_app(this._conn) !== 0) throw `Can't connect to RTMP server with app name: ${this._appName}`;
    
    if (libRTMP.srs_rtmp_publish_stream(this._conn) !== 0) throw `Can't publish stream: ${this._streamKey}`;
}

method.sendPackage = function(packetType, timestamp, data, dataSize) {
  if(libRTMP.srs_rtmp_write_packet(this._conn, packetType, timestamp, data, dataSize) != 0) return false;
  return true;
}

method.disconnect = function() {
  libRTMP.srs_rtmp_destroy(this._conn);
}

module.exports = RTMP;