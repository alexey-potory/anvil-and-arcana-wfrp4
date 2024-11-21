import { Contracts, modulePath } from "../../contracts";
import { ItemDocument, RecipeDocument } from "../../foundry/entities/item-document";
import { DropEventData } from "../../foundry/events/drop-event-data";
import { OnDropEvent } from "../../foundry/events/on-drop-event";
import { getDocumentByUuid } from "../../foundry/utils/documents-utils";
import { getDropEventData } from "../../foundry/utils/event-utils";
import { EventWithDataTarget, getDataAttribute } from "../../foundry/utils/html-utils";
import { findItem, getItem, updateItem } from "../../foundry/utils/items-utils";
import { localizeString } from "../../foundry/utils/localization-utils";
import { showWarning } from "../../foundry/utils/notifications-utils";
import { createSearchHash } from "../../utils/search-hashes-utils";
import { getModuleSkills } from "../../utils/skills-utils";

enum ResultType {
    Fail = 'fail',
    Success = 'success'
}

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

    currentData: RecipeDocument | undefined;

    constructor(item:any, options:any) {
        super(item, options);
    
        //@ts-ignore
        this.options.classes.push('craft-recipe-sheet');
    }

    get template() {
        return `${modulePath}/templates/sheets/recipe/craft-recipe-sheet.hbs`;
    }

    activateListeners(html: any) {
        super.activateListeners(html);

        html.find('#success-result').on('drop', this._onSuccessDrop.bind(this));
        html.find("#success-result-remove").click(this._onSuccessResultRemove.bind(this));

        html.find('#fail-result').on('drop', this._onFailDrop.bind(this));
        html.find("#fail-result-remove").click(this._onFailResultRemove.bind(this));

        html.find('#components-list').on('drop', this._onComponentsDrop.bind(this));
        html.find(".item-remove").click(this._onComponentRemove.bind(this));
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

        const item = await this._getDropItem(event);

        if (!item) {
            return;
        }

        await this._updateResult(ResultType.Success, item._id);
    }

    async _onFailDrop(event: OnDropEvent) {
        event.preventDefault();

        const item = await this._getDropItem(event);

        if (!item) {
            return;
        }

        await this._updateResult(ResultType.Fail, item._id);
    }

    async _onComponentsDrop(event: OnDropEvent) {

        if (!this.currentData) {
            throw Error(localizeString('...'));
        }

        event.preventDefault();

        const item = await this._getDropItem(event);

        if (!item) {
            return;
        }

        const components = this.currentData.system.components || [];
        components.push(item._id);

        await this._updateComponents(components);
    }

    async _onSuccessResultRemove() {
        await this._updateResult(ResultType.Success, '');
    }

    async _onFailResultRemove() {
        await this._updateResult(ResultType.Fail, '');
    }

    async _onComponentRemove(event: EventWithDataTarget) {

        if (!this.currentData) {
            throw Error(localizeString('...'));
        }

        const index = Number(getDataAttribute(event, 'index'));
        const components = this.currentData.system.components || [];

        components.splice(index, 1);
        await this._updateComponents(components);
    }

    async _getDropItem(event: OnDropEvent) : Promise<ItemDocument | undefined> {
        const data = getDropEventData<DropEventData>(event);

        if (data.type !== 'Item') {
            showWarning(localizeString('...'));
            return;
        }

        return await getDocumentByUuid<ItemDocument>(data.uuid);
    }

    async _updateResult(type: ResultType, value: string) {
        if (!this.currentData) {
            throw Error(localizeString('...'));
        }

        await updateItem(this.currentData, `system.results.${type}`, value);
    }

    async _updateComponents(components: string[]) {
        if (!this.currentData) {
            throw Error(localizeString('...'));
        }

        const searchHash = createSearchHash(components);

        const update = {
            searchHash,
            components
        };
        
        await updateItem(this.currentData, "system", update);
    }
}