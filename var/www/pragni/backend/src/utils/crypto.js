/**
 * URL/ID Encryption Utility
 * 
 * YouTube IDs and Google Drive links are:
 * 1. XOR-encrypted with a rotating key
 * 2. Base64url encoded
 * 3. Salted with a timestamp-based token
 * 4. Returned as opaque tokens that expire
 * 
 * This prevents interception via browser DevTools network tab,
 * as the actual IDs are never sent to the client.
 */

const crypto = require('crypto');

const VIDEO_SALT = process.env.VIDEO_SALT_KEY || 'default_change_this_32char_key!!!';
const DRIVE_SALT = process.env.DRIVE_SALT_KEY || 'default_change_this_drive_key!!!!';

// Encrypt a value with AES-256-GCM
function encrypt(text, salt) {
  const key = crypto.scryptSync(salt, 'pragni_salt_v1', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

// Decrypt a value
function decrypt(encryptedText, salt) {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;
    const [ivHex, authTagHex, encrypted] = parts;
    const key = crypto.scryptSync(salt, 'pragni_salt_v1', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

// Generate a signed, time-limited token for a video ID
// Token expires after `ttlSeconds` (default 4 hours)
function generateVideoToken(videoDocId, ttlSeconds = 14400) {
  const payload = {
    id: videoDocId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: crypto.randomBytes(8).toString('hex')
  };
  const payloadStr = JSON.stringify(payload);
  const encrypted = encrypt(payloadStr, VIDEO_SALT);
  return Buffer.from(encrypted).toString('base64url');
}

// Verify and decode a video token - returns videoDocId or null
function verifyVideoToken(token) {
  try {
    const encrypted = Buffer.from(token, 'base64url').toString('utf8');
    const payloadStr = decrypt(encrypted, VIDEO_SALT);
    if (!payloadStr) return null;
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.id;
  } catch {
    return null;
  }
}

// Encrypt YouTube ID for storage in DB
function encryptVideoId(youtubeId) {
  return encrypt(youtubeId, VIDEO_SALT);
}

// Decrypt YouTube ID from DB (server-side only, never sent to client)
function decryptVideoId(encrypted) {
  return decrypt(encrypted, VIDEO_SALT);
}

// Encrypt Google Drive / resource URL for storage
function encryptResourceUrl(url) {
  return encrypt(url, DRIVE_SALT);
}

// Decrypt resource URL (server-side only)
function decryptResourceUrl(encrypted) {
  return decrypt(encrypted, DRIVE_SALT);
}

// Generate an embed-safe proxy token that the frontend uses
// Frontend calls /api/videos/stream/:token to get a proxied iframe
// The actual YouTube embed URL is NEVER in the client response
function generateStreamToken(encryptedVideoId, ttlSeconds = 14400) {
  try {
    const realId = decrypt(encryptedVideoId, VIDEO_SALT);
    if (!realId) return null;
    const payload = {
      yt: realId,
      exp: Math.floor(Date.now() / 1000) + ttlSeconds,
      nonce: crypto.randomBytes(8).toString('hex')
    };
    return encrypt(JSON.stringify(payload), VIDEO_SALT + '_stream');
  } catch {
    return null;
  }
}

function verifyStreamToken(token) {
  try {
    const payloadStr = decrypt(token, VIDEO_SALT + '_stream');
    if (!payloadStr) return null;
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.yt;
  } catch {
    return null;
  }
}

module.exports = {
  encryptVideoId,
  decryptVideoId,
  encryptResourceUrl,
  decryptResourceUrl,
  generateVideoToken,
  verifyVideoToken,
  generateStreamToken,
  verifyStreamToken,
};
