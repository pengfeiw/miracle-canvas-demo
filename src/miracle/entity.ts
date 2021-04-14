import {Point, Rectangle, GraphicsAssist, Vector} from "./graphic";
import CoordTransform from "./coordTransform";

enum ControlStyle {
    Rectangle = 1,
    Circle = 2
}

abstract class Entity {
    public isActive = false; // 是否处于激活状态
    public isDrawControlPoint = true; // 是否绘制控制点
    public ctf: CoordTransform; // 坐标转换
    public xLocked = false; // x方向缩放是否禁用
    public yLocked = false; // y方向缩放是否禁用
    public diagLocked = false; // 对角线缩放是否禁用
    public rotateLocked = false; // 旋转是否禁用
    public controlStyle = ControlStyle.Rectangle; // 控制点样式
    public controlSize = 8; // 控制点大小
    public borderStyle = "#007acc"; // 选中时边框样式
    public borderWidth = 2; // 选中时边框线宽
    public rotateControlDistance = 40; // 旋转点距离包围框矩形的距离

    public constructor(position: Point) {
        this.ctf = new CoordTransform(1);
    }
    /**
     * 绘制当前entity
     */
    public abstract draw(ctx: CanvasRenderingContext2D): void;

    /**
     * 获得包围框
     */
    protected abstract getBound(): Rectangle;

    /**
     * 包围框（世界坐标系）
     * 这个每次获得，都要重新计算包围框，大大降低了效率，后期考虑改进
     */
    public get bound(): Rectangle {
        return this.getBound();
    }

    /**
     * 获得left middle控制点包围框（设备坐标系）
     */
    public getControlBound_lm_device(): Rectangle {
        const controlPointW = GraphicsAssist.mid(this.bound.lt, this.bound.ld);
        const controlPointD = this.ctf.worldToDevice_Point(controlPointW);
        return new Rectangle(new Point(controlPointD.x - this.controlSize * 0.5, controlPointD.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得right middle控制点包围框（设备坐标系）
     */
    public getControlBound_rm_device(): Rectangle {
        const controlPointW = GraphicsAssist.mid(this.bound.rt, this.bound.rd);
        const controlPointD = this.ctf.worldToDevice_Point(controlPointW);
        return new Rectangle(new Point(controlPointD.x - this.controlSize * 0.5, controlPointD.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得top middle控制点包围框（设备坐标系）
     */
    public getControlBound_tm_device(): Rectangle {
        const controlPointW = GraphicsAssist.mid(this.bound.lt, this.bound.rt);
        const controlPointD = this.ctf.worldToDevice_Point(controlPointW);
        return new Rectangle(new Point(controlPointD.x - this.controlSize * 0.5, controlPointD.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得bottom middle控制点包围框（设备坐标系）
     */
    public getControlBound_bm_device(): Rectangle {
        const controlPointW = GraphicsAssist.mid(this.bound.ld, this.bound.rd);
        const controlPointD = this.ctf.worldToDevice_Point(controlPointW);
        return new Rectangle(new Point(controlPointD.x - this.controlSize * 0.5, controlPointD.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得left top控制点包围框（设备坐标系）
     */
    public getControlBound_lt_device(): Rectangle {
        const controlPointW = this.bound.lt;
        const controlPointD = this.ctf.worldToDevice_Point(controlPointW);
        return new Rectangle(new Point(controlPointD.x - this.controlSize * 0.5, controlPointD.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得left top控制点包围框（设备坐标系）
     */
    public getControlBound_rt_device(): Rectangle {
        const controlPointW = this.bound.rt;
        const controlPointD = this.ctf.worldToDevice_Point(controlPointW);
        return new Rectangle(new Point(controlPointD.x - this.controlSize * 0.5, controlPointD.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得left bottom控制点包围框（设备坐标系）
     */
    public getControlBound_lb_device(): Rectangle {
        const controlPointW = this.bound.ld;
        const controlPointD = this.ctf.worldToDevice_Point(controlPointW);
        return new Rectangle(new Point(controlPointD.x - this.controlSize * 0.5, controlPointD.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得right bottom控制点包围框（设备坐标系）
     */
    public getControlBound_rb_device(): Rectangle {
        const controlPointW = this.bound.rd;
        const controlPointD = this.ctf.worldToDevice_Point(controlPointW);
        return new Rectangle(new Point(controlPointD.x - this.controlSize * 0.5, controlPointD.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得旋转控制点包围框（世界坐标系）
     */
    public getControlBound_rotate(): Rectangle {
        const tm = GraphicsAssist.mid(this.bound.lt, this.bound.rt);
        const controlPointW = new Point(tm.x, tm.y - this.rotateControlDistance);
        const controlPointD = this.ctf.worldToDevice_Point(controlPointW);
        return new Rectangle(new Point(controlPointD.x - this.controlSize * 0.5, controlPointD.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 绘制包围框
     */
    protected drawBound(ctx: CanvasRenderingContext2D): void {
        const boundRect = this.bound;
        ctx.strokeStyle = this.borderStyle;
        ctx.lineWidth = this.borderWidth;
        // 绘制边界
        const boundRectLtd = this.ctf.worldToDevice_Point(boundRect.lt);
        const boundRectLdd = this.ctf.worldToDevice_Point(boundRect.ld);
        const boundRectRtd = this.ctf.worldToDevice_Point(boundRect.rt);
        const boundRectRdd = this.ctf.worldToDevice_Point(boundRect.rd);

        ctx.beginPath();
        ctx.moveTo(boundRectLtd.x, boundRectLtd.y);
        ctx.lineTo(boundRectLdd.x, boundRectLdd.y);
        ctx.lineTo(boundRectRdd.x, boundRectRdd.y);
        ctx.lineTo(boundRectRtd.x, boundRectRtd.y);
        ctx.closePath();
        ctx.stroke();
    }

    /**
     * 绘制控制点 
     */
    protected drawControlPoint(ctx: CanvasRenderingContext2D): void {
        /**绘制一个控制点 */
        const drawControlPoint = (ctx: CanvasRenderingContext2D, worldPoint: Point) => {
            switch (this.controlStyle) {
                case ControlStyle.Rectangle:
                    // 设备坐标点
                    const devicePoint = this.ctf.worldToDevice_Point(worldPoint);
                    const ltd = new Point(devicePoint.x - this.controlSize * 0.5, devicePoint.y - this.controlSize * 0.5);
                    const ldd = new Point(devicePoint.x - this.controlSize * 0.5, devicePoint.y + this.controlSize * 0.5);
                    const rdd = new Point(devicePoint.x + this.controlSize * 0.5, devicePoint.y + this.controlSize * 0.5);
                    const rtd = new Point(devicePoint.x + this.controlSize * 0.5, devicePoint.y - this.controlSize * 0.5);
                    // 绘制
                    ctx.beginPath();
                    ctx.moveTo(ltd.x, ltd.y);
                    ctx.lineTo(ldd.x, ldd.y);
                    ctx.lineTo(rdd.x, rdd.y);
                    ctx.lineTo(rtd.x, rtd.y);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case ControlStyle.Circle:
                    const ow = worldPoint;
                    const od = this.ctf.worldToDevice_Point(ow);
                    const sizeD = this.controlSize * 0.5;
                    ctx.beginPath();
                    ctx.ellipse(od.x, od.y, sizeD * 0.5, sizeD * 0.5, 0, 0, 2 * Math.PI);
                    ctx.fill();
                    break;
                default:
                    throw new Error("unknow control style.")
            }
        }

        const boundRect = this.bound;
        ctx.strokeStyle = this.borderStyle;
        ctx.fillStyle = this.borderStyle;
        ctx.lineWidth = this.borderWidth;

        // 绘制x控制点
        if (!this.xLocked) {
            drawControlPoint(ctx, GraphicsAssist.mid(boundRect.lt, boundRect.ld));
            drawControlPoint(ctx, GraphicsAssist.mid(boundRect.rt, boundRect.rd));
        }

        // 绘制y控制点
        if (!this.yLocked) {
            drawControlPoint(ctx, GraphicsAssist.mid(boundRect.lt, boundRect.rt));
            drawControlPoint(ctx, GraphicsAssist.mid(boundRect.ld, boundRect.rd));
        }

        // 绘制顶点处控制点
        if (!this.diagLocked) {
            drawControlPoint(ctx, boundRect.lt);
            drawControlPoint(ctx, boundRect.ld);
            drawControlPoint(ctx, boundRect.rt);
            drawControlPoint(ctx, boundRect.rd);
        }

        // 绘制旋转点
        if (!this.rotateLocked) {
            const tmW = GraphicsAssist.mid(boundRect.lt, boundRect.rt);
            const tmD = this.ctf.worldToDevice_Point(tmW);
            const rotatePointW = new Point(tmW.x, tmW.y - this.rotateControlDistance);
            const rotatePointD = this.ctf.worldToDevice_Point(rotatePointW);

            ctx.beginPath();
            ctx.moveTo(tmD.x, tmD.y);
            ctx.lineTo(rotatePointD.x, rotatePointD.y);
            ctx.stroke();
            drawControlPoint(ctx, rotatePointW);
        }
    }

    /**
     * 平移
     */
    public displacement(vector: Vector) {
        this.ctf.displacement(vector);
    }

    /**
     * 缩放
     */
    public zoom(originInDevice: Point, scale: number) {
        this.ctf.zoom(originInDevice, scale);
    }

    /**
     * 缩放X方向
     */
    public zoomX(originInDevice: Point, scale: number) {
        this.ctf.zoomX(originInDevice, scale);
    }

    /**
     * 缩放Y方向
     */
    public zoomY(originInDevice: Point, scale: number) {
        this.ctf.zoomY(originInDevice, scale);
    }
}

/**
 * 图片
 */
export class Image extends Entity {
    public src: string;
    public width: number;
    public height: number;
    constructor(position: Point, width: number, height: number, src: string) {
        super(position);
        this.src = src;
        this.width = width;
        this.height = height;
    }
    public draw(ctx: CanvasRenderingContext2D): void {
        throw new Error("Method not implemented.");
    }
    public getBound(): Rectangle {
        throw new Error("Method not implemented.");
    }
}

/**
 * 形状
 */
export abstract class Shape extends Entity {
    public lineW: number; // 线宽
    public strokeStyle: string; // 轮廓颜色
    public fillStyle: string; // 填充色
    public filled: boolean; // 是否是填充色
    public constructor() {
        super(new Point(0, 0));
        this.lineW = 1;
        this.strokeStyle = "red";
        this.fillStyle = "red";
        this.filled = false;
    }
    public abstract draw(ctx: CanvasRenderingContext2D): void;
}

/**
 * 多义线形状,是一个形状，可以是一个多义线，但是不能是一条直线段。
 */
export class PolyShape extends Shape {
    public vertexs: Point[];
    public closed: boolean;
    public constructor(vertexs: Point[], closed = false) {
        super();
        this.vertexs = vertexs;
        this.closed = closed;
    }

    /**
     * 在canvas上绘制图形
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.vertexs.length <= 2) {
            throw new Error("the count of vertex must greater then 2.");
        }

        // 改变样式
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.lineWidth = this.lineW;

        // 转换顶点
        let points: Point[] = [];
        this.vertexs.forEach((vertex) => {
            points.push(this.ctf.worldToDevice_Point(vertex));
        })

        // 绘制
        if (this.filled) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            if (this.closed) {
                ctx.closePath();
            }
            ctx.stroke();
        }

        if (this.isActive) {
            this.drawBound(ctx);
            if (this.isDrawControlPoint) {
                this.drawControlPoint(ctx);
            }
        }
    }

    /**
     * 求包围框
     */
    public getBound(): Rectangle {
        return Rectangle.bound(this.vertexs);
    }
}

/**
 * 圆形
 */
export class Circle extends Shape {
    public center: Point;
    public radiusX: number;
    public radiusY: number;

    public constructor(center: Point, radius1: number, radius2?: number) {
        super();
        this.center = center;
        this.radiusX = radius1;
        this.radiusY = radius2 ?? radius1;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // 改变样式
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.lineWidth = this.lineW;

        const o = this.ctf.worldToDevice_Point(this.center);
        const r1 = 1 / this.ctf.worldToDevice_Len_X * this.radiusX;
        const r2 = 1 / this.ctf.worldToDevice_Len_Y * this.radiusY;

        ctx.beginPath();
        ctx.ellipse(o.x, o.y, r1, r2, 0, 0, 2 * Math.PI);
        if (this.filled) {
            ctx.fill();
        } else {
            ctx.stroke();
        }

        if (this.isActive) {
            this.drawBound(ctx);
            if (this.isDrawControlPoint) {
                this.drawControlPoint(ctx);
            }
        }
    }

    /**
     * 求包围框
     */
    public getBound(): Rectangle {
        return new Rectangle(new Point(this.center.x - this.radiusX, this.center.y - this.radiusY), 2 * this.radiusX, 2 * this.radiusY);
    }
}

/**
 * 一组entity的集合
 */
export class EntityCollection extends Entity {
    public entities: Entity[];
    public constructor(entities: Entity[]) {
        super(new Point(0, 0));
        this.entities = entities;
        this.ctf = new CoordTransform(1);
    }
    public draw(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(ctx);
        }

        if (this.isActive) {
            this.drawBound(ctx);
            if (this.isDrawControlPoint) {
                this.drawControlPoint(ctx);
            }
        }
    }
    protected getBound(): Rectangle {
        const boundsD = this.entities.map((ent) => {
            const boundW = ent.bound;
            const boundD = new Rectangle(ent.ctf.worldToDevice_Point(boundW.location), 1 / ent.ctf.worldToDevice_Len_X * boundW.width,
                1 / ent.ctf.worldToDevice_Len_Y * boundW.height);
            return boundD;
        });

        return Rectangle.union(boundsD);
    }
}

export default Entity;
