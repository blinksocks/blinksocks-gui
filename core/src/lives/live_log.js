const fs = require('fs');
const path = require('path');
const utils = require('util');
const readline = require('readline');
const { tailFile: tail } = require('winston/lib/winston/common');

const readdir = utils.promisify(fs.readdir);
const TAIL_FROM = 100;

async function getTotalLines(file) {
  let totalLines = 0;
  const reader = readline.createInterface({
    input: fs.createReadStream(file),
  });
  return new Promise((resolve) => {
    reader.on('line', () => totalLines += 1);
    reader.on('close', () => resolve(totalLines));
  });
}

module.exports = async function live_log({ id }) {
  const { log_path } = await this.invoke('get_config', { id });

  const logFilePath = path.resolve(process.cwd(), log_path || 'blinksocks');
  const logFileName = path.basename(logFilePath);
  const logFileDir = path.dirname(logFilePath);

  // find the most recently created log file
  const files = await readdir(logFileDir);
  const logFiles = files
    .filter(name => name.startsWith(logFileName))
    .sort()
    .map(name => path.join(logFileDir, name));

  const logFile = logFiles[0] || '';

  // count total lines
  let totalLines = 0;
  if (logFile) {
    totalLines = await getTotalLines(logFile);
  }

  let firstTime = true;
  let counter = 0;
  let lines = [];

  const start = totalLines > TAIL_FROM ? totalLines - TAIL_FROM - 1 : -1;
  const destroy = tail({ file: logFile, start: start }, (err, line) => {
    if (err) {
      return;
    }
    // instead of push many times at the first time,
    // we can make a cache here and do an one-time push.
    if (firstTime) {
      const end = start === -1 ? totalLines : TAIL_FROM;
      if (counter < end - 1) {
        lines.push(line);
        counter++;
      } else {
        firstTime = false;
        lines.push(line);
        this.push(lines);
        lines = null;
      }
    } else {
      this.push(line);
    }
  });
  return async function unregister() {
    destroy();
  };
};
