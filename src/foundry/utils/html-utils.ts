export interface EventWithDataTarget extends Event {
    target : EventTarget & {
        dataset : DOMStringMap;
    }
}

export function getDataAttribute(ev: EventWithDataTarget, property: string) : string | undefined {
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