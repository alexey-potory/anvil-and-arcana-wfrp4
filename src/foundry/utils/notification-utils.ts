export default class NotificationUtils {
    static warning(params:any) {
        //@ts-ignore
        ui.notifications.warn(params);
    }
}