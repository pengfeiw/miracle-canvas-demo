import Entity from "./entity";
import MiracleMouseControl from "./mouse";

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

    public addEntity(...entities: Entity[]) {
        this.entities.push(...entities);

        const ctx = this.up_canvas?.getContext("2d");
        if (ctx) {
            for (let i = 0; i < entities.length; i++) {
                this.entities[i].draw(ctx);
            }
        }
    }


    public redraw() {
        const ctx = this.up_canvas?.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
            for (let i = 0; i < this.entities.length; i++) {
                this.entities[i].draw(ctx);
            }
        }
    }

    /**
     * 给up_canvas添加事件
     */
    private initCanvas() {

    }
}

export default Miracle;
