import { request } from "./request.js";
import { setData } from "./global.js";

/**
 * @param {DataTransferItem} dt 
 * @returns {Promise<string>}
 */
const data_as_string = (dt) => {
    return new Promise((resolve) => {
        dt.getAsString((data) => resolve(data));
    });
}

/**
 * @param {DataTransferItem} dt 
 */
const data_as_bytes = (dt) => {
    const file = dt.getAsFile();
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.addEventListener("load", () => {
            const res = reader.result;
            resolve(new Uint8Array(res));
        });
        reader.readAsArrayBuffer(file);
    });
}

window.addEventListener("load", async () => {
    setData("authKey", location.hash.substring(1));
    console.log("1234");
    const req = await request("/hello", {});
    console.log(await req.text());
    document.addEventListener("paste", async (event) => {
        const items = event.clipboardData.items;
        if (items && items.length) {
            for (var i = 0; i < items.length; i++) {
                const item = items[i];
                console.log(item);
                if (item.type === "text/plain") {
                    const text = await data_as_string(item);
                    console.log("Text:", text);
                } else if (item.type.startsWith("image")) {
                    const data = await data_as_bytes(item);
                    console.log("Image:", data);
                }
            }
        }
    });
});
