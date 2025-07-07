<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import * as pdfjsLib from 'pdfjs-dist';
  import { tabs } from '../../data/contentContainer.svelte';
  import { savePDF } from '../../data/fileInteractions.svelte';
  import { tools } from '$lib/data/tools.svelte';
  import { loadPDF } from './pdfUtils.svelte';
  import PdfPage from './pdfPage.svelte';



  let pdfDoc: pdfjsLib.PDFDocumentProxy;
  let scale = 1.0;

  onMount(async () => {
    pdfDoc = await loadPDF(tabs.currentTab.content);
    tools.registerPdf(setAnnotationMode);
    
  });

  onDestroy(() => {
    if (pdfDoc) {
      pdfDoc.destroy();
      pdfDoc = null;
    }
    tools.removePdf(setAnnotationMode);
  });



  function setAnnotationMode(mode: number) {
    if (mode == -1) {
      savePDFData()
      return;
    }
  }


  async function savePDFData() {
    tabs.currentTab.content = await pdfDoc.saveDocument()
    await savePDF();
  }

  async function test () {
    console.log("jasdf");
    pdfDoc.annotationStorage.setValue("test", { deleted: true });
    await pdfDoc.saveDocument();
    console.log(pdfDoc.annotationStorage.modifiedIds);
  }
</script>

<div class="flex flex-col items-center h-full min-h-0 overflow-scroll pt-4">
  {#if pdfDoc}
    {#each Array(pdfDoc.numPages) as _, i}
      <PdfPage {pdfDoc} pageNumber={i + 1} scale={scale} />
      <button onclick={test}>button</button>
    {/each}
  {/if}
</div>
