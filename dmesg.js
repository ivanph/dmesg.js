#!/usr/bin/env node

const fs = require('fs');
const PRIORITY_MASK = 7;
const FACILITY_SHIFT = 3;

/**
 * Priorities/facilities are encoded into a single 32-bit quantity, where the
  * bottom 3 bits are the priority (0-7) and the top 28 bits are the facility
  * (0-big number).
  **/
function decodePrefix (prefix) {
  const prefixValue = parseInt(prefix);
  const facility = prefixValue >> FACILITY_SHIFT;
  const priority = prefix & PRIORITY_MASK;
  return [priority, facility];
}

function formatTimestamp (timestamp) {
  const microseconds = timestamp % 1000000;
  const seconds = (timestamp / 1000000) | 0;
  const paddedSeconds = seconds.toString(10).padStart(5);
  const paddedMicroseconds = microseconds.toString(10).padStart(6, '0');
  return `${paddedSeconds}.${paddedMicroseconds}`;
}

function parseMessage (data) {
  const rawMsg = Buffer.from(data).toString('utf8');
  const [infoSection, fullMessage] = rawMsg.split(';');
  const [ prefix, sequence, timestamp ] = infoSection.split(',');
  const [priority, facility] = decodePrefix(prefix);
  const formatedTime = formatTimestamp(timestamp);
  const message = fullMessage.split('\n')[0];
  return { formatedTime, priority, facility, sequence, message };
}

function makePRI (facility, priority) {
  return facility | priority;
}

function printMessage (parsedMessage) {
  const compatPriority = makePRI(parsedMessage.facility, parsedMessage.priority);
  process.stdout.write(`<${compatPriority}>[${parsedMessage.formatedTime}] ${parsedMessage.message}\n`);
}
function help () {
  console.log(`
  dmesg - print or control the kernel ring buffer.

  DESCRIPTION
       dmesg is used to examine or control the kernel ring buffer.
       The default action is to display all messages from the kernel ring buffer.
  
  OPTIONS
    -w, --follow
            Wait for new messages.  This feature is supported only on systems with a readable /dev/kmsg (since kernel 3.5.0).
  `);
}
function main (flags) {
  const fd = fs.openSync('/dev/kmsg', flags);
  const buffer = Buffer.allocUnsafe(1024);
  while (1) {
    try {
      const bytesRead = fs.readSync(fd, buffer, 0, buffer.length);
      const parsedMessage = parseMessage(buffer.slice(0, bytesRead));
      printMessage(parsedMessage);
    } catch (e) {
      process.exit();
    }
  }
}

const options = process.argv.slice(2);
if (options.includes('-h') || options.includes('--help')) {
  help();
  process.exit();
}
const follow = options.includes('-w') || options.includes('--follow');
const flags = follow ? fs.constants.O_RDONLY : fs.constants.O_NONBLOCK;
main(flags);
