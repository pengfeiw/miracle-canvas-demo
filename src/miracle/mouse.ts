import Entity from "./entity";
import {Rectangle, Point, GraphicsAssist, Vector} from "./graphic";

export enum Operator {
    /**
     * 框选操作
     */
    BoxSelect = 1,
    /**
     * 改变entity大小
     */
    ChangeEntitySize,
    /**
     * 旋转entity
     */
    RotateEntity,
    /**
     * 移动Entity
     */
    MoveEntity
}
class MiracleMouseControl {
    private entities: Entity[]; // 所有entity
    private mouseHoveEntity?: Entity; // 鼠标未拖拽时，当前鼠标悬浮的Entity
    private canvas: HTMLCanvasElement; // entity所在的画布
    private dragging = false; // 是否正在拖拽
    private mouseDownPosition?: Point; // 鼠标点击位置
    private operator = Operator.BoxSelect; // 用户此时的操作类型
    private dynamicRect?: Rectangle;

    public constructor(entities: Entity[], canvas: HTMLCanvasElement) {
        this.entities = entities;
        this.canvas = canvas;
        this.initEvent();
    }

    public initEvent() {
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mousemove", this.onMouseMove_setOperator);
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
            if (this.operator === Operator.BoxSelect && this.dynamicRect) {
                const dynaimcRect = this.dynamicRect;
                ctx.setLineDash([6]);
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.strokeRect(dynaimcRect.location.x, dynaimcRect.location.y, dynaimcRect.width, dynaimcRect.height);
            }
        }
    }

    /**
     * 1.设置鼠标样式
     * 2.根据鼠标位置，判断鼠标操作的类型
     */
    private onMouseMove_setOperator = (event: MouseEvent) => {
        if (this.dragging === false) {
            this.operator = Operator.BoxSelect;
            this.mouseHoveEntity = undefined;
            const mousePoint = new Point(event.offsetX, event.offsetY);
            document.body.style.cursor = "auto";
            for (let i = 0; i < this.entities.length; i++) {
                const ent = this.entities[i];
                const boundW = ent.bound;
                const boundD = new Rectangle(ent.ctf.worldToDevice_Point(boundW.location), 1 / ent.ctf.worldToDevice_Len * boundW.width,
                    1 / ent.ctf.worldToDevice_Len * boundW.height);

                // 鼠标位于entity包围框内，鼠标指针为"move"
                if (GraphicsAssist.isPointInRectangle(mousePoint, boundD)) {
                    document.body.style.cursor = "move";
                    this.operator = Operator.MoveEntity;
                    this.mouseHoveEntity = ent;
                    return;
                }
            }
        }
    }

    private onMouseDown = (event: MouseEvent) => {
        if (event.button === 0) {
            this.dragging = true;
            this.mouseDownPosition = new Point(event.offsetX, event.offsetY);
            if (this.operator === Operator.MoveEntity) {
                if (this.getActiveEntities().length > 0) {
                    const boundsD = this.getActiveEntities().map((ent) => {
                        const boundW = ent.bound;
                        const boundD = new Rectangle(ent.ctf.worldToDevice_Point(boundW.location), 1 / ent.ctf.worldToDevice_Len * boundW.width,
                            1 / ent.ctf.worldToDevice_Len * boundW.height);
                        return boundD;
                    });

                    const unionBoundD = Rectangle.union(boundsD);

                    if (!GraphicsAssist.isPointInRectangle(this.mouseDownPosition, unionBoundD)) {
                        this.entities.forEach((ent) => {
                            ent.isActive = false;
                        })

                        if (this.mouseHoveEntity) {
                            this.mouseHoveEntity.isActive = true;
                        }
                    }
                }
                else {
                    if (this.mouseHoveEntity) {
                        this.mouseHoveEntity.isActive = true;
                    }
                }
            }
            if (this.operator === Operator.BoxSelect) {
                this.dynamicRect = new Rectangle(this.mouseDownPosition, 0, 0);
                this.entities.forEach((ent) => {
                    ent.isActive = false;
                })
            }
            this.redraw();
        }
    }

    private onMouseMove = (event: MouseEvent) => {
        if (this.dragging) {
            // 绘制框选框
            const drawSelectBox = () => {
                const w = event.offsetX - this.dynamicRect!.location.x;
                const h = event.offsetY - this.dynamicRect!.location.y;
                this.dynamicRect = new Rectangle(this.dynamicRect!.location, w, h);
                this.redraw();
            };

            const MoveEntity = () => {
                const activeEntities = this.getActiveEntities();
                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].ctf.displacement(new Vector(event.movementX, event.movementY));
                }
                this.redraw();
            };

            switch (this.operator) {
                case Operator.BoxSelect:
                    drawSelectBox();
                    break;
                case Operator.MoveEntity:
                    MoveEntity();
                    break;
                default:
                    break;
            }
        }
    }

    private onMouseUp = (event: MouseEvent) => {
        if (this.operator === Operator.BoxSelect && this.dynamicRect) {
            for (let i = 0; i < this.entities.length; i++) {
                const ent = this.entities[i];
                const boundW = ent.bound;
                const boundD = new Rectangle(ent.ctf.worldToDevice_Point(boundW.location), 1 / ent.ctf.worldToDevice_Len * boundW.width,
                    1 / ent.ctf.worldToDevice_Len * boundW.height);
                if (Rectangle.intersection([this.dynamicRect, boundD])) {
                    ent.isActive = true;
                }
            }
        }
        this.dragging = false;
        this.dynamicRect = undefined;
        this.redraw();
    }

    public getActiveEntities() {
        return this.entities.filter((ent) => ent.isActive);
    } 
}

export default MiracleMouseControl;
