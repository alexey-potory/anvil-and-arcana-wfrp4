import ItemDocument from "./item-document";

export interface ActorTest {
    roll() : Promise<number>
    data: {
        result: {
            SL: string
        }
    }
    succeeded: boolean;
}

export default interface ActorDocument extends ItemDocument {
    items: ItemDocument[];
    setupSkill(skill: ItemDocument, options:any): Promise<ActorTest>;
    setupCharacteristic(characteristic: string, options: any): Promise<ActorTest>;
}