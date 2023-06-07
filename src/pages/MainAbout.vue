<template>
  <q-page>
    <div class="container q-gutter-y-lg">
      <ArticleWithImages v-for="slug in slugs" :key="slug" :slug="slug"/>
    </div>
  </q-page>
</template>

<script>
import {ref} from "vue";
import {useSanityFetcher} from "vue-sanity";
import ArticleWithImages from "components/ArticleWithImages.vue";

export default {
  name: "MainAbout",
  components: {ArticleWithImages},
  setup() {
    return {
      slugs: ref([])
    }
  },
  mounted() {
    useSanityFetcher('*[_id == "3989c665-b8cb-4f90-959b-285f5a6e0a4a"]{title, "slugs": articles[]->slug.current}').fetch()
      .then(result => {
        console.log(`Retrieved: ${JSON.stringify(result)}`)
        console.log(`Title: ${result[0].title}`)
        this.slugs = result[0].slugs
      })
  }
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
