<script lang="ts">
    import { onMount } from "svelte";

    let { pdfsrc, page, scale = 1.0 } = $props();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    onMount(() => {
        ctx = canvas.getContext("2d");
        pdfsrc.setupCanvas(canvas, page);
    });

    function handleMouseDown(event: MouseEvent) {
        drawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = (event.clientX - rect.left);
        lastY = (event.clientY - rect.top);
    }

    function handleMouseMove(event: MouseEvent) {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left);
        const y = (event.clientY - rect.top);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x;
        lastY = y;
    }

    function handleMouseUp() {
        drawing = false;
        test();
    }

    async function test () {
        pdfsrc.doc.annotationStorage.setValue("pdfjs_internal_editor_0", {
        "id": "16R",
        "deleted": true,
        "pageIndex": 0,
        "popupRef": ""
        });
        console.log(pdfsrc.doc.annotationStorage.serializable);
    }
</script>

<canvas
    bind:this={canvas}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
></canvas>