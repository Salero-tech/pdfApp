<script lang="ts">
    import { onMount } from "svelte";
    import * as pdfjsLib from 'pdfjs-dist';

    let { page, scale = 1.0 } = $props();;



    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    onMount(() => {
        ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        renderPage();
    });

    async function renderPage() {
        try {
            const viewport = page.getViewport({ scale });
            
            // Use device pixel ratio for better rendering on high DPI displays
            const pixelRatio = window.devicePixelRatio || 1;
            
            // Set display size (css pixels)
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Scale context to ensure correct drawing
            ctx.scale(pixelRatio, pixelRatio);
            
            await page.render({
                canvasContext: ctx,
                viewport: viewport,
                annotationMode: pdfjsLib.AnnotationMode.DISABLE, 
            }).promise;
      
        } catch (error) {
            console.error('Error rendering page:', error);
        }
    }
</script>


<canvas bind:this={canvas} ></canvas>

