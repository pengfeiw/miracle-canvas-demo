import './App.css';
import {useEffect, useState, useRef} from "react";
import {Miracle, MiracleEntity, MiracleGraphic, MiracleControl} from "miracle-canvas";
import {} from "miracle-canvas";

const {Circle, PolyShape, Image: MiracleImage} = MiracleEntity;
const {Point} = MiracleGraphic;
const {ImageControl, ControlBase} = MiracleControl;

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [miracle, setMiracle] = useState<Miracle>();

    // entity
    const [rect, setRect] = useState<MiracleEntity.PolyShape>();
    const [triangle, setTriangle] = useState<MiracleEntity.PolyShape>();
    const [circle, setCircle] = useState<MiracleEntity.Circle>();
    const [img, setImage] = useState<MiracleEntity.Image>();

    // 图形可见
    const [imgVisible, setImageVisible] = useState(true);
    const [circleVisible, setCircleVisible] = useState(true);
    const [rectVisible, setRectVisible] = useState(true);
    const [triangleVisible, setTriangleVisible] = useState(true);

    // 控制点
    const [xctrShow, setXctrShow] = useState(true);
    const [yctrShow, setYctrShow] = useState(true);
    const [diagctrShow, setDiagctrShow] = useState(true);
    const [rotatectrShow, setRotatectrShow] = useState(true);

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
            miracle.xLocked = !xctrShow;
            miracle.yLocked = !yctrShow;
            miracle.diagLocked = !diagctrShow;
            miracle.rotateLocked = !rotatectrShow;
        }
    }, [diagctrShow, miracle, rotatectrShow, xctrShow, yctrShow]);

    useEffect(() => {
        if (miracle) {
            const button1 = new ImageControl("/1.svg", {width: 115, height: 24}, ControlBase.lt, -124, 0);
            const button2 = new ImageControl("/2.svg", {width: 115, height: 24}, ControlBase.lt, -124, 28);

            button1.mouseUpHandler = () => {
                alert("button1 click");
            };
            button2.mouseUpHandler = () => {
                alert("button2 click");
            };

            const rect = new PolyShape([
                new Point(150, 30),
                new Point(200, 30),
                new Point(200, 120),
                new Point(150, 120)
            ], false);
            rect.filled = false;
            rect.closed = true;

            rect.addControl(button1, button2);

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

            const img = new MiracleImage(new Point(300, 300), "/logo192.png", {
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
            <div>
                <input type="checkbox" onClick={() => {setXctrShow(show => !show)}} checked={xctrShow} /><label>X控制</label>
                <input type="checkbox" onClick={() => {setYctrShow(show => !show)}} checked={yctrShow} /><label>Y控制</label>
                <input type="checkbox" onClick={() => {setDiagctrShow(show => !show)}} checked={diagctrShow} /><label>对角线控制</label>
                <input type="checkbox" onClick={() => {setRotatectrShow(show => !show)}} checked={rotatectrShow} /><label>旋转控制</label>
            </div>
        </>
    );
}

export default App;
