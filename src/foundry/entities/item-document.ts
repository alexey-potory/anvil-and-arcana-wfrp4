export interface ItemDocumentSystem {
    quantity: {
        value: number
    }
}

export interface ItemDocument {
    _id: string;
    name: string;
    system: ItemDocumentSystem;
    parent: any;
    update(value: any): Promise<ItemDocument>;
}

export interface RecipeDocument extends ItemDocument {
    system: ItemDocumentSystem & {
        components: string[]
        check: {
            skill: string;
            type: 'Simple' | 'Extended'
            simple: {
                modifier: number
            }
        }
    };
}