import { Contracts } from "../../contracts";

// @ts-ignore
export class CraftRecipeSheet extends ItemSheetWfrp4e {
    get template() {
        return `${Contracts.modulePath}/templates/sheets/craft-recipe-sheet.hbs`;
    }

    async getData(options: any) {
        return await super.getData();
    }
}