<script lang="ts">
    import { AnnotationEditorLayer } from 'pdfjs-dist';
  import { onMount } from 'svelte';
  let { pageNumber, scale, pdfDoc } = $props();

  let canvas : HTMLCanvasElement;
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
      console.log(page.getAnnotations());
      
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }
</script>

<div class="pageContainer">
  <canvas bind:this={canvas}></canvas>
  <div bind:this={textContainer}></div>
</div>

<style>

  .pageContainer {
      position: relative;
  }
</style>