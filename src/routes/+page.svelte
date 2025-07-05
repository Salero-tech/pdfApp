<script lang="ts">
    import TabBar from "$lib/components/tabView/tabBar.svelte";
    import { type ContentContainer, tabs } from "$lib/components/contentContainer.svelte";
    import TabContainer from "$lib/components/tabView/tabContainer.svelte";
    import { onMount } from "svelte";
    import { StatusBar, Style } from '@capacitor/status-bar';

    let activeTab = $state(0);

    onMount(async () => {
        if (tabs.tabs.length === 0) {
            addTab();
        }
    try {
      // Hide the status bar on mobile
      await StatusBar.hide();
    } catch (error) {
      console.warn('Status bar not available (probably web browser)');
    }
    });


    function addTab() {
        tabs.tabs.push({ titel: "*new", content: null, pdf: null } as ContentContainer);
        switchTabtoIndex(tabs.tabs.length - 1);
    }

    function removeTab(index: number) {
        if (tabs.tabs.length > 0) {
            tabs.tabs.splice(index, 1);
            if (activeTab >= tabs.tabs.length) {
                activeTab = tabs.tabs.length - 1;
            }
        }
    }

    function switchTabtoIndex(index: number) {
        if (index == activeTab) return;
        if(tabs.tabs[activeTab] && tabs.tabs[activeTab].content === null) {
            removeTab(activeTab);
        }
        if (tabs.tabs[index]) activeTab = index;
        else activeTab = tabs.tabs.length - 1;
    }

</script>

<main class="h-screen w-screen flex flex-col">
    <TabBar activeTab={activeTab} onTabSelect={switchTabtoIndex} onAddTab={addTab} onRemoveTab={removeTab}/>
    <TabContainer activeTab={activeTab} />
</main>




<style lang="postcss">
    @reference "tailwindcss";
    :global(html) {
        background-color: theme(--color-gray-500);
    }
</style>