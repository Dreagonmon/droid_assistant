import { request } from "./request.js";
import { setData } from "./global.js";
import { withLoadingDialog, alertDialog } from "./base.js";

/**
 * @param {DataTransferItem} dt 
 * @returns {Promise<string>}
 */
const dataAsString = (dt) => {
    return new Promise((resolve) => {
        dt.getAsString((data) => resolve(data));
    });
};

/**
 * @param {DataTransferItem} dt 
 * @returns {Promise<Uint8Array>}
 */
const dataAsBytes = (dt) => {
    const file = dt.getAsFile();
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.addEventListener("load", () => {
            const res = reader.result;
            resolve(new Uint8Array(res));
        });
        reader.readAsArrayBuffer(file);
    });
};

/**
 * @param {Uint8Array} data 
 * @returns {string}
 */
const base64Encode = (data) => {
    const arr = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
        arr[ i ] = String.fromCodePoint(data[ i ]);
    }
    const dataString = arr.join("");
    return btoa(dataString);
};

const clearPasteArea = () => {
    const elem = document.querySelector("#pastebin");
    elem.innerHTML = "";
    elem.value = "";
};

const pasteText = async (text) => {
    let hasError = false;
    let msg = "";
    await withLoadingDialog(async () => {
        const resp = await request("/api/paste_text", { text });
        if (resp.code !== 200) {
            hasError = true;
            msg = resp.msg;
        }
    });
    if (hasError) {
        await alertDialog(msg);
    }
    clearPasteArea();
};

const pasteImage = async (type, data) => {
    let hasError = false;
    let msg = "";
    await withLoadingDialog(async () => {
        const resp = await request("/api/paste_image", {
            type,
            data: base64Encode(data),
        });
        if (resp.code !== 200) {
            hasError = true;
            msg = resp.msg;
        }
    });
    if (hasError) {
        await alertDialog(msg);
    }
    clearPasteArea();
};

window.addEventListener("load", async () => {
    setData("authKey", location.hash.substring(1));
    document.addEventListener("paste", async (event) => {
        const items = event.clipboardData.items;
        if (items && items.length) {
            for (var i = 0; i < items.length; i++) {
                const item = items[ i ];
                console.log(item);
                if (item.type === "text/plain") {
                    const text = await dataAsString(item);
                    await pasteText(text);
                } else if (item.type.startsWith("image")) {
                    const data = await dataAsBytes(item);
                    await pasteImage(item.type, data);
                }
            }
        }
    });
});
