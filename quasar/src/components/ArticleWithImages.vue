<script setup lang="ts">
import {onBeforeUpdate, onMounted, Ref, ref} from "vue";
import {useSanityFetcher} from "vue-sanity";
import {SanityBlocks} from "sanity-blocks-vue-component";
import {BlockSerializer, BlockText, Serializers} from "sanity-blocks-vue-component/dist/types";
import ArticleList from "components/ArticleList.vue";
import ArticleImage from "components/ArticleImage.vue";
import FloatingImages from "components/FloatingImages.vue";
import TicketSalesWidget from "components/TicketSalesWidget.vue";
import PayPalDonation from "components/PayPalDonation.vue";

const props = defineProps({slug: String});

const loading = ref(true);
const loadedSlug = ref('');
const title = ref('');
const subtitle = ref('');
const showTitle = ref(false);
const copy: Ref<any[]> = ref([]);
const serializers : Partial<Serializers> = {
  types: {
    "collection": ((ArticleList as unknown) as BlockSerializer<BlockText>),
    "image": ((ArticleImage as unknown) as BlockSerializer<BlockText>),
    "floatingimages": ((FloatingImages as unknown) as BlockSerializer<BlockText>),
    "ticketwidget": ((TicketSalesWidget as unknown) as BlockSerializer<BlockText>),
    "paypaldonation": ((PayPalDonation as unknown) as BlockSerializer<BlockText>)
  }
};

function onNewSlug() {
  loadedSlug.value = '';
  loading.value = true;

  interface SanityResult {
    title: string,
    subtitle: string,
    showtitle: boolean,
    copy: any[]
  }

  useSanityFetcher<SanityResult>(() => `
*[_type == 'article' && slug.current == '${props.slug}'][0]{
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
      .then((result: SanityResult | null) => {
        loading.value = false;
        loadedSlug.value = props.slug || '';

        title.value = result?.title || '';
        subtitle.value = result?.subtitle || '';
        showTitle.value = result?.showtitle || false;
        copy.value = result?.copy || [];
      });
}

onMounted(() => {
  onNewSlug();
});

onBeforeUpdate(() => {
  if (props.slug != loadedSlug.value) {
    onNewSlug();
  }
})
</script>

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

<style scoped>

</style>
