<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import PDFRenderer from "./pdf/PDFRenderer.svelte";
    import PDFToolbar from "./pdf/PDFToolbar.svelte";
    import PDFSidebar from "./pdf/PDFSidebar.svelte";
    import type { PDFDocumentProxy } from "pdfjs-dist";

    // Props
    interface Props {
        src?: string;
        width?: string;
        height?: string;
        enableTextSelection?: boolean;
        showThumbnails?: boolean;
        enableSearch?: boolean;
        toolbar?: boolean;
    }

    let {
        src = "",
        width = "100%",
        height = "600px",
        enableTextSelection = true,
        showThumbnails = false,
        enableSearch = true,
        toolbar = true,
    }: Props = $props();

    // State
    let containerRef = $state<HTMLDivElement>();
    let pdfDocument = $state<PDFDocumentProxy | null>(null);
    let currentPage = $state(1);
    let totalPages = $state(0);
    let scale = $state(1.0);
    let rotation = $state(0);
    let showSidebar = $state(false);
    let sidebarTab = $state<"thumbnails" | "search">("thumbnails");
    let requestedPage = $state(1);

    // Toolbar event handlers
    function handlePreviousPage() {
        console.log("PDFViewer: handlePreviousPage called", {
            currentPage,
            totalPages,
        });
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    }

    function handleNextPage() {
        console.log("PDFViewer: handleNextPage called", {
            currentPage,
            totalPages,
        });
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    }

    function handleGoToPage(pageNum: number) {
        console.log("PDFViewer: handleGoToPage called", {
            pageNum,
            currentPage,
            totalPages,
        });
        goToPage(pageNum);
    }

    // Sidebar event handlers
    function handleSidebarClose() {
        showSidebar = false;
    }

    function handleSidebarGoToPage(pageNum: number) {
        goToPage(pageNum);
    }

    // Navigation functions
    function goToPage(pageNum: number) {
        console.log("PDFViewer: goToPage called", {
            pageNum,
            currentPage,
            totalPages,
            requestedPage,
        });
        if (pageNum >= 1 && pageNum <= totalPages) {
            requestedPage = pageNum;
        }
    }

    function zoomIn() {
        console.log("PDFViewer: zoomIn called", { scale });
        scale = Math.min(scale + 0.25, 5.0);
    }

    function zoomOut() {
        console.log("PDFViewer: zoomOut called", { scale });
        scale = Math.max(scale - 0.25, 0.1);
    }

    function resetZoom() {
        console.log("PDFViewer: resetZoom called", { scale });
        scale = 1.0;
    }

    function rotatePage() {
        console.log("PDFViewer: rotatePage called", { rotation });
        rotation = (rotation + 90) % 360;
    }

    function fitToWidth() {
        if (pdfDocument && containerRef) {
            const containerWidth =
                containerRef.offsetWidth - (showSidebar ? 280 : 0) - 40;
            pdfDocument.getPage(currentPage).then((page) => {
                const viewport = page.getViewport({ scale: 1, rotation });
                const newScale = containerWidth / viewport.width;
                scale = Math.max(0.1, Math.min(5.0, newScale));
            });
        }
    }

    function fitToPage() {
        if (pdfDocument && containerRef) {
            const containerWidth =
                containerRef.offsetWidth - (showSidebar ? 280 : 0) - 40;
            const containerHeight =
                containerRef.offsetHeight - (toolbar ? 50 : 0) - 40;

            pdfDocument.getPage(currentPage).then((page) => {
                const viewport = page.getViewport({ scale: 1, rotation });
                const scaleX = containerWidth / viewport.width;
                const scaleY = containerHeight / viewport.height;
                const newScale = Math.min(scaleX, scaleY);
                scale = Math.max(0.1, Math.min(5.0, newScale));
            });
        }
    }

    function toggleSidebar() {
        showSidebar = !showSidebar;
        if (showSidebar && showThumbnails) {
            sidebarTab = "thumbnails";
        } else if (showSidebar && enableSearch) {
            sidebarTab = "search";
        }
    }

    function downloadPDF() {
        const link = document.createElement("a");
        link.href = src;
        link.download = "document.pdf";
        link.click();
    }

    function printPDF() {
        window.print();
    }

    // Handle document loaded
    function handleDocumentLoaded(event: CustomEvent) {
        pdfDocument = event.detail.document;
        totalPages = event.detail.totalPages;
        currentPage = 1;
    }

    // Handle page rendered
    function handlePageRendered(event: CustomEvent) {
        currentPage = event.detail.pageNum;
    }

    // Handle errors
    function handleError(event: CustomEvent) {
        console.error("PDF Error:", event.detail.error);
    }

    // Debug state changes
    $effect(() => {
        console.log("PDFViewer: state changed", {
            currentPage,
            totalPages,
            scale,
            rotation,
            requestedPage,
            showSidebar,
        });
    });
</script>

<div
    class="pdf-viewer dark-theme"
    style="width: {width}; height: {height};"
    bind:this={containerRef}
>
    <!-- Toolbar -->
    {#if toolbar}
        <div class="toolbar-container">
            <PDFToolbar
                {currentPage}
                {totalPages}
                {scale}
                canGoPrevious={currentPage > 1}
                canGoNext={currentPage < totalPages}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
                onGoToPage={handleGoToPage}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onResetZoom={resetZoom}
                onRotatePage={rotatePage}
                onFitToWidth={fitToWidth}
                onFitToPage={fitToPage}
                onDownloadPDF={downloadPDF}
                onPrintPDF={printPDF}
            />

            <!-- Sidebar toggle and search toggle -->
            <div class="toolbar-extras">
                {#if showThumbnails || enableSearch}
                    <button
                        onclick={toggleSidebar}
                        title="Toggle sidebar"
                        class="sidebar-toggle"
                        class:active={showSidebar}
                    >
                        ☰
                    </button>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Main content -->
    <div class="main-content">
        <!-- Sidebar -->
        {#if showThumbnails || enableSearch}
            <PDFSidebar
                {pdfDocument}
                {currentPage}
                visible={showSidebar}
                bind:activeTab={sidebarTab}
                onClose={handleSidebarClose}
                onGoToPage={handleSidebarGoToPage}
            />
        {/if}

        <!-- PDF Content -->
        <div class="content-area">
            <PDFRenderer
                {src}
                {scale}
                {rotation}
                {enableTextSelection}
                targetPage={requestedPage}
                ondocumentloaded={handleDocumentLoaded}
                onpagerendered={handlePageRendered}
                onerror={handleError}
            />
        </div>
    </div>
</div>

<style>
    .pdf-viewer {
        display: flex;
        flex-direction: column;
        border: 1px solid #555;
        border-radius: 4px;
        overflow: hidden;
        font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #2d2d2d;
        color: #fff;
    }

    .toolbar-container {
        display: flex;
        align-items: center;
        background: #3d3d3d;
        border-bottom: 1px solid #555;
        position: relative;
    }

    .toolbar-extras {
        position: absolute;
        right: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .sidebar-toggle {
        padding: 6px 8px;
        border: 1px solid #666;
        border-radius: 2px;
        background: #4d4d4d;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
    }

    .sidebar-toggle:hover {
        background: #5d5d5d;
    }

    .sidebar-toggle.active {
        background: #007acc;
        border-color: #007acc;
    }

    .main-content {
        display: flex;
        flex: 1;
        overflow: hidden;
        height: 100%;
    }

    .content-area {
        flex: 1;
        overflow: auto;
        padding: 16px;
        background: #f5f5f5;
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .toolbar-container {
            flex-direction: column;
            align-items: stretch;
        }

        .toolbar-extras {
            position: static;
            justify-content: center;
            padding: 8px;
            border-top: 1px solid #555;
        }

        .content-area {
            padding: 8px;
        }
    }
</style>
