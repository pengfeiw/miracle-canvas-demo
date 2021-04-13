import CoordTransform from "./coordTransform";
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
class MiracleMouseControl {
    private entities: Entity[]; // 所有entity
    private mouseHoveEntity?: Entity; // 鼠标未拖拽时，当前鼠标悬浮的Entity
    private activeCollection?: EntityCollection; // 当激活的entity个数大于1时，activeCollection不是undefined
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
                ctx.strokeRect(dynaimcRect.location.x, dynaimcRect.location.y, dynaimcRect.width, dynaimcRect.height);
            }
        }
    }

    //#region mouse move操作，涉及的变化
    /**
     * 绘制动态框选框 
     */
    private drawSelectBox = (event: MouseEvent) => {
        const w = event.offsetX - this.dynamicRect!.location.x;
        const h = event.offsetY - this.dynamicRect!.location.y;
        this.dynamicRect = new Rectangle(this.dynamicRect!.location, w, h);
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
            // const moveLen = Math.sqrt(event.movementX * event.movementX + event.movementY * event.movementY);
            let boundD: Rectangle;
            if (this.activeCollection) {
                const boundW = this.activeCollection.bound;
                boundD = new Rectangle(this.activeCollection.ctf.worldToDevice_Point(boundW.location), 1 / this.activeCollection.ctf.worldToDevice_Len * boundW.width,
                1 / this.activeCollection.ctf.worldToDevice_Len * boundW.height);
            } else {
                const entity = activeEntities[0];
                const boundW = entity.bound;
                boundD = new Rectangle(entity.ctf.worldToDevice_Point(boundW.location), 1 / entity.ctf.worldToDevice_Len * boundW.width,
                1 / entity.ctf.worldToDevice_Len * boundW.height);
            }

            if (this.operator === Operator.ChangeEntitySizeLt) {
                const origin = boundD.rd;
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.lt.x - boundD.rd.x, 2) + Math.pow(boundD.lt.y - boundD.rd.y, 2));

                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoom(origin, zoomScale);
                }
            }

            if (this.operator === Operator.ChangeEntitySizeLb) {
                const origin = boundD.rt;
                const cursorDisToOrigin = Math.sqrt(Math.pow(event.offsetX - origin.x, 2) + Math.pow(event.offsetY - origin.y, 2));
                const zoomScale = cursorDisToOrigin / Math.sqrt(Math.pow(boundD.ld.x - boundD.rt.x, 2) + Math.pow(boundD.ld.y - boundD.rt.y, 2));

                for (let i = 0; i < activeEntities.length; i++) {
                    activeEntities[i].zoom(origin, zoomScale);
                }
            }
            this.redraw();
        }
    };
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

                const isMouseInControlBound = (ctf: CoordTransform, ctrBoundW: Rectangle) => {
                    const ctrBoundD = new Rectangle(ctf.worldToDevice_Point(ctrBoundW.location), 1 / ctf.worldToDevice_Len * ctrBoundW.width,
                        ctf.worldToDevice_Len * ctrBoundW.height);
                    if (GraphicsAssist.isPointInRectangle(mousePoint, ctrBoundD)) {
                        return true;
                    }
                    return false;
                }

                // 左上角控制点
                const ltCtrBoundW = entity.getControlBound_lt();
                if (isMouseInControlBound(entity.ctf, ltCtrBoundW)) {
                    document.body.style.cursor = "nwse-resize";
                    this.operator = Operator.ChangeEntitySizeLt;
                    return;
                }

                // 左中
                const lmCtrBoundW = entity.getControlBound_lm();
                if (isMouseInControlBound(entity.ctf, lmCtrBoundW)) {
                    document.body.style.cursor = "ew-resize";
                    this.operator = Operator.ChangeEntitySizeLm;
                    return;
                }

                // 左下
                const lbCtrBoundW = entity.getControlBound_lb();
                if (isMouseInControlBound(entity.ctf, lbCtrBoundW)) {
                    document.body.style.cursor = "nesw-resize";
                    this.operator = Operator.ChangeEntitySizeLb;
                    return;
                }

                // 中下
                const MbCtrBoundW = entity.getControlBound_bm();
                if (isMouseInControlBound(entity.ctf, MbCtrBoundW)) {
                    document.body.style.cursor = "ns-resize";
                    this.operator = Operator.ChangeEntitySizeMb;
                    return;
                }

                // 右下
                const RbCtrBoundW = entity.getControlBound_rb();
                if (isMouseInControlBound(entity.ctf, RbCtrBoundW)) {
                    document.body.style.cursor = "nwse-resize";
                    this.operator = Operator.ChangeEntitySizeRb;
                    return;
                }

                // 右中
                const RmCtrBoundW = entity.getControlBound_rm();
                if (isMouseInControlBound(entity.ctf, RmCtrBoundW)) {
                    document.body.style.cursor = "ew-resize";
                    this.operator = Operator.ChangeEntitySizeRb;
                    return;
                }

                // 右上
                const RtCtrBoundW = entity.getControlBound_rt();
                if (isMouseInControlBound(entity.ctf, RtCtrBoundW)) {
                    document.body.style.cursor = "nesw-resize";
                    this.operator = Operator.ChangeEntitySizeRt;
                    return;
                }

                // 中上
                const MtCtrBoundW = entity.getControlBound_tm();
                if (isMouseInControlBound(entity.ctf, MtCtrBoundW)) {
                    document.body.style.cursor = "ns-resize";
                    this.operator = Operator.ChangeEntitySizeMt;
                    return;
                }

                // 旋转点
                const rotateCtrBoundW = entity.getControlBound_rotate();
                if (isMouseInControlBound(entity.ctf, rotateCtrBoundW)) {
                    document.body.style.cursor = "crosshair";
                    this.operator = Operator.RotateEntity;
                    return;
                }
            }

            if (this.activeCollection) {
                const boundW = this.activeCollection.bound;
                const boundD = new Rectangle(this.activeCollection.ctf.worldToDevice_Point(boundW.location), 1 / this.activeCollection.ctf.worldToDevice_Len * boundW.width,
                    1 / this.activeCollection.ctf.worldToDevice_Len * boundW.height);
                if (GraphicsAssist.isPointInRectangle(mousePoint, boundD)) {
                    document.body.style.cursor = "move";
                    this.operator = Operator.MoveEntity;
                    return;
                }
            }

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
