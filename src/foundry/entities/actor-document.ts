import { ItemDocument } from "./item-document";

export interface ActorDocument extends ItemDocument {
    items: ItemDocument[];
    setupSkill(skill: ItemDocument, options:any): Promise<any>;
    setupCharacteristic(characteristic: string, options: any): Promise<any>;
}

export class InternalActor {
    data: ActorDocument;

    constructor(data: ActorDocument) {
        this.data = data;
    }

    findSkill(name: string) : ItemDocument | undefined {
        return this.data.items.find(skill => skill.name === name);
    }
}