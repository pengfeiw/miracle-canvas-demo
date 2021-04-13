import Entity from "./entity";
import MiracleMouseControl from "./mouse";
import {ControlStyle} from "./entityCollection";

class Miracle {
    private low_canvas: HTMLCanvasElement;
    private up_canvas: HTMLCanvasElement | null;
    public entities: Entity[];
    private mouseControl?: MiracleMouseControl;
    constructor(canvas: HTMLCanvasElement, entities = []) {
        this.entities = entities;
        this.low_canvas = canvas;
        const parentElement = canvas.parentElement;

        this.up_canvas = null;
        if (parentElement) {
            parentElement.removeChild(canvas);
            this.up_canvas = canvas.cloneNode(true) as HTMLCanvasElement;
            const canvasContainer = document.createElement("div");
            canvasContainer.style.backgroundColor = "transparent";
            canvasContainer.style.display = "relative";
            canvasContainer.style.height = canvas.style.height;
            canvasContainer.style.width = canvas.style.width;
            canvasContainer.style.display = "inline-block";
            canvasContainer.style.border = canvas.style.border;
            canvasContainer.className = "miracle-container";

            this.up_canvas.style.position = "absolute";
            this.up_canvas.style.left = "0";
            this.up_canvas.style.top = "0";
            this.up_canvas.style.backgroundColor = "transparent";
            this.up_canvas.className = `up-canvas ${this.up_canvas.className}`;

            this.low_canvas.style.position = "absolute";
            this.low_canvas.style.left = "0";
            this.low_canvas.style.top = "0";
            this.low_canvas.className = `lower-canvas ${this.low_canvas.className}`;

            canvasContainer.appendChild(this.low_canvas);
            canvasContainer.appendChild(this.up_canvas);
            parentElement.appendChild(canvasContainer);
            this.mouseControl = new MiracleMouseControl(this.entities, this.up_canvas);
        }
    }

    //#region 控制点
    /**
     * 左上控制点
     */
    public get controlLt() {
        return this.mouseControl?.showControlLt || false;
    };
    /**
     * 左上控制点
     */
    public set controlLt(value: boolean) {
        if (this.mouseControl) {
            this.mouseControl.showControlLt = value;
        } else {
            throw new Error("micral的mouseControl为undefined，无法设置该值");
        }
    }
    /**
     * 中上控制点
     */
    public get controlTm() {
        return this.mouseControl?.showControlTm || false;
    };
    /**
     * 中上控制点
     */
    public set controlTm(value: boolean) {
        if (this.mouseControl) {
            this.mouseControl.showControlTm = value;
        } else {
            throw new Error("micral的mouseControl为undefined，无法设置该值");
        }
    }

    /**
     * 右上控制点
     */
    public get controlRt() {
        return this.mouseControl?.showControlRt || false;
    };
    /**
     * 右上控制点
     */
    public set controlRt(value: boolean) {
        if (this.mouseControl) {
            this.mouseControl.showControlRt = value;
        } else {
            throw new Error("micral的mouseControl为undefined，无法设置该值");
        }
    }

    /**
     * 左中控制点
     */
    public get controlLm() {
        return this.mouseControl?.showControlLm || false;
    };
    /**
     * 左中控制点
     */
    public set controlLm(value: boolean) {
        if (this.mouseControl) {
            this.mouseControl.showControlLm = value;
        } else {
            throw new Error("micral的mouseControl为undefined，无法设置该值");
        }
    }

    /**
     * 左下控制点
     */
    public get controlLb() {
        return this.mouseControl?.showControlLb || false;
    };
    /**
     * 左下控制点
     */
    public set controlLb(value: boolean) {
        if (this.mouseControl) {
            this.mouseControl.showControlLb = value;
        } else {
            throw new Error("micral的mouseControl为undefined，无法设置该值");
        }
    }

    /**
     * 下中控制点
     */
    public get controlBm() {
        return this.mouseControl?.showControlBm || false;
    };
    /**
     * 下中控制点
     */
    public set controlBm(value: boolean) {
        if (this.mouseControl) {
            this.mouseControl.showControlBm = value;
        } else {
            throw new Error("micral的mouseControl为undefined，无法设置该值");
        }
    }
    /**
     * 右下控制点
     */
    public get controlRb() {
        return this.mouseControl?.showControlRb || false;
    };
    /**
     * 右下控制点
     */
    public set controlRb(value: boolean) {
        if (this.mouseControl) {
            this.mouseControl.showControlRb = value;
        } else {
            throw new Error("micral的mouseControl为undefined，无法设置该值");
        }
    }
    /**
     * 右中控制点
     */
    public get controlRm() {
        return this.mouseControl?.showControlRm || false;
    };
    /**
     * 右中控制点
     */
    public set controlRm(value: boolean) {
        if (this.mouseControl) {
            this.mouseControl.showControlRm = value;
        } else {
            throw new Error("micral的mouseControl为undefined，无法设置该值");
        }
    }
    /**
     * 旋转控制点
     */
    public get controlRotate() {
        return this.mouseControl?.showControlRotate || false;
    };
    /**
     * 旋转控制点
     */
    public set controlRotate(value: boolean) {
        if (this.mouseControl) {
            this.mouseControl.showControlRotate = value;
        } else {
            throw new Error("micral的mouseControl为undefined，无法设置该值");
        }
    }

    /**
     * 控制点样式
     */
    public get controlStyle() {
        if (this.mouseControl) {
            return this.mouseControl.controlStyle
        } else {
            throw new Error("mouseControl为undefined, 无法获得该值");
        }
    }
    /**
     * 控制点样式
     */
    public set controlStyle(style: ControlStyle) {
        if (this.mouseControl) {
            this.mouseControl.controlStyle = style;
        }
    }

    /**
     * 控制点大小
     */
    public get controlSize() {
        if (this.mouseControl) {
            return this.mouseControl.controlSize
        } else {
            throw new Error("mouseControl为undefined, 无法获得该值");
        }
    }
    /**
     * 控制点大小
     */
    public set controlSize(value: number) {
        if (this.mouseControl) {
            this.mouseControl.controlSize = value;
        }
    }
    //#endregion

    public addEntity(...entities: Entity[]) {
        this.entities.push(...entities);

        const ctx = this.up_canvas?.getContext("2d");
        if (ctx) {
            for (let i = 0; i < entities.length; i++) {
                this.entities[i].draw(ctx);
            }
        }
    }

    public drawAll() {
        const ctx = this.up_canvas?.getContext("2d");
        if (ctx) {
            for (let i = 0; i < this.entities.length; i++) {
                this.entities[i].draw(ctx);
            }
        }
    }
}

export default Miracle;
