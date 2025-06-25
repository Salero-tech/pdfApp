<script lang="ts">
    import type { PDFDocumentProxy } from "pdfjs-dist";

    // Props
    interface Props {
        pdfDocument?: PDFDocumentProxy | null;
        currentPage?: number;
        visible?: boolean;
        onGoToPage?: (pageNum: number) => void;
    }

    let {
        pdfDocument = null,
        currentPage = 1,
        visible = false,
        onGoToPage,
    }: Props = $props();

    // Events
    interface EventMap {
        goToPage: { pageNum: number };
        thumbnailsGenerated: { total: number };
    }

    interface Thumbnail {
        pageNum: number;
        canvas: HTMLCanvasElement;
        dataUrl: string;
    }

    // State
    let thumbnails = $state<Thumbnail[]>([]);
    let isGenerating = $state(false);
    let pdfjsLib: any = null;

    // Generate thumbnails for all pages
    async function generateThumbnails() {
        if (!pdfDocument || thumbnails.length > 0) return;

        isGenerating = true;
        thumbnails = [];
        const thumbnailScale = 0.2;
        const totalPages = pdfDocument.numPages;

        try {
            // Import PDF.js if not already loaded
            if (!pdfjsLib) {
                pdfjsLib = await import("pdfjs-dist");
            }

            for (let i = 1; i <= totalPages; i++) {
                try {
                    const page = await pdfDocument.getPage(i);
                    const viewport = page.getViewport({
                        scale: thumbnailScale,
                    });

                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");

                    if (!context) continue;

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                    }).promise;

                    thumbnails.push({
                        pageNum: i,
                        canvas: canvas,
                        dataUrl: canvas.toDataURL(),
                    });

                    // Trigger reactivity
                    thumbnails = [...thumbnails];
                } catch (err) {
                    console.warn(
                        `Failed to generate thumbnail for page ${i}:`,
                        err,
                    );
                }
            }

            dispatchEvent("thumbnailsGenerated", { total: thumbnails.length });
        } catch (err) {
            console.error("Failed to generate thumbnails:", err);
        } finally {
            isGenerating = false;
        }
    }

    function handleThumbnailClick(pageNum: number) {
        if (onGoToPage) {
            onGoToPage(pageNum);
        }
    }

    // Simple event dispatcher
    function dispatchEvent<T extends keyof EventMap>(
        type: T,
        detail: EventMap[T],
    ) {
        if (typeof window !== "undefined") {
            document.dispatchEvent(
                new CustomEvent(type, { detail, bubbles: true }),
            );
        }
    }

    // Watch for document changes
    $effect(() => {
        if (pdfDocument && visible && thumbnails.length === 0) {
            generateThumbnails();
        }
    });

    // Watch for visibility changes
    $effect(() => {
        if (visible && pdfDocument && thumbnails.length === 0) {
            generateThumbnails();
        }
    });
</script>

{#if visible}
    <div class="pdf-thumbnails">
        <div class="thumbnails-header">
            <h3>Pages</h3>
            {#if isGenerating}
                <span class="generating">Generating...</span>
            {:else if thumbnails.length > 0}
                <span class="count">{thumbnails.length} pages</span>
            {/if}
        </div>

        <div class="thumbnails-container">
            {#if isGenerating}
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <span>Generating thumbnails...</span>
                </div>
            {:else if thumbnails.length === 0 && pdfDocument}
                <div class="no-thumbnails">
                    <button
                        onclick={generateThumbnails}
                        class="generate-button"
                    >
                        Generate Thumbnails
                    </button>
                </div>
            {:else}
                {#each thumbnails as thumbnail}
                    <button
                        class="thumbnail"
                        class:active={thumbnail.pageNum === currentPage}
                        onclick={() => handleThumbnailClick(thumbnail.pageNum)}
                        title="Go to page {thumbnail.pageNum}"
                    >
                        <div class="thumbnail-image">
                            <img
                                src={thumbnail.dataUrl}
                                alt="Page {thumbnail.pageNum}"
                                loading="lazy"
                            />
                        </div>
                        <span class="thumbnail-number">{thumbnail.pageNum}</span
                        >
                    </button>
                {/each}
            {/if}
        </div>
    </div>
{/if}

<style>
    .pdf-thumbnails {
        background: #3d3d3d;
        border: 1px solid #555;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        height: 100%;
        color: #fff;
    }

    .thumbnails-header {
        padding: 12px;
        border-bottom: 1px solid #555;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .thumbnails-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
    }

    .generating,
    .count {
        font-size: 11px;
        color: #999;
    }

    .thumbnails-container {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #999;
        font-size: 12px;
        gap: 12px;
    }

    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #555;
        border-top: 2px solid #007acc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .no-thumbnails {
        display: flex;
        justify-content: center;
        padding: 20px;
    }

    .generate-button {
        padding: 8px 16px;
        border: 1px solid #666;
        border-radius: 4px;
        background: #4d4d4d;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
    }

    .generate-button:hover {
        background: #5d5d5d;
    }

    .thumbnail {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px;
        border: 2px solid transparent;
        border-radius: 4px;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s;
        gap: 6px;
    }

    .thumbnail:hover {
        background: #4d4d4d;
        border-color: #666;
    }

    .thumbnail.active {
        border-color: #007acc;
        background: #2d4a5d;
    }

    .thumbnail-image {
        width: 100%;
        max-width: 120px;
        display: flex;
        justify-content: center;
        border-radius: 2px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .thumbnail-image img {
        width: 100%;
        height: auto;
        display: block;
        border: 1px solid #666;
    }

    .thumbnail-number {
        font-size: 11px;
        color: #ccc;
        font-weight: 500;
    }

    .thumbnail.active .thumbnail-number {
        color: #007acc;
        font-weight: bold;
    }

    /* Scrollbar styling */
    .thumbnails-container::-webkit-scrollbar {
        width: 6px;
    }

    .thumbnails-container::-webkit-scrollbar-track {
        background: #2d2d2d;
    }

    .thumbnails-container::-webkit-scrollbar-thumb {
        background: #666;
        border-radius: 3px;
    }

    .thumbnails-container::-webkit-scrollbar-thumb:hover {
        background: #777;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .thumbnail-image {
            max-width: 80px;
        }

        .thumbnails-header h3 {
            font-size: 12px;
        }
    }
</style>
