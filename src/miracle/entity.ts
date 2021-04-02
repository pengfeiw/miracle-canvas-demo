import {Point} from "./graphic";

class Entity {
    public position: Point; // 位置
    private angle: number; // 旋转角度
    public selected: boolean; // 是否处于选中状态
    public xLocked: boolean; // x方向缩放是否禁用
    public yLocked: boolean; // y方向缩放是否禁用
    public rotateLocked: boolean; // 旋转是否禁用
    public constructor(position: Point) {
        this.selected = false;
        this.xLocked = false;
        this.yLocked = false;
        this.rotateLocked = false;
        this.position = position;
        this.angle = 0;
    }

    public rotate(angle: number) {
        this.angle += angle;
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
}

/**
 * 形状
 */
export class Shape extends Entity {
    public vertexs: Point[];
    constructor(position: Point, vertexs: Point[]) {
        super(position);
        this.vertexs = vertexs;
    }
}

export default Entity;
