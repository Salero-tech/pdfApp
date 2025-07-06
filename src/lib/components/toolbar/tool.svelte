<script lang="ts">
  let { icon = "🛠️", activeIndex = -1, onclick = (index: number) => {}, index = -2 } = $props();
</script>

<button
  class={`w-12 h-12 flex items-center justify-center rounded-full text-2xl shadow transition
    ${index==activeIndex ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
  type="button"
  onclick={() => onclick(index)}
>
  {icon}
</button>