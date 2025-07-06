export function renderInk(annotation: any, ctx: CanvasRenderingContext2D, viewport: any) {
    if (!annotation.inkLists) return;
    ctx.save();

    if (annotation.color) {
        ctx.strokeStyle = `rgba(${annotation.color[0]}, ${annotation.color[1]}, ${annotation.color[2]}, ${annotation.color[3] || 1})`;
    } else {
        ctx.strokeStyle = 'black';
    }

    ctx.lineWidth = annotation.borderStyle.width || 1.0;
    ctx.globalAlpha = annotation.opacity || 1.0;
    if (annotation.it === "InkHighlight") ctx.globalAlpha = 0.8;

    for (const stroke of annotation.inkLists) {
        if (stroke.length < 4) continue; // At least two points (4 numbers)
        ctx.beginPath();

        // First point
        let [x0, y0] = viewport.convertToViewportPoint(stroke[0], stroke[1]);
        ctx.moveTo(x0, y0);

        // Smoothing with quadraticCurveTo
        for (let i = 2; i < stroke.length - 2; i += 2) {
            const [x1, y1] = viewport.convertToViewportPoint(stroke[i], stroke[i + 1]);
            const [x2, y2] = viewport.convertToViewportPoint(stroke[i + 2], stroke[i + 3]);
            // Control point is the current point, end point is the midpoint between current and next
            ctx.quadraticCurveTo(
                x1, y1,
                (x1 + x2) / 2, (y1 + y2) / 2
            );
        }
        // Draw last segment as a line
        if (stroke.length >= 4) {
            const [xLast, yLast] = viewport.convertToViewportPoint(
                stroke[stroke.length - 2],
                stroke[stroke.length - 1]
            );
            ctx.lineTo(xLast, yLast);
        }

        ctx.stroke();
    }
    ctx.restore();
}