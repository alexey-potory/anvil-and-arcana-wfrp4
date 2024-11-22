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
import ActorUtils from "../../foundry/utils/actor-utils";
import ArrayUtils from "../../utils/array-utils";
import HashUtils from "../../utils/hash-utils";
import ChatUtils from "../../utils/chat-utils";
import DialogUtils from "../../utils/dialog-utils";
import RecipeDocument from "../../documents/recipe-document";

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

    async _onItemAdd(event: OnDropEvent) {
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

    async _onItemRemove(event: OnTargetedEvent) {
        const index = HtmlUtils.getAttributeEventData<number>(event, "index");

        const item = this.items[index];
        await ItemUtils.updateItemCount(item, item.system.quantity.value + 1);

        this.items.splice(index, 1);
        this.render(true);
    }

    async _onSubmit() {

        const gmPresent = UserUtils.isActiveGMPresent();
        const allowedWithoutGM = SettingsUtils.get<boolean>('allowCraftWithoutGM');

        if (!gmPresent && !allowedWithoutGM) {
            return NotificationUtils.warning('...')
        }

        const actor = await this._chooseActor();

        if (!actor) {
            return;
        }

        const recipe = await this._chooseRecipe();

        if (!recipe) {
            return;
        }

        const skill = ActorUtils.getSkill(actor, recipe.system.check.skill);
    }

    async _chooseRecipe() : Promise<RecipeDocument | null> {
        const ids = this.items.map(item => ItemUtils.findPrototypeByName(item)._id);

        const searchHash = HashUtils.createSearchHash(ids);

        const matchingRecipes = ItemUtils.findBySearchHash<RecipeDocument>(searchHash)
            .filter(recipe => ArrayUtils.araMatching(ids, recipe.system.components));

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

    async _chooseActor() : Promise<ActorDocument | null> {
        const actors = ActorUtils.getAvailableActors();

        if (!actors || actors.length === 0) {
            NotificationUtils.warning(LocalizationUtils.localize("ANVIL_AND_ARCANA.Errors.NoAvailableCharacter"))
            return null;
        }

        if (actors.length === 1) {
            return actors[0];
        }
        
        const choice = await DialogUtils.itemChooseDialog<ActorDocument>({
            title: LocalizationUtils.localize('ANVIL_AND_ARCANA.Dialogs.SelectActor.Header'),
            submitLabel: LocalizationUtils.localize('ANVIL_AND_ARCANA.Dialogs.SelectActor.Submit'),
            cancelLabel: LocalizationUtils.localize('ANVIL_AND_ARCANA.Dialogs.SelectActor.Cancel'),
            items: actors
        });

        if (!choice)
            return null;

        return choice;
    }

    render(force: boolean = false) {
        super.render(force);
    }
}