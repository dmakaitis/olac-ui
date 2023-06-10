<script setup>
const props = defineProps(['left', 'imageData'])
</script>

<template>
  <div v-if="left" class="float-left">
    <img v-for="image in imageData" :key="image" :src="`${image.url}?w=300`" :alt="image.altText"
         class="shadow-24"/>
  </div>
  <div v-if="!left" class="float-right">
    <img v-for="image in imageData" :key="image" :src="`${image.url}?w=300`" :alt="image.altText"
         class="shadow-24"/>
  </div>
</template>

<style scoped>
.float-left {
  float: left;
  margin: 15px;
  width: 30%;
  min-width: 300px;
}

.float-right {
  float: right;
  margin: 15px;
  width: 30%;
  min-width: 300px;
}

@media (max-width: 600px) {
  .float-left {
    float: none;
    width: 100%;
    min-width: 100%;
  }

  .float-right {
    float: none;
    width: 100%;
    min-width: 100%;
  }
}
</style>
