import { ActorDocument } from "../entities/actor-document";
import { ItemDocument } from "../entities/item-document";

export function getAvailableActors() : ActorDocument[] {
    // @ts-ignore
    return game.user.isGM ? game.actors : [game.user.character];
}

export function findActorSkill(actor: ActorDocument, skillName: string) : ItemDocument | undefined {
    return actor.items.find(skill => skill.name === skillName);
}

export function setupActorSkill(actor: ActorDocument, skill: ItemDocument) {
    
}