export interface ItemDocumentSystem {
    quantity: {
        value: number
    }
}

export default interface ItemDocument {
    _id: string;
    name: string;
    system: ItemDocumentSystem;
    parent: any;
    update(value: any): Promise<ItemDocument>;
}