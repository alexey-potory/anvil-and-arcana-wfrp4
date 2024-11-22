import { Contracts } from "../../contracts";

export default class CustomTypeUtils {
    static register(typeName: string, model: any, sheet: any) : void {

        const typeDef = {
            [typeName]: model
        }

        // @ts-ignore
        Object.assign(CONFIG.Item.dataModels, typeDef);

        // @ts-ignore
        DocumentSheetConfig.registerSheet(Item, Contracts.moduleName, sheet, {
            types: [typeName],
            makeDefault: true
        });
    }
}