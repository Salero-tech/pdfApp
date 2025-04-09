<script lang="ts">
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import * as pdfjsLib from 'pdfjs-dist';
    let { pageNumber, scale, pdfDoc } = $props();
    
    const dispatch = createEventDispatcher();

    let canvas : HTMLCanvasElement;
    let drawCanvas : HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let drawCtx: CanvasRenderingContext2D;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentPage: any = null;
    let drawingPath: any[] = [];

    onMount(async () => {
        ctx = canvas.getContext('2d');
        drawCtx = drawCanvas.getContext('2d');
        // Enable high quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        await renderPage();
        setupDrawingCanvas();
    });

    function setupDrawingCanvas() {
        // Match the drawing canvas size to the PDF canvas
        drawCanvas.width = canvas.width;
        drawCanvas.height = canvas.height;
        
        // Set up drawing context
        drawCtx.strokeStyle = 'black';
        drawCtx.lineWidth = 2;
        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
    }

    function startDrawing(e: MouseEvent) {
        isDrawing = true;
        const rect = drawCanvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        drawingPath = [[lastX, lastY]];
    }

    function draw(e: MouseEvent) {
        if (!isDrawing) return;
        
        const rect = drawCanvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        drawCtx.beginPath();
        drawCtx.moveTo(lastX, lastY);
        drawCtx.lineTo(currentX, currentY);
        drawCtx.stroke();
        
        drawingPath.push([currentX, currentY]);
        lastX = currentX;
        lastY = currentY;
    }

    async function stopDrawing() {
        if (isDrawing) {
            // Create PDF annotation for the drawing
            const viewport = currentPage.getViewport({ scale: 1 });
            
            // Convert drawing path to PDF coordinates
            const inkList = drawingPath.map(point => [
                point[0] / viewport.width,
                1 - (point[1] / viewport.height)
            ]);
            
            // Create annotation in PDF.js format
            const annotation = {
                subtype: 'Ink',
                color: [0, 0, 0],
                width: 2,
                inkList: [inkList],
                pageNumber: pageNumber - 1,
                rect: [0, 0, viewport.width, viewport.height]
            };

            // Add annotation to the page's annotation storage
            if (!currentPage.annotationStorage) {
                currentPage.annotationStorage = new Map();
            }
            
            const annotationId = `ink_${Date.now()}`;
            currentPage.annotationStorage.set(annotationId, annotation);

            // Dispatch the drawing event to the parent component
            dispatch('drawingAdded', {
                pageNumber,
                drawing: drawingPath,
                canvasWidth: drawCanvas.width,
                canvasHeight: drawCanvas.height
            });

            // Clear the drawing canvas
            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
            
            // Re-render the page to show the annotation
            await renderPage();
        }
        isDrawing = false;
    }

    async function renderPage() {
      try {
        currentPage = await pdfDoc.getPage(pageNumber);
        const viewport = currentPage.getViewport({ scale });
        
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
        
        await currentPage.render(renderContext).promise;

        // Render annotations from storage
        if (currentPage.annotationStorage) {
            for (const [id, annotation] of currentPage.annotationStorage) {
                if (annotation.subtype === 'Ink') {
                    drawCtx.beginPath();
                    drawCtx.strokeStyle = 'black';
                    drawCtx.lineWidth = annotation.width;
                    
                    for (const path of annotation.inkList) {
                        for (let i = 0; i < path.length; i++) {
                            const point = path[i];
                            const x = point[0] * viewport.width;
                            const y = (1 - point[1]) * viewport.height;
                            
                            if (i === 0) {
                                drawCtx.moveTo(x, y);
                            } else {
                                drawCtx.lineTo(x, y);
                            }
                        }
                    }
                    drawCtx.stroke();
                }
            }
        }
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    }
</script>

<div class="pageContainer">
    <canvas bind:this={canvas}></canvas>
    <canvas 
        bind:this={drawCanvas}
        class="drawCanvas"
        on:mousedown={startDrawing}
        on:mousemove={draw}
        on:mouseup={stopDrawing}
        on:mouseleave={stopDrawing}
    ></canvas>
</div>

<style>
    .pageContainer {
        position: relative;
    }

    .drawCanvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: auto;
        z-index: 1000;
    }
</style>