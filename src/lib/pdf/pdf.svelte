<script>
    import { onMount } from 'svelte';
    import * as pdfjsLib from 'pdfjs-dist';
    
    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  
    let canvas;
    let ctx;
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 2.0; // Increased default scale for higher resolution
    let pdfUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";
    
    onMount(() => {
      ctx = canvas.getContext('2d');
      // Enable high quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      loadPdf();
    });
  
    async function loadPdf(url = pdfUrl) {
      try {
        pageNum = 1;
        pdfDoc = await pdfjsLib.getDocument(url).promise;
        renderPage(pageNum);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }
  
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
  
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      } catch (error) {
        console.error('Error rendering page:', error);
        pageRendering = false;
      }
    }
  
    function queueRenderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }
  
    function onPrevPage() {
      if (pageNum <= 1) return;
      pageNum--;
      queueRenderPage(pageNum);
    }
  
    function onNextPage() {
      if (pageNum >= pdfDoc?.numPages) return;
      pageNum++;
      queueRenderPage(pageNum);
    }
    
    // Zoom functions
    function zoomIn() {
      scale += 0.25;
      queueRenderPage(pageNum);
    }
    
    function zoomOut() {
      if (scale <= 0.5) return; // Prevent zooming out too much
      scale -= 0.25;
      queueRenderPage(pageNum);
    }
  </script>
  
<canvas bind:this={canvas}></canvas>
  
  <style>
    canvas {
    }
  </style>