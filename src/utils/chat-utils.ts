import { recipeIconPath } from "../contracts";
import { localizeString } from "../foundry/utils/localization-utils";

const errorColor = '#ad0000';

export async function postBadRecipeChatMessage() {
    await postChatMessage(`<b style="color: ${errorColor}">${localizeString("ANVIL_AND_ARCANA.Chat.Messages.BadRecipe")}</b>`);
}

export async function postChatMessage(content: string) {
    // @ts-ignore
    await ChatMessage.create(
        { 
            content: content,
            speaker: { alias: localizeString("ANVIL_AND_ARCANA.Chat.Speaker") },
            flags: { img: recipeIconPath } 
        });
}