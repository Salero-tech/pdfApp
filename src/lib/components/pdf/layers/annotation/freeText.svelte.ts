const lineSeparator = (typeof process !== "undefined" && process.platform === "win32") ? "\r\n" : "\n";


export function renderFreeText(annotation: any, ctx: CanvasRenderingContext2D, viewport: any) {
    const str: string = annotation.contentsObj.str || "";
    const rect = annotation.rect; // [xMin, yMin, xMax, yMax] in PDF units

    // Convert rect origin to viewport/canvas coordinates
    const [x, y] = viewport.convertToViewportPoint(rect[0], rect[3]); // top-left corner

    ctx.save();

    // Font size and name
    const fontSize = annotation.defaultAppearanceData?.fontSize || 10;
    const fontName = annotation.defaultAppearanceData?.fontName || "Arial";
    ctx.font = `${fontSize}px ${fontName}`;

    // Font color
    let color = annotation.defaultAppearanceData?.fontColor;
    if (color && typeof color === "object") {
        const r = Math.round((color[0] ?? 0) * 255);
        const g = Math.round((color[1] ?? 0) * 255);
        const b = Math.round((color[2] ?? 0) * 255);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
    } else {
        ctx.fillStyle = "black";
    }

    ctx.textBaseline = "top";

    // Split text into lines
    const lines = str.split(/\r\n|\r|\n/);
    const lineHeight = fontSize * 1.4;

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineHeight);
    }

    ctx.restore();
}
