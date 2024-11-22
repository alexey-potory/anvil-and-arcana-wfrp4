import { ItemDocument } from "./item-document";

export interface ActorDocument extends ItemDocument {
    items: ItemDocument[];
    setupSkill(skill: ItemDocument, options:any): Promise<any>;
    setupCharacteristic(characteristic: string, options: any): Promise<any>;
}