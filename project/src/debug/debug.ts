let info: Element;

// update the debug info in the bottom right of the screen
export function update(message: string) {
    if (!info) info = window.document.querySelector("#info") || new Element();
    info.innerHTML = message.replace(/\n/g, "<br/>");
}
