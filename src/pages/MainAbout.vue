<template>
  <q-page>
    <div class="container q-pa-md row items-start q-gutter-md justify-center">
      <q-card class="my-card shadow-24" v-for="article in articles" :key="article.slug">
        <div v-ripple @click="onClickArticle(article.slug)" class="cursor-pointer relative-position">
          <q-img :src="`${article.imageUrl}?w=300&h=200&fit=min`">
            <div class="absolute-top text-h5 text-center">
              {{ article.title }}
            </div>
          </q-img>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import {ref} from "vue";
import {useSanityFetcher} from "vue-sanity";

export default {
  name: "MainAbout",
  methods: {
    onClickArticle(slug) {
      this.$router.push(`/main/article/${slug}`)
    }
  },
  setup() {
    return {
      articles: ref([])
    }
  },
  mounted() {
    useSanityFetcher('*[_id == "3989c665-b8cb-4f90-959b-285f5a6e0a4a"]{title, articles[]->{title, "slug": slug.current, "imageUrl": images[0].asset->url}}').fetch()
      .then(result => {
        console.log(`Retrieved: ${JSON.stringify(result)}`)
        // console.log(`Title: ${result[0].title}`)
        // console.log(`Slugs: ${result[0].articles.map(a => a.slug)}`)
        this.articles = result[0].articles
      })
  }
}
</script>

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

hr {
  clear: both
}
</style>
