const { RTMP, FLV } = require('../lib')
const sleep = require('sleep');

const host = '192.168.99.100';
const port = 32772;
const appName = 'live';
const streamKey = 'srs';

const flv_path = "../videos/SampleVideo_1280x720_30mb.flv";

console.log('start');
const rtmpClient = new RTMP(host, port, appName, streamKey);
rtmpClient.connect();

const flvStream = new FLV(flv_path);

flvStream.openStream();
flvStream.readHeader();

let i = 1;
while(true) {

  const tag = flvStream.readNextTag();
  if (!tag) break;

  // send package
  const sent = rtmpClient.sendPackage(tag.packetType, tag.timestamp, tag.data, tag.dataSize);
  if (!sent) {
    console.log("Can't send package: ", tag);
    break;
  }
  console.log('Sent Package', i);
  i++;
  sleep.msleep(10);
}

// while(true) { }

flvStream.closeStream();
rtmpClient.disconnect();
console.log('end');
