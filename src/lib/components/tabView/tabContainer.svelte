<script lang="ts">
    import { tabs } from '../../data/contentContainer.svelte';
    import Pdf from '$lib/components/pdf/pdf.svelte';
    import { pickFile } from '$lib/data/fileInteractions.svelte';
</script>


<div class="flex-1">
    {#if tabs.currentTab && tabs.currentTab.content}
    {#key tabs.currentTabIndex}
      <Pdf />
    {/key}
    {:else}
    <div class="flex justify-center items-center h-full">
        <button
            onclick={pickFile}
            class="px-4 py-2 bg-blue-500 text-white rounded transition duration-150 ease-in-out hover:bg-blue-600 active:bg-blue-700 focus:outline-none">
          Open PDF
        </button>
    </div>
    {/if}
</div>