<script lang="ts">
    import PDFViewer from "$lib/components/PDFViewer.svelte";

    let pdfUrl = $state("/test.pdf");
    let selectedFile = $state<File | null>(null);
    let fileUrl = $state("");

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
    </div>

    <main class="viewer-container">
        <PDFViewer
            src={currentPdfSrc}
            width="100%"
            height="calc(100vh - 80px)"
            theme="dark"
            enableTextSelection={true}
            showThumbnails={true}
            enableSearch={true}
            toolbar={true}
            ondocumentloaded={handleDocumentLoaded}
            onpagechanged={handlePageChanged}
            onerror={handleError}
        />
    </main>
</div>

<style>
    .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #fafafa;
    }

    .controls-bar {
        display: flex;
        justify-content: flex-start;
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

    .viewer-container {
        flex: 1;
        padding: 20px;
        display: flex;
        justify-content: center;
    }

    @media (max-width: 768px) {
        .controls-bar {
            flex-direction: column;
            align-items: stretch;
        }

        .file-upload {
            justify-content: center;
        }

        .viewer-container {
            padding: 10px;
        }
    }
</style>
