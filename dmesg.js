#!/usr/bin/env node

const fs = require('fs');

function decodePrefix (prefix) {
  const prefixValue = parseInt(prefix);
  const priortyMask = (1 << 3) - 1;
  const facility = prefixValue >> 3;
  const priority = prefix & priortyMask;
  return [priority, facility];
}

function parseMessage (data) {
  const message = Buffer.from(data).toString('utf8');
  const [infoSection, fullMessage] = message.split(';');
  const [prefix, sequence, timestamp ] = infoSection.split(',');
  const [priority, facility] = decodePrefix(prefix);
  const miliseconds = timestamp / 1000000;
  const msString = miliseconds.toString('10');
  const formatedTime = msString.padStart(14 - msString.length);
  process.stdout.write(`<${prefix}>[${formatedTime}] ${fullMessage.split('\n')[0]}\n`);
}
const follow = process.argv.includes('-w') || process.argv.includes('--follow'); 
const flags = follow ? fs.constants.O_RDONLY : fs.constants.O_NONBLOCK;
const fd = fs.openSync('/dev/kmsg', flags);
const buffer = Buffer.allocUnsafe(1024);
while (1) {
  let line;
  try {
    bytesRead = fs.readSync(fd, buffer, 0, buffer.length);
    parseMessage(buffer.slice(0, bytesRead))
  } catch (e) {
    process.exit();
  }
}
