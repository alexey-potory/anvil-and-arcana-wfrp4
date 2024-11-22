import ActorDocument from "../foundry/entities/actor-document";
import RecipeDocument from "../documents/recipe-document";
import ActorUtils, {Characteristics, CheckResult} from "../foundry/utils/actor-utils";
import LocalizationUtils from "../foundry/utils/localization-utils";
import ItemUtils from "../foundry/utils/item-utils";
import ItemDocument from "../foundry/entities/item-document";
import ChatUtils from "../utils/chat-utils";
import UserUtils from "../foundry/utils/user-utils";
import SettingsUtils from "../foundry/utils/settings-utils";
import NotificationUtils from "../foundry/utils/notification-utils";
import RecipeUtils from "../utils/recipe-utils";
import DialogUtils from "../utils/dialog-utils";

export default class CraftService {
    static get isCraftAllowed() : boolean {

        const gmPresent = UserUtils.isActiveGMPresent();
        const allowedWithoutGM = SettingsUtils.get<boolean>('allowCraftWithoutGM');

        if (!gmPresent && !allowedWithoutGM) {
            NotificationUtils.warning('...')
            return false;
        }

        return true;
    }

    static async _chooseRecipe(components: ItemDocument[]) : Promise<RecipeDocument | null> {

        const matchingRecipes = RecipeUtils.getByComponents(components);

        if (matchingRecipes.length === 0) {
            return null;
        }

        if (matchingRecipes.length === 1) {
            return matchingRecipes[0];
        }

        return await DialogUtils.itemChooseDialog<RecipeDocument>({
            title: LocalizationUtils.localize('ANVIL_AND_ARCANA.Dialogs.SelectRecipe.Header'),
            submitLabel: LocalizationUtils.localize('ANVIL_AND_ARCANA.Dialogs.SelectRecipe.Submit'),
            cancelLabel: LocalizationUtils.localize('ANVIL_AND_ARCANA.Dialogs.SelectRecipe.Cancel'),
            items: matchingRecipes
        });
    }

    static async _performInstantCheck(actor: ActorDocument, recipe: RecipeDocument) : Promise<CheckResult | undefined> {

        return await ActorUtils.performInstantCheck(actor,{
            skill: LocalizationUtils.localize(recipe.system.check.skill),
            modifier: recipe.system.check.simple.modifier,
            fallbackStat: Characteristics.Dexterity
        });
    }

    static async _performExtendedCheck() {

    }

    static async _handleResult(actor: ActorDocument, recipe: RecipeDocument, checkResult: CheckResult) {
        const resultId = checkResult.succeeded ?
            recipe.system.results.successUuid :
            recipe.system.results.failUuid;

        const item = await ItemUtils.getByUuid<ItemDocument>(resultId);

        if (checkResult.succeeded) {
            await this._handleSuccess(actor, item);
        } else {
            await this._handleFail(actor, item);
        }
    }

    static async _handleSuccess(actor: ActorDocument, itemPrototype: ItemDocument | undefined) {
        const resultUuid = await this._handleItemCreation(actor, itemPrototype);
        await ChatUtils.postSuccessMessage(resultUuid);
    }

    static async _handleFail(actor: ActorDocument, itemPrototype: ItemDocument | undefined) {
        const resultUuid = await this._handleItemCreation(actor, itemPrototype);
        await ChatUtils.postFailMessage(resultUuid);
    }

    static async _handleItemCreation(actor: ActorDocument, itemPrototype: ItemDocument | undefined) {
        if (!itemPrototype) {
            return undefined;
        }

        const item = await ActorUtils.findOrCreateItem(actor, itemPrototype);
        await ItemUtils.updateItemCount(item, item.system.quantity.value + 1);
        return item.uuid;
    }
}