import { ActorDocument } from "../entities/actor-document";
import { ItemDocument } from "../entities/item-document";

export default class ActorUtils {
    static getAvailableActors() : ActorDocument[] {
        // @ts-ignore
        return game.user.isGM ? game.actors : [game.user.character];
    }

    static getSkill(actor: ActorDocument, skillName: string) : ItemDocument | undefined {
        return actor.items.find(skill => skill.name === skillName);
    }
}