import ItemDocument, {ItemDocumentSystem} from "../foundry/entities/item-document";

export default interface RecipeDocument extends ItemDocument {
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