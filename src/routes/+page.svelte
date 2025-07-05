<script lang="ts">
    import TabBar from "$lib/components/tabView/tabBar.svelte";
    import type { ContentContainer } from "$lib/components/contentContainer";
    import TabContainer from "$lib/components/tabView/tabContainer.svelte";
    import { onMount } from "svelte";

    let tabs: ContentContainer[] = $state([]);

    let activeTab = $state(0);

    onMount(() => {
        if (tabs.length === 0) {
            addTab();
        }
    });


    function addTab() {
        tabs.push({ titel: "*new", content: null });
        console.log(tabs);
        switchTabtoIndex(tabs.length - 1);
    }

    function removeTab(index: number) {
        if (tabs.length > 0) {
            tabs.splice(index, 1);
            if (activeTab >= tabs.length) {
                activeTab = tabs.length - 1;
            }
        }
    }

    function switchTabtoIndex(index: number) {
        if (index == activeTab) return;
        if(tabs[activeTab] && tabs[activeTab].content === null) {
            removeTab(activeTab);
        }
        if (tabs[index]) activeTab = index;
        else activeTab = tabs.length - 1;
    }

</script>

<main class="h-screen w-screen flex flex-col">
    <TabBar tabs={tabs} activeTab={activeTab} onTabSelect={switchTabtoIndex} onAddTab={addTab} onRemoveTab={removeTab}/>
    <TabContainer tab={tabs[activeTab]} />
</main>




<style lang="postcss">
    @reference "tailwindcss";
    :global(html) {
        background-color: theme(--color-gray-500);
    }
</style>