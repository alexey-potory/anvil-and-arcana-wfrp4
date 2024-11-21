type HookFunc = () => void;

export function onInitHook(func: HookFunc) {
    // @ts-ignore
    Hooks.on("init", func);
}

export function onReadyHook(func: HookFunc) {
    // @ts-ignore
    Hooks.once("ready", func);
}