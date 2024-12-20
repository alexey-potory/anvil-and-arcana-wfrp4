import {modulePath, recipeIconPath} from "../contracts";
import LocalizationUtils from "../foundry/utils/localization-utils";
import TemplateUtils from "../foundry/utils/template-utils";

export default class ChatUtils {

    static init() {
        TemplateUtils.loadTemplates([
            `${modulePath}/templates/messages/bad-recipe-message.hbs`,
            `${modulePath}/templates/messages/check-failed-message.hbs`,
            `${modulePath}/templates/messages/no-related-skill-message.hbs`,
            `${modulePath}/templates/messages/extended-check-message.hbs`
        ]);
    }

    static async postBadRecipeMessage() {
        await this.postMessage(await TemplateUtils.render(`${modulePath}/templates/messages/bad-recipe-message.hbs`));
    }

    static async postNoRelatedSkillMessage() {
        await this.postMessage(await TemplateUtils.render(`${modulePath}/templates/messages/no-related-skill-message.hbs`));
    }

    static async postExtendedCheckMessage() {
        await this.postMessage(await TemplateUtils.render(
            `${modulePath}/templates/messages/extended-check-message.hbs`
        ));
    }

    static async postSuccessMessage(resultUuid: string | undefined) {
        await this.postMessage(await TemplateUtils.render(
            `${modulePath}/templates/messages/check-passed-message.hbs`,
            { result: resultUuid}
        ));
    }

    static async postFailMessage(resultUuid: string | undefined) {
        await this.postMessage(await TemplateUtils.render(
            `${modulePath}/templates/messages/check-failed-message.hbs`,
            { result: resultUuid}
        ));
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