<template>
  <router-view/>
</template>

<script>
import {defineComponent} from 'vue'
import {useSanityClient} from "vue-sanity";

export default defineComponent({
  name: 'App',
  setup() {
    useSanityClient({
      projectId: '1p3vrwxv',
      dataset: 'production',
      useCdn: process.env.NODE_ENV === 'production',
      apiVersion: '2023-06-04'
    })
  }
})
</script>
