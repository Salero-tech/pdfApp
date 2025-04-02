<script>
  import { onMount } from 'svelte';
  import * as pdfjsLib from 'pdfjs-dist';

  // Set the PDF.js worker path
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();

  // Global PDF settings
  let pdfUrl =
    "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";
  let pdfDoc = null;
  let scale = 2.0; // default scale
  // Global drawing tool settings
  let currentTool = 'pen'; // "pen", "eraser", or "highlighter"
  let penColor = '#000000';
  let penWidth = 2;
  let eraserWidth = 10;
  let highlighterColor = '#ffff00';
  let highlighterWidth = 15;

  // We'll store our pages (each page object holds its own canvases and annotation paths)
  let loadedPages = [];
  // Reference to the scrollable container
  let scrollContainer;

  // --- Dynamic Page Loading Functions ---

  // Loads a single page if not already loaded
  async function loadPage(pageNum) {
    if (loadedPages.find(p => p.pageNum === pageNum)) return;
    // Create container for the page
    let pageContainer = document.createElement('div');
    pageContainer.className = "page-container";

    // Create the PDF canvas (for rendered PDF content)
    let pdfCanvas = document.createElement('canvas');
    pdfCanvas.className = "pdf-canvas";

    // Create the drawing canvas (for annotations)
    let drawCanvas = document.createElement('canvas');
    drawCanvas.className = "drawing-canvas";

    // Append canvases to the page container
    pageContainer.appendChild(pdfCanvas);
    pageContainer.appendChild(drawCanvas);
    // Append the page container to the scroll container
    scrollContainer.appendChild(pageContainer);

    // Create a page object that stores relevant information
    let pageObj = {
      pageNum,
      container: pageContainer,
      pdfCanvas,
      drawCanvas,
      paths: [],        // persistent annotations for this page
      isDrawing: false,
      currentPath: null
    };
    loadedPages.push(pageObj);
    // Keep loadedPages sorted by pageNum
    loadedPages.sort((a, b) => a.pageNum - b.pageNum);

    await renderPdfPage(pageObj);
  }

  // Renders a PDF page on its PDF canvas and sets up the drawing canvas
  async function renderPdfPage(pageObj) {
    try {
      const page = await pdfDoc.getPage(pageObj.pageNum);
      const viewport = page.getViewport({ scale });
      const pixelRatio = window.devicePixelRatio || 1;

      // --- Render PDF content ---
      let pdfCanvas = pageObj.pdfCanvas;
      pdfCanvas.height = viewport.height * pixelRatio;
      pdfCanvas.width = viewport.width * pixelRatio;
      pdfCanvas.style.height = `${viewport.height}px`;
      pdfCanvas.style.width = `${viewport.width}px`;
      const ctx = pdfCanvas.getContext('2d');
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      await page.render({ canvasContext: ctx, viewport }).promise;

      // --- Setup drawing canvas ---
      let drawCanvas = pageObj.drawCanvas;
      drawCanvas.height = pdfCanvas.height;
      drawCanvas.width = pdfCanvas.width;
      drawCanvas.style.height = pdfCanvas.style.height;
      drawCanvas.style.width = pdfCanvas.style.width;
      const dCtx = drawCanvas.getContext('2d');
      dCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      dCtx.lineCap = 'round';
      dCtx.lineJoin = 'round';

      // --- Attach pointer event handlers for drawing ---
      drawCanvas.addEventListener('pointerdown', e => pagePointerDown(e, pageObj));
      drawCanvas.addEventListener('pointermove', e => pagePointerMove(e, pageObj));
      drawCanvas.addEventListener('pointerup', e => pagePointerUp(e, pageObj));
      drawCanvas.addEventListener('pointerleave', e => pagePointerUp(e, pageObj));

      // Redraw any saved annotations for this page
      redrawPageAnnotations(pageObj);
    } catch (err) {
      console.error('Error rendering page', pageObj.pageNum, err);
    }
  }

  // When scale changes (via pinch zoom or controls), re-render all loaded pages
  function reRenderAllPages() {
    for (const page of loadedPages) {
      renderPdfPage(page);
    }
  }

  // --- Annotation/Drawing Functions (per page) ---

  // Helper: Convert pointer event coordinates to normalized (0..1) coordinates
  function getNormalizedPosition(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  }

  function pagePointerDown(e, pageObj) {
    // Do not start drawing on touch – let the container handle pinch zoom/panning
    if (e.pointerType === 'touch') return;
    if (e.pointerType === 'pen' || e.pointerType === 'mouse') {
      e.preventDefault();
      pageObj.isDrawing = true;
      const normPos = getNormalizedPosition(e, pageObj.drawCanvas);
      pageObj.currentPath = {
        tool: currentTool,
        color: currentTool === 'pen'
          ? penColor
          : (currentTool === 'highlighter' ? highlighterColor : '#000000'),
        width: currentTool === 'pen'
          ? penWidth
          : (currentTool === 'highlighter' ? highlighterWidth : eraserWidth),
        alpha: currentTool === 'highlighter' ? 0.3 : 1.0,
        points: [normPos]
      };
      pageObj.paths.push(pageObj.currentPath);
    }
  }

  function pagePointerMove(e, pageObj) {
    if (e.pointerType === 'touch') return;
    if (!pageObj.isDrawing) return;
    e.preventDefault();
    const normPos = getNormalizedPosition(e, pageObj.drawCanvas);
    pageObj.currentPath.points.push(normPos);
    redrawPageAnnotations(pageObj);
  }

  function pagePointerUp(e, pageObj) {
    if (e.pointerType === 'touch') return;
    if (!pageObj.isDrawing) return;
    e.preventDefault();
    pageObj.isDrawing = false;
    redrawPageAnnotations(pageObj);
  }

  // Clears and re-draws all annotation paths for a given page
  function redrawPageAnnotations(pageObj) {
    const dCtx = pageObj.drawCanvas.getContext('2d');
    dCtx.clearRect(0, 0, pageObj.drawCanvas.width, pageObj.drawCanvas.height);
    for (const path of pageObj.paths) {
      drawPath(pageObj, path);
    }
  }

  // Draws a single stored annotation path on a page’s drawing canvas
  function drawPath(pageObj, path) {
    if (path.points.length < 2) return;
    const dCtx = pageObj.drawCanvas.getContext('2d');
    dCtx.save();
    // Use destination-out composite mode for eraser strokes
    if (path.tool === 'eraser') {
      dCtx.globalCompositeOperation = 'destination-out';
    } else {
      dCtx.globalCompositeOperation = 'source-over';
    }
    dCtx.strokeStyle = path.color;
    dCtx.lineWidth = path.width;
    dCtx.globalAlpha = path.alpha;
    dCtx.beginPath();
    const first = path.points[0];
    dCtx.moveTo(first.x * pageObj.drawCanvas.width, first.y * pageObj.drawCanvas.height);
    for (let i = 1; i < path.points.length; i++) {
      const pt = path.points[i];
      dCtx.lineTo(pt.x * pageObj.drawCanvas.width, pt.y * pageObj.drawCanvas.height);
    }
    dCtx.stroke();
    dCtx.restore();
  }

  // --- Container Touch Handlers for Pinch Zoom ---

  let containerInitialPinchDistance = 0;
  let containerInitialScale = scale;

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      containerInitialPinchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      containerInitialScale = scale;
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const newScale = containerInitialScale * (currentDistance / containerInitialPinchDistance);
      scale = Math.max(0.5, Math.min(newScale, 5));
      reRenderAllPages();
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length < 2) {
      containerInitialPinchDistance = 0;
    }
  }

  // --- Scroll Handler for Dynamic (Infinite) Loading ---

  function handleScroll() {
    const threshold = 300; // px threshold from bottom/top
    const scrollTop = scrollContainer.scrollTop;
    const containerHeight = scrollContainer.clientHeight;
    const scrollHeight = scrollContainer.scrollHeight;
    // If near bottom, load next page (if any)
    if (scrollTop + containerHeight > scrollHeight - threshold) {
      let maxLoaded = Math.max(...loadedPages.map(p => p.pageNum));
      if (maxLoaded < pdfDoc.numPages) {
        loadPage(maxLoaded + 1);
      }
    }
    // If near top, load previous page (if any)
    if (scrollTop < threshold) {
      let minLoaded = Math.min(...loadedPages.map(p => p.pageNum));
      if (minLoaded > 1) {
        loadPage(minLoaded - 1).then(() => {
          // Adjust scroll position to account for the new page’s height
          const newPage = loadedPages.find(p => p.pageNum === minLoaded - 1);
          scrollContainer.scrollTop += newPage.container.offsetHeight;
        });
      }
    }
  }

  // --- Zoom Controls (Global) ---

  function zoomIn() {
    scale += 0.25;
    reRenderAllPages();
  }

  function zoomOut() {
    if (scale <= 0.5) return;
    scale -= 0.25;
    reRenderAllPages();
  }

  // --- Initialization ---

  onMount(async () => {
    // Load the PDF document
    pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
    // Preload an initial set of pages (for example pages 1–3)
    await loadPage(1);
    if (pdfDoc.numPages >= 2) await loadPage(2);
    if (pdfDoc.numPages >= 3) await loadPage(3);
  });
</script>

<!-- The scrollable container for pages -->
<div class="pdf-scroll-container" bind:this={scrollContainer}
  on:scroll={handleScroll}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchEnd}>
  <!-- Pages are dynamically appended here -->
</div>

<!-- Global controls -->
<div class="global-controls">
  <div class="tool-controls">
    <button on:click={() => currentTool = 'pen'} class:active={currentTool === 'pen'}>Pen</button>
    <button on:click={() => currentTool = 'eraser'} class:active={currentTool === 'eraser'}>Eraser</button>
    <button on:click={() => currentTool = 'highlighter'} class:active={currentTool === 'highlighter'}>Highlighter</button>
    <button on:click={() => {
      // Clear annotations for all pages
      loadedPages.forEach(page => { page.paths = []; redrawPageAnnotations(page); });
    }}>Clear All</button>
  </div>
  <div class="zoom-controls">
    <button on:click={zoomOut}>-</button>
    <span>{Math.round(scale * 100)}%</span>
    <button on:click={zoomIn}>+</button>
  </div>
</div>

<style>
  .pdf-scroll-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 10px;
    overflow: auto;
    height: 80vh;
    border: 1px solid #ddd;
  }
  .page-container {
    position: relative;
    margin-bottom: 10px;
  }
  .pdf-canvas,
  .drawing-canvas {
    display: block;
    margin: 0 auto;
  }
  .drawing-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: all;
    touch-action: none;
  }
  .global-controls {
    margin: 10px auto;
    max-width: 800px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tool-controls,
  .zoom-controls {
    display: flex;
    gap: 15px;
    align-items: center;
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
