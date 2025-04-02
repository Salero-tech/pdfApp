<script>
  import { onMount } from 'svelte';
  import * as pdfjsLib from 'pdfjs-dist';
  
  // Set worker path
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();

  let drawCanvas;
  let drawCtx;
  let canvas;
  let ctx;
  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  let scale = 2.0; // Increased default scale for higher resolution
  let pdfUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";
  
  let isDrawing = false;
  let currentTool = 'pen';
  let penColor = '#000000';
  let penWidth = 2;
  let eraserWidth = 10;
  let highlighterColor = '#ffff00'; // Yellow highlighter
  let highlighterWidth = 15;

  // Add this to help detect pen vs touch
  let isPenInput = false;
  
  function detectInputType(event) {
    // pointerType will be 'pen' for stylus/pen input
    isPenInput = event.pointerType === 'pen';
  }

  function isPenOrMouseInput(event) {
    return event.pointerType === 'pen' || event.pointerType === 'mouse';
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    // Enable high quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    loadPdf();
    drawCtx = drawCanvas.getContext('2d');
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
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
      canvas.style.height = `${viewport.height}px`;
      canvas.style.width = `${viewport.width}px`;
      
      // Scale context to ensure correct drawing
      ctx.scale(pixelRatio, pixelRatio);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      pageRendering = false;
      
      // Match drawing canvas to PDF canvas
      drawCanvas.height = canvas.height;
      drawCanvas.width = canvas.width;
      drawCanvas.style.height = canvas.style.height;
      drawCanvas.style.width = canvas.style.width;
      
      // Reset the drawing context with proper scale
      drawCtx = drawCanvas.getContext('2d');
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';
      drawCtx.scale(pixelRatio, pixelRatio);

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
    clearDrawing();
    queueRenderPage(pageNum);
  }

  function onNextPage() {
    if (pageNum >= pdfDoc?.numPages) return;
    pageNum++;
    clearDrawing();
    queueRenderPage(pageNum);
  }
  
  // Zoom functions
  function zoomIn() {
    scale += 0.25;
    clearDrawing();
    queueRenderPage(pageNum);
  }
  
  function zoomOut() {
    if (scale <= 0.5) return; // Prevent zooming out too much
    scale -= 0.25;
    clearDrawing();
    queueRenderPage(pageNum);
  }

  function draw(event) {
    // Draw with pen or mouse, but not with touch
    if (!isDrawing || event.pointerType === 'touch') return;
    
    console.log('Drawing with', event.pointerType);
    const pos = getMousePos(event);
    
    if (currentTool === 'pen') {
      drawCtx.globalCompositeOperation = 'source-over';
      drawCtx.strokeStyle = penColor;
      drawCtx.lineWidth = penWidth;
      drawCtx.lineTo(pos.x, pos.y);
      drawCtx.stroke();
      drawCtx.beginPath();
      drawCtx.moveTo(pos.x, pos.y);
    } else if (currentTool === 'eraser') {
      drawCtx.clearRect(
        pos.x - eraserWidth / 2,
        pos.y - eraserWidth / 2,
        eraserWidth,
        eraserWidth
      );
    } else if (currentTool === 'highlighter') {
      drawCtx.globalCompositeOperation = 'source-over';
      drawCtx.strokeStyle = highlighterColor;
      drawCtx.lineWidth = highlighterWidth;
      drawCtx.globalAlpha = 0.3;
      drawCtx.lineTo(pos.x, pos.y);
      drawCtx.stroke();
      drawCtx.globalAlpha = 1.0;
      drawCtx.beginPath();
      drawCtx.moveTo(pos.x, pos.y);
    }
    
    // Prevent default to avoid scrolling/zooming during drawing
    if (event.pointerType === 'pen' || event.pointerType === 'mouse') {
      event.preventDefault();
    }
  }

  function stopDrawing(event) {
    if (!isDrawing) return;
    console.log('Stop drawing');
    isDrawing = false;
    drawCtx.closePath();
  }

  function startDrawing(event) {
    if (isPenOrMouseInput(event)) {
      console.log('Start drawing with', event.pointerType);
      isDrawing = true;
      const pos = getMousePos(event);
      drawCtx.beginPath();
      drawCtx.moveTo(pos.x, pos.y);
      event.preventDefault();
    }
  }

  function getMousePos(event) {
    const rect = drawCanvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width) / pixelRatio,
      y: (event.clientY - rect.top) * (canvas.height / rect.height) / pixelRatio
    };
  }

  function clearDrawing() {
    const pixelRatio = window.devicePixelRatio || 1;
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  }
</script>

<div class="pdf-container">
  <div class="canvas-container">
    <canvas bind:this={canvas}></canvas>
    <canvas bind:this={drawCanvas}
      class="drawing-canvas"
      on:pointerdown={startDrawing}
      on:pointermove={draw}
      on:pointerup={stopDrawing}
      on:pointerleave={stopDrawing}
      style:touch-action={event => event.pointerType === 'pen' ? 'none' : 'pan-y pan-x'}></canvas>
  </div>

  <div class="tool-controls">
      <button on:click={() =>  currentTool = 'pen' } class:active={currentTool === 'pen'}>Pen</button>
      <button on:click={() =>  currentTool = 'eraser' } class:active={currentTool === 'eraser'}>Eraser</button>
      <button on:click={() =>  currentTool = 'highlighter' } class:active={currentTool === 'highlighter'}>Highlighter</button>
      <button on:click={clearDrawing}>Clear</button>
  </div>
  
  <div class="controls">
    <div class="navigation">
      <button on:click={onPrevPage}>Previous</button>
      <span>Page {pageNum} of {pdfDoc?.numPages || '-'}</span>
      <button on:click={onNextPage}>Next</button>
    </div>
    
    <div class="zoom-controls">
      <button on:click={zoomOut}>-</button>
      <span>{Math.round(scale * 100)}%</span>
      <button on:click={zoomIn}>+</button>
    </div>
  </div>
</div>

<style>
  .pdf-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 10px;
  }

  .canvas-container {
    position: relative;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    overflow: auto;
    max-height: 80vh; /* Limit height and make it scrollable */
  }

  canvas {
    display: block;
    margin: 0 auto;
  }

  .drawing-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: all; /* Enable mouse events on the drawing canvas */
    /* We'll handle touch-action dynamically in JavaScript */
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .navigation, .zoom-controls, .tool-controls {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  button {
    padding: 8px 15px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #3367d6;
  }

  button.active {
    background-color: #2a56c6;
  }
</style>