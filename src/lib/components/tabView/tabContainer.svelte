<script lang="ts">
    import type { ContentContainer } from '../contentContainer';

    export let tab:ContentContainer;

    function openPDF() {
        // Logic to open PDF goes here
        console.log('Open PDF clicked');
    }



</script>


<div class="flex-1">
    {#if tab && tab.content}
    {tab.content}
    {:else}
    <div class="flex justify-center items-center h-full">
        <button
            onclick={openPDF}
            class="px-4 py-2 bg-blue-500 text-white rounded transition duration-150 ease-in-out hover:bg-blue-600 active:bg-blue-700 focus:outline-none">
            Open PDF
        </button>
    </div>
    {/if}
</div>