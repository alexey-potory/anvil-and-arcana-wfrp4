import ActorDocument, {ActorTest} from "../entities/actor-document";
import SkillDocument from "../entities/skill-document";
import NotificationUtils from "./notification-utils";

export interface CheckResult {
    succeed: boolean;
    SL: number;
}

export interface InstantCheckOptions {
    skill: string;
    fallbackStat?: Characteristics | undefined;
    modifier: number;
}

export enum Characteristics {
    WeaponSkill = 'ws',
    BallisticSkill = 'bs',
    Strength = 's',
    Toughness = 't',
    Initiative = 'i',
    Agility = 'ag',
    Dexterity = 'dex',
    Intelligence = 'int',
    Willpower = 'wp',
    Fellowship = 'fel'
}

export default class ActorUtils {
    static getAvailableActors() : ActorDocument[] {
        // @ts-ignore
        return game.user.isGM ? game.actors : [game.user.character];
    }

    static getSkill(actor: ActorDocument, skillName: string) : SkillDocument | undefined {
        return actor.items.find(skill => skill.name === skillName) as SkillDocument;
    }

    static async performInstantCheck(actor: ActorDocument, options: InstantCheckOptions) : Promise<CheckResult | undefined> {

        const skill = this.getSkill(actor, options.skill);

        if (!skill && !options.fallbackStat) {
            NotificationUtils.warning('This character cannot perform the check. Please ensure they have the required skill.');
            return;
        }

        const args = { fields: { modifier: options.modifier } };

        if (skill) {
            return await actor.setupSkill(skill, args).then(async actorTest => {
                return await this._performRoll(actorTest);
            });
        }

        if (options.fallbackStat) {
            return await actor.setupCharacteristic(options.fallbackStat, args).then(async actorTest => {
                return await this._performRoll(actorTest);
            });
        }

        throw Error('Unexpected error: Instant check could not be performed due to missing skill or fallback stat.');
    }

    private static async _performRoll(test: ActorTest) : Promise<CheckResult | undefined> {
        try {
            await test.roll();
        } catch (error: any) {
            if (error.message === "No Active GM present") {
                // ignore (handled manually)
            }
        }

        const sl = Number(test.data.result.SL);
        return {
            SL: sl,
            succeed: test.succeed
        }
    }
}