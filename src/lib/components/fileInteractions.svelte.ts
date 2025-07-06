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