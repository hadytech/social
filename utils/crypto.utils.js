const crypto = require("crypto");

const encrypt = (text) => {
    if (!text) throw new Error("Text to encrypt is required");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(process.env.CRYPTO_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
        iv: iv.toString("hex"),
        encryptedData: encrypted.toString("hex"),
    };
};

const decrypt = (encryptedText) => {
    if (!encryptedText) throw new Error("Text to decrypt is required");
    const iv = Buffer.from(encryptedText.iv, "hex");
    const encryptedData = Buffer.from(encryptedText.encryptedData, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(process.env.CRYPTO_KEY), iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

module.exports = { encrypt, decrypt };
