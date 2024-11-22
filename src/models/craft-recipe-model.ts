import { recipeIconPath } from "../contracts";
import SchemaUtils from "../foundry/utils/schema-utils";
import SkillUtils from "../utils/skill-utils";
import ItemUtils from "../foundry/utils/item-utils";

interface CraftRecipeData {
    img: string;
    system: any;
}

// @ts-ignore
export class CraftRecipeModel extends BaseItemModel {

    static defineSchema() {
        const schema = super.defineSchema();
        const fields$F = SchemaUtils.schemaFields();

        schema.componentsUuids = new fields$F.ArrayField(new fields$F.StringField());
        schema.searchHash = new fields$F.NumberField();
        schema.results = new fields$F.SchemaField({
            successUuid: new fields$F.StringField(),
            failUuid: new fields$F.StringField()
        });

        schema.check = new fields$F.SchemaField({
            type: new fields$F.StringField(),
            skill: new fields$F.StringField(),
            simple: new fields$F.SchemaField({
                modifier: new fields$F.NumberField()
            }),
            extended: new fields$F.SchemaField({
                sl: new fields$F.NumberField(),
                difficulty: new fields$F.StringField(),
            }),
        });

        return schema;
    }

    get isPhysical() { 
        return false;
    }

    get tags() {
        return super.tags.add("cargo");
    }

    async _preCreate(data: CraftRecipeData, options: any, user: any)
    {
        await super._preCreate(data, options, user);

        if (!data.system) {
            this._initializeSystem();
        }

        if (!data.img || data.img == "icons/svg/item-bag.svg") {
            this._updateImage(recipeIconPath);
        }
    }

    _initializeSystem() {
        const skills = SkillUtils.getModuleSkillsDef();
        const skillKey = Object.keys(skills)[0];

        ItemUtils.update(
            //@ts-ignore
            this.parent, {
                system: {
                    check:
                        {
                            type: "Simple",
                            skill: skillKey,
                            simple: {
                                modifier: 0
                            },
                            extended: {
                                sl: 1,
                                difficulty: "challenging"
                            }
                        }
                }
            }
        );
    }
    
    _updateImage(path: string) {
        ItemUtils.update(
            //@ts-ignore
            this.parent, {img : path}
        );
    }
}