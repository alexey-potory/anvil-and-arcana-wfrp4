import {CraftApplication} from "./ui/applications/craft-application";


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

    static get moduleName() {
        return "anvil-and-arcana-wfrp4";
    }

    static get modulePath() {
        return `modules/${this.moduleName}`;
    }
}