import {Point} from "./graphic";
import CoordTransform from "./coordTransform";

abstract class Entity {
    private angle: number; // 旋转角度
    protected ctf: CoordTransform; // 坐标转换
    public selected: boolean; // 是否处于选中状态
    public xLocked: boolean; // x方向缩放是否禁用
    public yLocked: boolean; // y方向缩放是否禁用
    public rotateLocked: boolean; // 旋转是否禁用
    public constructor(position: Point) {
        this.selected = false;
        this.xLocked = false;
        this.yLocked = false;
        this.rotateLocked = false;
        this.ctf = new CoordTransform(position);
        this.angle = 0;
    }

    public rotate(angle: number) {
        this.angle += angle;
    }
    public getPosition() {
        return this.ctf.worldOrigin;
    }

    public abstract draw(ctx: CanvasRenderingContext2D): void;
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
        if (this.vertexs.length < 2) {
            return;
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
    }
}

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
    }
}

export default Entity;
