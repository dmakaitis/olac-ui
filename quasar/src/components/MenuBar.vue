<template>
  <q-toolbar-title :key="roles">
    <q-tabs align="center" no-caps>
      <span v-for="item in tabItems" :key="item">
        <q-route-tab v-if="item._type === 'routetarget' && showItem(item)" :to="item.target" replace
                     :label="item.label"/>
        <q-route-tab v-if="item._type === 'reference'" :to="`/main/article/${item.target}`" replace
                     :label="item.label"/>
        <q-btn-dropdown v-if="item._type === 'tabmenu' && showItem(item)" class="q-btn--no-uppercase" auto-close stretch
                        flat :label="item.label">
          <q-list>
            <span v-for="subitem in item.items" :key="subitem">
              <q-item v-if="subitem._type === 'routetarget' && showItem(item)" clickable
                      @click="$router.push(`${subitem.target}`)">
                <q-item-section>{{ subitem.label }}</q-item-section>
              </q-item>
              <q-item v-if="subitem._type === 'reference'" clickable
                      @click="$router.push(`/main/article/${subitem.target}`)">
                <q-item-section>{{ subitem.label }}</q-item-section>
              </q-item>
            </span>
          </q-list>
        </q-btn-dropdown>
      </span>
    </q-tabs>
  </q-toolbar-title>
</template>

<script>
import {useStore} from "vuex";
import {ref} from "vue";
import {useSanityFetcher} from "vue-sanity";

export default {
  name: 'MenuBar',
  props: [
    'slug'
  ],
  methods: {
    showLogin() {
      return this.showLoginButton && !this.isLoggedIn
    },
    showItem(item) {
      if (!item.requiredRole) {
        return true;
      }
      if (item.requiredRole === 'ADMIN') {
        return this.isAdmin
      }
      return this.isLoggedIn;
    }
  },
  computed: {
    roles() {
      return `${this.store.getters["auth/isLoggedIn"]}-${this.store.getters["auth/isAdmin"]}`
    },
    isLoggedIn() {
      return this.store.getters['auth/isLoggedIn'];
    },
    isAdmin() {
      return this.store.getters['auth/isAdmin'];
    },
    showLoginButton() {
      return this.store.getters["config/showLogin"];
    }
  },
  setup() {
    const store = useStore()

    return {
      store,
      tabItems: ref([])
    }
  },
  mounted() {
    useSanityFetcher(`
*[_type == 'tabbar' && slug.current == "${this.slug}"][0]
{
  items[]{
    _type,
    "label": coalesce(label, name, @->title),
    "target": coalesce(target, @->slug.current),
    requiredRole,
    items[]{
      _type,
      "label": coalesce(label, name, @->title),
      "target": coalesce(target, @->slug.current),
      requiredRole
    }
  }
}
    `).fetch()
      .then(result => {
        this.tabItems = result.items
      })
  }
}
</script>

<style scoped>

</style>
