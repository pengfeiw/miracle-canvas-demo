import Entity, {EntityCollection} from "./entity";
import {Rectangle, Point, GraphicsAssist, Vector} from "./graphic";

export enum Operator {
    /**
     * 框选操作
     */
    BoxSelect = 1,
    /**
     * 旋转entity
     */
    RotateEntity,
    /**
     * 移动Entity
     */
    MoveEntity,
    /**
     * 改变entity大小，左上
     */
    ChangeEntitySizeLt,
    /**
     * 改变entity大小，左中
     */
    ChangeEntitySizeLm,
    /**
     * 改变entity大小，左下
     */
    ChangeEntitySizeLb,
    /**
     * 改变entity大小，中下
     */
    ChangeEntitySizeMb,
    /**
     * 改变entity大小，右下
     */
    ChangeEntitySizeRb,
    /**
     * 改变entity大小，右中
     */
    ChangeEntitySizeRm,
    /**
     * 改变entity大小，右上
     */
    ChangeEntitySizeRt,
    /**
     * 改变entity大小，中上
     */
    ChangeEntitySizeMt
}

interface DynamicRect {
    lt: Point;
    rd: Point;
}

class MiracleMouseControl {
    private entities: Entity[]; // 所有entity
    private mouseHoveEntity?: Entity; // 鼠标未拖拽时，当前鼠标悬浮的Entity
    private activeCollection?: EntityCollection; // 当激活的entity个数大于1时，activeCollection不是undefined
    private canvas: HTMLCanvasElement; // entity所在的画布
    private dragging = false; // 是否正在拖拽
    private mouseDownPosition?: Point; // 鼠标点击位置
    private operator = Operator.BoxSelect; // 用户此时的操作类型
    private dynamicRect?: DynamicRect;

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

            // 绘制动态矩形
            ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
            ctx.setLineDash([]);

            // 绘制entity
            this.entities.forEach((ent) => {
                ent.isDrawControlPoint = true;
            })
            const activeEntities = this.getActiveEntities();
            if (activeEntities.length > 1) {
                const collection = new EntityCollection(activeEntities);
                collection.isActive = true;
                collection.isDrawControlPoint = true;
                activeEntities.forEach((ent) => {
                    ent.isDrawControlPoint = false;
                })

                for (let i = 0; i < this.entities.length; i++) {
                    const entity = this.entities[i];
                    if (!activeEntities.includes(entity)) {
                        entity.draw(ctx);
                    }
                }
                collection.draw(ctx);
            } else {
                for (let i = 0; i < this.entities.length; i++) {
                    const entity = this.entities[i];
                    entity.draw(ctx);
                }
            }

            // 绘制动态矩形
            if (this.operator === Operator.BoxSelect && this.dynamicRect) {
                const dynaimcRect = this.dynamicRect;
                ctx.setLineDash([6]);
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.strokeRect(dynaimcRect.lt.x, dynaimcRect.lt.y, dynaimcRect.rd.x - dynaimcRect.lt.x, dynaimcRect.rd.y - dynaimcRect.lt.y);
            }
        }
    }

    //#region mouse move操作，涉及的变化
    /**
     * 绘制动态框选框 
     */
    private drawSelectBox = (event: MouseEvent) => {
        this.dynamicRect = {
            lt: this.dynamicRect!.lt,
            rd: new Point(event.offsetX, event.offsetY)
        }
        this.redraw();
    };

    /**
     * 移动entity时，动态绘制图元 
     */
    private MoveEntity = (event: MouseEvent) => {
        const activeEntities = this.getActiveEntities();
        for (let i = 0; i < activeEntities.length; i++) {
            activeEntities[i].displacement(new Vector(event.movementX, event.movementY));
        }
        this.redraw();
    };

    /**
     * 改变entity尺寸
     */
    private resizeEntity = (event: MouseEvent) => {
        const activeEntities = this.getActiveEntities();
        if (activeEntities.length > 0) {
            let boundD: Rectangle;
            if (this.activeCollection) {
                const boundW = this.activeCollection.bound;
                boundD = new Rectangle(this.activeCollection.ctf.worldToDevice_Point(boundW.location), 1 / this.activeCollection.ctf.worldToDevice_Len_X * boundW.width,
                    1 / this.activeCollection.ctf.worldToDevice_Len_Y * boundW.height);
            } else {
                const entity = activeEntities[0];
                const boundW = entity.bound;
                boundD = new Rectangle(entity.ctf.worldToDevice_Point(boundW.location), 1 / entity.ctf.worldToDevice_Len_X * boundW.width,
                    1 / entity.ctf.worldToDevice_Len_Y * boundW.height);
            }

            if (this.operator === Operator.ChangeEntitySizeLt) {
                const origin = boundD.rd;
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.lt.x - boundD.rd.x, 2) + Math.pow(boundD.lt.y - boundD.rd.y, 2));

                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoom(origin, zoomScale);
                }
            }
            else if (this.operator === Operator.ChangeEntitySizeLm) {
                const origin = GraphicsAssist.mid(boundD.rt, boundD.rd);
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.lt.x - boundD.rt.x, 2) + Math.pow(boundD.lt.y - boundD.rt.y, 2));

                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoomX(origin, zoomScale);
                }
            }
            else if (this.operator === Operator.ChangeEntitySizeLb) {
                const origin = boundD.rt;
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.ld.x - boundD.rt.x, 2) + Math.pow(boundD.ld.y - boundD.rt.y, 2));

                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoom(origin, zoomScale);
                }
            }
            else if (this.operator === Operator.ChangeEntitySizeMb) {
                const origin = GraphicsAssist.mid(boundD.lt, boundD.rt);
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.lt.x - boundD.ld.x, 2) + Math.pow(boundD.lt.y - boundD.ld.y, 2));
                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoomY(origin, zoomScale);
                }
            }
            else if (this.operator === Operator.ChangeEntitySizeRb) {
                const origin = boundD.lt;
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.lt.x - boundD.rd.x, 2) + Math.pow(boundD.lt.y - boundD.rd.y, 2));
                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoom(origin, zoomScale);
                }
            }
            else if (this.operator === Operator.ChangeEntitySizeRm) {
                const origin = GraphicsAssist.mid(boundD.lt, boundD.ld);
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.lt.x - boundD.rt.x, 2) + Math.pow(boundD.lt.y - boundD.rt.y, 2));
                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoomX(origin, zoomScale);
                }
            }
            else if (this.operator === Operator.ChangeEntitySizeRt) {
                const origin = boundD.ld;
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.lt.x - boundD.rd.x, 2) + Math.pow(boundD.lt.y - boundD.rd.y, 2));
                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoom(origin, zoomScale);
                }
            }
            else if (this.operator === Operator.ChangeEntitySizeMt) {
                const origin = GraphicsAssist.mid(boundD.ld, boundD.rd);
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.lt.x - boundD.ld.x, 2) + Math.pow(boundD.lt.y - boundD.ld.y, 2));
                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoomY(origin, zoomScale);
                }
            }
            this.redraw();
        }
    };

    private rotateEntity = (event: MouseEvent) => {
        const activeEntities = this.getActiveEntities();
        if (activeEntities.length > 0) {
            for (let i = 0; i <activeEntities.length; i++) {
                activeEntities[i].rotateAnticlockwise(Math.PI / 18);
            }
        }
        this.redraw();
    }
    //#endregion

    //#region 鼠标操作
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

            const activeEntities = this.getActiveEntities();
            // 判断是否处于控制点内
            if (activeEntities.length > 0) {
                let entity: Entity;
                if (activeEntities.length > 1) {
                    entity = this.activeCollection!;
                } else {
                    entity = activeEntities[0];
                }

                const isMouseInControlBound = (ctrBoundD: Rectangle) => {
                    if (GraphicsAssist.isPointInRectangle(mousePoint, ctrBoundD)) {
                        return true;
                    }
                    return false;
                }

                // 左上角控制点
                const ltCtrBoundD = entity.getControlBound_lt_device();
                if (isMouseInControlBound(ltCtrBoundD)) {
                    document.body.style.cursor = "nwse-resize";
                    this.operator = Operator.ChangeEntitySizeLt;
                    return;
                }

                // 左中
                const lmCtrBoundD = entity.getControlBound_lm_device();
                if (isMouseInControlBound(lmCtrBoundD)) {
                    document.body.style.cursor = "ew-resize";
                    this.operator = Operator.ChangeEntitySizeLm;
                    return;
                }

                // 左下
                const lbCtrBoundD = entity.getControlBound_lb_device();
                if (isMouseInControlBound(lbCtrBoundD)) {
                    document.body.style.cursor = "nesw-resize";
                    this.operator = Operator.ChangeEntitySizeLb;
                    return;
                }

                // 中下
                const MbCtrBoundD = entity.getControlBound_bm_device();
                if (isMouseInControlBound(MbCtrBoundD)) {
                    document.body.style.cursor = "ns-resize";
                    this.operator = Operator.ChangeEntitySizeMb;
                    return;
                }

                // 右下
                const RbCtrBoundD = entity.getControlBound_rb_device();
                if (isMouseInControlBound(RbCtrBoundD)) {
                    document.body.style.cursor = "nwse-resize";
                    this.operator = Operator.ChangeEntitySizeRb;
                    return;
                }

                // 右中
                const RmCtrBoundD = entity.getControlBound_rm_device();
                if (isMouseInControlBound(RmCtrBoundD)) {
                    document.body.style.cursor = "ew-resize";
                    this.operator = Operator.ChangeEntitySizeRm;
                    return;
                }

                // 右上
                const RtCtrBoundD = entity.getControlBound_rt_device();
                if (isMouseInControlBound(RtCtrBoundD)) {
                    document.body.style.cursor = "nesw-resize";
                    this.operator = Operator.ChangeEntitySizeRt;
                    return;
                }

                // 中上
                const MtCtrBoundD = entity.getControlBound_tm_device();
                if (isMouseInControlBound(MtCtrBoundD)) {
                    document.body.style.cursor = "ns-resize";
                    this.operator = Operator.ChangeEntitySizeMt;
                    return;
                }

                // 旋转点
                const rotateCtrBoundD = entity.getControlBound_rotate();
                if (isMouseInControlBound(rotateCtrBoundD)) {
                    document.body.style.cursor = "crosshair";
                    this.operator = Operator.RotateEntity;
                    return;
                }
            }

            if (this.activeCollection) {
                const boundW = this.activeCollection.bound;
                const boundD = new Rectangle(this.activeCollection.ctf.worldToDevice_Point(boundW.location), 1 / this.activeCollection.ctf.worldToDevice_Len_X * boundW.width,
                    1 / this.activeCollection.ctf.worldToDevice_Len_Y * boundW.height);
                if (GraphicsAssist.isPointInRectangle(mousePoint, boundD)) {
                    document.body.style.cursor = "move";
                    this.operator = Operator.MoveEntity;
                    return;
                }
            }

            for (let i = 0; i < this.entities.length; i++) {
                const ent = this.entities[i];
                const boundW = ent.bound;
                const boundD = new Rectangle(ent.ctf.worldToDevice_Point(boundW.location), 1 / ent.ctf.worldToDevice_Len_X * boundW.width,
                    1 / ent.ctf.worldToDevice_Len_Y * boundW.height);
                
                
                // 测试 ---绘制屏幕包围框
                const ctx = this.canvas.getContext("2d");
                if (ctx) {
                    ctx.strokeStyle = "gray";
                    ctx.beginPath();
                    ctx.strokeRect(boundD.lt.x, boundD.lt.y, boundD.width, boundD.height);
                }


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
                        const boundD = new Rectangle(ent.ctf.worldToDevice_Point(boundW.location), 1 / ent.ctf.worldToDevice_Len_X * boundW.width,
                            1 / ent.ctf.worldToDevice_Len_Y * boundW.height);
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
                // this.dynamicRect = new Rectangle(this.mouseDownPosition, 0, 0);
                this.dynamicRect = {
                    lt: this.mouseDownPosition,
                    rd: this.mouseDownPosition
                };
                this.entities.forEach((ent) => {
                    ent.isActive = false;
                });
            }
            this.redraw();
        }
    }

    private onMouseMove = (event: MouseEvent) => {
        if (this.dragging) {
            switch (this.operator) {
                case Operator.BoxSelect:
                    this.drawSelectBox(event);
                    break;
                case Operator.MoveEntity:
                    this.MoveEntity(event);
                    break;
                case Operator.ChangeEntitySizeLt:
                    this.resizeEntity(event);
                    break;
                case Operator.ChangeEntitySizeLb:
                    this.resizeEntity(event);
                    break;
                case Operator.ChangeEntitySizeLm:
                    this.resizeEntity(event);
                    break;
                case Operator.ChangeEntitySizeMb:
                    this.resizeEntity(event);
                    break;
                case Operator.ChangeEntitySizeRb:
                    this.resizeEntity(event);
                    break;
                case Operator.ChangeEntitySizeRm:
                    this.resizeEntity(event);
                    break;
                case Operator.ChangeEntitySizeRt:
                    this.resizeEntity(event);
                    break;
                case Operator.ChangeEntitySizeMt:
                    this.resizeEntity(event);
                    break;
                case Operator.RotateEntity:
                    this.rotateEntity(event);
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
                const boundD = new Rectangle(ent.ctf.worldToDevice_Point(boundW.location), 1 / ent.ctf.worldToDevice_Len_X * boundW.width,
                    1 / ent.ctf.worldToDevice_Len_Y * boundW.height);
                const mouseRect = new Rectangle(GraphicsAssist.mid(this.dynamicRect.lt, this.dynamicRect.rd), this.dynamicRect.rd.x - this.dynamicRect.lt.x, 
                    this.dynamicRect.rd.y - this.dynamicRect.lt.y);
                if (Rectangle.intersection(mouseRect, boundD)) {
                    ent.isActive = true;
                }
            }
        }
        // 设置activeEntsCollection
        const activeEnts = this.getActiveEntities();
        if (activeEnts.length > 1) {
            this.activeCollection = new EntityCollection(activeEnts);
        } else {
            this.activeCollection = undefined;
        }

        this.dragging = false;
        this.dynamicRect = undefined;
        this.redraw();
    }
    //#endregion

    public getActiveEntities() {
        return this.entities.filter((ent) => ent.isActive);
    }
}

export default MiracleMouseControl;
