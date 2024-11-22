import {modulePath} from "../../contracts";
import ItemDocument from "../../foundry/entities/item-document";
import {DropEventData} from "../../foundry/events/drop-event-data";
import {OnDropEvent} from "../../foundry/events/on-drop-event";
import {OnTargetedEvent} from "../../foundry/events/on-target-event";
import ObjectUtils from "../../foundry/utils/object-utils";
import HtmlUtils from "../../foundry/utils/html-utils";
import NotificationUtils from "../../foundry/utils/notification-utils";
import LocalizationUtils from "../../foundry/utils/localization-utils";
import ItemUtils from "../../foundry/utils/item-utils";
import ActorUtils from "../../foundry/utils/actor-utils";
import ChatUtils from "../../utils/chat-utils";
import {CheckType} from "../../documents/recipe-document";
import CraftService from "../../services/craft-service";

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

        const item = await ItemUtils.getByUuid<ItemDocument>(data.uuid);

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
        if (!CraftService.isCraftAllowed)
            return;

        const actor = await ActorUtils.getActor();

        if (!actor)
            return;

        const recipe = await CraftService._chooseRecipe(this.items);

        if (!recipe) {
            await ChatUtils.postBadRecipeMessage();
            this._clear();
            return;
        }

        if (recipe.system.check.type === CheckType.Simple) {
            const result = await CraftService._performInstantCheck(actor, recipe);

            if (!result) {
                return;
            }

            await CraftService._handleResult(actor, recipe, result);
        } else {

        }

        this._clear();
    }

    private _clear() {
        this.items = [];
        this.render();
    }
}