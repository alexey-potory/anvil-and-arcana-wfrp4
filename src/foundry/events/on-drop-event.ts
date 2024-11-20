export interface OnDropEvent {
    preventDefault() : void;
    originalEvent: DragEvent;
}