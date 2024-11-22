export default class DocumentUtils {
    static updateDocumentSource(source: any, update: any) {
        source.updateSource(update);
    }

    static async getDocumentByUuid<T>(uuid: string) : Promise<T> {
        // @ts-ignore
        const item = await fromUuid(uuid);
        return item as T;
    }
}