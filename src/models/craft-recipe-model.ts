import { recipeIconPath } from "../contracts";
import SchemaUtils from "../foundry/utils/schema-utils";
import DocumentUtils from "../foundry/utils/document-utils";
import SkillUtils from "../utils/skill-utils";

interface CraftRecipeData {
    img: string;
    system: any;
}

// @ts-ignore
export class CraftRecipeModel extends BaseItemModel {

    static defineSchema() {
        const schema = super.defineSchema();
        const fields$F = SchemaUtils.schemaFields();

        schema.components = new fields$F.ArrayField(new fields$F.StringField());
        schema.searchHash = new fields$F.NumberField();
        schema.results = new fields$F.SchemaField({
            success: new fields$F.StringField(),
            fail: new fields$F.StringField()
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

        DocumentUtils.updateSource(
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
        DocumentUtils.updateSource(
            //@ts-ignore
            this.parent, {img : path}
        );
    }
}