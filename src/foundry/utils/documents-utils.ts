export function updateDocumentSource(source: any, update: any) {
    source.updateSource(update);
}

export async function getDocumentByUuid<T>(uuid: string) : Promise<T> {
    // @ts-ignore
    const item = await fromUuid(uuid);
    return item as T;
}