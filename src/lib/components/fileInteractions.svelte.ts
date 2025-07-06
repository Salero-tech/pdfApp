import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { tabs } from './contentContainer.svelte';


function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
    return btoa(String.fromCharCode(...uint8Array));
}



export async function pickFile() {
    const result = await FilePicker.pickFiles({
        limit: 1,
        types: ['application/pdf'],
        readData: true,

    });
    if (result.files && result.files.length > 0) {
        const file = result.files[0];

        tabs.currentTab.file = file;
        tabs.currentTab.filePath = file.path || null;
        tabs.currentTab.fileName = file.name;
        tabs.currentTab.content = base64ToUint8Array(file.data!);
    }
}


export async function savePDF() {
    if (!tabs.currentTab.fileName || !tabs.currentTab.content) {
      alert('No file selected.');
      console.log('No file selected.');
      return;
    }

    if (tabs.currentTab.filePath) await saveFileToFileSystem();
    else await download();
}

async function saveFileToFileSystem() {
    try {
      
      const dataToSave = uint8ArrayToBase64(tabs.currentTab.content);

      await Filesystem.writeFile({
        path: tabs.currentTab.fileName,
        data: dataToSave,
        directory: Directory.Documents,
      });
      
      alert(`File saved with annotations as ${tabs.currentTab.fileName}`);
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file');
    }
  }



async function download() {
    const blob = new Blob([tabs.currentTab.content], { type: 'application/pdf' });

    // Create a temporary link and trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tabs.currentTab.fileName || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}