export default class ObjectUtils {
    static merge(a: any, b: any) : any {
        // @ts-ignore
        return foundry.utils.mergeObject(a, b);
    }
}