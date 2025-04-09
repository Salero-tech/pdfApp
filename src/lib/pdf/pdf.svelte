<script lang="ts">
    import { onMount } from 'svelte';
    import * as pdfjsLib from 'pdfjs-dist';
    import { PDFDocument, rgb, PDFName } from 'pdf-lib';
    import PdfPage from './pdfPage.svelte';
    
    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  
    export let pdfUrl;

    let pdfContainer;
    let pdfPages = [];  // Array to hold PdfPage components
    let pdfDoc = null;
    let pageNum = 1;
    let scale = 2.0; // Increased default scale for higher resolution
    let drawings = new Map(); // Store drawings by page number
    let pageDimensions = new Map(); // Store page dimensions
    
    onMount(() => {
      init();
    });

    async function init() {
      await loadPdf();
    }
  
    async function loadPdf(url = pdfUrl) {
      try {
        pageNum = 1;
        pdfDoc = await pdfjsLib.getDocument(url).promise;
        await createPdfPages(pdfDoc.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }

    async function createPdfPages(numPages) {
      pdfPages = Array.from({ length: numPages }, (_, i) => ({
        component: PdfPage,
        props: {
          pageNumber: i + 1,
          scale,
          pdfDoc
        }
      }));
    }

    function handleDrawingAdded(event: CustomEvent) {
      console.log('Drawing added event received:', event.detail);
      const { pageNumber, drawing, canvasWidth, canvasHeight } = event.detail;
      console.log('Extracted data:', { pageNumber, drawing, canvasWidth, canvasHeight });
      
      if (!drawings.has(pageNumber)) {
        drawings.set(pageNumber, []);
      }
      drawings.get(pageNumber).push(drawing);
      pageDimensions.set(pageNumber, { width: canvasWidth, height: canvasHeight });
      
      console.log('Current drawings after update:', drawings);
      console.log('Current page dimensions:', pageDimensions);
    }

    async function downloadPdfWithAnnotations() {
      
      try {
        // Fetch the original PDF
        const response = await fetch(pdfUrl);
        const pdfBytes = await response.arrayBuffer();
        
        // Load the PDF with pdf-lib
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        console.log('Current drawings Map:', drawings);
        console.log('Number of pages with drawings:', drawings.size);
        
        // Add drawings to each page
        for (const [pageNumber, pageDrawings] of drawings) {
          console.log("Processing page:", pageNumber);
          console.log("Page drawings:", pageDrawings);
          const page = pdfDoc.getPage(pageNumber - 1);
          const { width, height } = page.getSize();
          const dimensions = pageDimensions.get(pageNumber);
          
          // Draw each path
          console.log('Drawing paths for page', pageNumber, pageDrawings);
          for (const path of pageDrawings) {
            // Convert points to PDF coordinates
            const points = path.map(point => ({
              x: (point[0] / dimensions.width) * width,
              y: height - ((point[1] / dimensions.height) * height)
            }));
            
            // Draw lines between consecutive points
            for (let i = 1; i < points.length; i++) {
              const start = points[i - 1];
              const end = points[i];
              page.drawLine({
                start: { x: start.x, y: start.y },
                end: { x: end.x, y: end.y },
                color: rgb(0, 0, 0),
                thickness: 4,
              });
            }
          }
        }
        
        // Save the modified PDF
        const modifiedPdfBytes = await pdfDoc.save();
        
        // Create download link
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'annotated-document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error saving PDF:', error);
      }
    }
</script>

<div class="controls">
  <button on:click={downloadPdfWithAnnotations}>Download PDF with Annotations</button>
</div>

<div class="pdfContainer" bind:this={pdfContainer}>
  {#each pdfPages as page}
    <svelte:component 
      this={page.component}
      {...page.props}
      on:drawingAdded={handleDrawingAdded}
    />
  {/each}
</div>

<style>
  .controls {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #4a5568;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover {
    background-color: #2d3748;
  }

  .pdfContainer {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem 0;
    width: auto;
    height: auto;
    background-color: rebeccapurple;
  }
</style>