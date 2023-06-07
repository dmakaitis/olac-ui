<template>
  <q-card>
    <q-card-section v-if="loading">
      <div class="text-center"><q-spinner size="lg"/></div>
    </q-card-section>
    <q-card-section v-if="!loading">
      <div v-if="title" class="text-h4">{{ title }}</div>
      <div v-if="subtitle" class="text-h5">{{ subtitle }}</div>
    </q-card-section>
    <q-card-section v-if="!loading">
      <div v-if="leftImagesArray.length" class="float-left">
        <q-img v-for="image in leftImagesArray" :key="image" :src="image" class="shadow-24"/>
      </div>
      <div v-if="rightImagesArray.length" class="float-right">
        <q-img v-for="image in rightImagesArray" :key="image" :src="image" class="shadow-24"/>
      </div>
      <SanityBlocks :blocks="copy"/>
      <div style="clear: both;"></div>
    </q-card-section>
  </q-card>
</template>

<script>
import {ref} from "vue";
import {useSanityFetcher} from "vue-sanity";
import {SanityBlocks} from "sanity-blocks-vue-component";

export default {
  name: "ArticleWithImages",
  components: {SanityBlocks},
  props: {
    slug: String,
  },
  setup(props) {
    return {
      loading: ref(true),
      title: ref(''),
      subtitle: ref(''),
      leftImagesArray: ref([]),
      rightImagesArray: ref([]),
      copy: ref([]),
    }
  },
  mounted() {
    useSanityFetcher(() => `*[slug.current == '${this.slug}'][0]{title, subtitle, imagesOnLeft, copy, "imageUrls": images[].asset->url}`).fetch()
      .then(result => {
        this.loading = false

        this.title = result.title
        this.subtitle = result.subtitle
        this.copy = result.copy

        if (result.imagesOnLeft) {
          this.leftImagesArray = result.imageUrls
        } else {
          this.rightImagesArray = result.imageUrls
        }
      })
  }
}
</script>

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
