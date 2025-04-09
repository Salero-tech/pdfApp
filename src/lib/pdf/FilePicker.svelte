<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      dispatch('fileSelected', { fileUrl });
    }
  }
</script>

<div class="file-picker">
  <label for="pdf-file" class="file-picker-label">
    Choose PDF File
    <input
      type="file"
      id="pdf-file"
      accept=".pdf"
      on:change={handleFileSelect}
      class="file-input"
    />
  </label>
</div>

<style>
  .file-picker {
    margin: 1rem 0;
  }
  
  .file-picker-label {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #4a5568;
    color: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .file-picker-label:hover {
    background-color: #2d3748;
  }
  
  .file-input {
    display: none;
  }
</style> 