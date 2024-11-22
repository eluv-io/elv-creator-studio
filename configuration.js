const firebaseProjectId = "demov3-955210";

const EluvioConfiguration = {
  "config-url": "https://main.net955305.contentfabric.io/config",
  //"config-url": "https://demov3.net955210.contentfabric.io/config",
  "coreUrl": "https://core.v3.contentfabric.io/#/apps/Asset%20Manager",
  "version": "local",
  "dev": true,
  "firebase-local": true,

  "firebase-config": {
    "apiKey": "AIzaSyB-klmTxRJ8HL_lPVahq584KVs1xmrcI0A",
    "projectId": firebaseProjectId,
    "authDomain": `${firebaseProjectId}.firebaseapp.com`,
    "databaseURL": `https://${firebaseProjectId}.firebaseio.com`,
    "storageBucket": `${firebaseProjectId}.appspot.com`
  },

  /*
  "firebase-config": {
    "apiKey": "AIzaSyB-klmTxRJ8HL_lPVahq584KVs1xmrcI0A",
    "projectId": "production-web-apps-c0c6b",
    "authDomain": "production-web-apps-c0c6b.firebaseapp.com",
    "databaseURL": "https://production-web-apps-c0c6b.firebaseio.com",
    "storageBucket": "production-web-apps-c0c6b.appspot.com"
  },

   */

  "network": "demo",
  "mode": "staging",
  "purchase-mode": "develop",
  "show-debug": true,
  "auth0-domain": "auth.contentfabric.io",
  "auth0-configuration-id": "ONyubP9rFI5BHzmYglQKBZ1bBbiyoB3S",
  "ory_configuration": {
    "url": "https://ory.svc.contentfabric.io",
    "client_id": "4ef862d4-0144-4715-a1c0-5683458d5034",
    "audience": "https://wltd.svc.eluv.io",
    "jwt_template": "jwt_uefa_template1"
  },
  "deploy-time": "",
  "version-hash": "local"
};
