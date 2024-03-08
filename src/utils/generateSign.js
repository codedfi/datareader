const CryptoJS = require("crypto-js");

module.exports = (appSecret, paramJson = {}, headers = {}) => {
  let strBody = "";
  let keysBody = Object.keys(paramJson);
  keysBody = keysBody.sort();
  for (const key of keysBody) {
    const val = paramJson[key];
    strBody += `${key}=${val}`;
  }

  let param = Object.assign({}, headers);

  let strHeader = "";
  let headerKeys = Object.keys(param);
  headerKeys = headerKeys.sort();
  for (const key of headerKeys) {
    if (key !== "signature") {
      const val = param[key];
      strHeader += `${key}=${val}`;
    }
  }

  str = strBody + strHeader;

  const sign = CryptoJS.HmacSHA256(str, appSecret);
  return sign;
};
