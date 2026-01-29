const { encrypt, decrypt } = require('./Source/Back/utils/crypto');

const secret = '123';
const encrypted = encrypt(secret);
console.log('Encrypted:', encrypted);
console.log('Contains colon:', encrypted.includes(':'));

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', secret === decrypted);

// Test malformed
try {
    const malformed = "7f44ca1b74039ad59d976a7564777deb3da0b05d62c29ba5d67c03f9afc2e643";
    const res = decrypt(malformed);
    console.log('Malformed result:', res);
} catch (e) {
    console.log('Malformed threw error:', e.message);
}
