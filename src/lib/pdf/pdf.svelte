<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment'; // Import browser check from SvelteKit
    import type { PDFViewer, PDFViewerOptions } from 'pdfjs-dist/types/web/pdf_viewer';
    import {AnnotationMode} from 'pdfjs-dist'
    export const ssr = false;
    export let pdfUrl;

    let container;
    let view;

    //pdf
    let pdfjsLib;
    let pdfjsViewer;
    let pdfViewer;
    //services
    let pdfLinkService;
    let pdfFindController;
    let pdfScriptingManager;
    let eventBus;
    
    onMount(async () => {
      if (browser) {
        await importLibs();
        await renderPDF(pdfUrl);
        setupListeners();
      }
    });

    async function importLibs() {
      // Dynamically import PDF.js libraries
      pdfjsLib = await import('pdfjs-dist');
      pdfjsViewer = await import('pdfjs-dist/web/pdf_viewer.mjs');
      
      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString();
    }

    async function renderPDF(url:String) {
      const CMAP_URL = new URL(
      'pdfjs-dist/cmaps/',
      import.meta.url
      ).toString()+"/";

      const CMAP_PACKED = true;

      const ENABLE_XFA = true;
      
      const SANDBOX_BUNDLE_SRC = new URL(
      'pdfjs-dist/build/pdf.sandbox.mjs',
      import.meta.url
      ).toString();

      eventBus = new pdfjsViewer.EventBus();

      // (Optionally) enable hyperlinks within PDF files.
      pdfLinkService = new pdfjsViewer.PDFLinkService({
        eventBus,
      });

      // (Optionally) enable find controller.
      pdfFindController = new pdfjsViewer.PDFFindController({
        eventBus,
        linkService: pdfLinkService,
      });

      // (Optionally) enable scripting support.
      pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
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
        supportsPinchToZoom: true,
        //enableHWA: true,
        annotationMode: pdfjsLib.AnnotationMode.ENABLED,
        annotationEditorMode: pdfjsLib.AnnotationEditorType.INK,
        
        

      };
      pdfViewer = new pdfjsViewer.PDFViewer(opt);
      pdfLinkService.setViewer(pdfViewer);
      pdfScriptingManager.setViewer(pdfViewer);

      
      // Loading document.
      const loadingTask = pdfjsLib.getDocument({
        url: url,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED,
        enableXfa: ENABLE_XFA,
      });

      const pdfDocument = await loadingTask.promise;
      pdfViewer.setDocument(pdfDocument);
      pdfLinkService.setDocument(pdfDocument, null);
    }
  
    function setupListeners() {
      window.addEventListener("wheel", handleWheelZoom, { passive: false });
      window.addEventListener("keydown", handleKeyZoom);
      //pdf
      eventBus.on("pagesinit", function () {
        pdfjsViewer.pdfViewer.scroll.lastTouchDistance = 0;
        pdfjsViewer.pdfViewer._setScale('auto', true);
      });
    }

    function handleWheelZoom(e: WheelEvent) {
    if (!pdfViewer || !e.ctrlKey) return;
      e.preventDefault();
      pdfViewer.currentScaleValue *= e.deltaY < 0 ? 1.1 : 0.9;
    }

    function handleKeyZoom(e: KeyboardEvent) {
      if (!pdfViewer || !e.ctrlKey) return;
      if (e.key === "+") {
        e.preventDefault();
        pdfViewer.currentScaleValue *= 1.1;
      } else if (e.key === "-") {
        e.preventDefault();
        pdfViewer.currentScaleValue *= 0.9;
      }
    }

</script>

<div class="pdfContainer"
  bind:this={container}
  >
  <div class="pdfViewer" bind:this={view}></div>
</div>


<style>
  @import 'pdfjs-dist/web/pdf_viewer.css';
  .pdfViewer {

  }
  .pdfContainer {
    position: absolute;
    background-color: rebeccapurple;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: scroll;
  }
</style>