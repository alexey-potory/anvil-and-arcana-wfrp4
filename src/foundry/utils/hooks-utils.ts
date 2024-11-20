type HookFunc = () => void;

export class HooksUtils {
    static onInit(func: HookFunc) {
        // @ts-ignore
        Hooks.on("init", func);
    }

    static onReady(func: HookFunc) {
        // @ts-ignore
        Hooks.once("ready", func);
    }
}