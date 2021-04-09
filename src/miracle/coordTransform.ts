import {Point, Vector} from "./graphic";

interface Displacement {
    (vector: Vector): void;
    (point1: Point, point2: Point): void;
}

const movePoint = (point: Point, vector: Vector): Point => {
    return new Point(point.x + vector.x, point.y + vector.y);
};

const scalePoint = (point: Point, scaleOrigin: Point, scale: number): Point => {
    var moveVector = {x: point.x - scaleOrigin.x, y: point.y - scaleOrigin.y};
    moveVector = {x: scale * moveVector.x, y: scale * moveVector.y};
    return new Point(scaleOrigin.x + moveVector.x, scaleOrigin.y + moveVector.y);
}
export default class CoordTransform {
    private _worldOrigin: Point; // the origin of world coord.
    private _worldToDevice_Len: number; // the ratio of world coord to device coord.
    public constructor(worldOrigin: Point = new Point(0, 0), worldToDevice_Len: number = 1) {
        this._worldOrigin = worldOrigin;
        this._worldToDevice_Len = worldToDevice_Len;
    }

    public get worldToDevice_Len () {
        return this._worldToDevice_Len;
    }

    public get worldOrigin () {
        return this._worldOrigin;
    }
    public displacement: Displacement = (point1: Point | Vector, point2?: Point) => {
        const moveVector: Vector =  point2 ? new Vector(point2.x - point1.x, point2.y - point1.y) : new Vector(point1.x, point1.y);
        this._worldOrigin = movePoint(this._worldOrigin, moveVector);
    };

    public zoom = (deviceZoomOrigin: Point, scale: number) => {
        this._worldToDevice_Len = this._worldToDevice_Len * scale;
        let moveVect = {x: this._worldOrigin.x - deviceZoomOrigin.x, y: this._worldOrigin.y - deviceZoomOrigin.y};
        moveVect = {x: moveVect.x * scale, y: moveVect.y * scale};
        this._worldOrigin = new Point(deviceZoomOrigin.x + moveVect.x, deviceZoomOrigin.y + moveVect.y);
    }
    
    // convert world coord to device coord
    public worldToDevice_Point = (point: Point) => {
        let resPnt = movePoint(point, new Vector(this._worldOrigin.x, this._worldOrigin.y));
        resPnt = scalePoint(resPnt, this._worldOrigin, this._worldToDevice_Len);
        return resPnt;
    };
}
