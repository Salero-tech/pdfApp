<script lang="ts">
    import { onMount } from 'svelte';
    let { pageNumber, scale, pdfDoc } = $props();

    let canvas : HTMLCanvasElement;
    let drawCanvase: HTMLCanvasElement;
    let textContainer: HTMLDivElement = $state();
    let ctx: CanvasRenderingContext2D;

    onMount(() => {
        ctx = canvas.getContext('2d');
        // Enable high quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        renderPage();
    });

    async function renderPage() {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        // Use device pixel ratio for better rendering on high DPI displays
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.height = viewport.height * pixelRatio;
        canvas.width = viewport.width * pixelRatio;
        
        // Set display size (css pixels)
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Scale context to ensure correct drawing
        ctx.scale(pixelRatio, pixelRatio);
  
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        const textContent = await page.getTextContent();
      

        // Use PDF.js text layer builder
        const renderTextLayer = await import('pdfjs-dist/web/pdf_viewer.mjs');
        const textLayer = new renderTextLayer.TextLayerBuilder({
          pdfPage: page
        });
        await textLayer.render({
          textContentParams: textContent,
          viewport: viewport
        });
        textContainer.append(textLayer.div);
        
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    }
</script>

<div class="pageContainer">
    <canvas bind:this={canvas}></canvas>
    <canvas bind:this={drawCanvase} class="drawCanvas"></canvas>
    <div bind:this={textContainer}></div>
</div>

<style>
    @import 'pdfjs-dist/web/pdf_viewer.css';

    .pageContainer {
        position: relative;
    }
</style>