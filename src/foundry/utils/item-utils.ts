import { ItemDocument } from "../entities/item-document";

type FindPredicate = (item: ItemDocument) => boolean;

export default class ItemUtils {
    static async updateItemCount(document: ItemDocument, count: number) {
        await document.update({ "system.quantity.value": count });
    }

    static async updateItem(document: ItemDocument, key: string, value: any) {
        await document.update({ [key]: value })
    }

    static find<T>(func: FindPredicate) : T {
        // @ts-ignore
        return game.items.find(func);
    }

    static findBySearchHash<T>(hash: number) : T[] {
        // @ts-ignore
        return game.items.filter(item => item.system.searchHash === hash);
    }

    static getItem<T>(id: string) : T {
        // @ts-ignore
        return game.items.get(id);
    }

    static findPrototypeByName<T>(sourceItem: T) : T {
        // @ts-ignore
        return game.items.find(item => item.name === sourceItem.name);
    }

    static filter<T>(func: FindPredicate) : T[] {
        // @ts-ignore
        return game.items.filter(func);
    }
}