<script lang="ts">
    import PDFViewer from "$lib/components/PDFViewer.svelte";
    import AdvancedPDFViewer from "$lib/components/AdvancedPDFViewer.svelte";

    let pdfUrl = $state("/test.pdf");
    let selectedFile = $state<File | null>(null);
    let fileUrl = $state("");
    let activeViewer = $state<"basic" | "advanced">("basic");
    let theme = $state<"light" | "dark">("light");
    let enableFeatures = $state({
        textSelection: true,
        thumbnails: false,
        search: true,
        toolbar: true,
    });

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
    <title>Custom PDF Viewer</title>
</svelte:head>

<div class="container">
    <h1>Custom PDF Viewer Demo</h1>

    <div class="controls">
        <h2>Configuration</h2>

        <div class="config-grid">
            <div class="file-controls">
                <h3>Load PDF</h3>
                <label for="pdf-upload" class="upload-label">
                    Upload PDF File:
                    <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf,application/pdf"
                        onchange={handleFileChange}
                    />
                </label>

                <div class="url-control">
                    <label for="pdf-url">Or use URL:</label>
                    <input
                        id="pdf-url"
                        type="text"
                        bind:value={pdfUrl}
                        placeholder="Enter PDF URL"
                    />
                </div>
            </div>

            <div class="viewer-controls">
                <h3>Viewer Type</h3>
                <div class="radio-group">
                    <label>
                        <input
                            type="radio"
                            bind:group={activeViewer}
                            value="basic"
                        />
                        Basic Viewer
                    </label>
                    <label>
                        <input
                            type="radio"
                            bind:group={activeViewer}
                            value="advanced"
                        />
                        Advanced Viewer
                    </label>
                </div>

                {#if activeViewer === "advanced"}
                    <h3>Advanced Features</h3>
                    <div class="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                bind:checked={enableFeatures.textSelection}
                            />
                            Text Selection
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                bind:checked={enableFeatures.thumbnails}
                            />
                            Thumbnails
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                bind:checked={enableFeatures.search}
                            />
                            Search
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                bind:checked={enableFeatures.toolbar}
                            />
                            Toolbar
                        </label>
                    </div>

                    <h3>Theme</h3>
                    <div class="radio-group">
                        <label>
                            <input
                                type="radio"
                                bind:group={theme}
                                value="light"
                            />
                            Light
                        </label>
                        <label>
                            <input
                                type="radio"
                                bind:group={theme}
                                value="dark"
                            />
                            Dark
                        </label>
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <div class="viewer-section">
        <h2>{activeViewer === "basic" ? "Basic" : "Advanced"} PDF Viewer</h2>

        {#if activeViewer === "basic"}
            <PDFViewer src={currentPdfSrc} width="100%" height="700px" />
        {:else}
            <AdvancedPDFViewer
                src={currentPdfSrc}
                width="100%"
                height="700px"
                {theme}
                enableTextSelection={enableFeatures.textSelection}
                showThumbnails={enableFeatures.thumbnails}
                enableSearch={enableFeatures.search}
                toolbar={enableFeatures.toolbar}
                ondocumentloaded={handleDocumentLoaded}
                onpagechanged={handlePageChanged}
                onerror={handleError}
            />
        {/if}
    </div>

    <div class="navigation">
        <a href="/" class="nav-link">← Back to Main PDF Viewer</a>
    </div>

    <div class="features">
        <h2>Implementation Approaches</h2>

        <div class="approach-comparison">
            <div class="approach">
                <h3>🔧 Basic Viewer</h3>
                <ul>
                    <li>✅ Simple integration</li>
                    <li>✅ Essential controls</li>
                    <li>✅ Lightweight</li>
                    <li>✅ Easy to customize</li>
                    <li>✅ Good for basic use cases</li>
                </ul>
            </div>

            <div class="approach">
                <h3>🚀 Advanced Viewer</h3>
                <ul>
                    <li>✅ Full-featured</li>
                    <li>✅ Text selection & search</li>
                    <li>✅ Thumbnail navigation</li>
                    <li>✅ Multiple themes</li>
                    <li>✅ Event dispatching</li>
                    <li>✅ Sidebar with tabs</li>
                    <li>✅ Advanced controls</li>
                </ul>
            </div>
        </div>

        <h3>Why Use pdfjs-dist?</h3>
        <div class="benefits">
            <div class="benefit">
                <h4>📦 Bundle Control</h4>
                <p>Only include what you need, reducing bundle size</p>
            </div>
            <div class="benefit">
                <h4>🎨 Full Customization</h4>
                <p>Build exactly the UI you want</p>
            </div>
            <div class="benefit">
                <h4>⚡ Framework Integration</h4>
                <p>Works seamlessly with SvelteKit</p>
            </div>
            <div class="benefit">
                <h4>🔧 Maintenance</h4>
                <p>npm handles updates automatically</p>
            </div>
        </div>

        <h3>Further Customization Ideas</h3>
        <ul>
            <li>Add annotation tools (highlight, sticky notes)</li>
            <li>Implement form filling capabilities</li>
            <li>Add signature support</li>
            <li>Create custom print layouts</li>
            <li>Add bookmarks and navigation</li>
            <li>Implement document comparison</li>
            <li>Add accessibility features</li>
            <li>Create mobile-optimized gestures</li>
        </ul>
    </div>
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    h1 {
        color: #333;
        margin-bottom: 30px;
        text-align: center;
    }

    h2 {
        color: #555;
        margin: 20px 0 15px 0;
    }

    h3 {
        color: #666;
        margin: 15px 0 10px 0;
        font-size: 16px;
    }

    .controls {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
    }

    .config-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
    }

    .file-controls {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .upload-label {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-weight: 500;
    }

    .upload-label input[type="file"] {
        padding: 8px;
        border: 2px dashed #ccc;
        border-radius: 4px;
        background: white;
    }

    .url-control {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .url-control label {
        font-weight: 500;
    }

    .url-control input {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }

    .viewer-controls {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .radio-group,
    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .radio-group label,
    .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px;
    }

    .radio-group input,
    .checkbox-group input {
        margin: 0;
    }

    .viewer-section {
        margin-bottom: 30px;
    }

    .features {
        background: #f0f8ff;
        padding: 20px;
        border-radius: 8px;
    }

    .approach-comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 20px 0;
    }

    .approach {
        background: white;
        padding: 15px;
        border-radius: 6px;
        border-left: 4px solid #007acc;
    }

    .approach h3 {
        margin-top: 0;
        color: #007acc;
    }

    .benefits {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
        margin: 20px 0;
    }

    .benefit {
        background: white;
        padding: 15px;
        border-radius: 6px;
        border: 1px solid #ddd;
    }

    .benefit h4 {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 14px;
    }

    .benefit p {
        margin: 0;
        color: #666;
        font-size: 13px;
        line-height: 1.4;
    }

    .features ul {
        margin: 10px 0;
        padding-left: 20px;
    }

    .features li {
        margin: 5px 0;
    }

    .navigation {
        margin-bottom: 20px;
    }

    .nav-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: #007acc;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .nav-link:hover {
        background: #005f99;
    }

    @media (max-width: 768px) {
        .container {
            padding: 10px;
        }

        .config-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .approach-comparison {
            grid-template-columns: 1fr;
        }

        .benefits {
            grid-template-columns: 1fr;
        }
    }
</style>
