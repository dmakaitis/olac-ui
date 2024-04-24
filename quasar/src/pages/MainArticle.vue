<script setup lang="ts">
import ArticleWithImages from "components/ArticleWithImages.vue";
</script>

<template>
  <q-page>
    <div class="container q-gutter-y-lg">
      <ArticleWithImages :slug="$route.params.slug as string"/>
    </div>
  </q-page>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
}

hr {
  clear: both
}
</style>
