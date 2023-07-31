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

<script>
import {useStore} from 'vuex'

export default {
  name: "LoginUser",
  methods: {
    onAuth(authentication) {
      console.log(`Received authentication: ${JSON.stringify(authentication)}`)
      this.store.commit('auth/storeAuthentication', authentication)
      this.store.commit('config/setShowLogin', true)

      gtag('event', 'login', {
        method: 'Google'
      })

      this.$router.push('/main/about')
    }
  },
  setup() {
    const store = useStore()

    const props = store.getters["config/cognito"]

    const cognitoDomain = props.domain
    const clientId = props.clientId
    const redirectUri = props.redirectUri

    window.location.href = `${cognitoDomain}/login?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}`

    return {
      store
    }
  }
}
</script>

<style scoped>
.q-card {
  width: 430px;
}
</style>
