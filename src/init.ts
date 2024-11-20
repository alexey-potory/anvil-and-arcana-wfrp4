import {Contracts, ModuleRoot} from "./contracts";
import {CraftingApplication} from "./windows/crafting-application";

Hooks.on("init", () => {
    const templatePaths = [
        `${Contracts.modulePath}/templates/_shared/items-list.hbs`
    ];

    loadTemplates(templatePaths);
});

Hooks.once('ready', () => {
    const root: ModuleRoot = new ModuleRoot({
        crafting: new CraftingApplication(),
    });

    Contracts.root = root;
    root.applications.crafting?.render(true);
});