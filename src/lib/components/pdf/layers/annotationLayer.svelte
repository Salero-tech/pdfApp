<script lang="ts">
    import { onMount } from "svelte";
    import { renderAnnotations } from "./annotation/annotation.svelte";

    let { page, scale = 1.0 } = $props();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    onMount(() => {
        ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        prepareAnnotaions();
    });

    async function prepareAnnotaions() {
        const annotations = await page.getAnnotations();
        renderAnnotations(annotations, ctx, page.getViewport({ scale }));
    }
</script>


<canvas bind:this={canvas} class=""></canvas>

