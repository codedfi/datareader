const bcrypt = require("bcrypt");
const crypto = require('crypto');
var CryptoJS = require("crypto-js");
let SALT_WORK_FACTOR = 10;
const aeSecretKey = 'zxcvwefgadfcxve'

const createHash = (msg) => {
    const hash = crypto.createHash('md5');
    hash.update(msg);
    return hash.digest('hex')
}

const encryption = (msg) => {
    const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    const hash = bcrypt.hashSync(msg, salt);
    return hash
}

const checkHash = (msg, hash) => {
    return bcrypt.compareSync(msg, hash);
}

const encryptionAes = (msg) => {
   return CryptoJS.AES.encrypt(msg, aeSecretKey).toString();
}

const checkHashAes = (hash, result) => {
    var bytes  = CryptoJS.AES.decrypt(hash, aeSecretKey);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    if(originalText === result) {
        return true
    } else {
        return false 
    }
}



module.exports = {
    encryption,
    checkHash,
    createHash,
    encryptionAes,
    checkHashAes
}