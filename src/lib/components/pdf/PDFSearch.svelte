<script lang="ts">
    import type { PDFDocumentProxy } from "pdfjs-dist";

    // Props
    interface Props {
        pdfDocument?: PDFDocumentProxy | null;
        visible?: boolean;
        onGoToPage?: (pageNum: number) => void;
    }

    let { pdfDocument = null, visible = false, onGoToPage }: Props = $props();

    // Events
    interface EventMap {
        searchResult: { pageNum: number; text: string; context: string };
        searchComplete: { results: SearchResult[]; total: number };
        goToPage: { pageNum: number };
    }

    interface SearchResult {
        pageNum: number;
        text: string;
        index: number;
        context: string;
    }

    // State
    let searchTerm = $state("");
    let searchResults = $state<SearchResult[]>([]);
    let currentSearchIndex = $state(0);
    let isSearching = $state(false);

    // Search functionality
    async function searchInPDF() {
        if (!pdfDocument || !searchTerm.trim()) {
            searchResults = [];
            return;
        }

        isSearching = true;
        searchResults = [];

        try {
            const totalPages = pdfDocument.numPages;

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdfDocument.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(" ");

                const regex = new RegExp(searchTerm, "gi");
                let match;
                while ((match = regex.exec(pageText)) !== null) {
                    const result: SearchResult = {
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
                    };
                    searchResults.push(result);
                }
            }

            currentSearchIndex = 0;
            dispatchEvent("searchComplete", {
                results: searchResults,
                total: searchResults.length,
            });

            if (searchResults.length > 0) {
                goToSearchResult(0);
            }
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            isSearching = false;
        }
    }

    function goToSearchResult(index: number) {
        if (searchResults[index]) {
            currentSearchIndex = index;
            const result = searchResults[index];
            if (onGoToPage) {
                onGoToPage(result.pageNum);
            }
        }
    }

    function nextSearchResult() {
        if (searchResults.length > 0) {
            const nextIndex = (currentSearchIndex + 1) % searchResults.length;
            goToSearchResult(nextIndex);
        }
    }

    function prevSearchResult() {
        if (searchResults.length > 0) {
            const prevIndex =
                currentSearchIndex === 0
                    ? searchResults.length - 1
                    : currentSearchIndex - 1;
            goToSearchResult(prevIndex);
        }
    }

    function clearSearch() {
        searchTerm = "";
        searchResults = [];
        currentSearchIndex = 0;
    }

    // Handle Enter key
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            searchInPDF();
        } else if (event.key === "Escape") {
            clearSearch();
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
</script>

{#if visible}
    <div class="pdf-search">
        <div class="search-input-group">
            <input
                type="text"
                bind:value={searchTerm}
                onkeydown={handleKeydown}
                placeholder="Search in PDF..."
                class="search-input"
                disabled={isSearching}
            />
            <button
                onclick={searchInPDF}
                title="Search"
                class="search-button"
                disabled={isSearching || !searchTerm.trim()}
            >
                {#if isSearching}
                    ⏳
                {:else}
                    🔍
                {/if}
            </button>
            {#if searchTerm}
                <button
                    onclick={clearSearch}
                    title="Clear"
                    class="clear-button"
                >
                    ✕
                </button>
            {/if}
        </div>

        {#if searchResults.length > 0}
            <div class="search-navigation">
                <span class="search-results-count">
                    {currentSearchIndex + 1} of {searchResults.length}
                </span>
                <button
                    onclick={prevSearchResult}
                    title="Previous result"
                    class="nav-button"
                >
                    ↑
                </button>
                <button
                    onclick={nextSearchResult}
                    title="Next result"
                    class="nav-button"
                >
                    ↓
                </button>
            </div>
        {:else if searchTerm && !isSearching}
            <div class="no-results">No results found</div>
        {/if}

        {#if searchResults.length > 0}
            <div class="search-results-list">
                {#each searchResults as result, i}
                    <button
                        class="search-result-item"
                        class:active={i === currentSearchIndex}
                        onclick={() => goToSearchResult(i)}
                    >
                        <div class="result-page">Page {result.pageNum}</div>
                        <div class="result-context">
                            {result.context}
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
{/if}

<style>
    .pdf-search {
        background: #3d3d3d;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 12px;
        color: #fff;
        max-height: 400px;
        overflow-y: auto;
    }

    .search-input-group {
        display: flex;
        gap: 4px;
        margin-bottom: 8px;
    }

    .search-input {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid #666;
        border-radius: 2px;
        background: #4d4d4d;
        color: #fff;
        font-size: 12px;
    }

    .search-input:focus {
        outline: none;
        border-color: #007acc;
    }

    .search-input::placeholder {
        color: #999;
    }

    .search-button,
    .clear-button {
        padding: 6px 8px;
        border: 1px solid #666;
        border-radius: 2px;
        background: #4d4d4d;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
    }

    .search-button:hover:not(:disabled),
    .clear-button:hover {
        background: #5d5d5d;
    }

    .search-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .search-navigation {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        padding: 4px 0;
        border-bottom: 1px solid #555;
    }

    .search-results-count {
        font-size: 11px;
        color: #ccc;
        flex: 1;
    }

    .nav-button {
        padding: 4px 6px;
        border: 1px solid #666;
        border-radius: 2px;
        background: #4d4d4d;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
    }

    .nav-button:hover {
        background: #5d5d5d;
    }

    .no-results {
        font-size: 11px;
        color: #999;
        text-align: center;
        padding: 8px;
    }

    .search-results-list {
        max-height: 200px;
        overflow-y: auto;
    }

    .search-result-item {
        display: block;
        width: 100%;
        padding: 8px;
        text-align: left;
        border: 1px solid #555;
        border-radius: 4px;
        background: #4d4d4d;
        color: #fff;
        cursor: pointer;
        margin-bottom: 4px;
        transition: background-color 0.2s;
    }

    .search-result-item:hover {
        background: #5d5d5d;
    }

    .search-result-item.active {
        border-color: #007acc;
        background: #2d4a5d;
    }

    .result-page {
        font-weight: bold;
        font-size: 11px;
        margin-bottom: 4px;
        color: #007acc;
    }

    .result-context {
        font-size: 10px;
        color: #ccc;
        line-height: 1.3;
        word-break: break-word;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    /* Scrollbar styling */
    .pdf-search::-webkit-scrollbar,
    .search-results-list::-webkit-scrollbar {
        width: 6px;
    }

    .pdf-search::-webkit-scrollbar-track,
    .search-results-list::-webkit-scrollbar-track {
        background: #2d2d2d;
    }

    .pdf-search::-webkit-scrollbar-thumb,
    .search-results-list::-webkit-scrollbar-thumb {
        background: #666;
        border-radius: 3px;
    }

    .pdf-search::-webkit-scrollbar-thumb:hover,
    .search-results-list::-webkit-scrollbar-thumb:hover {
        background: #777;
    }
</style>
