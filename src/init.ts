import { Contracts, ModuleRoot} from "./contracts";
import { HooksUtils } from "./foundry/utils/hooks-utils";
import { TemplateUtils } from "./foundry/utils/template-utils";
import { CraftingApplication} from "./windows/crafting-application";

HooksUtils.onInit(() => {
    const templatePaths = [
        `${Contracts.modulePath}/templates/_shared/items-list.hbs`
    ];

    TemplateUtils.load(templatePaths);
});

HooksUtils.onReady(() => {
    const root: ModuleRoot = new ModuleRoot({
        crafting: new CraftingApplication(),
    });

    Contracts.root = root;
    root.applications.crafting?.render(true);
});