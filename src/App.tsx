import './App.css';
import {useEffect, useState, useRef} from "react";
import Miracle from "./miracle";
import {Circle, PolyShape, Image} from "./miracle/entity";
import {Point} from "./miracle/graphic";

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [miracle, setMiracle] = useState<Miracle>();
    const [imgVisible, setImageVisible] = useState(true);
    const [circleVisible, setCircleVisible] = useState(true);
    const [rectVisible, setRectVisible] = useState(true);
    const [triangleVisible, setTriangleVisible] = useState(true);

    // entity
    const [rect, setRect] = useState<PolyShape>();
    const [triangle, setTriangle] = useState<PolyShape>();
    const [circle, setCircle] = useState<Circle>();
    const [img, setImage] = useState<Image>();

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
        if (rect) {
            rect.visible = rectVisible;
        }
        if (triangle) {
            triangle.visible = triangleVisible;
        }
        if (img) {
            img.visible = imgVisible;
        }
        if (circle) {
            circle.visible = circleVisible;
        }
        miracle?.redraw();
    }, [imgVisible, circleVisible, rectVisible, triangleVisible, rect, triangle, img, circle, miracle]);

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

            const circle = new Circle(new Point(400, 400), 50);
            circle.strokeStyle = "green";

            const triangle = new PolyShape([
                new Point(100, 100),
                new Point(150, 150),
                new Point(100, 200)
            ]);
            triangle.filled = true;
            triangle.closed = true;
            triangle.fillStyle = "gray";

            const img = new Image(new Point(200, 300), "/logo192.png", {
                height: 150,
                width: 180
            });

            miracle.addEntity(circle, rect, triangle, img);
            setRect(rect);
            setTriangle(triangle);
            setImage(img);
            setCircle(circle);
        }
    }, [miracle]);

    return (
        <>
            <div>
                <canvas className="canvas" ref={canvasRef} />
            </div>
            <div>
                <input id="rect-checkbox" type="checkbox" onClick={() => {setRectVisible(visible => !visible)}} checked={rectVisible} /><label htmlFor="rect-checkbox">矩形</label>
                <input id="triangle-checkbox" type="checkbox" onClick={() => {setTriangleVisible(visible => !visible)}} checked={triangleVisible} /><label htmlFor="triangle-checkbox">三角形</label>
                <input id="circle-checkbox" type="checkbox" onClick={() => {setCircleVisible(visible => !visible)}} checked={circleVisible} /><label htmlFor="circle-checkbox">圆形</label>
                <input id="image-checkbox" type="checkbox" onClick={() => {setImageVisible(visible => !visible)}} checked={imgVisible} /><label htmlFor="image-checkbox">图片</label>
            </div>
        </>
    );
}

export default App;
