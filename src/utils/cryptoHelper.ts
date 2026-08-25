import CryptoJS from "crypto-js";

/**
 * Encrypt plain text with a secret key.
 * @param text - Text to encrypt
 * @param secret - Secret key
 * @returns Encrypted string (Base64)
 */
export const encryptData = (text: string, secret: string): string => {
  return CryptoJS.AES.encrypt(text, secret).toString();
};

/**
 * Decrypt AES encrypted text with a secret key.
 * @param ciphertext - Encrypted text (Base64)
 * @param secret - Secret key
 * @returns Decrypted plain text
 */
export const decryptData = (ciphertext: string, secret: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
};
