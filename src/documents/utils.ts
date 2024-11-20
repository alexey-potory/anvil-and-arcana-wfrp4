export async function getItemByUuid<T>(uuid: string) : Promise<T> {
    const item = await fromUuid(uuid);
    return item as T;
}