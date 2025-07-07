<script lang="ts">
    import { onMount } from "svelte";
    import * as pdfjsLib from 'pdfjs-dist';
    import BackLayer from "./layers/backLayer.svelte";
    import AnnotationLayer from "./layers/annotationLayer.svelte";
    import EditLayer from "./layers/editLayer.svelte";

    let { pdfsrc, pageNumber = 1 } = $props();

    let page: pdfjsLib.PDFPageProxy = $state(null);

    onMount(async () => {
        page = await pdfsrc.doc.getPage(pageNumber);
        
        const textContent = await page.getTextContent();
    });
</script>

{#if page}
<div class="relative w-fit h-fit mx-auto mb-5">
    <BackLayer {page} />
    <div class="absolute inset-0">
        <AnnotationLayer {page} />
    </div>
    <div class="absolute inset-0">
        <EditLayer {page} {pdfsrc}/>
    </div>
</div>
{/if}
