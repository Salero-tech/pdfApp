<script lang="ts">
  import { tabs } from '$lib/data/contentContainer.svelte';
    import { onMount } from 'svelte';

  onMount(() => {
    // Initialize the first tab if it doesn't exist
    if (tabs.isEmpty) {
      tabs.addTab();
    }
  });

</script>

<div class="flex border-b border-green-800 bg-gray-50  nowra">
  {#each tabs.tabs as tab, i}
    <div class="relative flex items-center">
      <button
        class={`px-6 py-3 cursor-pointer border-none bg-transparent outline-none text-base transition-colors text-nowrap
          ${i === tabs.currentTabIndex
            ? 'border-b-2 border-blue-600 bg-white font-bold text-blue-600'
            : 'hover:bg-gray-200 text-gray-700'
          }`}
        on:click={() => tabs.switchTabTo(i)}
        type="button"
      >
        {tab.fileName}
      </button>
      <button
        class="absolute right-1 top-1 text-xs text-gray-400 hover:text-red-500 px-1 py-0.5 rounded"
        on:click={(e) => tabs.removeTab(i)}
        tabindex="-1"
        aria-label="Close tab"
        style="transform: translateY(-50%);"
      >
        ×
      </button>
    </div>
  {/each}
  <button
    class="px-4 py-3 cursor-pointer border-none bg-transparent outline-none text-xl text-gray-500 hover:text-blue-600 transition-colors"
    on:click={tabs.addTab}
    type="button"
    aria-label="Add tab"
  >
    +
  </button>
</div>
