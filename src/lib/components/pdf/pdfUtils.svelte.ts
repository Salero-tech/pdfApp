import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();




export async function loadPDF(data: Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
    return await pdfjsLib.getDocument(new Uint8Array(data)).promise;
}
