<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary">
      <div class="q-mx-auto text-center">
        <img class="headerimage" src="~assets/olac-logo.svg" alt="Omaha Lithuanian-American Community"/>
      </div>

      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer"/>

        <MenuBar slug="main-menu"/>

        <q-btn v-if="isLoggedIn" align="right" dense flat round icon="logout" to="/logout"/>
      </q-toolbar>

    </q-header>

    <q-drawer show-if-above v-model="drawerOpen" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple to="/admin/ticket-types">
          <q-item-section>Ticket Types</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/users">
          <q-item-section>Users</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

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
