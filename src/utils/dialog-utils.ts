import { modulePath } from "../contracts";
import ItemDocument from "../foundry/entities/item-document";

export interface ChooseDialogueOptions<T> {
    title: string;
    submitLabel: string;
    cancelLabel: string;
    items: ItemDocument[]
}

export default class DialogUtils {
    static async itemChooseDialog<T>(options: ChooseDialogueOptions<T>): Promise<T | null> {

        return new Promise(async (resolve) => {
            //@ts-ignore
            const content = await renderTemplate(`${modulePath}/templates/dialogs/item-select.hbs`, { items: options.items });

            //@ts-ignore
            new Dialog({
                title: options.title,
                content,
                buttons: {
                    ok: {
                        label: options.submitLabel,
                        //@ts-ignore
                        callback: (html) => {
                            const itemId = html.find("#item-select").val();
                            resolve(options.items.find(item => item.uuid === itemId) as T);
                        }
                    },
                    cancel: {
                        label: options.cancelLabel,
                        callback: () => resolve(null)
                    }
                },
                default: "ok"
            }).render(true);
        });
    }
}