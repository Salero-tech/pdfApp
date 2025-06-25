<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

    // Events
    interface EventMap {
        documentLoaded: { totalPages: number; document: PDFDocumentProxy };
        pageRendered: { pageNum: number };
        error: { error: any };
    }

    // State
    let canvasContainer = $state<HTMLDivElement>();
    let pdfDoc = $state<PDFDocumentProxy | null>(null);
    let currentPage = $state(1);
    let totalPages = $state(0);
    let loading = $state(false);
    let error = $state("");
    let pdfjsLib: any = null;

    // Props
    interface Props {
        src?: string;
        scale?: number;
        rotation?: number;
        enableTextSelection?: boolean;
        targetPage?: number;
    }

    let {
        src = "",
        scale = 1.0,
        rotation = 0,
        enableTextSelection = true,
        targetPage = 1,
    }: Props = $props();

    // Configure PDF.js worker and load library
    onMount(async () => {
        if (browser) {
            pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.js";
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

            dispatchEvent("documentLoaded", { totalPages, document: pdfDoc });
        } catch (err) {
            error = `Failed to load PDF: ${err}`;
            console.error("PDF loading error:", err);
            dispatchEvent("error", { error: err });
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
            const viewport = page.getViewport({ scale, rotation });

            // Clear previous content
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

            // Add text layer for selection
            if (enableTextSelection) {
                await renderTextLayer(page, viewport);
            }

            currentPage = pageNum;
            dispatchEvent("pageRendered", { pageNum });
        } catch (err) {
            error = `Failed to render page: ${err}`;
            console.error("Page rendering error:", err);
        }
    }

    // Render text layer for text selection
    async function renderTextLayer(page: PDFPageProxy, viewport: any) {
        try {
            const textContent = await page.getTextContent();

            const textLayerDiv = document.createElement("div");
            textLayerDiv.className = "text-layer";
            textLayerDiv.style.position = "absolute";
            textLayerDiv.style.left = "0";
            textLayerDiv.style.top = "0";
            textLayerDiv.style.right = "0";
            textLayerDiv.style.bottom = "0";
            textLayerDiv.style.overflow = "hidden";
            textLayerDiv.style.opacity = "0.3";
            textLayerDiv.style.lineHeight = "1.0";

            canvasContainer!.style.position = "relative";
            canvasContainer!.appendChild(textLayerDiv);

            const textLayer = new pdfjsLib.TextLayer({
                textContentSource: textContent,
                container: textLayerDiv,
                viewport: viewport,
                textDivProperties: {
                    enhanceTextSelection: true,
                },
            });

            await textLayer.render();
        } catch (err) {
            console.warn("Text layer rendering failed:", err);
        }
    }

    // Simple event dispatcher
    function dispatchEvent<T extends keyof EventMap>(
        type: T,
        detail: EventMap[T],
    ) {
        if (typeof window !== "undefined") {
            canvasContainer?.dispatchEvent(
                new CustomEvent(type, { detail, bubbles: true }),
            );
        }
    }

    // Watch for src changes
    $effect(() => {
        if (src && browser) {
            loadPDF();
        }
    });

    // Watch for scale/rotation changes
    $effect(() => {
        console.log("PDFRenderer: scale/rotation effect", {
            scale,
            rotation,
            pdfDoc,
            canvasContainer,
        });
        if (pdfDoc && canvasContainer) {
            renderPage(currentPage);
        }
    });

    // Watch for targetPage changes
    $effect(() => {
        console.log("PDFRenderer: targetPage effect", {
            targetPage,
            currentPage,
            pdfDoc,
            totalPages,
        });
        if (
            pdfDoc &&
            targetPage !== currentPage &&
            targetPage >= 1 &&
            targetPage <= totalPages
        ) {
            renderPage(targetPage);
        }
    });

    // Debug prop changes
    $effect(() => {
        console.log("PDFRenderer: props changed", {
            src,
            scale,
            rotation,
            targetPage,
            enableTextSelection,
        });
    });
</script>

<div class="pdf-renderer">
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

<style>
    .pdf-renderer {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        height: 100%;
    }

    .canvas-container {
        display: flex;
        justify-content: center;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
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

    .placeholder {
        color: #999;
    }
</style>
