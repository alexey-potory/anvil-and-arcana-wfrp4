export interface ItemDocument {
    name: string;
    system: {
        quantity: {
            value: number
        }
    };
    parent: any;
    update(value: any): Promise<ItemDocument>;
}