<script lang="ts">
    import TabBar from "$lib/components/tabView/tabBar.svelte";
    import TabContainer from "$lib/components/tabView/tabContainer.svelte";
    import { onMount } from "svelte";
    import { StatusBar, Style } from '@capacitor/status-bar';

    onMount(async () => {
    try {
      // Hide the status bar on mobile
      await StatusBar.hide();
    } catch (error) {
      console.warn('Status bar not available (probably web browser)');
    }
    });

</script>

<main class="h-screen w-screen flex flex-col">
    <TabBar/>
    <TabContainer />
</main>




<style lang="postcss">
    @reference "tailwindcss";
    :global(html) {
        background-color: theme(--color-gray-500);
    }
</style>