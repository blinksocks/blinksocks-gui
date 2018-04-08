export const RUN_TYPE_CLIENT = 0;
export const RUN_TYPE_SERVER = 1;

export const TOKEN_NAME = 'BLINKSOCKS_GUI_TOKEN';
export const HASH_SALT = 'blinksocks';

// this value must be less than server dispose timeout
export const KEEPALIVE_INTERVAL = 5e4; // 50s
export const RPC_TIMEOUT = 3e4; // 30s

export const RPC_STATUS_INIT = -1;
export const RPC_STATUS_ONLINE = 0;
export const RPC_STATUS_OFFLINE = 1;
export const RPC_STATUS_ERROR = 2;

export const SERVICE_STATUS_INIT = -1;
export const SERVICE_STATUS_RUNNING = 0;
export const SERVICE_STATUS_STOPPED = 1;

export const CONN_STAGE_INIT = 0;
export const CONN_STAGE_TRANSFER = 1;
export const CONN_STAGE_FINISH = 2;
export const CONN_STAGE_ERROR = 3;
