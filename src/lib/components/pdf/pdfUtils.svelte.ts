import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();




export async function loadPDF(data: Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
    return await pdfjsLib.getDocument(new Uint8Array(data)).promise;
}



export function createPdfStorage(pdf:pdfjsLib.PDFDocumentProxy) {
    let pdfDoc = $state(pdf);
    let scale = $state(1);


    function destroy() {
        pdfDoc.destroy();
        pdfDoc = null;
        scale = 1;
    }

    function setupCanvas(canvas: HTMLCanvasElement, page: pdfjsLib.PDFPageProxy) {
        let ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const viewport = page.getViewport({ scale });
            
        // Use device pixel ratio for better rendering on high DPI displays
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Set display size (css pixels)
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Scale context to ensure correct drawing
        ctx.scale(pixelRatio, pixelRatio);
    }


    return {
        get doc() {return pdfDoc},
        get scale() {return scale},
        destroy,
        setupCanvas,

    }
}