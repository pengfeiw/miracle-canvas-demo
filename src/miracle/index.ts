import Entity from "./entity";

class Miracle {
    private m_canvas: HTMLCanvasElement;
    public entities: Entity[];
    constructor(canvas: HTMLCanvasElement, entities = []) {
        this.m_canvas = canvas;
        this.entities = entities;
    }

    public addEntity(...entities: Entity[]) {
        this.entities.push(...entities);
        
        const ctx = this.m_canvas.getContext("2d");
        if (ctx !== null) {
            for (let i = 0; i < entities.length; i++) {
                this.entities[i].draw(ctx);
            }
        }
    }

    public drawAll(){
        const ctx = this.m_canvas.getContext("2d");
        if (ctx !== null) {
            for (let i = 0; i < this.entities.length; i++) {
                this.entities[i].draw(ctx);
            }
        }
    }

    /**
     * 初始化canvas, 给canvas添加事件
     */
    private initCanvas() {
        
    }
}

export default Miracle;
