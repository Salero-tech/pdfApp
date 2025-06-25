<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

    // Props
    interface Props {
        src?: string;
        scale?: number;
        width?: string;
        height?: string;
    }

    let {
        src = "",
        scale = $bindable(1.0),
        width = "100%",
        height = "600px",
    }: Props = $props();

    // State
    let containerRef = $state<HTMLDivElement>();
    let canvasContainer = $state<HTMLDivElement>();
    let pdfDoc = $state<PDFDocumentProxy | null>(null);
    let currentPage = $state(1);
    let totalPages = $state(0);
    let loading = $state(false);
    let error = $state("");
    let pdfjsLib: any = null;

    // Configure PDF.js worker and load library
    onMount(async () => {
        if (browser) {
            pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                "/pdf.js/build/pdf.worker.min.js";
        }
    });

    // Load PDF document
    async function loadPDF() {
        if (!src || !browser || !pdfjsLib) return;

        loading = true;
        error = "";

        try {
            const loadingTask = pdfjsLib.getDocument(src);
            pdfDoc = await loadingTask.promise;
            totalPages = pdfDoc.numPages;
            currentPage = 1;
            await renderPage(currentPage);
        } catch (err) {
            error = `Failed to load PDF: ${err}`;
            console.error("PDF loading error:", err);
        } finally {
            loading = false;
        }
    }

    // Render specific page
    async function renderPage(pageNum: number) {
        if (!pdfDoc || pageNum < 1 || pageNum > totalPages || !canvasContainer)
            return;

        try {
            const page: PDFPageProxy = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            // Clear previous canvas
            canvasContainer.innerHTML = "";

            // Create canvas
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Could not get canvas context");
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.maxWidth = "100%";
            canvas.style.height = "auto";

            canvasContainer.appendChild(canvas);

            // Render page
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            await page.render(renderContext).promise;
            currentPage = pageNum;
        } catch (err) {
            error = `Failed to render page: ${err}`;
            console.error("Page rendering error:", err);
        }
    }

    // Navigation functions
    function goToPage(pageNum: number) {
        if (pageNum >= 1 && pageNum <= totalPages) {
            renderPage(pageNum);
        }
    }

    function nextPage() {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    }

    function zoomIn() {
        scale = Math.min(scale + 0.25, 3.0);
        renderPage(currentPage);
    }

    function zoomOut() {
        scale = Math.max(scale - 0.25, 0.25);
        renderPage(currentPage);
    }

    function resetZoom() {
        scale = 1.0;
        renderPage(currentPage);
    }

    // Watch for src changes
    $effect(() => {
        if (src && browser) {
            loadPDF();
        }
    });
</script>

<div
    class="pdf-viewer"
    style="width: {width}; height: {height};"
    bind:this={containerRef}
>
    <!-- Toolbar -->
    <div class="toolbar">
        <div class="nav-controls">
            <button
                onclick={prevPage}
                disabled={currentPage <= 1}
                title="Previous page"
            >
                ←
            </button>

            <span class="page-info">
                <input
                    type="number"
                    bind:value={currentPage}
                    onchange={() => goToPage(currentPage)}
                    min="1"
                    max={totalPages}
                    disabled={!pdfDoc}
                />
                <span>/ {totalPages}</span>
            </span>

            <button
                onclick={nextPage}
                disabled={currentPage >= totalPages}
                title="Next page"
            >
                →
            </button>
        </div>

        <div class="zoom-controls">
            <button onclick={zoomOut} title="Zoom out">-</button>
            <span class="zoom-level">{Math.round(scale * 100)}%</span>
            <button onclick={zoomIn} title="Zoom in">+</button>
            <button onclick={resetZoom} title="Reset zoom">Reset</button>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        {#if loading}
            <div class="loading">Loading PDF...</div>
        {:else if error}
            <div class="error">{error}</div>
        {:else if pdfDoc}
            <div class="canvas-container" bind:this={canvasContainer}></div>
        {:else}
            <div class="placeholder">No PDF loaded</div>
        {/if}
    </div>
</div>

<style>
    .pdf-viewer {
        display: flex;
        flex-direction: column;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
        background: #f5f5f5;
    }

    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #fff;
        border-bottom: 1px solid #ddd;
        flex-shrink: 0;
    }

    .nav-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .zoom-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .page-info {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .page-info input {
        width: 50px;
        padding: 2px 4px;
        border: 1px solid #ccc;
        border-radius: 2px;
        text-align: center;
    }

    button {
        padding: 4px 8px;
        border: 1px solid #ccc;
        border-radius: 2px;
        background: #fff;
        cursor: pointer;
        font-size: 12px;
    }

    button:hover:not(:disabled) {
        background: #f0f0f0;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .zoom-level {
        font-size: 12px;
        min-width: 40px;
        text-align: center;
    }

    .content {
        flex: 1;
        overflow: auto;
        padding: 16px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }

    .canvas-container {
        display: flex;
        justify-content: center;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .loading,
    .error,
    .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #666;
    }

    .error {
        color: #d32f2f;
        background: #ffebee;
        border-radius: 4px;
    }

    .loading {
        color: #1976d2;
    }
</style>
