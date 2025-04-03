<script lang="ts">
    import { onMount } from 'svelte';
    import * as pdfjsLib from 'pdfjs-dist';
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
    let scale = 1.0; // Increased default scale for higher resolution
    
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
</script>

<div class="pdfContainer" bind:this={pdfContainer}>
  {#each pdfPages as page}
    <svelte:component 
      this={page.component}
      {...page.props}
    />
  {/each}
</div>


<style>
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