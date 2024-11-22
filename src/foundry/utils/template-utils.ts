export default class TemplateUtils {
    static loadTemplates(paths: string[]) {
        // @ts-ignore
        loadTemplates(paths)
    }

    static register(name: string, fn: (arg1: any, arg2: any, options: any) => any): void {
        //@ts-ignore
        Handlebars.registerHelper(name, fn);
    }
}