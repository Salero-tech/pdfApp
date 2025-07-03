<script lang="ts">
  import { onMount, tick } from 'svelte';
  import * as pdfjsLib from 'pdfjs-dist';
  import { EventBus, PDFViewer } from 'pdfjs-dist/web/pdf_viewer.mjs';
  import type { PDFViewerOptions } from 'pdfjs-dist/types/web/pdf_viewer';

  export let pdfUrl: string;

  let viewerContainer: HTMLDivElement;
  let pdfViewer: PDFViewer;

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

    const pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
    pdfViewer.setDocument(pdfDoc);
  });
</script>

<!-- Container for the PDF viewer -->
<div bind:this={viewerContainer} class="pdfViewerContainer">
  <div class="pdfViewer"></div>
</div>

<style>
  @import 'pdfjs-dist/web/pdf_viewer.css';

  .pdfViewerContainer {
    position: absolute;
    width: 100vw;
    height: 90vh;
    overflow: auto;
    background: #222;
  }
</style>