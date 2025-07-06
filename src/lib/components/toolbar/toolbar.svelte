<script lang="ts">
    import { tools } from "$lib/data/tools.svelte";
    import Tool from "./tool.svelte";

    function addTool() {
        console.log("add a tool?");
    }

</script>

<div class="fixed right-2 top-1/2 transform -translate-y-1/2 bg-gray-100 px-2 py-2 rounded-4xl z-50 text-gray-800 border-none">
    <ul class="space-y-2">
        {#each tools.tools as tool, i}
            <li><Tool activeIndex={tools.getACtiveToolIndex} icon={tool.icon} index={i} onclick={tools.onclick} /></li>
        {/each}
        <li><Tool icon="+" onclick={(i) => addTool()}/></li>
    </ul>
</div>