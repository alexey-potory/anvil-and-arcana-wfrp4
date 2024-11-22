import ItemDocument from "../entities/item-document";

export default class ObjectUtils {
    static merge(a: any, b: any) : any {
        // @ts-ignore
        return foundry.utils.mergeObject(a, b);
    }

    static castToObject(a: any): any {
        // @ts-ignore
        return a.toObject();
    }
}