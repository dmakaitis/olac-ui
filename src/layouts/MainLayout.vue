<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary">
      <div class="q-mx-auto text-center">
        <img class="headerimage" src="~assets/olac-logo.svg" alt="Omaha Lithuanian-American Community"/>
      </div>

      <q-toolbar>
        <q-toolbar-title>
          <q-tabs align="center" no-caps>
            <q-route-tab to="/main/about" replace label="Home"/>
            <q-btn-dropdown class="q-btn--no-uppercase" auto-close stretch flat label="About...">
              <q-list>
                <q-item v-for="article in aboutArticles" :key="article.slug" clickable @click="$router.push(`/main/article/${article.slug}`)">
                  <q-item-section>{{ article.title }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
<!--            <q-route-tab to="/main/tickets" target="_top" label="OLAC 70th Anniversary Event"/>-->
            <q-route-tab v-if="isLoggedIn" to="/main/reservations" replace label="Reservations"/>
            <q-route-tab v-if="isAdmin" to="/admin/ticket-types" replace label="Admin"/>
          </q-tabs>
        </q-toolbar-title>

        <q-btn v-if="isLoggedIn" align="right" dense flat round icon="logout" to="/logout"/>
        <span v-if="!isLoggedIn">
          <q-btn v-if="store.getters['config/showLogin']" align="right" dense flat round icon="login" to="/login"/>
        </span>
      </q-toolbar>

    </q-header>

    <q-footer class="bg-primary text-center">
      &copy; {{ new Date().getFullYear() }} Omaha Lithuanian-American Community
    </q-footer>

    <q-page-container class="bg-primary">
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script>
import {ref} from 'vue';
import {useStore} from "vuex";
import {useSanityFetcher} from "vue-sanity";

export default {
  name: 'AdminLayout',
  methods: {
    showLogin() {
      console.log(`Should show login button: ${this.showLoginButton && !this.isLoggedIn}`)
      return this.showLoginButton && !this.isLoggedIn
    }
  },
  setup() {
    const store = useStore()

    return {
      store,
      isAdmin: ref(false),
      isLoggedIn: ref(false),
      showLoginButton: ref(false),
      aboutArticles: ref([])
    }
  },
  mounted() {
    this.isAdmin = this.store.getters['auth/isAdmin']
    this.isLoggedIn = this.store.getters['auth/isLoggedIn']
    this.showLoginButton = this.store.getters['config/showLogin']

    useSanityFetcher('*[_id == "3989c665-b8cb-4f90-959b-285f5a6e0a4a"]{title, articles[]->{title, "slug": slug.current, "imageUrl": images[0].asset->url}}').fetch()
      .then(result => {
        this.aboutArticles = result[0].articles
      })
  }
}
</script>

<style scoped>
.headerimage {
  padding: 10px;
  height: 150px;
}
</style>
