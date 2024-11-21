import { ItemDocument } from "../entities/item-document";

type FindPredicate = (item: ItemDocument) => boolean;

export async function updateItemCount(document: ItemDocument, count: number) {
    await document.update({ "system.quantity.value": count });
}

export async function updateItem(document: ItemDocument, key: string, value: any) {
    await document.update({ [key]: value })
}

export function findItem<T>(func: FindPredicate) : T {
    // @ts-ignore
    return game.items.find(func);
}

export function findBySearchHash<T>(hash: number) : T[] {
    // @ts-ignore
    return game.items.filter(item => item.system.searchHash === hash);
}

export function getItem<T>(id: string) : T {
    // @ts-ignore
    return game.items.get(id);
}

export function findItemPrototypeByName<T>(sourceItem: T) : T {
    // @ts-ignore
    return game.items.find(item => item.name === sourceItem.name);
}

export function filterItems<T>(func: FindPredicate) : T[] {
    // @ts-ignore
    return game.items.filter(func);
}