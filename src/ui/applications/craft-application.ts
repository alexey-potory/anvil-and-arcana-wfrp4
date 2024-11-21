import { Contracts, modulePath } from "../../contracts";
import { ActorDocument, InternalActor } from "../../foundry/entities/actor-document";
import { ItemDocument, RecipeDocument } from "../../foundry/entities/item-document";
import { DropEventData } from "../../foundry/events/drop-event-data";
import { OnDropEvent } from "../../foundry/events/on-drop-event";
import { OnTargetedEvent } from "../../foundry/events/on-target-event";
import { findActorSkill, getAvailableActors } from "../../foundry/utils/actor-utils";
import { performCheck as performInstantCheck, performExtendedCheck } from "../../foundry/utils/check-utils";
import { getDocumentByUuid } from "../../foundry/utils/documents-utils";
import { getAttributeEventData, getDropEventData } from "../../foundry/utils/event-utils";
import { findBySearchHash, findItem, findItemPrototypeByName, updateItemCount } from "../../foundry/utils/items-utils";
import { localizeString } from "../../foundry/utils/localization-utils";
import { showWarning } from "../../foundry/utils/notifications-utils";
import { mergeObjects } from "../../foundry/utils/objects-utils";
import { settingValue } from "../../foundry/utils/settings-utils";
import { isActiveGMPresent } from "../../foundry/utils/users-utils";
import { areMatchingArrays } from "../../utils/array-utils";
import { postBadRecipeChatMessage, postChatMessage } from "../../utils/chat-utils";
import { itemChooseDialog } from "../../utils/dialog-utils";
import { createSearchHash } from "../../utils/search-hashes-utils";

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

        return mergeObjects(super.defaultOptions, settings);
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

        const data = getDropEventData<DropEventData>(event);

        if (data.type !== 'Item') {
            return showWarning(localizeString('...'));
        }

        const item = await getDocumentByUuid<ItemDocument>(data.uuid);

        if (!item.parent) {
            // TODO: Commented for testing, uncomment on build
            // return NotificationUtils.warning(LocalizationUtils.localize('...'));
        }

        if (item.system.quantity?.value > 0) {
            await updateItemCount(item, item.system.quantity.value - 1);
        } else {
            return showWarning(localizeString('...'));
        }

        this.items.push(item);
        this.render(true);
    }

    async _onItemRemove(event: OnTargetedEvent) {
        const index = getAttributeEventData<number>(event, "index");

        const item = this.items[index];
        await updateItemCount(item, item.system.quantity.value + 1);

        this.items.splice(index, 1);
        this.render(true);
    }

    async _onSubmit() {

        const gmPresent = isActiveGMPresent();
        const allowedWithoutGM = settingValue<boolean>('allowCraftWithoutGM');

        if (!gmPresent && !allowedWithoutGM) {
            return showWarning('...')
        }

        const actor = await this._chooseActor();

        if (!actor) {
            return;
        }
    
        const recipe = await this._chooseRecipe();

        if (!recipe) {
            return;
        }

        const skill = actor.findSkill(localizeString(recipe.system.check.skill));
    }

    async _chooseRecipe() : Promise<RecipeDocument | null> {
        const ids = this.items.map(item => findItemPrototypeByName(item)._id);

        const searchHash = createSearchHash(ids);
        const matchingRecipes = findBySearchHash<RecipeDocument>(searchHash).filter(recipe => areMatchingArrays(ids, recipe.system.components));

        if (matchingRecipes.length === 0) {
            this.items = [];
            this.render();

            await postBadRecipeChatMessage();
            return null;
        }

        if (matchingRecipes.length === 1) {
            return matchingRecipes[0];
        }

        const choice = await itemChooseDialog<RecipeDocument>({
            title: localizeString('ANVIL_AND_ARCANA.Dialogs.SelectRecipe.Header'),
            submitLabel: localizeString('ANVIL_AND_ARCANA.Dialogs.SelectRecipe.Submit'),
            cancelLabel: localizeString('ANVIL_AND_ARCANA.Dialogs.SelectRecipe.Cancel'),
            items: matchingRecipes
        });

        return choice;
    }

    async _chooseActor() : Promise<InternalActor | null> {
        const actors = getAvailableActors();

        if (!actors || actors.length === 0) {
            showWarning(localizeString("ANVIL_AND_ARCANA.Errors.NoAvailableCharacter"))
            return null;
        }

        if (actors.length === 1) {
            return new InternalActor(actors[0]);
        }
        
        const choice = await itemChooseDialog<ActorDocument>({
            title: localizeString('ANVIL_AND_ARCANA.Dialogs.SelectActor.Header'),
            submitLabel: localizeString('ANVIL_AND_ARCANA.Dialogs.SelectActor.Submit'),
            cancelLabel: localizeString('ANVIL_AND_ARCANA.Dialogs.SelectActor.Cancel'),
            items: actors
        });

        if (!choice)
            return null;

        return new InternalActor(choice);
    }

    render(force: boolean = false) {
        super.render(force);
    }
}