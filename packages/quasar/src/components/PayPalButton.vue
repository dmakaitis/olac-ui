<script setup lang="ts">
import {onMounted, ref} from "vue";
import {usePayPal} from "boot/paypal";

interface PurchaseUnit {

}

const props = defineProps<{
  purchaseUnits: PurchaseUnit[]
}>();

const emit = defineEmits<{
  'approved': [data: any],
  'error': []
}>();

const paypal = usePayPal();

const paymentAccepted = ref(false);

function getPurchaseUnits(): PurchaseUnit[] {
  return props.purchaseUnits;
}

function emitPaymentApprovedEvent(orderData: any) {
  emit('approved', orderData);
  paymentAccepted.value = true;
}

function emitPaymentErrorEvent() {
  emit('error');
}

function initPayPalButton() {
  const getPurchaseUnitsFunc = getPurchaseUnits
  const emitPaymentApprovedEventFunc = emitPaymentApprovedEvent
  const emitPaymentErrorEventFunc = emitPaymentErrorEvent

  if (paypal) {
    console.log("Initializing PayPal buttons")

    paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'checkout'
      },
      createOrder: function (data: any, actions: any) {
        console.log(`Creating order with purchase units: ${JSON.stringify(getPurchaseUnitsFunc())}`)
        return actions.order.create({
          purchase_units: getPurchaseUnitsFunc()
        });
      },
      onApprove: function (data: any, actions: any) {
        console.log(`Configuring PayPal onApproval`)
        return actions.order.capture().then(function (orderData: any) {
          // Full available details
          console.log('Capture result', orderData, JSON.stringify(orderData, null, 2))
          emitPaymentApprovedEventFunc(orderData)
        });
      },
      onError: function (err: any) {
        console.log(err)
        emitPaymentErrorEventFunc()
      },
    }).render('#paypal-button-container');
  } else {
    console.error("PayPal library not loaded!!!")
    setTimeout(initPayPalButton, 200)
  }
}

onMounted(() => {
  initPayPalButton();
});
</script>

<template>
  <div id="smart-button-container">
    <div class="text-center">
      <div :hidden="paymentAccepted" id="paypal-button-container"></div>
      <div :hidden="!paymentAccepted" class="text-h5">Thank you for your payment!</div>
    </div>
  </div>
</template>

<style scoped>

</style>
