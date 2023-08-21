<script setup lang="ts">
import {ref} from "vue";
import {useStore} from "vuex";

const props = defineProps(['size']);

const store = useStore();

function buttonId() {
  return store.getters["config/payPalDonationButtonId"] || 'N4ZY3QGD6CMVN';
}
const buttonImage = ref(props.size ? 'https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif' : 'https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif');
</script>

<template>
  <div class="text-center">
    <form action="https://www.paypal.com/donate" method="post" target="_">
      <input type="hidden" name="hosted_button_id" :value="buttonId()"/>
      <input type="image" :src="buttonImage" border="0" name="submit"
             title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button"/>
      <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1"/>
    </form>
  </div>
</template>

<style scoped>

</style>
