import { moduleName } from "../../contracts";

export interface SettingConfig {
    name: string;
    hint: string;
    scope: "world" | "client";
    config: boolean;
    type?: NumberConstructor | StringConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor;
    default: any;
    onChange?: (value: any) => void;
    requiresReload?: boolean;
    choices?: Record<number | string, string>;
    range?: {
      min: number;
      max: number;
      step?: number;
    };
    filePicker?: "audio" | "image" | "video" | "imagevideo" | "folder" | "font";
  }
  
export default class SettingsUtils {
    static registerSetting(settingName: string, options: SettingConfig) {
        //@ts-ignore
        game.settings.register(moduleName, settingName, options);
    }

    static get<T>(settingName: string) : T {
        //@ts-ignore
        const settings:any = game.settings;

        return settings.get(moduleName, settingName)
    }
}