<script setup lang="ts">
const props = defineProps<{
  url: string,
  altText: string
}>();
</script>

<template>
  <img :src="url" :alt="altText" class="shadow-24" style="width: 100%;"/>
</template>

<style scoped>

</style>
