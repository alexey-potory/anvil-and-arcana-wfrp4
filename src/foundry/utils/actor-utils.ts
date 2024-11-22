import ActorDocument, {ActorTest} from "../entities/actor-document";
import SkillDocument from "../entities/skill-document";
import NotificationUtils from "./notification-utils";
import LocalizationUtils from "./localization-utils";
import DialogUtils from "../../utils/dialog-utils";
import ItemDocument, {ItemTypes} from "../entities/item-document";
import ObjectUtils from "./object-utils";
import ItemUtils from "./item-utils";

export interface CheckResult {
    succeeded: boolean;
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
    static async getActor() : Promise<ActorDocument | null> {
        const actors = ActorUtils.getAvailableActors();

        if (!actors || actors.length === 0) {
            NotificationUtils.warning(LocalizationUtils.localize("ANVIL_AND_ARCANA.Errors.NoAvailableCharacter"))
            return null;
        }

        if (actors.length === 1) {
            return actors[0];
        }

        const choice = await DialogUtils.itemChooseDialog<ActorDocument>({
            title: LocalizationUtils.localize('ANVIL_AND_ARCANA.Dialogs.SelectActor.Header'),
            submitLabel: LocalizationUtils.localize('ANVIL_AND_ARCANA.Dialogs.SelectActor.Submit'),
            cancelLabel: LocalizationUtils.localize('ANVIL_AND_ARCANA.Dialogs.SelectActor.Cancel'),
            items: actors
        });

        if (!choice)
            return null;

        return choice;
    }
    static getAvailableActors() : ActorDocument[] {
        // @ts-ignore
        return game.user.isGM ? game.actors : [game.user.character];
    }

    static findItem<T>(actor: ActorDocument, name: string, type: ItemTypes) : T | undefined {
        return actor.items.find(item => item.name === name && type.equals(item.type)) as T;
    }

    static async findOrCreateItem<T>(actor: ActorDocument, itemPrototype: ItemDocument) : Promise<ItemDocument> {
        let existing =
            this.findItem<ItemDocument>(actor, itemPrototype.name, ItemTypes.fromItem(itemPrototype));

        if (existing === undefined) {
            return await this.addRecordOfItem(actor, itemPrototype);
        }

        return existing;
    }

    static async addRecordOfItem(actor: ActorDocument, itemPrototype: ItemDocument) : Promise<ItemDocument> {
        const item = await this.CreateItem(actor, itemPrototype);
        await ItemUtils.updateItemCount(item, 0);
        return item;
    }

    static async CreateItem(actor: ActorDocument, itemPrototype: ItemDocument) : Promise<ItemDocument> {
        const documents =
            await actor.createEmbeddedDocuments("Item", [ObjectUtils.castToObject(itemPrototype)]) as ItemDocument[];

        return documents[0];
    }

    static async performInstantCheck(actor: ActorDocument, options: InstantCheckOptions) : Promise<CheckResult | undefined> {

        const skill = this.findItem<SkillDocument>(actor, options.skill, ItemTypes.Skill);

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
            succeeded: test.succeeded
        }
    }
}