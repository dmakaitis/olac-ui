<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary">
      <div class="q-mx-auto text-center">
        <img class="headerimage" src="~assets/olac-logo.svg" alt="Omaha Lithuanian-American Community"/>
      </div>

      <q-toolbar>
        <MenuBar slug="main-menu"/>

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
import {useStore} from "vuex";
import MenuBar from "components/MenuBar.vue";

export default {
  name: 'MainLayout',
  components: {MenuBar},
  computed: {
    isLoggedIn() {
      return this.store.getters['auth/isLoggedIn'];
    }
  },
  setup() {
    const store = useStore()

    return {
      store
    }
  }
}
</script>

<style scoped>
.headerimage {
  padding: 10px;
  height: 150px;
}
</style>
