import * as pdfjsLib from 'pdfjs-dist';
import { renderInk } from './ink.svelte';
import { renderFreeText } from './freeText.svelte';

export function renderAnnotations(annotations: any[], ctx: CanvasRenderingContext2D, viewport: any) {
    for (const annotation of annotations) {
        switch (annotation.annotationType) {
            case pdfjsLib.AnnotationType.INK:
                renderInk(annotation, ctx, viewport);
                break;
            case pdfjsLib.AnnotationType.FREETEXT:
                renderFreeText(annotation, ctx, viewport);
                break;
            default:
                console.warn(`Unsupported annotation type: ${annotation.annotationType}`);
        }
    }
}


