<script lang="ts">
    // Event handlers interface
    interface EventHandlers {
        onPreviousPage?: () => void;
        onNextPage?: () => void;
        onGoToPage?: (pageNum: number) => void;
        onZoomIn?: () => void;
        onZoomOut?: () => void;
        onResetZoom?: () => void;
        onRotatePage?: () => void;
        onFitToWidth?: () => void;
        onFitToPage?: () => void;
        onDownloadPDF?: () => void;
        onPrintPDF?: () => void;
    }

    // Props
    interface Props extends EventHandlers {
        currentPage?: number;
        totalPages?: number;
        scale?: number;
        canGoPrevious?: boolean;
        canGoNext?: boolean;
    }

    let {
        currentPage = 1,
        totalPages = 0,
        scale = 1.0,
        canGoPrevious = false,
        canGoNext = false,
        onPreviousPage,
        onNextPage,
        onGoToPage,
        onZoomIn,
        onZoomOut,
        onResetZoom,
        onRotatePage,
        onFitToWidth,
        onFitToPage,
        onDownloadPDF,
        onPrintPDF,
    }: Props = $props();

    // Local state for page input
    let pageInputValue = $state(currentPage);

    // Navigation functions
    function handlePreviousPage() {
        console.log("Previous page clicked", { canGoPrevious, onPreviousPage });
        if (canGoPrevious && onPreviousPage) {
            onPreviousPage();
        }
    }

    function handleNextPage() {
        console.log("Next page clicked", { canGoNext, onNextPage });
        if (canGoNext && onNextPage) {
            onNextPage();
        }
    }

    function handleGoToPage() {
        const pageNum = parseInt(pageInputValue.toString());
        console.log("Go to page", { pageNum, totalPages, onGoToPage });
        if (pageNum >= 1 && pageNum <= totalPages && onGoToPage) {
            onGoToPage(pageNum);
        } else {
            pageInputValue = currentPage; // Reset to current page if invalid
        }
    }

    function handleZoomIn() {
        console.log("Zoom in clicked", { onZoomIn });
        if (onZoomIn) {
            onZoomIn();
        }
    }

    function handleZoomOut() {
        console.log("Zoom out clicked", { onZoomOut });
        if (onZoomOut) {
            onZoomOut();
        }
    }

    function handleResetZoom() {
        console.log("Reset zoom clicked", { onResetZoom });
        if (onResetZoom) {
            onResetZoom();
        }
    }

    function handleRotatePage() {
        console.log("Rotate page clicked", { onRotatePage });
        if (onRotatePage) {
            onRotatePage();
        }
    }

    function handleFitToWidth() {
        console.log("Fit to width clicked", { onFitToWidth });
        if (onFitToWidth) {
            onFitToWidth();
        }
    }

    function handleFitToPage() {
        console.log("Fit to page clicked", { onFitToPage });
        if (onFitToPage) {
            onFitToPage();
        }
    }

    function handleDownloadPDF() {
        console.log("Download PDF clicked", { onDownloadPDF });
        if (onDownloadPDF) {
            onDownloadPDF();
        }
    }

    function handlePrintPDF() {
        console.log("Print PDF clicked", { onPrintPDF });
        if (onPrintPDF) {
            onPrintPDF();
        }
    }

    // Sync page input with current page
    $effect(() => {
        pageInputValue = currentPage;
    });
</script>

<div class="pdf-toolbar">
    <!-- Navigation Controls -->
    <div class="toolbar-group">
        <button
            onclick={handlePreviousPage}
            disabled={!canGoPrevious}
            title="Previous page"
            class="nav-button"
        >
            ←
        </button>

        <span class="page-info">
            <input
                type="number"
                bind:value={pageInputValue}
                onchange={handleGoToPage}
                min="1"
                max={totalPages}
                disabled={totalPages === 0}
                class="page-input"
            />
            <span class="page-total">/ {totalPages}</span>
        </span>

        <button
            onclick={handleNextPage}
            disabled={!canGoNext}
            title="Next page"
            class="nav-button"
        >
            →
        </button>
    </div>

    <!-- Zoom Controls -->
    <div class="toolbar-group">
        <button onclick={handleZoomOut} title="Zoom out" class="zoom-button">
            -
        </button>
        <span class="zoom-level">{Math.round(scale * 100)}%</span>
        <button onclick={handleZoomIn} title="Zoom in" class="zoom-button">
            +
        </button>
        <button
            onclick={handleResetZoom}
            title="Reset zoom"
            class="action-button"
        >
            Reset
        </button>
    </div>

    <!-- View Controls -->
    <div class="toolbar-group">
        <button
            onclick={handleFitToWidth}
            title="Fit to width"
            class="action-button"
        >
            Fit Width
        </button>
        <button
            onclick={handleFitToPage}
            title="Fit to page"
            class="action-button"
        >
            Fit Page
        </button>
        <button onclick={handleRotatePage} title="Rotate" class="action-button">
            ↻
        </button>
    </div>

    <!-- Document Actions -->
    <div class="toolbar-group">
        <button
            onclick={handleDownloadPDF}
            title="Download"
            class="action-button"
        >
            ⬇
        </button>
        <button onclick={handlePrintPDF} title="Print" class="action-button">
            🖨
        </button>
        <button
            onclick={() => alert("Test button works!")}
            title="Test"
            class="action-button"
        >
            TEST
        </button>
    </div>
</div>

<style>
    .pdf-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #3d3d3d;
        border-bottom: 1px solid #555;
        flex-shrink: 0;
        flex-wrap: wrap;
        gap: 8px;
        color: #fff;
    }

    .toolbar-group {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .page-info {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .page-input {
        width: 50px;
        padding: 2px 4px;
        border: 1px solid #666;
        border-radius: 2px;
        text-align: center;
        font-size: 12px;
        background: #4d4d4d;
        color: #fff;
    }

    .page-input:focus {
        outline: none;
        border-color: #007acc;
    }

    .page-total {
        font-size: 12px;
        color: #ccc;
    }

    .zoom-level {
        font-size: 12px;
        min-width: 40px;
        text-align: center;
        color: #ccc;
    }

    button {
        padding: 4px 8px;
        border: 1px solid #666;
        border-radius: 2px;
        background: #4d4d4d;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
        transition: background-color 0.2s;
    }

    button:hover:not(:disabled) {
        background: #5d5d5d;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #3d3d3d;
    }

    .nav-button {
        font-weight: bold;
        font-size: 14px;
    }

    .zoom-button {
        font-weight: bold;
        font-size: 16px;
        width: 28px;
        height: 28px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .action-button {
        font-size: 11px;
    }

    @media (max-width: 768px) {
        .pdf-toolbar {
            flex-direction: column;
            align-items: stretch;
        }

        .toolbar-group {
            justify-content: center;
        }
    }
</style>
