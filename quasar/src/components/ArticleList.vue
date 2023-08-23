<script setup lang="ts">
import {useRouter} from "vue-router";

interface ArticleData {
  slug: string,
  title: string,
  imageUrl: string
}

const router = useRouter();
const props = defineProps<{
  articleData: ArticleData[]
}>();

function onClickArticle(slug: string) {
  router.push(`/main/article/${slug}`);
}
</script>

<template>
  <div class="q-pa-md row items-start q-gutter-md justify-center">
    <q-card class="my-card shadow-24" v-for="article in articleData" :key="article.slug">
      <div v-ripple @click="onClickArticle(article.slug)" class="cursor-pointer relative-position">
        <q-img :src="`${article.imageUrl}?w=300&h=200&fit=min`">
          <div class="absolute-top text-h5 text-center">
            {{ article.title }}
          </div>
        </q-img>
      </div>
    </q-card>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
}

.my-card {
  width: 100%;
  max-width: 300px;
}

.my-card:hover {
  position: relative;
  top: -5px;
}
</style>
