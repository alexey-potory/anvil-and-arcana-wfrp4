export default class ObjectUtils {
    static mergeObjects(a: any, b: any) : any {
        // @ts-ignore
        return foundry.utils.mergeObject(a, b);
    }
}