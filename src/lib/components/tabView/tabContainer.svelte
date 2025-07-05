<script lang="ts">
    import { type ContentContainer, tabs } from '../contentContainer.svelte';
    import Pdf from '$lib/components/pdf/pdf.svelte';
    import { Filesystem, Directory } from '@capacitor/filesystem';
    

    let selectedFile: File | null = null;
    let selectedFileName: string | null = null;

 async function selectFile(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      selectedFile = file;
      selectedFileName = file.name;
      tabs.currentTab.titel = selectedFileName;
      
      const reader = new FileReader();
      reader.onload = () => {
        tabs.currentTab.pdfUrl = reader.result as string;
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


<div class="flex-1">
    {#if tabs.currentTab && tabs.currentTab.pdfUrl}
    <Pdf  pdfUrl={tabs.currentTab.pdfUrl} />
    {:else}
    <div class="flex justify-center items-center h-full">
        <input
            type="file" accept=".pdf" onchange={selectFile}
            class="px-4 py-2 bg-blue-500 text-white rounded transition duration-150 ease-in-out hover:bg-blue-600 active:bg-blue-700 focus:outline-none" />
    </div>
    {/if}
</div>