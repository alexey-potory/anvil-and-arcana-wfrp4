export default class UserUtils {
    static isActiveGMPresent(): boolean {
        //@ts-ignore
        return !!game.users.activeGM;
    }
}