<script setup lang="ts">
// TODO: This component is not used
import {api} from 'boot/axios.js'
import {onMounted} from "vue";

const emit = defineEmits(['auth']);

function onLogin(credentialResponse: any) {
  api.post("/api/auth/google-id", credentialResponse)
      .then(response => emit('auth', response.data))
}

onMounted(() => {
  (window as any).google.accounts.id.initialize({
    client_id: "192542427030-lo0r4n23ecl4bl35v1rq0ejhn3gfffgj.apps.googleusercontent.com",
    callback: onLogin
  })
  (window as any).google.accounts.id.renderButton(
      document.getElementById("signin-button"),
      {theme: "outline", size: "large"}
  )
});
</script>

<template>
  <div id="signin-button"></div>
</template>

<style scoped>

</style>
