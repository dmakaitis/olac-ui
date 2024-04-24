<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useStore} from 'vuex'
import {useRouter} from "vue-router";

const store = useStore();

const router = useRouter();

function onConfirm() {
  router.push('/');
}

onMounted(() => {
  store.commit('auth/storeAuthentication', {});
})
</script>

<template>
  <q-layout view="hhh lpr fff">
    <q-page-container>
      <q-page class="bg-primary window-width row justify-center items-center">
        <div class="column">
          <div class="row">
            <h5 class="text-h5 text-white q-my-md">Omaha Lithuanian-American Community</h5>
          </div>
          <div class="row">
            <q-card square bordered class="q-pa-lg shadow-1">
              <q-card-section>
                You have been successfully logged out.
              </q-card-section>
              <q-card-actions class="q-px-md">
                <q-btn unelevated color="light-green-7" size="lg" class="full-width" label="Okay" @click="onConfirm"/>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.q-card {
  width: 430px;
}
</style>
