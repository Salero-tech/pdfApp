<script lang="ts">
  import Pdf from '$lib/components/pdf/pdf.svelte';
  import { Filesystem, Directory } from '@capacitor/filesystem';
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { onMount } from 'svelte';

  let selectedFile: File | null = null;
  let selectedFileName: string | null = null;
  let pdfUrl: string | null = null;
  let pdfComponent: Pdf;

  onMount(async () => {
    try {
      // Hide the status bar on mobile
      await StatusBar.hide();
      
      // Alternatively, you can set it to overlay mode instead of hiding
      // await StatusBar.setOverlaysWebView({ overlay: true });
      // await StatusBar.setStyle({ style: Style.Dark });
    } catch (error) {
      console.log('Status bar not available (probably web browser)');
    }
  });

  async function selectFile(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      selectedFile = file;
      selectedFileName = file.name;
      
      const reader = new FileReader();
      reader.onload = () => {
        pdfUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function saveFile() {
    if (!selectedFile || !selectedFileName) {
      alert('No file selected.');
      return;
    }

    try {
      // Get annotated PDF data from PDF component
      const annotatedData = await pdfComponent?.getAnnotatedPDFData();
      
      let dataToSave: string;
      if (annotatedData) {
        // Convert Uint8Array to base64
        dataToSave = btoa(String.fromCharCode(...annotatedData));
      } else {
        // Fallback to original file data
        dataToSave = pdfUrl!.split(',')[1];
      }
      
      await Filesystem.writeFile({
        path: selectedFileName,
        data: dataToSave,
        directory: Directory.Documents,
      });
      
      alert(`File saved with annotations as ${selectedFileName}`);
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file');
    }
  }

  // Function to get annotated PDF data from PDF component
  async function getAnnotatedPDFData(): Promise<string | null> {
    // You'll need to expose this from your PDF component
    // For now, return null
    return null;
  }
</script>

<div class="bar">
  <div class="spacer"></div>
  <input type="file" accept=".pdf" on:change={selectFile} />
  <button on:click={saveFile} disabled={!selectedFile}>
    Save {selectedFileName ? `"${selectedFileName}"` : 'File'}
  </button>
  {#if selectedFileName}
    <span class="filename">Current: {selectedFileName}</span>
  {/if}
</div>

{#if pdfUrl}
  <Pdf bind:this={pdfComponent} pdfUrl={pdfUrl} />
{/if}

<style>
  .bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 200;
    background: #964ea5;
    padding: 0.5rem;
    border-bottom: 1px solid #ccc;
    display: flex;
    gap: 0.5rem;
    align-items: end;
  }
  
  .filename {
    font-size: 0.9em;
    color: #666;
    margin-left: auto;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .spacer {
    height: 30px;
  }
</style>