<script setup lang="ts">
import {useStore} from 'vuex'
import {useRouter} from "vue-router";
import {onMounted} from "vue";

const store = useStore();
const router = useRouter();

function onAuth(authentication: any) {
  console.log(`Received authentication: ${JSON.stringify(authentication)}`);
  store.commit('auth/storeAuthentication', authentication);
  store.commit('config/setShowLogin', true);

  gtag('event', 'login', {
    method: 'Google'
  });

  router.push('/main/about');
}

function redirectToCognito() {
  const props = store.getters['config/cognito'];

  if (props?.domain) {
    const cognitoDomain = props.domain;
    const clientId = props.clientId;
    const redirectUri = props.redirectUri;

    window.location.href = `${cognitoDomain}/login?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}`
  } else {
    setTimeout(redirectToCognito, 200);
  }
}

onMounted(() => {
  redirectToCognito();
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
              </q-card-section>
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
