import './App.css';
import {useEffect, useState, useRef} from "react";
import Miracle from "./miracle";
import {Circle, PolyShape} from "./miracle/entity";
import {Point} from "./miracle/graphic";

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [miracle, setMiracle] = useState<Miracle>();
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const size = 800;
            canvas.width = size;
            canvas.height = size;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
            setMiracle(new Miracle(canvas));
        }
    }, [canvasRef]);

    useEffect(() => {
        if (miracle) {
            const rect = new PolyShape([
                new Point(150, 30),
                new Point(200, 30),
                new Point(200, 120),
                new Point(150, 120)
            ], false);
            rect.filled = false;
            rect.closed = true;
            const circle = new Circle(new Point(400, 400), 300);
            circle.strokeStyle = "green";
            miracle.addEntity(rect, circle);
        }
    }, [miracle]);
    return (
        <canvas className="canvas" ref={canvasRef} />
    );
}

export default App;
