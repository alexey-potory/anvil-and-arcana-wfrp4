import { Contracts } from "../../contracts";
import { ItemDocument } from "../../foundry/entities/item-document";
import { DropEventData } from "../../foundry/events/drop-event-data";
import { OnDropEvent } from "../../foundry/events/on-drop-event";
import { OnTargetedEvent } from "../../foundry/events/on-target-event";
import { getDocumentByUuid } from "../../foundry/utils/documents-utils";
import { getAttributeEventData, getDropEventData } from "../../foundry/utils/event-utils";
import { findItemPrototypeByName, updateItemCount } from "../../foundry/utils/items-utils";
import { localizeString } from "../../foundry/utils/localization-utils";
import { showWarning } from "../../foundry/utils/notifications-utils";
import { mergeObjects } from "../../foundry/utils/objects-utils";
import { createSearchString } from "../../utils/search-string-utils";

// @ts-ignore
export class CraftApplication extends Application {

    items: ItemDocument[];

    constructor(options = {}) {
        super();
        this.items = [];
    }

    static get defaultOptions() {

        const templatePath =
            `${Contracts.modulePath}/templates/applications/craft-application.hbs`;

        const startWidth = 400;
        const startHeight = 400;

        const settings = {
            title: "Ступка и пестик",
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
        html.find(".item-delete").click(this._onItemRemove.bind(this));
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
        const items = this.items.map(item => findItemPrototypeByName(item));
        const searchString = createSearchString(items);

        // TODO: Recipe search and apply
    }

    render(force: boolean = false) {
        super.render(force);
    }
}