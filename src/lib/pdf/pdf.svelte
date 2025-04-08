<script lang="ts">
    import { onMount } from 'svelte';
    import PdfPage from './pdfPage.svelte';
    import { browser } from '$app/environment'; // Import browser check from SvelteKit
    import type { PDFViewer, PDFViewerOptions } from 'pdfjs-dist/types/web/pdf_viewer';
 



    export let pdfUrl;

    let container;
    let view;
    let pdfPages = [];  // Array to hold PdfPage components
    let pdfDoc = null;
    let pageNum = 1;
    let scale = 1.0; // Increased default scale for higher resolution
    let pdfViewer;
    let pdfjsLib;
    let pdfjsViewer;
    
    onMount(async () => {
      // Only import and initialize PDF.js in the browser
      if (browser) {
        // Dynamically import PDF.js libraries
        pdfjsLib = await import('pdfjs-dist');
        pdfjsViewer = await import('pdfjs-dist/web/pdf_viewer.mjs');
        
        // Set worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.mjs',
          import.meta.url
        ).toString();
        
        // Initialize PDF viewer
        await init();
      }
    });

    async function init() {
      const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
      const CMAP_PACKED = true;

      const DEFAULT_URL = pdfUrl;
      // To test the AcroForm and/or scripting functionality, try e.g. this file:
      // "../../test/pdfs/160F-2019.pdf"

      const ENABLE_XFA = true;
      const SEARCH_FOR = ""; // try "Mozilla";

      const SANDBOX_BUNDLE_SRC = new URL(
      'pdfjs-dist/build/pdf.sandbox.mjs',
      import.meta.url
      ).toString();
      const eventBus = new pdfjsViewer.EventBus();

      // (Optionally) enable hyperlinks within PDF files.
      const pdfLinkService = new pdfjsViewer.PDFLinkService({
        eventBus,
      });

      // (Optionally) enable find controller.
      const pdfFindController = new pdfjsViewer.PDFFindController({
        eventBus,
        linkService: pdfLinkService,
      });

      // (Optionally) enable scripting support.
      const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
        eventBus,
        sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
      });

      const opt:PDFViewerOptions = {
        container,
        eventBus,
        viewer: view,
        linkService: pdfLinkService,
        findController: pdfFindController,
        scriptingManager: pdfScriptingManager,
      };
      const pdfViewer:PDFViewer = new pdfjsViewer.PDFViewer(opt);
      pdfLinkService.setViewer(pdfViewer);
      pdfScriptingManager.setViewer(pdfViewer);

      eventBus.on("pagesinit", function () {
        // We can use pdfViewer now, e.g. let's change default scale.
        pdfViewer.currentScaleValue = "page-width";

        // We can try searching for things.
        if (SEARCH_FOR) {
          eventBus.dispatch("find", { type: "", query: SEARCH_FOR });
        }
      });

      // Loading document.
      const loadingTask = pdfjsLib.getDocument({
        url: DEFAULT_URL,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED,
        enableXfa: ENABLE_XFA,
      });

      const pdfDocument = await loadingTask.promise;
      // Document loaded, specifying document for the viewer and
      // the (optional) linkService.
      pdfViewer.setDocument(pdfDocument);

      pdfLinkService.setDocument(pdfDocument, null);
    }
  
</script>

<div class="pdfContainer" bind:this={container}>
  <div class="pdfViewer" bind:this={view}></div>
</div>


<style>
@import 'pdfjs-dist/web/pdf_viewer.css';
.pdfContainer {
    position: absolute;
    height: 100%;
    background-color: rebeccapurple;
  }
</style>