export class Point {
    public x: number;
    public y: number;
    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
export class Vector {
    public x: number;
    public y: number;
    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Rectangle {
    public location: Point; // 左上角坐标
    public width: number; // 宽度
    public height: number; // 高度

    /**
     * 左上角点
     */
    public get lt() {
        return this.location;
    }

    /**
     * 左下角点
     */
    public get ld() {
        return new Point(this.location.x, this.location.y + this.height);
    }

    /**
     * 右上角点
     */
    public get rt() {
        return new Point(this.location.x + this.width, this.location.y);
    }

    /**
     * 右下角点
     */
    public get rd() {
        return new Point(this.location.x + this.width, this.location.y + this.height);
    }

    /**
     * @param location 矩形的位置，左上角坐标
     * @param w 矩形的宽度
     * @param h 矩形的高度
     */
    public constructor(location: Point, w: number, h: number) {
        this.location = location;
        this.width = w;
        this.height = h;
    }

    /**
     * 求一组Point构成的包围框
     * @param points 点数组
     */
    public static bound(points: Point[]) {
        if (points.length <= 1) {
            throw new Error("Point的个数不能小于2");
        }
        let max_x = points[0].x;
        let max_y = points[0].y;
        let min_x = points[0].x;
        let min_y = points[0].y;
        for (let i = 1; i < points.length; i++) {
            max_x = Math.max(max_x, points[i].x);
            max_y = Math.max(max_y, points[i].y);
            min_x = Math.min(min_x, points[i].x);
            min_y = Math.min(min_y, points[i].y);
        }
        const lt = new Point(min_x, min_y);
        const w = max_x - min_x;
        const h = max_y - min_y;
        return new Rectangle(lt, w, h);
    }

    /**
     * 求一组Rectangle构成的包围框矩形
     * @param rects 一组矩形
     */
    public static Union(rects: Rectangle[]) {
        if (rects.length < 1) {
            throw new Error("Rectangle的个数不能小于1");
        }

        const points: Point[] = [];

        for (let i = 0; i < rects.length; i++) {
            points.push(rects[i].lt, rects[i].rd);
        }

        return Rectangle.bound(points);
    }
}

export namespace GraphicsAssist {
    /**
     * 求两个点的中点
     */
    export const mid = (point1: Point, point2: Point) => {
        return new Point(0.5 * (point1.x + point2.x), 0.5 * (point1.y + point2.y));
    };
}
