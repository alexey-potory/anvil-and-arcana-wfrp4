import { modulePath } from "../../contracts";
import ItemDocument from "../../foundry/entities/item-document";
import { DropEventData } from "../../foundry/events/drop-event-data";
import { OnDropEvent } from "../../foundry/events/on-drop-event";
import HtmlUtils, { EventWithDataTarget } from "../../foundry/utils/html-utils";
import SkillUtils from "../../utils/skill-utils";
import LocalizationUtils from "../../foundry/utils/localization-utils";
import ItemUtils from "../../foundry/utils/item-utils";
import NotificationUtils from "../../foundry/utils/notification-utils";
import DocumentUtils from "../../foundry/utils/document-utils";
import HashUtils from "../../utils/hash-utils";
import RecipeDocument from "../../documents/recipe-document";

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

    private _getRecipeCheck(data: any) : CraftRecipeCheck {
        return {
            selectedType: data.system.check.type,
            selectedSkill: data.system.check.skill,
            skills: SkillUtils.getModuleSkillsDef(),
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

    private _getRecipeComponents(data: any) : ItemDocument[] {
        const components: string[] = data.system.components;
        return components?.map(id => ItemUtils.get<ItemDocument>(id));
    }

    private _getRecipeResults(data: any) : CraftRecipeResults {
        const successId = data.system.results?.success;
        const failId = data.system.results?.fail;

        return {
            success: ItemUtils.find(item => item._id === successId),
            fail: ItemUtils.find(item => item._id === failId)
        }
    }

    private async _onSuccessDrop(event: OnDropEvent) {
        event.preventDefault();

        const item = await this._getDropItem(event);

        if (!item) {
            return;
        }

        await this._updateResult(ResultType.Success, item._id);
    }

    private async _onFailDrop(event: OnDropEvent) {
        event.preventDefault();

        const item = await this._getDropItem(event);

        if (!item) {
            return;
        }

        await this._updateResult(ResultType.Fail, item._id);
    }

    private async _onComponentsDrop(event: OnDropEvent) {

        if (!this.currentData) {
            throw Error(LocalizationUtils.localize('...'));
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

    private async _onSuccessResultRemove() {
        await this._updateResult(ResultType.Success, '');
    }

    private async _onFailResultRemove() {
        await this._updateResult(ResultType.Fail, '');
    }

    private async _onComponentRemove(event: EventWithDataTarget) {

        if (!this.currentData) {
            throw Error(LocalizationUtils.localize('...'));
        }

        const index = Number(HtmlUtils.getDataAttribute(event, 'index'));
        const components = this.currentData.system.components || [];

        components.splice(index, 1);
        await this._updateComponents(components);
    }

    private async _getDropItem(event: OnDropEvent) : Promise<ItemDocument | undefined> {
        const data = HtmlUtils.getDropEventData<DropEventData>(event);

        if (data.type !== 'Item') {
            NotificationUtils.warning(LocalizationUtils.localize('...'));
            return;
        }

        return await DocumentUtils.getByUuid<ItemDocument>(data.uuid);
    }

    private async _updateResult(type: ResultType, value: string) {
        if (!this.currentData) {
            throw Error(LocalizationUtils.localize('...'));
        }

        await ItemUtils.updateItem(this.currentData, `system.results.${type}`, value);
    }

    private async _updateComponents(components: string[]) {
        if (!this.currentData) {
            throw Error(LocalizationUtils.localize('...'));
        }

        const searchHash = HashUtils.createSearchHash(components);

        const update = {
            searchHash,
            components
        };
        
        await ItemUtils.updateItem(this.currentData, "system", update);
    }
}