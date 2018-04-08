const path = require('path');
const cwd = process.cwd();

exports.RUNTIME_PATH = path.join(cwd, 'runtime');
exports.RUNTIME_LOG_PATH = path.join(cwd, 'runtime/logs/');
exports.DATABASE_PATH = path.join(cwd, 'runtime/db.json');
exports.RUNTIME_HELPERS_PAC_PATH = path.join(cwd, 'runtime/helpers/pac');
exports.RUNTIME_HELPERS_SYSPROXY_PATH = path.join(cwd, 'runtime/helpers/sysproxy');

exports.HASH_SALT = 'blinksocks';
exports.DESENSITIZE_PLACEHOLDER = '********';

exports.RUN_TYPE_CLIENT = 0;
exports.RUN_TYPE_SERVER = 1;

exports.SERVER_PUSH_REGISTER_SUCCESS = 0;
exports.SERVER_PUSH_REGISTER_ERROR = 1;
exports.SERVER_PUSH_DISPOSE_TIMEOUT = 6e4; // 1min

exports.SERVICE_STATUS_INIT = -1;
exports.SERVICE_STATUS_RUNNING = 0;
exports.SERVICE_STATUS_STOPPED = 1;
