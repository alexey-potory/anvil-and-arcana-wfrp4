import {CraftApplication} from "./ui/applications/craft-application";

export const moduleName = "anvil-and-arcana-wfrp4";
export const modulePath = `modules/${moduleName}`

export const recipeIconPath = `${modulePath}/art/icons/craft-recipe-icon.png`

export interface ModuleApplications {
    crafting?: CraftApplication;
}

export class ModuleRoot {
    applications: ModuleApplications;

    constructor(applications: ModuleApplications) {
        this.applications = applications;
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