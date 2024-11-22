export interface ItemDocumentSystem {
    quantity: {
        value: number
    }
}

export class ItemTypes {

    public value: string;

    constructor(value: string) {
        this.value = value;
    }

    static Skill = new ItemTypes('skill');
    static Cargo = new ItemTypes('cargo');
    static Trapping = new ItemTypes('trapping');

    static fromItem(item: ItemDocument): ItemTypes {
        if (!item || !item.type) {
            throw new Error("Invalid item document");
        }

        if (item.type instanceof ItemTypes) {
            return item.type;
        }

        switch (item.type) {
            case ItemTypes.Skill.value:
                return ItemTypes.Skill;
            case ItemTypes.Cargo.value:
                return ItemTypes.Cargo;
            case ItemTypes.Trapping.value:
                return ItemTypes.Trapping;
            default:
                return new ItemTypes(item.type);
        }
    }

    equals(other: ItemTypes | string): boolean {
        if (other instanceof ItemTypes) {
            return this.value === other.value;
        }
        return this.value === other;
    }
}

export default interface ItemDocument {
    uuid: string;
    _id: string;
    name: string;
    type: string | ItemTypes;
    system: ItemDocumentSystem;
    parent: any;
    update(value: any): Promise<ItemDocument>;
}