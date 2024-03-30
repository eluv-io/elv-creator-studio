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
  }
};
