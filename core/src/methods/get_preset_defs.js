module.exports = async function get_preset_defs() {
  return [
    {
      "name": "ss-base",
      "params": [],
      "isAddressing": true
    },
    {
      "name": "ss-stream-cipher",
      "params": [{
        "key": "method",
        "type": "enum",
        "values": [
          "aes-128-ctr",
          "aes-192-ctr",
          "aes-256-ctr",
          "aes-128-cfb",
          "aes-192-cfb",
          "aes-256-cfb",
          "camellia-128-cfb",
          "camellia-192-cfb",
          "camellia-256-cfb",
          "rc4-md5",
          "rc4-md5-6",
          "none"
        ],
        "defaultValue": "aes-128-ctr",
        "description": "encryption/decryption algorithm",
        "optional": true
      }]
    },
    {
      "name": "ss-aead-cipher",
      "params": [{
        "key": "method",
        "type": "enum",
        "values": [
          "aes-128-gcm",
          "aes-192-gcm",
          "aes-256-gcm",
          "chacha20-poly1305",
          "chacha20-ietf-poly1305",
          "xchacha20-ietf-poly1305"
        ],
        "defaultValue": "aes-128-gcm",
        "description": "encryption/decryption algorithm",
        "optional": true
      }]
    },
    {
      "name": "ssr-auth-aes128-md5",
      "params": []
    },
    {
      "name": "ssr-auth-aes128-sha1",
      "params": []
    },
    {
      "name": "ssr-auth-chain-a",
      "params": []
    },
    {
      "name": "ssr-auth-chain-b",
      "params": []
    },
    {
      "name": "v2ray-vmess",
      "params": [{
        "key": "id",
        "type": "string",
        "defaultValue": "",
        "description": "uuid",
        "optional": false
      }, {
        "key": "security",
        "type": "enum",
        "values": [
          "aes-128-gcm",
          "chacha20-poly1305",
          "none"
        ],
        "defaultValue": "aes-128-gcm",
        "description": "encryption/decryption algorithm",
        "optional": true
      }]
    },
    {
      "name": "obfs-random-padding",
      "params": []
    },
    // {
    //   "name": "obfs-http",
    //   "params": [
    //     {
    //       "key": "file",
    //       "type": "string",
    //       "defaultValue": ""
    //     }
    //   ]
    // },
    {
      "name": "obfs-tls1.2-ticket",
      "params": [{
        "key": "sni",
        "type": "array",
        "defaultValue": [],
        "description": "server name indication",
        "optional": false
      }]
    },
    {
      "name": "base-auth",
      "params": [{
        "key": "method",
        "type": "enum",
        "values": [
          "md5",
          "sha1",
          "sha256"
        ],
        "defaultValue": "sha1",
        "description": "hash algorithm",
        "optional": true
      }],
      "isAddressing": true
    },
    {
      "name": "aead-random-cipher",
      "params": [{
        "key": "method",
        "type": "enum",
        "values": [
          "aes-128-gcm",
          "aes-192-gcm",
          "aes-256-gcm"
        ],
        "defaultValue": "aes-128-gcm",
        "description": "encryption/decryption algorithm",
        "optional": true
      }, {
        "key": "info",
        "type": "string",
        "defaultValue": "bs-subkey",
        "description": "",
        "optional": true
      }, {
        "key": "factor",
        "type": "number",
        "defaultValue": 2,
        "description": "",
        "optional": true
      }]
    },
    // {
    //   "name": "auto-conf",
    //   "params": []
    // },
  ];
};
