import {Point, Vector} from "./graphic";

export default class CoordTransform {
    private _worldToDevice_Len_X: number; // x方向：这里叫x方向其实是不准确的，应该是主方向，在角度为0的时候为x方向。
    private _worldToDevice_Len_Y: number; // y方向：这里叫y方向其实是不准确的，应该是副方向，在角度为0的时候为y方向。
    private angle: number; // 旋转角度
    private basePoint_world = new Point(0, 0); // 基点（世界坐标系）

    /**
     * 设置基点（图的旋转中心）
     * @param point 
     */
    public get base() {
        return this.basePoint_world;
    }
    public set base(value: Point) {
        this.basePoint_world = value;
    }
    public constructor(scale: number = 1) {
        this._worldToDevice_Len_X = 1 / scale;
        this._worldToDevice_Len_Y = 1 / scale;
        this.angle = 0;
    }
    public get worldToDevice_Len_X() {
        return this._worldToDevice_Len_X;
    }
    public get worldToDevice_Len_Y() {
        return this._worldToDevice_Len_Y;
    }
    public displacement = (vector: Vector) => {
        this.basePoint_world = new Point(this.basePoint_world.x + vector.x, this.basePoint_world.y + vector.y);
    };
    /**
     * 将世界坐标系点转换为设备坐标点
     * @param pointW 
     */
    public worldToDevice_Point = (pointW: Point) => {
        const dx = pointW.x * 1 / this._worldToDevice_Len_X;
        const dy = pointW.y * 1 / this._worldToDevice_Len_Y;

        return new Point(this.basePoint_world.x + dx, this.basePoint_world.y + dy);
    };

    /**
     * 缩放
     * @param deviceZoomOrigin 缩放中心（设备坐标系）
     * @param zoomScale 缩放比例
     */
    public zoom = (deviceZoomOrigin: Point, zoomScale: number) => {
        this._worldToDevice_Len_X = this._worldToDevice_Len_X * 1 / zoomScale;
        this._worldToDevice_Len_Y = this._worldToDevice_Len_Y * 1 / zoomScale;

        // 更改基点位置
        let dx = this.basePoint_world.x - deviceZoomOrigin.x;
        let dy = this.basePoint_world.y - deviceZoomOrigin.y;
        
        dx *= zoomScale;
        dy *= zoomScale;

        this.basePoint_world = new Point(deviceZoomOrigin.x + dx, deviceZoomOrigin.y + dy);
    };

    /**
     * 缩放主方向（X方向）,副方向（Y方向）不变
     * @param deviceZoomOrigin 缩放中心
     * @param zoomScale 缩放比例
     */
    public zoomX = (deviceZoomOrigin: Point, zoomScale: number) => {
        this._worldToDevice_Len_X = this._worldToDevice_Len_X * 1 / zoomScale;

        let dx = this.basePoint_world.x - deviceZoomOrigin.x;
        dx *= zoomScale;
        this.basePoint_world = new Point(deviceZoomOrigin.x + dx, this.basePoint_world.y);
    }

    /**
     * 缩放副方向（Y方向），主方向（X方向）不变
     * @param deviceZoomOrigin 缩放中心
     * @param zoomScale 缩放比例
     */
    public zoomY = (deviceZoomOrigin: Point, zoomScale: number) => {
        this._worldToDevice_Len_Y = this._worldToDevice_Len_Y * 1 / zoomScale;

        // 更改基点位置
        let dy = this.basePoint_world.y - deviceZoomOrigin.y;
        dy *= zoomScale;
        this.basePoint_world = new Point(this.basePoint_world.x, deviceZoomOrigin.y + dy);
    }
}
