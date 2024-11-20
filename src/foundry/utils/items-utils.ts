import { ItemDocument } from "../entities/item-document";

type FindPredicate = (item: ItemDocument) => boolean;

export class ItemsUtils {
    static async updateCount(document: ItemDocument, count: number) {
        await document.update({ "system.quantity.value": count });
    }

    static find<T>(func: FindPredicate) : T {
        // @ts-ignore
        return game.items.find(func);
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
