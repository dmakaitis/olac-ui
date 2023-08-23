<script setup lang="ts">
import {useStore} from "vuex";
import {computed, onMounted, ref} from "vue";
import {useSanityFetcher} from "vue-sanity";

interface TabSubItem {
  "_type": string,
  label: string,
  target: string,
  requiredRole?: string
}

interface TabItem {
  "_type": string,
  label: string,
  target: string,
  requiredRole?: string,
  items: TabSubItem[]
}

interface SanityResult {
  items: TabItem[]
}

const props = defineProps<{ slug: string }>();

const store = useStore();
const tabItems = ref<TabItem[]>([]);

function showLogin(): boolean {
  return showLoginButton.value && !isLoggedIn.value;
}

function showItem(item: TabItem | TabSubItem): boolean {
  if (!item.requiredRole) {
    return true;
  }
  if (item.requiredRole === 'ADMIN') {
    return isAdmin.value;
  }
  return isLoggedIn.value;
}

const roles = computed(() => {
  return `${store.getters["auth/isLoggedIn"]}-${store.getters["auth/isAdmin"]}`
});

const isLoggedIn = computed(() => {
  return store.getters['auth/isLoggedIn'] as boolean;
});

const isAdmin = computed(() => {
  return store.getters['auth/isAdmin'] as boolean;
})

const showLoginButton = computed(() => {
  return store.getters["config/showLogin"] as boolean;
});

onMounted(() => {
  useSanityFetcher<SanityResult>(`
*[_type == 'tabbar' && slug.current == "${props.slug}"][0]
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
        tabItems.value = result?.items || [];
      })
});
</script>

<template>
  <q-toolbar-title :key="roles">
    <q-tabs align="center" no-caps>
      <span v-for="item in tabItems" :key="item.label">
        <q-route-tab v-if="item._type === 'routetarget' && showItem(item)" :to="item.target" replace
                     :label="item.label"/>
        <q-route-tab v-if="item._type === 'reference'" :to="`/main/article/${item.target}`" replace
                     :label="item.label"/>
        <q-btn-dropdown v-if="item._type === 'tabmenu' && showItem(item)" class="q-btn--no-uppercase" auto-close stretch
                        flat :label="item.label">
          <q-list>
            <span v-for="subitem in item.items" :key="subitem.label">
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

<style scoped>

</style>
