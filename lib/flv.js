const libRTMP = require('./clib');

var method = FLV.prototype;

function FLV(filePath) {
    this._filePath = filePath;
}

method.openStream = function() {
    this._file = libRTMP.srs_flv_open_read(this._filePath);
    if (!this._file) throw "Can't open the file";
}

/*
* @param header, @see E.2 The FLV header, flv_v10_1.pdf in SRS doc.
*   3bytes, signature, "FLV",
*   1bytes, version, 0x01,
*   1bytes, flags, UB[5] 0, UB[1] audio present, UB[1] 0, UB[1] video present.
*   4bytes, dataoffset, 0x09, The length of this header in bytes
*/
method.readHeader = function() {
  var header = new Buffer(9);
  libRTMP.srs_flv_read_header(this._file, header);

  let header_signature = new Buffer(3);
  header.copy(header_signature, 0, 0, 3);
  header_signature = header_signature.toString();

  let header_version = new Buffer(1);
  header.copy(header_version, 0, 3, 4);
  header_version = header_version.readInt8(0);

  let header_flags = new Buffer(1);
  header.copy(header_flags, 0, 4, 5);
  header_flags = header_flags.readInt8(0);

  let header_size = new Buffer(4);
  header.copy(header_size, 0, 5, 9);
  header_size = header_size.readInt32BE(0);

  if (header_signature.indexOf('FLV') === - 1) {
      this.closeStream();
      throw "The file is not flv.";
  }
  return {
    header,
    header_signature,
    header_version,
    header_flags,
    header_size
  };
}

method.readNextTag = function () {
  let packetType = new Buffer(1);
  let dataSize = new Buffer(3);
  let timestamp = new Buffer(4);
  const r = libRTMP.srs_flv_read_tag_header(this._file, packetType, dataSize, timestamp);

  packetType = packetType.readInt8(0);
  dataSize = dataSize.readUIntLE(0, 3)
  timestamp = timestamp.readInt32LE(0);

  if (r != 0 || timestamp < 0) return null;

  let data = new Buffer(dataSize);
  if(libRTMP.srs_flv_read_tag_data(this._file, data, dataSize) != 0) return null;

  return {
    packetType,
    dataSize,
    timestamp,
    data
  };
}

method.closeStream = function() {
  libRTMP.srs_flv_close(this._file);
}

module.exports = FLV;