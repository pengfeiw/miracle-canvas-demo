import './App.css';
import React, {useEffect, useRef} from "react";

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const size = 800;
            canvas.width = size;
            canvas.height = size;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
        }
    }, [canvasRef]);
    return (
        <canvas className="canvas" ref={canvasRef} />
    );
}

export default App;
