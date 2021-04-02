import './App.css';
import {useEffect, useState, useRef} from "react";
import Miracle from "./miracle";
import {Shape} from "./miracle/entity";
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
            const rect = new Shape(new Point(100, 100), [
                new Point(0, 0),
                new Point(200, 0),
                new Point(200, 100),
                new Point(0, 100)
            ], true);
            miracle.addEntity(rect);
        }
    }, [miracle]);
    return (
        <canvas className="canvas" ref={canvasRef} />
    );
}

export default App;
