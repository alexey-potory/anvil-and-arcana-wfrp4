import {modulePath} from "../../contracts";
import ActorDocument from "../../foundry/entities/actor-document";
import ItemDocument from "../../foundry/entities/item-document";
import {DropEventData} from "../../foundry/events/drop-event-data";
import {OnDropEvent} from "../../foundry/events/on-drop-event";
import {OnTargetedEvent} from "../../foundry/events/on-target-event";
import ObjectUtils from "../../foundry/utils/object-utils";
import HtmlUtils from "../../foundry/utils/html-utils";
import NotificationUtils from "../../foundry/utils/notification-utils";
import LocalizationUtils from "../../foundry/utils/localization-utils";
import DocumentUtils from "../../foundry/utils/document-utils";
import ItemUtils from "../../foundry/utils/item-utils";
import UserUtils from "../../foundry/utils/user-utils";
import SettingsUtils from "../../foundry/utils/settings-utils";
import ActorUtils, {Characteristics, CheckResult} from "../../foundry/utils/actor-utils";
import ChatUtils from "../../utils/chat-utils";
import DialogUtils from "../../utils/dialog-utils";
import RecipeDocument from "../../documents/recipe-document";
import RecipeUtils from "../../utils/recipe-utils";

// @ts-ignore
export class CraftApplication extends Application {

    items: ItemDocument[];

    constructor(options = {}) {
        super();
        this.items = [];
    }

    static get defaultOptions() {

        const templatePath =
            `${modulePath}/templates/applications/craft-application.hbs`;

        const startWidth = 400;
        const startHeight = 400;

        const settings = {
            title: undefined,
            template: templatePath,
            width: startWidth,
            height: startHeight,
            resizable: true,
            classes: [
                'craft-application'
            ]
        };

        return ObjectUtils.merge(super.defaultOptions, settings);
    }

    activateListeners(html: any) {
        super.activateListeners(html);

        // Drag and drop
        html.find('.craft-items-section').on('drop', this._onItemAdd.bind(this));

        // Buttons
        html.find(".item-remove").click(this._onItemRemove.bind(this));
        html.find("#submit").click(this._onSubmit.bind(this));
    }

    getData(options:any) {
        return {
            items: this.items
        };
    }

    render(force: boolean = false) {
        super.render(force);
    }

    private async _onItemAdd(event: OnDropEvent) {
        event.preventDefault();

        const data = HtmlUtils.getDropEventData<DropEventData>(event);

        if (data.type !== 'Item') {
            return NotificationUtils.warning(LocalizationUtils.localize('...'));
        }

        const item = await DocumentUtils.getByUuid<ItemDocument>(data.uuid);

        if (!item.parent) {
            // TODO: Commented for testing, uncomment on build
            // return NotificationUtils.warning(LocalizationUtils.localize('...'));
        }

        if (item.system.quantity?.value > 0) {
            await ItemUtils.updateItemCount(item, item.system.quantity.value - 1);
        } else {
            return NotificationUtils.warning(LocalizationUtils.localize('...'));
        }

        this.items.push(item);
        this.render(true);
    }

    private async _onItemRemove(event: OnTargetedEvent) {
        const index = HtmlUtils.getAttributeEventData<number>(event, "index");

        const item = this.items[index];
        await ItemUtils.updateItemCount(item, item.system.quantity.value + 1);

        this.items.splice(index, 1);
        this.render(true);
    }

    private async _onSubmit() {

        if (!this._checkIfAllowed())
            return;

        const actor = await ActorUtils.getActor();

        if (!actor)
            return;

        const recipe = await this._chooseRecipe();

        if (!recipe)
            return;

        const checkResult = await this._performCheck(actor, recipe);

        if (checkResult === undefined)
            return;

        let resultId: string;

        resultId = checkResult.succeeded ?
            recipe.system.results.success :
            recipe.system.results.fail;

        const item = ItemUtils.get<ItemDocument>(resultId);

        if (checkResult) {
            // TODO: Success
        } else {
            // TODO: Fail
            await ChatUtils.postCheckFailedMessage();
        }
    }

    private _checkIfAllowed() : boolean {

        const gmPresent = UserUtils.isActiveGMPresent();
        const allowedWithoutGM = SettingsUtils.get<boolean>('allowCraftWithoutGM');

        if (!gmPresent && !allowedWithoutGM) {
            NotificationUtils.warning('...')
            return false;
        }

        return true;
    }

    private async _chooseRecipe() : Promise<RecipeDocument | null> {

        const matchingRecipes = RecipeUtils.getByComponents(this.items);

        if (matchingRecipes.length === 0) {
            this.items = [];
            this.render();

            await ChatUtils.postBadRecipeMessage();
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

    private async _performCheck(actor: ActorDocument, recipe: RecipeDocument) : Promise<CheckResult | undefined> {
        return await ActorUtils.performInstantCheck(actor,{
            skill: LocalizationUtils.localize(recipe.system.check.skill),
            modifier: recipe.system.check.simple.modifier,
            fallbackStat: Characteristics.Dexterity
        });
    }
}