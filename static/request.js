import SHA256 from "./libs/sha256.js";
import { globalData } from "./global.js";

const CHARS = "0123456789QWERTYUIOPASDFGHJKLZXCVBNM";

const randomString = (length) => {
    var result = "";
    for (var i = length; i > 0; --i) result += CHARS[ Math.floor(Math.random() * CHARS.length) ];
    return result;
};

/**
 * sign a content with key
 * @param {string} key 
 * @param {string} content 
 * @returns {string}
 */
const sign = (key, content) => {
    const encoder = new TextEncoder();
    const sha256 = new SHA256("SHA-256", "UINT8ARRAY", {
        hmacKey: { value: encoder.encode(key), format: "UINT8ARRAY" },
    });
    sha256.update(encoder.encode(content));
    return sha256.getHMAC("HEX").toUpperCase();
};

export const request = async (url, contentObject) => {
    const key = globalData.authKey;
    const rand = randomString(32);
    const content = JSON.stringify(contentObject);
    const header = {
        "Content-Type": "application/json",
        "Rand": rand,
        "Auth": sign(key, rand + content),
    };
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: header,
            body: content,
        });
        if (resp.status == 200) {
            return await resp.json();
        } else if (resp.status == 404) {
            return { code: 404, msg: "Passcode Error." };
        } else {
            return { code: resp.status, msg: await resp.text() };
        }
    } catch (err) {
        console.error("Network Error:");
        console.error(err);
    }
    return { code: 503, msg: "Service Unavailable" };
};
