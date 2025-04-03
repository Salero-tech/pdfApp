<script>
    import { onMount } from 'svelte';

    export let pageNumber = 1;
    export let scale = 1.0;
    export let pdfDoc;

    let canvas;
    let ctx;

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
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    }

</script>

<canvas bind:this={canvas}></canvas>