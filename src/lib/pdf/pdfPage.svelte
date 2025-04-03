<script lang="ts">

    import { onMount } from 'svelte';
    let { pageNumber, scale, pdfDoc } = $props();

    let holeContaier;

    onMount(() => {
        render2();
    });

    async function render2() {

      const page = await pdfDoc.getPage(pageNumber);

      const pdfJsViewser = await import('pdfjs-dist/web/pdf_viewer.mjs');

      var eventBus = new pdfJsViewser.EventBus();
      const test = new pdfJsViewser.PDFPageView({
          container: holeContaier,
          eventBus: eventBus,
          id: pageNumber,
          scale: scale,
          defaultViewport: page.getViewport({ scale: scale }),
          
        });

        test.setPdfPage(page);
        test.draw();

    }


</script>

<div class="pageContainer" bind:this={holeContaier}>

</div>

<style>
    @import 'pdfjs-dist/web/pdf_viewer.css';

    .pageContainer {
        position: relative;
        overflow: hidden;
        margin: 0 auto;
    }
</style>