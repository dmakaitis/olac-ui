<template>
  <div id="smart-button-container">
    <div class="text-center">
      <div :hidden="paymentAccepted" id="paypal-button-container"></div>
      <div :hidden="!paymentAccepted" class="text-h5">Thank you for your payment!</div>
    </div>
  </div>
</template>

<script>
import {useStore} from "vuex";
import {ref} from "vue";

export default {
  name: "PayPalButton",
  methods: {
    getPurchaseUnits() {
      return this.purchaseUnits
    },
    emitPaymentApprovedEvent(orderData) {
      this.$emit('approved', orderData)
      this.paymentAccepted = true
    },
    emitPaymentErrorEvent() {
      this.$emit('error')
    },
    initPayPalButton() {
      const getPurchaseUnitsFunc = this.getPurchaseUnits
      const emitPaymentApprovedEventFunc = this.emitPaymentApprovedEvent
      const emitPaymentErrorEventFunc = this.emitPaymentErrorEvent

      if (window.paypal) {
        console.log("Initializing PayPal buttons")

        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'checkout',

          },
          createOrder: function (data, actions) {
            console.log(`Creating order with purchase units: ${JSON.stringify(getPurchaseUnitsFunc())}`)
            return actions.order.create({
              purchase_units: getPurchaseUnitsFunc()
            });
          },
          onApprove: function (data, actions) {
            console.log(`Configurating PayPal onApproval`)
            return actions.order.capture().then(function (orderData) {
              // Full available details
              console.log('Capture result', orderData, JSON.stringify(orderData, null, 2))
              emitPaymentApprovedEventFunc(orderData)
            });
          },
          onError: function (err) {
            console.log(err)
            emitPaymentErrorEventFunc()
          },
        }).render('#paypal-button-container');
      } else {
        console.error("PayPal library not loaded!!!")
        setTimeout(this.initPayPalButton, 200)
      }
    }
  },
  props: {
    purchaseUnits: Array
  },
  setup() {
    const store = useStore()
    return {
      store,
      paymentAccepted: ref(false)
    }
  },
  mounted() {
    this.initPayPalButton();
  }
}
</script>

<style scoped>

</style>
