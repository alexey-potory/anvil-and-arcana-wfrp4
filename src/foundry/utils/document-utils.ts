import { ItemDocument } from "../entities/item-document";

export class DocumentUtils {
    static async updateItemCount(document: ItemDocument, count: number) {
        await document.update({ "system.quantity.value": count });
    }
}
