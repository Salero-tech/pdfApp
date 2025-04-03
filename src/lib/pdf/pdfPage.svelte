<script>
    
    export let pageNumber = 1;
    export let scale = 1.0;
    export let pdfDoc;

    import { onMount } from 'svelte';
    import * as pdfjsLib from 'pdfjs-dist';

    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
    ).toString();

    let canvas;
    let ctx;
    let pageRendering = false;

    onMount(() => {
      ctx = canvas.getContext('2d');
      // Enable high quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
    });

    async function renderPage(num) {
      pageRendering = true;
      
      try {
        const page = await pdfDoc.getPage(num);
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
        pageRendering = false;
      } catch (error) {
        console.error('Error rendering page:', error);
        pageRendering = false;
      }
    }

</script>

<canvas bind:this={canvas}></canvas>
<button onclick={()=>renderPage(pageNumber)}>asdf</button>