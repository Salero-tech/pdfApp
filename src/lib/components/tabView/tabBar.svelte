<script lang="ts">
  import type { ContentContainer } from '$lib/components/contentContainer';

  export let tabs: ContentContainer[] = [];
  export let activeTab = 0;
  export let onTabSelect = (index) => {};
  export let onAddTab = () => {};
  export let onRemoveTab = (index) => {};

  function selectTab(index) {
    onTabSelect(index);
  }

  function closeTab(index, event) {
    event.stopPropagation();
    onRemoveTab(index);
  }
</script>

<div class="flex border-b border-green-800 bg-gray-50 overflow-scroll nowra">
  {#each tabs as tab, i}
    <div class="relative flex items-center">
      <button
        class={`px-6 py-3 cursor-pointer border-none bg-transparent outline-none text-base transition-colors text-nowrap
          ${i === activeTab
            ? 'border-b-2 border-blue-600 bg-white font-bold text-blue-600'
            : 'hover:bg-gray-200 text-gray-700'
          }`}
        on:click={() => selectTab(i)}
        type="button"
      >
        {tab.titel}
      </button>
      <button
        class="absolute right-1 top-1 text-xs text-gray-400 hover:text-red-500 px-1 py-0.5 rounded"
        on:click={(e) => closeTab(i, e)}
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
    on:click={onAddTab}
    type="button"
    aria-label="Add tab"
  >
    +
  </button>
</div>
