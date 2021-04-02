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
    }

    public draw(){}
}

export default Miracle;
