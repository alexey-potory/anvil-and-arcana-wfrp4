import { recipeIconPath } from "../contracts";
import LocalizationUtils from "../foundry/utils/localization-utils";

const errorColor = '#ad0000';

export default class ChatUtils {
    static async postBadRecipeMessage() {
        await this.postMessage(`<b style="color: ${errorColor}">${LocalizationUtils.localize("ANVIL_AND_ARCANA.Chat.Messages.BadRecipe")}</b>`);
    }

    static async postMessage(content: string) {
        // @ts-ignore
        await ChatMessage.create(
            {
                content: content,
                speaker: { alias: LocalizationUtils.localize("ANVIL_AND_ARCANA.Chat.Speaker") },
                flags: { img: recipeIconPath }
            });
    }
}