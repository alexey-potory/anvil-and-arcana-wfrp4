import ActorDocument from "../entities/actor-document";
import RecipeDocument from "../entities/item-document";

export interface InstantCheckOptions {
    actor: ActorDocument;
    skillName: string;
    fallbackStatId: string | undefined;
    modifier: number;
    recipe: RecipeDocument;
}

export async function performCheck(options: InstantCheckOptions) : Promise<boolean> {
    const skill = options.actor.items.find(skill => skill.name === options.skillName);

    if (skill !== undefined) {
        return await options.actor.setupSkill(skill, _instantRollArgs(options)).then(async test => {
            return await _performRoll(test);
        });
    } else {
        return await options.actor.setupCharacteristic('dex', _instantRollArgs(options)).then(async test => {
            return await _performRoll(test);
        });
    }
}

export function performExtendedCheck() : boolean {
    return false;
}

function _instantRollArgs(options: InstantCheckOptions) : any {
    //@ts-ignore
    return { fields: {modifier: options.recipe.system.check.simple.modifier } };
}

async function _performRoll(test: any) : Promise<boolean> {
    try {
        await test.roll();
    } catch (error: any) {
        if (error.message === "No Active GM present") {
            // ignore (handled manually)
        }
    }
    return test.succeeded;
}