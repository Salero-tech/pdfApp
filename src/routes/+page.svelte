<script lang="ts">
  import Pdf from '$lib/pdf/pdf.svelte';
  import FilePicker from '$lib/pdf/FilePicker.svelte';
  
  let currentPdfUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";
  
  function handleFileSelected(event: CustomEvent<{fileUrl: string}>) {
    currentPdfUrl = event.detail.fileUrl;
  }
</script>

<FilePicker on:fileSelected={handleFileSelected} />

<Pdf pdfUrl={currentPdfUrl} />
