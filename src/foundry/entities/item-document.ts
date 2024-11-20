export interface ItemDocument {
    _id: string;
    name: string;
    system: {
        quantity: {
            value: number
        }
    };
    parent: any;
    update(value: any): Promise<ItemDocument>;
}