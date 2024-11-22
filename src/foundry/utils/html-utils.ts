import {OnDropEvent} from "../events/on-drop-event";
import {OnTargetedEvent} from "../events/on-target-event";

export interface EventWithDataTarget extends Event {
    target : EventTarget & {
        dataset : DOMStringMap;
    }
}

export default class HtmlUtils {
    static getDropEventData<T>(event: OnDropEvent): T {
        return JSON.parse(event.originalEvent.dataTransfer!.getData('text/plain')) as T;
    }

    static getAttributeEventData<T>(ev: OnTargetedEvent, propName: string): T {
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

    static getDataAttribute(ev: EventWithDataTarget, property: string) : string | undefined {
        let value = ev.target?.dataset[property];

        if (!value) {
            // @ts-ignore
            const parent = $(ev.target).parents(`[data-${property}]`);
            if (parent) {
                value = parent[0]?.dataset[property];
            }
        }

        return value;
    }
}