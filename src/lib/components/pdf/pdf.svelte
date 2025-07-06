<script lang="ts">
  import { onMount, tick } from 'svelte';
  import * as pdfjsLib from 'pdfjs-dist';
  import { EventBus, PDFViewer } from 'pdfjs-dist/web/pdf_viewer.mjs';
  import type { PDFViewerOptions } from 'pdfjs-dist/types/web/pdf_viewer';
  import { tabs } from '../../data/contentContainer.svelte';
    import { savePDF } from '../../data/fileInteractions.svelte';

  let viewerContainer: HTMLDivElement;
  let pdfViewer: PDFViewer;
  let pdfDoc: pdfjsLib.PDFDocumentProxy;

  // Set worker path
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();

  onMount(async () => {
    await tick();

    const eventBus = new EventBus();
    let pdfViewerOptions: PDFViewerOptions = {
      eventBus,
      container: viewerContainer,
    };
    pdfViewer = new PDFViewer(pdfViewerOptions);
    pdfDoc = await pdfjsLib.getDocument(new Uint8Array(tabs.currentTab.content)).promise;
    pdfViewer.setDocument(pdfDoc);
    
  });



  function setAnnotationMode(mode: number) {
    if (pdfViewer) {
      pdfViewer.annotationEditorMode = { mode };
      console.log(`Annotation mode set to: ${mode}`);
    }
  }


  async function savePDFData() {
    tabs.currentTab.content = await pdfDoc.saveDocument()
    await savePDF();
  }

</script>

<!-- Toolbar -->
<div class="toolbar">
  <button on:click={() => setAnnotationMode(pdfjsLib.AnnotationEditorType.NONE)}>View</button>
  <button on:click={() => setAnnotationMode(pdfjsLib.AnnotationEditorType.INK)}>Ink</button>
  <button on:click={() => setAnnotationMode(pdfjsLib.AnnotationEditorType.HIGHLIGHT)}>Highlight</button>
  <button on:click={() => setAnnotationMode(pdfjsLib.AnnotationEditorType.FREETEXT)}>Text</button>
  <button on:click={savePDFData}>save</button>
</div>

<!-- Container for the PDF viewer -->
<div bind:this={viewerContainer} class="pdfViewerContainer">
  <div class="pdfViewer"></div>
</div>

<style>
  @import 'pdfjs-dist/web/pdf_viewer.css';

  .toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #333;
    color: #fff;
    position: absolute;
    top: 3rem; /* Leave space for file bar */
    left: 0;
    z-index: 100;
  }
  .toolbar button {
    background: #444;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 3px;
  }
  .toolbar button:hover {
    background: #666;
  }
  .pdfViewerContainer {
    position: absolute;
    top: 5.5rem; /* Leave space for both file bar and toolbar */
    width: 100vw;
    height: calc(100vh - 5.5rem);
    overflow: auto;
    background: #222;
  }
</style>