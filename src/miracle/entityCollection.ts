import {Point, Rectangle, GraphicsAssist} from "./graphic";
import Entity from "./entity";
import CoordTransform from "./coordTransform";

export enum ControlStyle {
    Rectangle = 1,
    Circle = 2
}

/**
 * 一组entity集合, 附加绘制控制点
 */
export class EntityCollection {
    public ctf: CoordTransform; // 坐标转换
    public entities: Entity[];
    public showControlLt = true; // 左上控制点
    public showControlTm = true; // 中上控制点
    public showControlRt = true; // 右上控制点
    public showControlLm = true; // 左中控制点
    public showControlLb = true; // 左下控制点
    public showControlBm = true; // 下中控制点
    public showControlRb = true; // 右下控制点
    public showControlRm = true; // 右中控制点
    public showControlRotate = true; // 旋转控制点
    public controlStyle = ControlStyle.Rectangle; // 控制点样式
    public controlSize = 6; // 控制点大小
    public constructor(entities: Entity[]) {
        this.entities = entities;
        this.ctf = new CoordTransform(new Point(0, 0));
    }

    public draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(ctx);
        }

        // 绘制控制点
        const boundD = this.getEntitesBound_device();

    }

    //#region 获得控制点位置
    // /**
    //  * 获得left middle控制点包围框（世界坐标系）
    //  */
    // public getControlBound_lm(): Rectangle {
    //     const controlPoint = GraphicsAssist.mid(this.bound.lt, this.bound.ld);

    //     return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    // }

    // /**
    //  * 获得right middle控制点包围框（世界坐标系）
    //  */
    // public getControlBound_rm(): Rectangle {
    //     const controlPoint = GraphicsAssist.mid(this.bound.rt, this.bound.rd);

    //     return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    // }

    // /**
    //  * 获得top middle控制点包围框（世界坐标系）
    //  */
    // public getControlBound_tm(): Rectangle {
    //     const controlPoint = GraphicsAssist.mid(this.bound.lt, this.bound.rt);

    //     return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    // }

    // /**
    //  * 获得bottom middle控制点包围框（世界坐标系）
    //  */
    // public getControlBound_bm(): Rectangle {
    //     const controlPoint = GraphicsAssist.mid(this.bound.ld, this.bound.rd);

    //     return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    // }

    // /**
    //  * 获得left top控制点包围框（世界坐标系）
    //  */
    // public getControlBound_lt(): Rectangle {
    //     const controlPoint = this.bound.lt;
    //     return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    // }

    // /**
    //  * 获得left top控制点包围框（世界坐标系）
    //  */
    // public getControlBound_rt(): Rectangle {
    //     const controlPoint = this.bound.rt;
    //     return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    // }

    // /**
    //  * 获得left bottom控制点包围框（世界坐标系）
    //  */
    // public getControlBound_lb(): Rectangle {
    //     const controlPoint = this.bound.ld;
    //     return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    // }

    // /**
    //  * 获得right bottom控制点包围框（世界坐标系）
    //  */
    // public getControlBound_rb(): Rectangle {
    //     const controlPoint = this.bound.rd;
    //     return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    // }

    // /**
    //  * 获得旋转控制点包围框（世界坐标系）
    //  */
    // public getControlBound_rotate(): Rectangle {
    //     const tm = GraphicsAssist.mid(this.bound.lt, this.bound.rt);
    //     const controlPoint = new Point(tm.x, tm.y - this.rotateControlDistance);

    //     return new Rectangle(new Point(controlPoint.x - this.controlSize * 0.5, controlPoint.y - this.controlSize * 0.5), this.controlSize, this.controlSize);
    // }
    //#endregion

    /**
     * 获得设备坐标系下的状态为active的entity的联合包围框
     */
    public getEntitesBound_device() {
        if (this.entities.length === 0) {
            return new Rectangle(new Point(0, 0), 0, 0);
        }

        const boundsD = this.entities.map((ent) => {
            const boundW = ent.bound;
            const boundD = new Rectangle(ent.ctf.worldToDevice_Point(boundW.location), 1 / ent.ctf.worldToDevice_Len * boundW.width,
                1 / ent.ctf.worldToDevice_Len * boundW.height);
            return boundD;
        });
        const unionBoundD = Rectangle.union(boundsD);
        return unionBoundD;
    }
}
