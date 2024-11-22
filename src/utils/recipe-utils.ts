import ItemDocument from "../foundry/entities/item-document";
import ItemUtils from "../foundry/utils/item-utils";
import HashUtils from "./hash-utils";
import RecipeDocument from "../documents/recipe-document";
import ArrayUtils from "./array-utils";

export default class RecipeUtils {
    static getByComponents(components: ItemDocument[]) {
        const ids = components.map(item => ItemUtils.findPrototypeByName(item).uuid);

        const searchHash = HashUtils.createSearchHash(ids);

        return ItemUtils.findBySearchHash<RecipeDocument>(searchHash)
            .filter(recipe => ArrayUtils.areMatching(ids, recipe.system.componentsUuids));
    }
}