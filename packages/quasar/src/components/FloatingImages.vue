<script setup lang="ts">
interface ImageData {
  altText: string,
  url: string
}

interface Image {
  "_type": string,
  "_key": string,
  asset: {
    "_ref": string,
    "_type": string
  }
}

const props = defineProps<{
  left: boolean,
  imageData: ImageData[],
  images: Image[]
}>();
</script>

<template>
  <div v-if="left" class="float-left">
    <img v-for="image in imageData" :key="image.url" :src="`${image.url}?w=300`" :alt="image.altText"
         class="shadow-24"/>
  </div>
  <div v-if="!left" class="float-right">
    <img v-for="image in imageData" :key="image.url" :src="`${image.url}?w=300`" :alt="image.altText"
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
