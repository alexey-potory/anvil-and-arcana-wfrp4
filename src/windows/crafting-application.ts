import { Contracts } from "../contracts";
import { OnTargetedEvent } from "../foundry/events/on-target-event";
import { getItemByUuid} from "../documents/utils";
import { ItemDocument } from "../foundry/entities/item-document";
import { EventUtils } from "../foundry/utils/event-utils";
import { OnDropEvent } from "../foundry/events/on-drop-event";
import { NotificationUtils } from "../foundry/utils/notifications-utils";
import { DocumentUtils } from "../foundry/utils/document-utils";
import { LocalizationUtils } from "../foundry/utils/localization-utils";
import { ObjectsUtils } from "../foundry/utils/objects-utils";

interface DropEventData {
    uuid: string;
    type: 'Item' | 'Actor'
}

interface GameItem extends ItemDocument { }

// @ts-ignore
export class CraftingApplication extends Application {

    items: GameItem[];

    constructor(options = {}) {
        super();
        this.items = [];
    }

    static get defaultOptions() {

        const templatePath =
            `${Contracts.modulePath}/templates/applications/crafting-application.hbs`;

        const startWidth = 400;
        const startHeight = 400;

        const settings = {
            title: "Ступка и пестик",
            template: templatePath,
            width: startWidth,
            height: startHeight,
            resizable: true,
            classes: [
                'crafting-application'
            ]
        };

        return ObjectsUtils.merge(super.defaultOptions, settings);
    }

    activateListeners(html: any) {
        super.activateListeners(html);

        // Drag and drop
        html.find('.items-section').on('drop', this._onItemAdd.bind(this));

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

        const data = EventUtils.getDropData<DropEventData>(event);

        if (data.type !== 'Item') {
            return NotificationUtils.warning(LocalizationUtils.localize('...'));
        }

        const item = await getItemByUuid<GameItem>(data.uuid);

        if (!item.parent) {
            // TODO: Commented for testing, uncomment on build
            // return NotificationUtils.warning(LocalizationUtils.localize('...'));
        }

        if (item.system.quantity.value > 0) {
            await DocumentUtils.updateItemCount(item, item.system.quantity.value - 1);
        } else {
            return NotificationUtils.warning(LocalizationUtils.localize('...'));
        }

        this.items.push(item);
        this.render(true);
    }

    async _onItemRemove(event: OnTargetedEvent) {
        const index = EventUtils.getAttributeData<number>(event, "index");

        const item = this.items[index];
        await DocumentUtils.updateItemCount(item, item.system.quantity.value + 1);

        this.items.splice(index, 1);
        this.render(true);
    }

    async _onSubmit() {
        // TODO: Finish submit function
        console.log("On Submit");
    }

    render(force: boolean = false) {
        super.render(force);
    }
}