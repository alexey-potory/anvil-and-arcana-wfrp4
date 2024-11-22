import ItemDocument from "./item-document";

export default interface ActorDocument extends ItemDocument {
    items: ItemDocument[];
    setupSkill(skill: ItemDocument, options:any): Promise<any>;
    setupCharacteristic(characteristic: string, options: any): Promise<any>;
}