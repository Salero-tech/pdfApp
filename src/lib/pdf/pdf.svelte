<script>
    import { onMount } from 'svelte';
    import * as pdfjsLib from 'pdfjs-dist';
    import PdfPage from './pdfPage.svelte';
    
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
      loadPdf();
    });
  
    async function loadPdf(url = pdfUrl) {
      try {
        pageNum = 1;
        pdfDoc = await pdfjsLib.getDocument(url).promise;
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }
  </script>

<div class="pdfContainer">
  <PdfPage
    pageNumber={1}
    scale={1}
    pdfDoc={pdfDoc}
  />
</div>


<style>
  .pdfContainer {
    display: flex;
    justify-content: center;
    
    width: auto;
    height: auto;
  }
</style>