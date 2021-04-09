import Entity from "./entity";
import {Rectangle, Point} from "./graphic";

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
    private dynaimcRect?: Rectangle;

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

    private redraw() {
        const ctx = this.canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
            ctx.setLineDash([]);
            this.entities.forEach((ent) => {
                ent.draw(ctx);
            });

            // 绘制动态矩形
            if (this.dynaimcRect) {
                const dynaimcRect = this.dynaimcRect;
                ctx.setLineDash([6]);
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.strokeRect(dynaimcRect.location.x, dynaimcRect.location.y, dynaimcRect.width, dynaimcRect.height);
            }
        }
    }

    private onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
            this.dragging = true;
            this.dynaimcRect = new Rectangle(new Point(event.offsetX, event.offsetY), 0, 0);
        }
    }

    private onMouseMove = (event: MouseEvent) => {
        if (this.dragging) {
            const w = event.offsetX - this.dynaimcRect!.location.x;
            const h = event.offsetY - this.dynaimcRect!.location.y;
            this.dynaimcRect = new Rectangle(this.dynaimcRect!.location, w, h);
            this.redraw();
        }
    }

    private onMouseUp = (event: MouseEvent) => {
        this.entities.forEach((ent) => {
            ent.isActive = false;
        });
        const dragging = this.dragging; 
        this.dragging = false;
        this.dynaimcRect = undefined;
        if (dragging) {
            this.redraw();
        }
    }
}

export default MiracleMouseControl;
