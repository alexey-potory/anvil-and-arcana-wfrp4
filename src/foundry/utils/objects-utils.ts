export class ObjectsUtils {
    static merge(a: any, b: any) : any {
        // @ts-ignore
        return foundry.utils.mergeObject(a, b);
    }
}