import CryptoJS from 'crypto-js';

export const sha256 = (message) => CryptoJS.SHA256(message).toString();

export const encrypt = (message, secretKey) => {
  const encryptedMessage = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(secretKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
  return encryptedMessage;
};

export const decrypt = (encryptedMessage, secretKey) => {
  const decryptedMessage = CryptoJS.AES.decrypt(encryptedMessage, CryptoJS.enc.Utf8.parse(secretKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);
  return decryptedMessage;
}
