let info: Element;

export function update(message: string) {
    if (!info) info = window.document.querySelector("#info") || new Element();
    info.innerHTML = message.replace(/\n/g, "<br/>");
}
