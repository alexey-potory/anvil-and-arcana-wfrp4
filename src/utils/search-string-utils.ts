import { ItemDocument } from "../foundry/entities/item-document";

export function createSearchString(items: ItemDocument[]) : string {
    const sorted = items.sort((a, b) => {
        const idA = a._id;
        const idB = b._id;
        return idA.localeCompare(idB);
    }).map(item => item._id);

    return sorted.join(',');
}

export function areSameSearchString(a:string, b: string) {
    if (a.length != b.length)
        return false;

    return a === b;
}