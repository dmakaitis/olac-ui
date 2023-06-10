<script setup>
  const props = defineProps(['url', 'altText'])
</script>

<template>
<img :src="url" :alt="altText" class="shadow-24" style="width: 100%;"/>
</template>

<style scoped>

</style>
