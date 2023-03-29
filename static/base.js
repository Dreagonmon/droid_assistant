
//  <div class="dialog hidden" id="dialog_alert">
//      <div class="dialog_outter">
//          <div class="dialog_inner">
//              <div class="w-full" style="background-color: var(--main-bg-color); color: var(--main-fg-color); border: var(--main-fg-color) 0.25rem solid;">
//                  <pre  class="w-full" style="padding: 1rem; overflow: auto;"></pre>
//                  <button class="w-full" style="border: none; border-radius: 0; background-color: var(--main-fg-color); color: var(--main-bg-color);">OK</button>
//              </div>
//          </div>
//      </div>
//  </div>
export const alertDialog = (message) => {
    let dialog = document.querySelector("#dialog_alert");
    if (!dialog) {
        // create dialog
        dialog = document.createElement("div");
        dialog.classList.add("dialog");
        dialog.classList.add("hidden");
        dialog.id = "dialog_alert";
        const innerDiv1 = document.createElement("div");
        innerDiv1.classList.add("dialog_outter");
        const innerDiv2 = document.createElement("div");
        innerDiv2.classList.add("dialog_inner");
        const innerDiv3 = document.createElement("div");
        innerDiv3.classList.add("w-full");
        innerDiv3.style.cssText = "background-color: var(--main-bg-color); color: var(--main-fg-color); border: var(--main-fg-color) 0.25rem solid;";
        const innerPre = document.createElement("pre");
        innerPre.classList.add("w-full");
        innerPre.style.cssText = "padding: 1rem; overflow: auto; font-family: sans-serif;";
        const innerButton = document.createElement("button");
        innerButton.classList.add("w-full");
        innerButton.style.cssText = "border: none; border-radius: 0; background-color: var(--main-fg-color); color: var(--main-bg-color);";
        innerButton.innerText = "OK";
        // insert dialog
        innerDiv3.append(innerPre);
        innerDiv3.append(innerButton);
        innerDiv2.append(innerDiv3);
        innerDiv1.append(innerDiv2);
        dialog.append(innerDiv1);
        document.body.append(dialog);
    }
    const pre = dialog.querySelector("pre");
    const button = dialog.querySelector("button");
    pre.innerText = message;
    if (button.onclick) button.onclick();
    return new Promise(resolve => {
        if (dialog.classList.contains("hidden")) dialog.classList.remove("hidden");
        button.onclick = () => {
            button.onclick = undefined;
            if (!dialog.classList.contains("hidden")) dialog.classList.add("hidden");
            resolve();
        };
    });
};

//  <div class="dialog hidden" id="dialog_loading">
//      <div class="dialog_outter">
//          <div class="dialog_inner">
//              <div style="padding: 1rem; background-color: var(--main-bg-color); color: var(--main-fg-color); border: var(--main-fg-color) 0.25rem solid;">Loading...</div>
//          </div>
//      </div>
//  </div>
export const showLoadingDialog = () => {
    let dialog = document.querySelector("#dialog_loading");
    if (!dialog) {
        // create dialog
        dialog = document.createElement("div");
        dialog.classList.add("dialog");
        dialog.classList.add("hidden");
        dialog.id = "dialog_loading";
        const innerDiv1 = document.createElement("div");
        innerDiv1.classList.add("dialog_outter");
        const innerDiv2 = document.createElement("div");
        innerDiv2.classList.add("dialog_inner");
        const innerDiv3 = document.createElement("div");
        innerDiv3.style.cssText = "padding: 1rem; background-color: var(--main-bg-color); color: var(--main-fg-color); border: var(--main-fg-color) 0.25rem solid;";
        innerDiv3.innerText = "Loading...";
        // insert dialog
        innerDiv2.append(innerDiv3);
        innerDiv1.append(innerDiv2);
        dialog.append(innerDiv1);
        document.body.append(dialog);
    }
    if (dialog.classList.contains("hidden")) dialog.classList.remove("hidden");
};
export const hideLoadingDialog = () => {
    const dialog = document.querySelector("#dialog_loading");
    if (dialog) {
        if (!dialog.classList.contains("hidden")) dialog.classList.add("hidden");
    }
};
export const withLoadingDialog = async (task) => {
    showLoadingDialog();
    try {
        const result = task();
        if (result instanceof Promise) {
            return await result;
        } else {
            return result;
        }
    } finally {
        hideLoadingDialog();
    }
};
