import ActorDocument from "../foundry/entities/actor-document";
import RecipeDocument, {CheckType} from "../documents/recipe-document";
import ActorUtils, {Characteristics, CheckError, CheckResult} from "../foundry/utils/actor-utils";
import LocalizationUtils from "../foundry/utils/localization-utils";
import ItemUtils from "../foundry/utils/item-utils";
import ItemDocument, {ItemTypes} from "../foundry/entities/item-document";
import ChatUtils from "../utils/chat-utils";
import UserUtils from "../foundry/utils/user-utils";
import SettingsUtils from "../foundry/utils/settings-utils";
import NotificationUtils from "../foundry/utils/notification-utils";
import RecipeUtils from "../utils/recipe-utils";
import DialogUtils from "../utils/dialog-utils";
import SkillDocument from "../foundry/entities/skill-document";
import EffectUtils from "../foundry/utils/effect-utils";
import ScriptsUtils, {ScriptData} from "../foundry/utils/scripts-utils";
import {ExtendedCheckDocument} from "../foundry/entities/extended-check-document";

export enum CraftStatus {
    Success,
    Fail,
    NoRelatedSkill,
    Extended
}

export default class CraftService {

    static get defaultFallback() {
        return Characteristics.Dexterity;
    }

    static get isCraftAllowed() : boolean {

        const gmPresent = UserUtils.isActiveGMPresent();
        const allowedWithoutGM = SettingsUtils.get<boolean>('allowCraftWithoutGM');

        if (!gmPresent && !allowedWithoutGM) {
            NotificationUtils.warning('...')
            return false;
        }

        return true;
    }

    static async craftFrom(components: ItemDocument[]) : Promise<CraftStatus> {
        if (!CraftService.isCraftAllowed)
            return CraftStatus.NoRelatedSkill;

        const actor = await ActorUtils.getActor();

        if (!actor)
            return CraftStatus.NoRelatedSkill;

        const recipe = await CraftService._chooseRecipe(components);

        if (!recipe) {
            await ChatUtils.postBadRecipeMessage();
            return CraftStatus.Fail;
        }

        if (!ActorUtils.hasSkill(actor, recipe.system.check.skill) &&
            !SettingsUtils.get<boolean>('allowFallbackToCharacteristic')) {
            await ChatUtils.postNoRelatedSkillMessage();
            return CraftStatus.NoRelatedSkill;
        }

        if (recipe.system.check.type === CheckType.Extended) {
            const check = await CraftService._performExtendedCheck(actor, recipe);
            await ChatUtils.postExtendedCheckMessage();
            return CraftStatus.Extended;
        }

        const result = await CraftService._performInstantCheck(actor, recipe);

        if (result === undefined) {
            throw new Error('Unexpected error: Unable to perform the crafting check. Please verify the recipe and actor data.');
        }

        await CraftService._handleResult(actor, recipe, result);

        return result.succeeded ?
            CraftStatus.Success :
            CraftStatus.Fail;
    }

    static async handleExtendedRollCallback(effect: ItemDocument, recipeUuid: string, args: any) {
        const check = effect?.parent as ExtendedCheckDocument;
        const uuid: string = args?.test?.data?.preData?.options?.extended;

        if (!uuid || check?.uuid != uuid) {
            return;
        }

        const result: number = Number(args?.test?.data.result.SL);

        if (result + check.system.SL.current < check.system.SL.target) {
            return;
        }

        const actor = check.parent as ActorDocument;
        const recipe = await ItemUtils.getByUuid<RecipeDocument>(recipeUuid);

        const item = await ItemUtils.getByUuid<ItemDocument>(recipe.system.results.successUuid);

        setTimeout(() => {
            CraftService._handleSuccess(actor, item);
        }, 500);

        await ItemUtils.updateItem(effect, 'system.scriptData', null);
    }

    static async handleExtendedDeleteCallback(effect: ItemDocument, recipeUuid: string) {
        const check = effect?.parent as ExtendedCheckDocument;
        const actor = check.parent as ActorDocument;
        const recipe = await ItemUtils.getByUuid<RecipeDocument>(recipeUuid);

        const item = await ItemUtils.getByUuid<ItemDocument>(recipe.system.results.failUuid);
        await CraftService._handleFail(actor, item);
    }

    private static async _chooseRecipe(components: ItemDocument[]) : Promise<RecipeDocument | null> {

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

    private static async _performInstantCheck(actor: ActorDocument, recipe: RecipeDocument) : Promise<CheckResult> {
        return await ActorUtils.performInstantCheck(actor,{
            skill: LocalizationUtils.localize(recipe.system.check.skill),
            modifier: recipe.system.check.simple.modifier,
            fallbackStat: CraftService.defaultFallback
        });
    }

    private static async _performExtendedCheck(actor: ActorDocument, recipe: RecipeDocument) : Promise<ExtendedCheckDocument> {

        const checkDocument = await ActorUtils.createExtendedCheck(actor, {
            name: LocalizationUtils.localize('ANVIL_AND_ARCANA.ExtendedCheck.Label'),
            skill: recipe.system.check.skill,
            sl: recipe.system.check.extended.sl,
            difficulty: recipe.system.check.extended.difficulty,
            fallbackStat: CraftService.defaultFallback
        });

        const rollScriptContent = `await game.anvilAndArcana.triggers.onExtendedRoll(this.effect, '${recipe.uuid}', args);`
        const deleteScriptContent = `await game.anvilAndArcana.triggers.onExtendedDelete(this.effect, '${recipe.uuid}');this.script.trigger = '';`

        const effect = await EffectUtils.createEffect(checkDocument, checkDocument.name, [
            ScriptsUtils.create('crafting-script-roll', 'rollTest', rollScriptContent),
            ScriptsUtils.create('crafting-script-delete', 'deleteEffect', deleteScriptContent)
        ]);

        return checkDocument;
    }

    private static async _handleResult(actor: ActorDocument, recipe: RecipeDocument, checkResult: CheckResult) {
        const resultId = checkResult.succeeded ?
            recipe.system.results.successUuid :
            recipe.system.results.failUuid;

        const item = await ItemUtils.getByUuid<ItemDocument>(resultId);

        if (checkResult.succeeded) {
            await CraftService._handleSuccess(actor, item);
        } else {
            await CraftService._handleFail(actor, item);
        }
    }

    private static async _handleSuccess(actor: ActorDocument, itemPrototype: ItemDocument | undefined) {
        const resultUuid = await CraftService._handleItemCreation(actor, itemPrototype);
        await ChatUtils.postSuccessMessage(resultUuid);
    }

    private static async _handleFail(actor: ActorDocument, itemPrototype: ItemDocument | undefined) {
        const resultUuid = await CraftService._handleItemCreation(actor, itemPrototype);
        await ChatUtils.postFailMessage(resultUuid);
    }

    private static async _handleItemCreation(actor: ActorDocument, itemPrototype: ItemDocument | undefined) {
        if (!itemPrototype) {
            return undefined;
        }

        const item = await ActorUtils.findOrCreateItem(actor, itemPrototype);
        await ItemUtils.updateItemCount(item, item.system.quantity.value + 1);
        return item.uuid;
    }
}