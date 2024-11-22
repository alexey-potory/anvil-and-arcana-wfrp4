type HookFunc = () => void;

export default class HookUtils {
    static onInit(func: HookFunc) {
        // @ts-ignore
        Hooks.on("init", func);
    }

    static onReady(func: HookFunc) {
        // @ts-ignore
        Hooks.once("ready", func);
    }
}