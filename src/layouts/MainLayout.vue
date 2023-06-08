<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary">
      <div class="q-mx-auto text-center">
        <img class="headerimage" src="~assets/olac-logo.svg" alt="Omaha Lithuanian-American Community"/>
      </div>

      <q-toolbar>
        <q-toolbar-title>
          <q-tabs align="center" no-caps>
            <span v-for="item in tabItems" :key="item">
              <q-route-tab v-if="item._type == 'routetarget'" :to="item.target" replace :label="item.label"/>
              <q-route-tab v-if="item._type == 'reference'" :to="`/main/article/${item.target}`" replace :label="item.label"/>
              <q-btn-dropdown v-if="item._type == 'tabmenu'" class="q-btn--no-uppercase" auto-close stretch flat :label="item.label">
                <q-list>
                  <span v-for="subitem in item.items" :key="subitem">
                    <q-item v-if="subitem._type == 'routetarget'" clickable @click="$router.push(`${subitem.target}`)">
                      <q-item-section>{{ subitem.label }}</q-item-section>
                    </q-item>
                    <q-item v-if="subitem._type == 'reference'" clickable @click="$router.push(`/main/article/${subitem.target}`)">
                      <q-item-section>{{ subitem.label }}</q-item-section>
                    </q-item>
                  </span>
                </q-list>
              </q-btn-dropdown>
            </span>
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
      tabItems: ref([])
    }
  },
  mounted() {
    this.isAdmin = this.store.getters['auth/isAdmin']
    this.isLoggedIn = this.store.getters['auth/isLoggedIn']
    this.showLoginButton = this.store.getters['config/showLogin']

    useSanityFetcher('*[slug.current == \'main-menu\'][0]{items[]{_type, "label": coalesce(label, name, @->title), "target": coalesce(target, @->slug.current), items[]{_type, "label": coalesce(label, name, @->title), "target": coalesce(target, @->slug.current)}}}').fetch()
      .then(result => {
        this.tabItems = result.items
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
