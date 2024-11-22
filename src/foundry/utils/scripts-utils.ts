export interface ScriptData {
    label: string;
    script: string;
    trigger: string;
}

export default class ScriptsUtils {
    static create(label: string, trigger: string, script: string) : ScriptData {
        return {
            label: label,
            trigger: trigger,
            script: script
        }
    }
}