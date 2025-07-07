<script lang="ts">
    import { onMount } from "svelte";
    import * as pdfjsLib from 'pdfjs-dist';
    import BackLayer from "./layers/backLayer.svelte";
    import AnnotationLayer from "./layers/annotationLayer.svelte";
    import Pdf from "./pdf.svelte";

    let { pdfDoc, pageNumber = 1, scale = 1.0 } = $props();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let page: pdfjsLib.PDFPageProxy = $state(null);

    onMount(async () => {
        page = await pdfDoc.getPage(pageNumber);
        
        const textContent = await page.getTextContent();
    });
</script>

{#if page}
<div class="relative w-fit h-fit mx-auto mb-5">
    <BackLayer {page} {scale} />
    <div class="absolute inset-0">
        <AnnotationLayer {page} {scale} />
    </div>
</div>
{/if}
