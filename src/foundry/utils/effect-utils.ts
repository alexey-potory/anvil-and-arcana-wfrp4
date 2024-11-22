import ItemDocument from "../entities/item-document";
import {recipeIconPath} from "../../contracts";
import {ScriptData} from "./scripts-utils";

export default class EffectUtils {
    static async createEffect(item: ItemDocument, name: string, scripts: ScriptData[]) {
        let effectData = {
            name: name,
            img: recipeIconPath,
            system: {
                scriptData: scripts
            }
        };

        const documents =
            await item.createEmbeddedDocuments("ActiveEffect", [effectData]) as ItemDocument[];

        return documents[0];
    }
}