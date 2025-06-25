<script lang="ts">
    import AdvancedPDFViewer from "$lib/components/AdvancedPDFViewer.svelte";

    let pdfUrl = $state("/test.pdf");
    let selectedFile = $state<File | null>(null);
    let fileUrl = $state("");
    let theme = $state<"light" | "dark">("light");

    // Handle file upload
    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file && file.type === "application/pdf") {
            selectedFile = file;
            // Create object URL for the file
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
            fileUrl = URL.createObjectURL(file);
        }
    }

    // Event handlers
    function handleDocumentLoaded(event: CustomEvent) {
        console.log("Document loaded:", event.detail);
    }

    function handlePageChanged(event: CustomEvent) {
        console.log("Page changed:", event.detail);
    }

    function handleError(event: CustomEvent) {
        console.error("PDF Error:", event.detail);
    }

    // Get current PDF source
    const currentPdfSrc = $derived(fileUrl || pdfUrl);
</script>

<svelte:head>
    <title>PDF Viewer App</title>
    <meta
        name="description"
        content="Advanced PDF viewer built with PDF.js and SvelteKit"
    />
</svelte:head>

<div class="app-container">
    <header class="app-header">
        <h1>PDF Viewer</h1>
        <p>Advanced PDF viewer with search, thumbnails, and more</p>
    </header>

    <div class="controls-bar">
        <div class="file-upload">
            <label for="pdf-upload" class="upload-button">
                📁 Upload PDF
                <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    onchange={handleFileChange}
                    style="display: none;"
                />
            </label>
            {#if selectedFile}
                <span class="file-name">{selectedFile.name}</span>
            {/if}
        </div>

        <div class="theme-toggle">
            <label>
                <input type="radio" bind:group={theme} value="light" />
                ☀️ Light
            </label>
            <label>
                <input type="radio" bind:group={theme} value="dark" />
                🌙 Dark
            </label>
        </div>
    </div>

    <main class="viewer-container">
        <AdvancedPDFViewer
            src={currentPdfSrc}
            width="100%"
            height="calc(100vh - 160px)"
            {theme}
            enableTextSelection={true}
            showThumbnails={true}
            enableSearch={true}
            toolbar={true}
            ondocumentloaded={handleDocumentLoaded}
            onpagechanged={handlePageChanged}
            onerror={handleError}
        />
    </main>

    <footer class="app-footer">
        <p>
            Built with <a
                href="https://mozilla.github.io/pdf.js/"
                target="_blank">PDF.js</a
            >
            and <a href="https://svelte.dev" target="_blank">SvelteKit</a>
            • <a href="/custom">View Demo & Customization Options</a>
        </p>
    </footer>
</div>

<style>
    .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #fafafa;
    }

    .app-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .app-header h1 {
        margin: 0 0 8px 0;
        font-size: 2.5rem;
        font-weight: 300;
    }

    .app-header p {
        margin: 0;
        opacity: 0.9;
        font-size: 1.1rem;
    }

    .controls-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        flex-wrap: wrap;
        gap: 15px;
    }

    .file-upload {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .upload-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #007acc;
        color: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .upload-button:hover {
        background: #005f99;
    }

    .file-name {
        color: #666;
        font-size: 14px;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .theme-toggle {
        display: flex;
        gap: 15px;
    }

    .theme-toggle label {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .theme-toggle label:hover {
        background: #f0f0f0;
    }

    .theme-toggle input {
        margin: 0;
    }

    .viewer-container {
        flex: 1;
        padding: 20px;
        display: flex;
        justify-content: center;
    }

    .app-footer {
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border-top: 1px solid #e0e0e0;
        color: #666;
        font-size: 14px;
    }

    .app-footer a {
        color: #007acc;
        text-decoration: none;
    }

    .app-footer a:hover {
        text-decoration: underline;
    }

    @media (max-width: 768px) {
        .app-header h1 {
            font-size: 2rem;
        }

        .controls-bar {
            flex-direction: column;
            align-items: stretch;
        }

        .file-upload,
        .theme-toggle {
            justify-content: center;
        }

        .viewer-container {
            padding: 10px;
        }
    }
</style>
