import { Contracts, moduleName, modulePath, ModuleRoot} from "./contracts";
import { CraftRecipeModel } from "./models/craft-recipe-model";
import { CraftApplication} from "./ui/applications/craft-application";
import { CraftRecipeSheet } from "./ui/sheets/craft-recipe-sheet";
import HookUtils from "./foundry/utils/hook-utils";
import CustomTypeUtils from "./foundry/utils/custom-type-utils";
import HandlebarsUtils from "./foundry/utils/template-utils";
import SettingsUtils from "./foundry/utils/settings-utils";
import LocalizationUtils from "./foundry/utils/localization-utils";

HookUtils.onInit(() => {

    // Loading custom item types

    CustomTypeUtils.register(
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

    HandlebarsUtils.loadTemplates(templatePaths);

    SettingsUtils.register('allowCraftWithoutGM',
    {
        name: LocalizationUtils.localize('ANVIL_AND_ARCANA.Settings.AllowCraftWithoutGM.Name'),
        hint: LocalizationUtils.localize('ANVIL_AND_ARCANA.Settings.AllowCraftWithoutGM.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        requiresReload: true,
        default: false
    });
});

HookUtils.onReady(() => {

    HandlebarsUtils.register('ifEquals', function(arg1:any, arg2:any, options:any) {
        //@ts-ignore
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    const root: ModuleRoot = new ModuleRoot({
        crafting: new CraftApplication(),
    });

    Contracts.root = root;
    root.applications.crafting?.render(true);
});