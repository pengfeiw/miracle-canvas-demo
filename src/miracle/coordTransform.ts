import {Point, Vector} from "./graphic";

export default class CoordTransform {
    private _worldToDevice_Len: number; // the ratio of world coord to device coord.
    private basePoint_world = new Point(0, 0); // 基点（世界坐标系）
    public constructor(scale: number = 1) {
        this._worldToDevice_Len = 1 / scale;
    }
    public get worldToDevice_Len() {
        return this._worldToDevice_Len;
    }
    public displacement = (vector: Vector) => {
        this.basePoint_world = new Point(this.basePoint_world.x + vector.x, this.basePoint_world.y + vector.y);
    };
    /**
     * 将世界坐标系点转换为设备坐标点
     * @param pointW 
     */
    public worldToDevice_Point = (pointW: Point) => {
        const dx = pointW.x * 1 / this._worldToDevice_Len;
        const dy = pointW.y * 1 / this._worldToDevice_Len;

        return new Point(this.basePoint_world.x + dx, this.basePoint_world.y + dy);
    };

    /**
     * 缩放
     * @param deviceZoomOrigin 缩放中心（设备坐标系）
     * @param zoomScale 缩放比例
     */
    public zoom = (deviceZoomOrigin: Point, zoomScale: number) => {
        this._worldToDevice_Len = this._worldToDevice_Len * 1 / zoomScale;

        // 更改基点位置
        let dx = this.basePoint_world.x - deviceZoomOrigin.x;
        let dy = this.basePoint_world.y - deviceZoomOrigin.y;
        
        dx *= zoomScale;
        dy *= zoomScale;

        this.basePoint_world = new Point(deviceZoomOrigin.x + dx, deviceZoomOrigin.y + dy);
    };
}
