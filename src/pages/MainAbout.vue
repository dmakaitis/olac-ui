<template>
  <q-page>
    <div class="container q-gutter-y-lg">
      <ArticleWithImages slug="omaha-lithuanian-american-community"/>
      <ArticleWithImages slug="ausra"/>
      <ArticleWithImages slug="women-s-club"/>
      <ArticleWithImages slug="omaha-sister-cities-association-osca"/>
      <ArticleWithImages slug="rambynas"/>
      <ArticleWithImages slug="scouts"/>
    </div>
  </q-page>
</template>

<script>
import ArticleWithImages from "components/ArticleWithImages.vue";

export default {
  name: "MainAbout",
  components: {ArticleWithImages}
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
}

hr {
  clear: both
}
</style>
