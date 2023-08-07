<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary">
      <div class="q-mx-auto text-center">
        <img class="headerimage" src="~assets/olac-logo.svg" alt="Omaha Lithuanian-American Community"/>
      </div>

      <q-toolbar>
        <MenuBar slug="main-menu"/>

        <q-btn v-if="isLoggedIn" align="right" dense flat round icon="logout" to="/logout"/>
      </q-toolbar>

    </q-header>

    <q-footer class="bg-primary text-center">
      &copy; {{ new Date().getFullYear() }} Omaha Lithuanian-American Community
    </q-footer>

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script>
import {ref} from 'vue';
import {useStore} from 'vuex';
import MenuBar from "components/MenuBar.vue";

export default {
  name: 'AdminLayout',
  components: {MenuBar},
  computed: {
    isLoggedIn() {
      return this.store.getters['auth/isLoggedIn'];
    }
  },
  methods: {
    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen
    }
  },
  setup() {
    const store = useStore()

    return {
      store,
      drawerOpen: ref(true)
    }
  },
}
</script>

<style scoped>
.headerimage {
  padding: 10px;
  height: 150px;
}
</style>
