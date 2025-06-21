<script setup lang="ts">
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {useSanityFetcher} from "vue-sanity";
import {date} from "quasar";

interface EventData {
  slug: string,
  title: string,
  imageUrl: string,
  eventDate: string
}

const router = useRouter();
const props = defineProps<{ future: boolean }>();
const events = ref<EventData[]>([]);
const loading = ref<boolean>(true);

function onClickArticle(slug: string) {
  router.push(`/main/article/${slug}`);
}

function formatDate(eventDate: string) {
  var d = new Date(eventDate);
  var offset = d.getTimezoneOffset() * 60000;
  d = new Date(d.getTime() + offset);
  return date.formatDate(d.toDateString(), "ddd, MMM D, YYYY");
}

onMounted(() => {
  var now = new Date().toISOString().substring(0, 10);

  var filter = props.future ?
    `*[_type=='article' && eventdate >= "${now}"] | order(eventdate asc)` :
    `*[_type=='article' && eventdate < "${now}"] | order(eventdate desc)`;

  useSanityFetcher<EventData[]>(`
${filter}
{
  title,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  "eventDate": eventdate
}
    `).fetch()
    .then(result => {
      events.value = result || [];
      loading.value = false;
    })
});

</script>

<template>
  <div v-if="loading" class="text-center">
    <q-spinner size="lg"/>
  </div>
  <div v-if="!loading && events.length <= 0" class="text-center text-h5">
    There are no {{ props.future ? "future" : "past" }} events scheduled at this time. Please check again later.
  </div>
  <div v-if="!loading && events.length > 0" class="q-pa-md row items-start q-gutter-md justify-center">
    <q-card class="my-card shadow-24" v-for="event in events" :key="event.slug">
      <div v-ripple @click="onClickArticle(event.slug)" class="cursor-pointer relative-position">
        <q-img :src="`${event.imageUrl}?w=300&h=200&fit=min`">
          <div class="absolute-top text-h6 text-center">
            <div class="text-h5">
              {{ event.title }}
            </div>
            <div class="text-h6">
              {{ formatDate(event.eventDate) }}
            </div>
          </div>
        </q-img>
      </div>
    </q-card>
  </div>
</template>

<style scoped>
.my-card {
  width: 100%;
  max-width: 300px;
}

.my-card:hover {
  position: relative;
  top: -5px;
}
</style>
