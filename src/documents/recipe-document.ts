import ItemDocument, {ItemDocumentSystem} from "../foundry/entities/item-document";

export default interface RecipeDocument extends ItemDocument {
    system: ItemDocumentSystem & {
        componentsUuids: string[]
        check: {
            skill: string;
            type: 'Simple' | 'Extended'
            simple: {
                modifier: number
            }
            extended: {
                difficulty: string;
                sl: string;
            }
        },
        results: {
            successUuid: string
            failUuid: string
        }
    };
}