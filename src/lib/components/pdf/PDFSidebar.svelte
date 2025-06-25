<script lang="ts">
    import PDFSearch from "./PDFSearch.svelte";
    import PDFThumbnails from "./PDFThumbnails.svelte";
    import type { PDFDocumentProxy } from "pdfjs-dist";

    // Props
    interface Props {
        pdfDocument?: PDFDocumentProxy | null;
        currentPage?: number;
        visible?: boolean;
        activeTab?: "thumbnails" | "search";
        onClose?: () => void;
        onGoToPage?: (pageNum: number) => void;
    }

    let {
        pdfDocument = null,
        currentPage = 1,
        visible = false,
        activeTab = $bindable("thumbnails"),
        onClose,
        onGoToPage,
    }: Props = $props();

    // Events
    interface EventMap {
        close: void;
        goToPage: { pageNum: number };
        searchResult: { pageNum: number; text: string; context: string };
    }

    // Handle tab switching
    function setActiveTab(tab: "thumbnails" | "search") {
        activeTab = tab;
    }

    function handleClose() {
        if (onClose) {
            onClose();
        }
    }

    // Pass through events from child components
    function handleGoToPage(pageNum: number) {
        if (onGoToPage) {
            onGoToPage(pageNum);
        }
    }

    function handleSearchResult(event: CustomEvent) {
        if (onGoToPage) {
            onGoToPage(event.detail.pageNum);
        }
    }
</script>

{#if visible}
    <div class="pdf-sidebar">
        <!-- Sidebar Header -->
        <div class="sidebar-header">
            <div class="sidebar-tabs">
                <button
                    class="tab-button"
                    class:active={activeTab === "thumbnails"}
                    onclick={() => setActiveTab("thumbnails")}
                >
                    📄 Pages
                </button>
                <button
                    class="tab-button"
                    class:active={activeTab === "search"}
                    onclick={() => setActiveTab("search")}
                >
                    🔍 Search
                </button>
            </div>
            <button
                class="close-button"
                onclick={handleClose}
                title="Close sidebar"
            >
                ✕
            </button>
        </div>

        <!-- Sidebar Content -->
        <div class="sidebar-content">
            {#if activeTab === "thumbnails"}
                <PDFThumbnails
                    {pdfDocument}
                    {currentPage}
                    visible={activeTab === "thumbnails"}
                    onGoToPage={handleGoToPage}
                />
            {:else if activeTab === "search"}
                <PDFSearch
                    {pdfDocument}
                    visible={activeTab === "search"}
                    onGoToPage={handleGoToPage}
                />
            {/if}
        </div>
    </div>
{/if}

<style>
    .pdf-sidebar {
        width: 280px;
        background: #2d2d2d;
        border-right: 1px solid #555;
        display: flex;
        flex-direction: column;
        height: 100%;
        flex-shrink: 0;
        color: #fff;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        border-bottom: 1px solid #555;
        background: #3d3d3d;
    }

    .sidebar-tabs {
        display: flex;
        gap: 4px;
    }

    .tab-button {
        padding: 6px 12px;
        border: 1px solid #666;
        border-radius: 4px;
        background: #4d4d4d;
        color: #ccc;
        cursor: pointer;
        font-size: 11px;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .tab-button:hover {
        background: #5d5d5d;
        color: #fff;
    }

    .tab-button.active {
        background: #007acc;
        border-color: #007acc;
        color: #fff;
    }

    .close-button {
        padding: 4px 6px;
        border: 1px solid #666;
        border-radius: 2px;
        background: #4d4d4d;
        color: #ccc;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-button:hover {
        background: #5d5d5d;
        color: #fff;
    }

    .sidebar-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .pdf-sidebar {
            width: 250px;
        }

        .tab-button {
            padding: 4px 8px;
            font-size: 10px;
        }
    }

    @media (max-width: 480px) {
        .pdf-sidebar {
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1000;
            border-right: none;
            border-bottom: 1px solid #555;
        }
    }
</style>
