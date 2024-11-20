import { Contracts } from "../../contracts";
import { ItemDocument } from "../../foundry/entities/item-document";
import { ItemsUtils } from "../../foundry/utils/items-utils";
import { LocalizationUtils } from "../../foundry/utils/localization-utils";
import { SkillsUtils } from "../../utils/skills-utils";

interface CraftRecipeResults {
    success: string;
    fail: string;
}

interface CraftRecipeCheck {
    selectedType: string;
    selectedSkill: string;
    skills: {
        [key: string]: string;
    };
    checkTypes: {
        [key: string]: string;
    };
    extended: {
        selectedDifficulty: string;
        allDifficulties: {
            [key: string]: string;
        }
    };
}

// @ts-ignore
export class CraftRecipeSheet extends ItemSheetWfrp4e {

    currentData: ItemDocument | undefined;

    get template() {
        return `${Contracts.modulePath}/templates/sheets/recipe/craft-recipe-sheet.hbs`;
    }

    async getData(options: any) {

        const data = await super.getData();
        
        this.currentData = data.document;

        const components = this._getRecipeComponents(data);
        const results =  this._getRecipeResults(data);
        const check = this._getRecipeCheck(data);

        data.check = check;
        data.results = results;

        data.components = {
            label: LocalizationUtils.localize("WFRP4E.TrappingType.Cargo"),
            items: components,
            show: true,
            dataType: "cargo"
        };

        return data;
    }

    _getRecipeCheck(data: any) : CraftRecipeCheck {
        return {
            selectedType: data.system.check.type,
            selectedSkill: data.system.check.skill,
            skills: SkillsUtils.all(),
            checkTypes: {
                Simple: LocalizationUtils.localize("ANVIL_AND_ARCANA.Check.Type.Simple"),
                Extended: LocalizationUtils.localize("ANVIL_AND_ARCANA.Check.Type.Extended")
            },
            extended: {
                selectedDifficulty: data.system.check.extended.difficulty,
                // @ts-ignore
                allDifficulties: game.wfrp4e.config.difficultyLabels
            }
        }
    }

    _getRecipeComponents(data: any) : ItemDocument[] {
        const components: string[] = data.system.components;
        return components?.map(id => ItemsUtils.get<ItemDocument>(id));
    }

    _getRecipeResults(data: any) : CraftRecipeResults {
        const successId = data.system.results?.success;
        const failId = data.system.results?.fail;

        return {
            success: ItemsUtils.find(item => item._id === successId),
            fail: ItemsUtils.find(item => item._id === failId)
        }
    }
}