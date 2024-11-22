export class StringUtils {
    static capitalizeFirstLetter(val:string) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }
}