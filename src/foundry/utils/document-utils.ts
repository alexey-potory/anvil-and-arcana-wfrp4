export default class DocumentUtils {
    static updateSource(source: any, update: any) {
        source.updateSource(update);
    }

    static async getByUuid<T>(uuid: string) : Promise<T> {
        // @ts-ignore
        const item = await fromUuid(uuid);
        return item as T;
    }
}