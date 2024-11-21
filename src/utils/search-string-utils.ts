import { ItemDocument } from "../foundry/entities/item-document";

export function createSearchHash(items: string[]) : number {
    const sorted = items.sort((a, b) => {
        return a.localeCompare(b);
    });

    return createHash(sorted.join(','));
}

function createHash(str: string): number {
    let hash = 0;

    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }

    return hash;
}