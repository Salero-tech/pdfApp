<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import * as pdfjsLib from 'pdfjs-dist';
  import { tabs } from '../../data/contentContainer.svelte';
  import { savePDF } from '../../data/fileInteractions.svelte';
  import { tools } from '$lib/data/tools.svelte';
  import { createPdfStorage, loadPDF } from './pdfUtils.svelte';
  import PdfPage from './pdfPage.svelte';

  let pdfsrc: ReturnType<typeof createPdfStorage>;

  onMount(async () => {
    let pdfDoc = await loadPDF(tabs.currentTab.content);
    pdfsrc = createPdfStorage(pdfDoc);
    tools.registerPdf(setAnnotationMode);
    
  });

  onDestroy(() => {
    pdfsrc.destroy();
    tools.removePdf(setAnnotationMode);
  });



  function setAnnotationMode(mode: number) {
    if (mode == -1) {
      savePDFData()
      return;
    }
  }


  async function savePDFData() {
    tabs.currentTab.content = await pdfsrc.doc.saveDocument()
    await savePDF();
  }
  
</script>

<div class="flex flex-col items-center h-full min-h-0 overflow-scroll pt-4">
  {#if pdfsrc && pdfsrc.doc}
    {#each Array(pdfsrc.doc.numPages) as _, i}
      <PdfPage {pdfsrc} pageNumber={i + 1} />
    {/each}
  {/if}
</div>
