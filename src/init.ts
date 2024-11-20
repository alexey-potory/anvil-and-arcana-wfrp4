import { Contracts, ModuleRoot} from "./contracts";
import { CustomTypeUtils } from "./foundry/utils/custom-type-utils";
import { HooksUtils } from "./foundry/utils/hooks-utils";
import { TemplateUtils } from "./foundry/utils/template-utils";
import { CraftRecipeModel } from "./models/craft-recipe-model";
import { CraftApplication} from "./ui/applications/craft-application";
import { CraftRecipeSheet } from "./ui/sheets/craft-recipe-sheet";

HooksUtils.onInit(() => {

    // Loading custom item types

    CustomTypeUtils.register(
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
        `${Contracts.modulePath}/templates/sheets/recipe/craft-recipe-header.hbs`,
        
    ];

    TemplateUtils.load(templatePaths);
});

HooksUtils.onReady(() => {
    const root: ModuleRoot = new ModuleRoot({
        crafting: new CraftApplication(),
    });

    Contracts.root = root;
    root.applications.crafting?.render(true);
});