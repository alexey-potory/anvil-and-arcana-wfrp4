import ItemDocument, {ItemDocumentSystem} from "../foundry/entities/item-document";

export enum CheckType {
    Simple = 'Simple',
    Extended = 'Extended'
}

export default interface RecipeDocument extends ItemDocument {
    system: ItemDocumentSystem & {
        componentsUuids: string[]
        check: {
            skill: string;
            type: CheckType
            simple: {
                modifier: number
            }
            extended: {
                difficulty: string;
                sl: number;
            }
        },
        results: {
            successUuid: string
            failUuid: string
        }
    };
}