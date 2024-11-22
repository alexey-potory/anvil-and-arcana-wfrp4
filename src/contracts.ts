import {CraftApplication} from "./ui/applications/craft-application";
import {ExtendedCheckDocument} from "./foundry/entities/extended-check-document";

export const moduleName = "anvil-and-arcana-wfrp4";
export const modulePath = `modules/${moduleName}`

export const recipeIconPath = `${modulePath}/art/icons/craft-recipe-icon.png`

export interface ModuleApplications {
    crafting: CraftApplication;
}

export interface ModuleTriggers {
    onExtendedRoll: (check: ExtendedCheckDocument, uuid: string, args: any) => Promise<void>;
    onExtendedDelete: (check: ExtendedCheckDocument, uuid: string) => Promise<void>;
}

export class ModuleRoot {
    applications: ModuleApplications;
    triggers: ModuleTriggers;

    constructor(applications: ModuleApplications, triggers: {
        onExtendedRoll: (check: ExtendedCheckDocument, recipeUuid: string, args: any) => Promise<void>;
        onExtendedDelete: (check: ExtendedCheckDocument, recipeUuid: string) => Promise<void>
    }) {
        this.applications = applications;
        this.triggers = triggers;
    }
}

export class Contracts {
    static get root() : ModuleRoot {
        // @ts-ignore
        return game.anvilAndArcana;
    }

    static set root(root: ModuleRoot) {
        // @ts-ignore
        game.anvilAndArcana = root;
    }
}