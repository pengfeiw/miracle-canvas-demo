import Entity from "./entity";

export enum Operator {
    BoxSelect = 1,
    ChangeEntitySize,
    RotateEntity
}
class MiracleMouseControl {
    private entities: Entity[]; // 所有entity
    private canvas: HTMLCanvasElement; // entity所在的画布
    private dragging = false; // 是否正在拖拽
    private operator = Operator.BoxSelect; // 用户此时的操作类型

    public constructor(entities: Entity[], canvas: HTMLCanvasElement) {
        this.entities = entities;
        this.canvas = canvas;
        this.initEvent();
    }
    
    public initEvent() {
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
    }

    private onMouseDown(event: MouseEvent) {
        this.dragging = true;
    }

    private onMouseMove(event: MouseEvent) {
        if (this.dragging) {
            
        }
    }

    private onMouseUp(event: MouseEvent) {
        this.dragging = false;
    }
}

export default MiracleMouseControl;
