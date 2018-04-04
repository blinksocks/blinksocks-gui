#!/usr/bin/env node
const os = require('os');
const prompts = require('prompts');
const chalk = require('chalk');
const bootstrap = require('./bootstrap');
const version = require('../package.json').version;

const RUN_TYPE_CLIENT = 0;
const RUN_TYPE_SERVER = 1;

const examples = [
  ['Start web ui interactively', '$ blinksocks-gui'],
  ['Start web ui at 3000 as client', '$ blinksocks-gui --client --port 3000'],
];

const usage = `
  ${chalk.bold.underline(`blinksocks-gui v${version}`)}

  Usage: blinksocks-gui [options] ...

  Options:

    -h, --help          output usage information
    -v, --version       output blinksocks-gui version
    -c, --client        start web ui as client
    -s, --server        start web ui as server
    -p, --port          web ui listening port

  Examples:

${examples.map(([description, example]) => `  ${chalk.gray('-')} ${description}${os.EOL}    ${chalk.blue(example)}`).join(os.EOL)}

  About & Help: ${chalk.underline('https://github.com/blinksocks/blinksocks-gui')}
`;

const argv = process.argv;
const options = argv.slice(2);

function hasOption(opt) {
  return options.indexOf(opt) !== -1;
}

function getOptionValue(opt) {
  const index = options.indexOf(opt);
  if (index !== -1) {
    return options[index + 1];
  }
}

async function main() {
  if (argv.length < 2) {
    return console.log(usage);
  }

  // parse options

  if (hasOption('-h') || hasOption('--help')) {
    return console.log(usage);
  }

  if (hasOption('-v') || hasOption('--version')) {
    return console.log(version);
  }

  let runType, port;

  // ask for runType when necessary
  if (hasOption('-c') || hasOption('--client')) {
    runType = RUN_TYPE_CLIENT;
  }
  if (hasOption('-s') || hasOption('--server')) {
    runType = RUN_TYPE_SERVER;
  }

  if (typeof runType === 'undefined') {
    const answer = await prompts({
      type: 'select',
      name: 'value',
      message: 'Please choose run type',
      choices: [
        { title: 'Client', value: RUN_TYPE_CLIENT },
        { title: 'Server', value: RUN_TYPE_SERVER },
      ],
      initial: 0,
    });
    runType = answer.value;
  }

  // ask for port when necessary
  port = getOptionValue('-p') || getOptionValue('--port');

  if (!port || port === '0') {
    const answer = await prompts({
      type: 'number',
      name: 'value',
      message: 'Please choose a port(1 ~ 65535) for web ui:',
      initial: 3000,
      style: 'default',
      min: 1,
      max: 65535,
    });
    port = answer.value;
  }

  bootstrap({ runType, port });
}

main();
