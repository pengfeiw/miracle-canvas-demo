import {Point, Rectangle, GraphicsAssist} from "./graphic";
import CoordTransform from "./coordTransform";

enum ControlStyle {
    Rectangle = 1,
    Circle = 2
}

abstract class Entity {
    private angle: number; // 旋转角度
    public isActive: boolean; // 是否处于激活状态
    public ctf: CoordTransform; // 坐标转换
    public selected: boolean; // 是否处于选中状态
    public xLocked: boolean; // x方向缩放是否禁用
    public yLocked: boolean; // y方向缩放是否禁用
    public diagLocked: boolean; // 对角线缩放是否禁用
    public rotateLocked: boolean; // 旋转是否禁用
    public controlStyle: ControlStyle; // 控制点样式
    public controlSize: number; // 控制点大小
    public borderStyle: string; // 选中时边框样式
    public borderWidth: number; // 选中时边框线宽
    public rotateControlDistance: number; // 旋转点距离包围框矩形的距离
    private _bound?: Rectangle; // 包围框，用于存储第一次计算出的包围框

    public constructor(position: Point) {
        this.isActive = false;
        this.selected = false;
        this.xLocked = false;
        this.yLocked = false;
        this.rotateLocked = false;
        this.diagLocked = false;
        this.controlStyle = ControlStyle.Rectangle;
        this.borderStyle = "#007acc70";
        this.borderWidth = 2;
        this.controlSize = 4;
        this.rotateControlDistance = 30;
        this.ctf = new CoordTransform(position);
        this.angle = 0;
    }

    public rotate(angle: number) {
        this.angle += angle;
    }
    public getPosition() {
        return this.ctf.worldOrigin;
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
     */
    public get bound(): Rectangle {
        if (!this._bound) {
            this._bound = this.getBound();
        }
        return this._bound;
    }

    /**
     * 获得未禁用的控制点包围框（世界坐标系）
     */
    public getEnableControlPointsBound(): Rectangle[] {
        const res: Rectangle[] = [];
        // x控制点
        if (!this.xLocked) {
            res.push(this.getControlBound_lm());
            res.push(this.getControlBound_rm());
        }

        // y控制点
        if (!this.yLocked) {
            res.push(this.getControlBound_tm());
            res.push(this.getControlBound_bm());
        }

        // 顶点处控制点
        if (!this.diagLocked) {
            res.push(this.getControlBound_lt());
            res.push(this.getControlBound_rt());
            res.push(this.getControlBound_lb());
            res.push(this.getControlBound_rb());
        }

        // 旋转点
        if (!this.rotateLocked) {
            res.push(this.getControlBound_rotate());
        }
        return res;
    }

    /**
     * 获得left middle控制点包围框（世界坐标系）
     */
    public getControlBound_lm(): Rectangle {
        const controlPoint = GraphicsAssist.mid(this.bound.lt, this.bound.ld);

        return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得right middle控制点包围框（世界坐标系）
     */
    public getControlBound_rm(): Rectangle {
        const controlPoint = GraphicsAssist.mid(this.bound.rt, this.bound.rd);

        return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得top middle控制点包围框（世界坐标系）
     */
    public getControlBound_tm(): Rectangle {
        const controlPoint = GraphicsAssist.mid(this.bound.lt, this.bound.rt);

        return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得bottom middle控制点包围框（世界坐标系）
     */
    public getControlBound_bm(): Rectangle {
        const controlPoint = GraphicsAssist.mid(this.bound.ld, this.bound.rd);

        return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得left top控制点包围框（世界坐标系）
     */
    public getControlBound_lt(): Rectangle {
        const controlPoint = this.bound.lt;
        return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得left top控制点包围框（世界坐标系）
     */
    public getControlBound_rt(): Rectangle {
        const controlPoint = this.bound.rt;
        return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得left bottom控制点包围框（世界坐标系）
     */
    public getControlBound_lb(): Rectangle {
        const controlPoint = this.bound.ld;
        return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得right bottom控制点包围框（世界坐标系）
     */
    public getControlBound_rb(): Rectangle {
        const controlPoint = this.bound.rd;
        return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    }

    /**
     * 获得旋转控制点包围框（世界坐标系）
     */
    public getControlBound_rotate(): Rectangle {
        const tm = GraphicsAssist.mid(this.bound.lt, this.bound.rt);
        const controlPoint = new Point(tm.x, tm.y - this.rotateControlDistance);

        return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
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
                    // 世界坐标点
                    const ltw = new Point(worldPoint.x - this.controlSize * 0.5, worldPoint.y - this.controlSize * 0.5);
                    const ldw = new Point(worldPoint.x - this.controlSize * 0.5, worldPoint.y + this.controlSize * 0.5);
                    const rdw = new Point(worldPoint.x + this.controlSize * 0.5, worldPoint.y + this.controlSize * 0.5);
                    const rtw = new Point(worldPoint.x + this.controlSize * 0.5, worldPoint.y - this.controlSize * 0.5);
                    // 设备坐标点
                    const ltd = this.ctf.worldToDevice_Point(ltw);
                    const ldd = this.ctf.worldToDevice_Point(ldw);
                    const rdd = this.ctf.worldToDevice_Point(rdw);
                    const rtd = this.ctf.worldToDevice_Point(rtw);
                    // 绘制
                    ctx.beginPath();
                    ctx.moveTo(ltd.x, ltd.y);
                    ctx.lineTo(ldd.x, ldd.y);
                    ctx.lineTo(rdd.x, rdd.y);
                    ctx.lineTo(rtd.x, rtd.y);
                    ctx.closePath();
                    ctx.stroke();
                    break;
                case ControlStyle.Circle:
                    const ow = worldPoint;
                    const od = this.ctf.worldToDevice_Point(ow);
                    const sizeD = 1 / this.ctf.worldToDevice_Len * this.controlSize * 0.5;
                    ctx.beginPath();
                    ctx.ellipse(od.x, od.y, sizeD * 0.5, sizeD * 0.5, 0, 0, 2 * Math.PI);
                    ctx.stroke();
                    break;
                default:
                    throw new Error("unknow control style.")
            }
        }

        const boundRect = this.bound;
        ctx.strokeStyle = this.borderStyle;
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

    // public getControlPointsBound(): Point[] {
    //     throw new Error("Method not implemented.");
    // }
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
            this.drawControlPoint(ctx);
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
        const r1 = 1 / this.ctf.worldToDevice_Len * this.radiusX;
        const r2 = 1 / this.ctf.worldToDevice_Len * this.radiusY;

        ctx.beginPath();
        ctx.ellipse(o.x, o.y, r1, r2, 0, 0, 2 * Math.PI);
        if (this.filled) {
            ctx.fill();
        } else {
            ctx.stroke();
        }

        if (this.isActive) {
            this.drawBound(ctx);
            this.drawControlPoint(ctx);
        }
    }

    /**
     * 求包围框
     */
    public getBound(): Rectangle {
        return new Rectangle(new Point(this.center.x - this.radiusX, this.center.y - this.radiusY), 2 * this.radiusX, 2 * this.radiusY);
    }
}

export default Entity;
