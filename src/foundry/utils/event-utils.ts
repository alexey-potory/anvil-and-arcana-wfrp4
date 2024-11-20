import { OnDropEvent } from "../events/on-drop-event";
import { OnTargetedEvent } from "../events/on-target-event";


export class EventUtils {
    static getDropData<T>(event: OnDropEvent): T {
        return JSON.parse(event.originalEvent.dataTransfer!.getData('text/plain')) as T;
    }

    static getAttributeData<T>(ev: OnTargetedEvent, propName: string): T {
        let value = ev.target.dataset[propName];

        if (!value) {
            // @ts-ignore
            const parent = $(ev.target).parents(`[data-${propName}]`);
            if (parent) {
                value = parent[0]?.dataset[propName] as T;
            }
        }

        return value as T;
    }
}
