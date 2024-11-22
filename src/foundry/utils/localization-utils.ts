export default class LocalizationUtils {
    static localize(key:string) : string {
        //@ts-ignore
        return game.i18n.localize(key);
    }
}