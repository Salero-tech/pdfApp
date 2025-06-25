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
        theme?: "light" | "dark";
        enableTextSelection?: boolean;
        showThumbnails?: boolean;
        enableSearch?: boolean;
        toolbar?: boolean;
    }

    let {
        src = "",
        scale = $bindable(1.0),
        width = "100%",
        height = "600px",
        theme = "light",
        enableTextSelection = true,
        showThumbnails = false,
        enableSearch = true,
        toolbar = true,
    }: Props = $props();

    // Events
    interface EventMap {
        documentLoaded: { totalPages: number; document: PDFDocumentProxy };
        pageChanged: { pageNum: number; totalPages: number };
        error: { error: any };
    }

    // State
    let containerRef = $state<HTMLDivElement>();
    let canvasContainer = $state<HTMLDivElement>();
    let textLayerContainer = $state<HTMLDivElement>();
    let pdfDoc = $state<PDFDocumentProxy | null>(null);
    let currentPage = $state(1);
    let totalPages = $state(0);
    let loading = $state(false);
    let error = $state("");
    let searchTerm = $state("");
    let searchResults = $state<any[]>([]);
    let currentSearchIndex = $state(0);
    let rotation = $state(0);
    let viewMode = $state<"single" | "continuous">("single");
    let fitMode = $state<"width" | "page" | "auto">("auto");

    // Advanced features state
    let thumbnails = $state<any[]>([]);
    let textContent = $state<any>(null);
    let showSidebar = $state(false);
    let sidebarTab = $state<"thumbnails" | "outline" | "search">("thumbnails");
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
        thumbnails = [];

        try {
            const loadingTask = pdfjsLib.getDocument(src);
            pdfDoc = await loadingTask.promise;
            totalPages = pdfDoc.numPages;
            currentPage = 1;

            await renderPage(currentPage);

            if (showThumbnails) {
                await generateThumbnails();
            }

            // Dispatch event
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
            if (textLayerContainer) {
                textLayerContainer.innerHTML = "";
            }

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
            dispatchEvent("pageChanged", { pageNum, totalPages });
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

    // Generate thumbnails for all pages
    async function generateThumbnails() {
        if (!pdfDoc) return;

        thumbnails = [];
        const thumbnailScale = 0.2;

        for (let i = 1; i <= totalPages; i++) {
            try {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: thumbnailScale });

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
            } catch (err) {
                console.warn(
                    `Failed to generate thumbnail for page ${i}:`,
                    err,
                );
            }
        }

        thumbnails = thumbnails; // Trigger reactivity
    }

    // Search functionality
    async function searchInPDF() {
        if (!pdfDoc || !searchTerm.trim()) {
            searchResults = [];
            return;
        }

        searchResults = [];

        for (let i = 1; i <= totalPages; i++) {
            try {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(" ");

                const regex = new RegExp(searchTerm, "gi");
                let match;
                while ((match = regex.exec(pageText)) !== null) {
                    searchResults.push({
                        pageNum: i,
                        text: match[0],
                        index: match.index,
                        context: pageText.substring(
                            Math.max(0, match.index - 50),
                            Math.min(
                                pageText.length,
                                match.index + match[0].length + 50,
                            ),
                        ),
                    });
                }
            } catch (err) {
                console.warn(`Search failed on page ${i}:`, err);
            }
        }

        currentSearchIndex = 0;
        searchResults = searchResults; // Trigger reactivity
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
        scale = Math.min(scale + 0.25, 5.0);
        renderPage(currentPage);
    }

    function zoomOut() {
        scale = Math.max(scale - 0.25, 0.1);
        renderPage(currentPage);
    }

    function resetZoom() {
        scale = 1.0;
        renderPage(currentPage);
    }

    function rotatePage() {
        rotation = (rotation + 90) % 360;
        renderPage(currentPage);
    }

    function fitToWidth() {
        fitMode = "width";
        if (pdfDoc && containerRef) {
            const containerWidth = containerRef.offsetWidth - 40;
            pdfDoc.getPage(currentPage).then((page) => {
                const viewport = page.getViewport({ scale: 1, rotation });
                const newScale = containerWidth / viewport.width;
                scale = Math.max(0.1, Math.min(5.0, newScale));
                renderPage(currentPage);
            });
        }
    }

    function fitToPage() {
        fitMode = "page";
        if (pdfDoc && containerRef) {
            const containerWidth = containerRef.offsetWidth - 40;
            const containerHeight = containerRef.offsetHeight - 100;

            pdfDoc.getPage(currentPage).then((page) => {
                const viewport = page.getViewport({ scale: 1, rotation });
                const scaleX = containerWidth / viewport.width;
                const scaleY = containerHeight / viewport.height;
                const newScale = Math.min(scaleX, scaleY);
                scale = Math.max(0.1, Math.min(5.0, newScale));
                renderPage(currentPage);
            });
        }
    }

    function toggleSidebar() {
        showSidebar = !showSidebar;
        if (showSidebar && thumbnails.length === 0) {
            generateThumbnails();
        }
    }

    function goToSearchResult(index: number) {
        if (searchResults[index]) {
            currentSearchIndex = index;
            goToPage(searchResults[index].pageNum);
        }
    }

    function nextSearchResult() {
        if (searchResults.length > 0) {
            currentSearchIndex =
                (currentSearchIndex + 1) % searchResults.length;
            goToSearchResult(currentSearchIndex);
        }
    }

    function prevSearchResult() {
        if (searchResults.length > 0) {
            currentSearchIndex =
                currentSearchIndex === 0
                    ? searchResults.length - 1
                    : currentSearchIndex - 1;
            goToSearchResult(currentSearchIndex);
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

    // Simple event dispatcher for Svelte 5
    function dispatchEvent<T extends keyof EventMap>(
        type: T,
        detail: EventMap[T],
    ) {
        if (typeof window !== "undefined") {
            containerRef?.dispatchEvent(
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

    // Computed values
    const themeClass = $derived(
        theme === "dark" ? "dark-theme" : "light-theme",
    );
</script>

<div
    class="pdf-viewer {themeClass}"
    style="width: {width}; height: {height};"
    bind:this={containerRef}
>
    <!-- Toolbar -->
    {#if toolbar}
        <div class="toolbar">
            <div class="toolbar-group">
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

            <div class="toolbar-group">
                <button onclick={zoomOut} title="Zoom out">-</button>
                <span class="zoom-level">{Math.round(scale * 100)}%</span>
                <button onclick={zoomIn} title="Zoom in">+</button>
                <button onclick={resetZoom} title="Reset zoom">Reset</button>
            </div>

            <div class="toolbar-group">
                <button onclick={fitToWidth} title="Fit to width"
                    >Fit Width</button
                >
                <button onclick={fitToPage} title="Fit to page">Fit Page</button
                >
                <button onclick={rotatePage} title="Rotate">↻</button>
            </div>

            <div class="toolbar-group">
                <button onclick={toggleSidebar} title="Toggle sidebar"
                    >☰</button
                >
                <button onclick={downloadPDF} title="Download">⬇</button>
                <button onclick={printPDF} title="Print">🖨</button>
            </div>

            {#if enableSearch}
                <div class="search-group">
                    <input
                        type="text"
                        bind:value={searchTerm}
                        onkeydown={(e) => e.key === "Enter" && searchInPDF()}
                        placeholder="Search..."
                        class="search-input"
                    />
                    <button onclick={searchInPDF} title="Search">🔍</button>
                    {#if searchResults.length > 0}
                        <span class="search-results">
                            {currentSearchIndex + 1} of {searchResults.length}
                        </span>
                        <button
                            onclick={prevSearchResult}
                            title="Previous result">↑</button
                        >
                        <button onclick={nextSearchResult} title="Next result"
                            >↓</button
                        >
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <div class="main-content">
        <!-- Sidebar -->
        {#if showSidebar}
            <div class="sidebar">
                <div class="sidebar-tabs">
                    <button
                        class:active={sidebarTab === "thumbnails"}
                        onclick={() => (sidebarTab = "thumbnails")}
                    >
                        Thumbnails
                    </button>
                    {#if enableSearch}
                        <button
                            class:active={sidebarTab === "search"}
                            onclick={() => (sidebarTab = "search")}
                        >
                            Search
                        </button>
                    {/if}
                </div>

                <div class="sidebar-content">
                    {#if sidebarTab === "thumbnails"}
                        <div class="thumbnails-container">
                            {#each thumbnails as thumbnail}
                                <button
                                    class="thumbnail"
                                    class:active={thumbnail.pageNum ===
                                        currentPage}
                                    onclick={() => goToPage(thumbnail.pageNum)}
                                >
                                    <img
                                        src={thumbnail.dataUrl}
                                        alt="Page {thumbnail.pageNum}"
                                    />
                                    <span class="thumbnail-number"
                                        >{thumbnail.pageNum}</span
                                    >
                                </button>
                            {/each}
                        </div>
                    {:else if sidebarTab === "search" && enableSearch}
                        <div class="search-results-container">
                            {#each searchResults as result, i}
                                <button
                                    class="search-result"
                                    class:active={i === currentSearchIndex}
                                    onclick={() => goToSearchResult(i)}
                                >
                                    <div class="result-page">
                                        Page {result.pageNum}
                                    </div>
                                    <div class="result-context">
                                        {result.context}
                                    </div>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Content -->
        <div class="content">
            {#if loading}
                <div class="loading">Loading PDF...</div>
            {:else if error}
                <div class="error">{error}</div>
            {:else if pdfDoc}
                <div class="canvas-container" bind:this={canvasContainer}></div>
                {#if enableTextSelection}
                    <div
                        class="text-layer-container"
                        bind:this={textLayerContainer}
                    ></div>
                {/if}
            {:else}
                <div class="placeholder">No PDF loaded</div>
            {/if}
        </div>
    </div>
</div>

<style>
    .pdf-viewer {
        display: flex;
        flex-direction: column;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
        font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .light-theme {
        background: #f5f5f5;
        color: #333;
    }

    .dark-theme {
        background: #2d2d2d;
        color: #fff;
    }

    .dark-theme .toolbar {
        background: #3d3d3d;
        border-bottom-color: #555;
    }

    .dark-theme button {
        background: #4d4d4d;
        color: #fff;
        border-color: #666;
    }

    .dark-theme button:hover:not(:disabled) {
        background: #5d5d5d;
    }

    .dark-theme .sidebar {
        background: #3d3d3d;
        border-right-color: #555;
    }

    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #fff;
        border-bottom: 1px solid #ddd;
        flex-shrink: 0;
        flex-wrap: wrap;
        gap: 8px;
    }

    .toolbar-group {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .search-group {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .search-input {
        padding: 4px 8px;
        border: 1px solid #ccc;
        border-radius: 2px;
        font-size: 12px;
        width: 120px;
    }

    .search-results {
        font-size: 11px;
        color: #666;
        white-space: nowrap;
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
        font-size: 12px;
    }

    button {
        padding: 4px 8px;
        border: 1px solid #ccc;
        border-radius: 2px;
        background: #fff;
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
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

    .main-content {
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    .sidebar {
        width: 250px;
        background: #fff;
        border-right: 1px solid #ddd;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }

    .sidebar-tabs {
        display: flex;
        border-bottom: 1px solid #ddd;
    }

    .sidebar-tabs button {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: 0;
        background: #f9f9f9;
        font-size: 14px;
    }

    .sidebar-tabs button.active {
        background: #fff;
        border-bottom: 2px solid #007acc;
    }

    .sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
    }

    .thumbnails-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
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
    }

    .thumbnail.active {
        border-color: #007acc;
        background: #e7f3ff;
    }

    .thumbnail img {
        max-width: 100%;
        height: auto;
        border: 1px solid #ddd;
    }

    .thumbnail-number {
        margin-top: 4px;
        font-size: 12px;
    }

    .search-results-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .search-result {
        padding: 8px;
        text-align: left;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
        cursor: pointer;
    }

    .search-result.active {
        border-color: #007acc;
        background: #e7f3ff;
    }

    .result-page {
        font-weight: bold;
        font-size: 12px;
        margin-bottom: 4px;
    }

    .result-context {
        font-size: 11px;
        color: #666;
        line-height: 1.3;
        word-break: break-word;
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
        position: relative;
    }

    .text-layer-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
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

    @media (max-width: 768px) {
        .toolbar {
            flex-direction: column;
            align-items: stretch;
        }

        .toolbar-group,
        .search-group {
            justify-content: center;
        }

        .sidebar {
            width: 200px;
        }
    }
</style>
