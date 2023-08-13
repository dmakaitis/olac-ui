<template>
  <q-card>
    <q-card-section v-if="loading">
      <div class="text-center">
        <q-spinner size="lg"/>
      </div>
    </q-card-section>
    <q-card-section v-if="!loading && showTitle">
      <div v-if="title" class="text-h4">{{ title }}</div>
      <div v-if="subtitle" class="text-h5">{{ subtitle }}</div>
    </q-card-section>
    <q-card-section v-if="!loading">
      <SanityBlocks :blocks="copy" :serializers="serializers"/>
      <div style="clear: both;"></div>
    </q-card-section>
  </q-card>
</template>

<script>
import {ref} from "vue";
import {useSanityFetcher} from "vue-sanity";
import {SanityBlocks} from "sanity-blocks-vue-component";
import ArticleList from "components/ArticleList.vue";
import ArticleImage from "components/ArticleImage.vue";
import FloatingImages from "components/FloatingImages.vue";
import TicketSalesWidget from "components/TicketSalesWidget.vue";

export default {
  name: "ArticleWithImages",
  components: {SanityBlocks},
  props: {
    slug: String,
  },
  methods: {
    onNewSlug() {
      this.loadedSlug = ''
      this.loading = true

      useSanityFetcher(() => `
*[_type == 'article' && slug.current == '${this.slug}'][0]{
  title,
  subtitle,
  showtitle,
  "copy": copy[]{
    _type == 'collection' => {
      "articleData": articles[]{
        "title": @->title,
        "slug": @->slug.current,
        "imageUrl": @->image.asset->url
      },
      ...
    },
    _type == 'image' => {
      "altText": asset->altText,
      "url": asset->url,
      ...
    },
    _type == 'floatingimages' => {
      "imageData": images[]{
        "altText": asset->altText,
        "url": asset->url
      },
      ...
    },
    !(_type in ['image', 'collection', 'floatingimages']) => @
  }
}
      `).fetch()
        .then(result => {
          this.loading = false
          this.loadedSlug = this.slug

          this.title = result.title
          this.subtitle = result.subtitle
          this.showTitle = result.showtitle
          this.copy = result.copy
        })
    }
  },
  setup(props) {
    const serializers = {
      types: {
        collection: ArticleList,
        image: ArticleImage,
        floatingimages: FloatingImages,
        ticketwidget: TicketSalesWidget
      }
    }

    return {
      loading: ref(true),
      loadedSlug: ref(''),
      title: ref(''),
      subtitle: ref(''),
      showTitle: ref(false),
      copy: ref([]),
      serializers
    }
  },
  mounted() {
    this.onNewSlug()
  },
  beforeUpdate() {
    if (this.slug != this.loadedSlug) {
      this.onNewSlug()
    }
  }
}
</script>

<style scoped>

</style>
