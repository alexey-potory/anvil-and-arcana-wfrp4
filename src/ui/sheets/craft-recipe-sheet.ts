import { Contracts } from "../../contracts";
import { ItemDocument } from "../../foundry/entities/item-document";
import { DropEventData } from "../../foundry/events/drop-event-data";
import { OnDropEvent } from "../../foundry/events/on-drop-event";
import { getDocumentByUuid } from "../../foundry/utils/documents-utils";
import { getDropEventData } from "../../foundry/utils/event-utils";
import { findItem, getItem } from "../../foundry/utils/items-utils";
import { localizeString } from "../../foundry/utils/localization-utils";
import { showWarning } from "../../foundry/utils/notifications-utils";
import { getModuleSkills } from "../../utils/skills-utils";

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

    constructor(item:any, options:any) {
        super(item, options);
    
        //@ts-ignore
        this.options.classes.push('craft-recipe-sheet');
    }

    get template() {
        return `${Contracts.modulePath}/templates/sheets/recipe/craft-recipe-sheet.hbs`;
    }

    activateListeners(html: any) {
        super.activateListeners(html);

        html.find('#success-result').on('drop', this._onSuccessDrop.bind(this));
        html.find('#fail-result').on('drop', () => console.log('Fail drop'));

        // html.find('#ingredients-list').on('drop', this._onIngredientAdd.bind(this));
        // html.find(".ingredient-delete").click(this._onIngredientDelete.bind(this));

        // html.find("#success-result-delete").click(this._onSuccessResultDelete.bind(this));
        // html.find("#fail-result-delete").click(this._onFailResultDelete.bind(this));
    }

    async getData(options: any) {

        const data = await super.getData();
        
        this.currentData = data.document;

        const components = this._getRecipeComponents(data);
        const results =  this._getRecipeResults(data);
        const check = this._getRecipeCheck(data);

        data.check = check;
        data.results = results;
        data.components = components;

        return data;
    }

    _getRecipeCheck(data: any) : CraftRecipeCheck {
        return {
            selectedType: data.system.check.type,
            selectedSkill: data.system.check.skill,
            skills: getModuleSkills(),
            checkTypes: {
                Simple: localizeString("ANVIL_AND_ARCANA.Check.Type.Simple"),
                Extended: localizeString("ANVIL_AND_ARCANA.Check.Type.Extended")
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
        return components?.map(id => getItem<ItemDocument>(id));
    }

    _getRecipeResults(data: any) : CraftRecipeResults {
        const successId = data.system.results?.success;
        const failId = data.system.results?.fail;

        return {
            success: findItem(item => item._id === successId),
            fail: findItem(item => item._id === failId)
        }
    }

    async _onSuccessDrop(event: OnDropEvent) {
        event.preventDefault();

        const data = getDropEventData<DropEventData>(event);

        if (data.type !== 'Item') {
            return showWarning(localizeString('...'));
        }

        const item = await getDocumentByUuid<ItemDocument>(data.uuid);
    }
}