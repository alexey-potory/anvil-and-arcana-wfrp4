import { Contracts, ModuleRoot} from "./contracts";
import { registerCustomType } from "./foundry/utils/custom-type-utils";
import { onInitHook, onReadyHook } from "./foundry/utils/hooks-utils";
import { loadHandlebarsTemplates } from "./foundry/utils/template-utils";
import { CraftRecipeModel } from "./models/craft-recipe-model";
import { CraftApplication} from "./ui/applications/craft-application";
import { CraftRecipeSheet } from "./ui/sheets/craft-recipe-sheet";

onInitHook(() => {

    // Loading custom item types

    registerCustomType(
        `${Contracts.moduleName}.recipe`,
        CraftRecipeModel,
        CraftRecipeSheet
    );

    // Loading common templates

    const templatePaths = [

        // Shared
        `${Contracts.modulePath}/templates/_shared/items-list.hbs`,

        // Recipe sheet
        `${Contracts.modulePath}/templates/sheets/recipe/craft-recipe-sheet.hbs`,
        `${Contracts.modulePath}/templates/sheets/recipe/craft-recipe-content.hbs`,
        `${Contracts.modulePath}/templates/sheets/recipe/craft-recipe-header.hbs`,
        
    ];

    loadHandlebarsTemplates(templatePaths);
});

onReadyHook(() => {

    // @ts-ignore
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        //@ts-ignore
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    const root: ModuleRoot = new ModuleRoot({
        crafting: new CraftApplication(),
    });

    Contracts.root = root;
    root.applications.crafting?.render(true);
});