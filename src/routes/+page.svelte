<script lang="ts">
    // Path to your PDF (relative to public)
    let pdfUrl = "/test.pdf";
    // Path to the viewer, with the PDF as a query param
    let viewerUrl = `/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`;
</script>

<iframe
    src={viewerUrl}
    style="width: 100%; height: 90vh; border: none;"
    title="PDF.js Official Viewer"
></iframe>
