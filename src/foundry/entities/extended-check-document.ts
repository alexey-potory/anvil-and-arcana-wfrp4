import ItemDocument, {ItemDocumentSystem} from "./item-document";

export interface ExtendedCheckDocument extends ItemDocument {
    system: ItemDocumentSystem & {
        SL: {
            target: number,
            current: number
        },
        test: {
            value: string
        },
        difficulty: {
            value: string
        },
        negativePossible?: {
            value: boolean
        },
        failingDecreases?: {
            value: boolean
        },
        completion?: {
            value: string
        },
        hide?: {
            test: boolean
            progress: boolean
        }
    }
}