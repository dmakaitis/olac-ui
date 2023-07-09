<template>
  <q-page>
    <div class="container q-gutter-y-lg">
      <ArticleWithImages :slug="$route.params.slug"/>
    </div>
  </q-page>
</template>

<script>
import {ref} from "vue";
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
