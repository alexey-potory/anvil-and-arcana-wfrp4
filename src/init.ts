import { Contracts, moduleName, modulePath, ModuleRoot} from "./contracts";
import { registerCustomType } from "./foundry/utils/custom-type-utils";
import { onInitHook, onReadyHook } from "./foundry/utils/hooks-utils";
import { localizeString } from "./foundry/utils/localization-utils";
import { registerSetting } from "./foundry/utils/settings-utils";
import { loadHandlebarsTemplates } from "./foundry/utils/template-utils";
import { CraftRecipeModel } from "./models/craft-recipe-model";
import { CraftApplication} from "./ui/applications/craft-application";
import { CraftRecipeSheet } from "./ui/sheets/craft-recipe-sheet";

onInitHook(() => {

    // Loading custom item types

    registerCustomType(
        `${moduleName}.recipe`,
        CraftRecipeModel,
        CraftRecipeSheet
    );

    // Loading common templates

    const templatePaths = [

        // Shared
        `${modulePath}/templates/_shared/items-list.hbs`,

        // Recipe sheet
        `${modulePath}/templates/sheets/recipe/craft-recipe-sheet.hbs`,
        `${modulePath}/templates/sheets/recipe/craft-recipe-content.hbs`,
        `${modulePath}/templates/sheets/recipe/craft-recipe-header.hbs`,

        // Dialogs
        `${modulePath}/templates/dialogs/item-select.hbs`,
    ];

    loadHandlebarsTemplates(templatePaths);

    registerSetting('allowCraftWithoutGM', 
    {
        name: localizeString('ANVIL_AND_ARCANA.Settings.AllowCraftWithoutGM.Name'),
        hint: localizeString('ANVIL_AND_ARCANA.Settings.AllowCraftWithoutGM.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        requiresReload: true,
        default: false
    });
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