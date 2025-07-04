<script lang="ts">
  import Pdf from '$lib/pdf/pdf.svelte';
  import { Filesystem } from '@capacitor/filesystem';
  import { onMount } from 'svelte';

  let selectedFilePath: string | null = null;
  let pdfUrl: string | null = null;

  async function selectFile(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        pdfUrl = reader.result as string; // Load the file as a data URL
      };
      reader.readAsDataURL(file);
    }
  }

  async function saveFile() {
    /*
    if (selectedFilePath && pdfUrl) {
      await Filesystem.writeFile({
        path: selectedFilePath,
        data: pdfUrl.split(',')[1], // Remove the data URL prefix
        directory: FilesystemDirectory.Documents,
      });
      alert('File saved successfully!');
    } else {
      alert('No file selected or no changes made.');
    }
      */
  }
</script>

<div>
  <input type="file" on:change={selectFile} />
  <button on:click={saveFile}>Save</button>
</div>

{#if pdfUrl}
  <Pdf pdfUrl={pdfUrl} />
{/if}
