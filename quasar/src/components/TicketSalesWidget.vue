<script setup>
import {onMounted, ref} from "vue";
import {api} from "boot/axios";
import {currency} from "boot/helper";
import PayPalButton from "components/PayPalButton.vue";

const props = defineProps(['eventId'])
const event = ref({});

const mode = ref(1);
const showConfirmation = ref(false);
const showPayment = ref(false);
const showThankYou = ref(false);
const showPayPalError = ref(false);

const ticketFields = ref(null);

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const phone = ref('');
const ticketTypes = ref([]);
const notEnoughTickets = ref(false);

const reservationId = ref('');
const purchaseUnits = ref([]);

const paymentMethod = ref('online');

const reservationNumber = ref(0);

function updateMode(newMode) {
  mode.value = newMode;

  showConfirmation.value = newMode === 2;
  showPayment.value = newMode === 3;
  showThankYou.value = newMode === 4;
}

function sendGtagEvent(eventType, transactionId = null) {
  console.log(`Tracking event: ${eventType}`)

  gtag('event', eventType, {
    currency: 'USD',
    transaction_id: transactionId,
    value: getGrandTotal(),
    items: ticketTypes.value.map(t => {
      return {
        item_name: t.name,
        price: t.price,
        quantity: t.count
      }
    })
  })
}

function isValidEmail(val) {
  const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  return emailPattern.test(val) || 'Enter a valid email address';
}

function atLeastOneTicket(val) {
  let total = ticketTypes.value.reduce((sum, type) => sum = sum + +type.count, 0)
  return total > 0 || 'You must order at least one ticket'
}

function validateTicketsAvailable(val) {
  let total = ticketTypes.value.reduce((sum, type) => sum = sum + +type.count, 0)
  return new Promise((resolve) => {
    api.get(`/api/events/${props.eventId}/_available?ticketCount=${total}`)
      .then(response => resolve(response.data || 'Not enough tickets are available'))
      .catch(error => resolve('Unable to verify tickets available. Try again later.'))
  })
}

function onTicketFieldFocus() {
  ticketFields.value.forEach(f => f.resetValidation())
}

function getGrandTotal() {
  return ticketTypes.value
    .map(t => t.count * t.price)
    .reduce((a, b) => a + b, 0)
}

function onSubmit() {
  sendGtagEvent('add_to_cart')
  sendGtagEvent('view_cart')

  updateMode(2);
}

function onConfirmation() {
  sendGtagEvent('begin_checkout')

  purchaseUnits.value = [{
    "amount": {
      "value": getGrandTotal(),
      "breakdown": {
        "item_total": {"value": getGrandTotal(), "currency_code": "USD"},
      },
      "currency_code": "USD"
    },
    "description": event.value.name,
    "items": ticketTypes.value
      .filter(t => t.count > 0)
      .map(t => {
        return {
          "name": t.name,
          "quantity": `${t.count}`,
          "unit_amount": {"value": t.price, "currency_code": "USD"}
        }
      }),
    "custom_id": reservationId,
    "soft_descriptor": 'OLAC Tickets'
  }]

  updateMode(3);
}

function onMakeOrderChanges() {
  sendGtagEvent('remove_from_cart')

  updateMode(1);
}

function onPayPayPaymentAccepted(orderData) {
  sendGtagEvent('purchase', reservationId.value)

  const url = `/api/events/${props.eventId}/_newReservation`;
  const newReservationRequest = {
    "id": reservationId.value,
    "firstName": firstName.value,
    "lastName": lastName.value,
    "email": email.value,
    "phone": phone.value,
    "ticketCounts": ticketTypes.value
      .filter(t => t.count > 0)
      .map(t => {
        return {"typeName": t.name, "costPerTicket": t.price, "count": t.count}
      }),
    "payPalPayment": orderData
  };

  console.log(`Posting to: ${url}`);
  console.log(`Posting new reservation: ${JSON.stringify(newReservationRequest)}`);

  api.post(url, newReservationRequest)
    .then(response => {
      reservationNumber.value = response.data;
      updateMode(4);
    })
    .catch(error => alert(error));
}

function onPayPalError() {
  showPayPalError.value = true
  alert('There was a problem processing your request. Please try again later');
  onReset();
}

function onReset() {
  firstName.value = '';
  lastName.value = '';
  email.value = '';
  phone.value = '';
  ticketTypes.value.forEach(t => t.count = 0);

  updateMode(1);
}

onMounted(() => {
  console.log(`Loading event: ${props.eventId}`);

  api.get(`/api/events/${props.eventId}`)
    .then(result => {
      event.value = result.data;
      ticketTypes.value = event.value.ticketTypes.map(t => {
        return {
          name: t.name,
          price: t.price,
          count: 0
        };
      })
    })
    .catch(error => alert(error));

  api.get(`/api/events/${props.eventId}/reservations/_new-id`)
    .then(result => {
      reservationId.value = result.data;
    })
    .catch(error => alert(error));
});
</script>

<template>
  <q-card class="q-pa-sm reservations text-center">
    <q-form greedy @submit="onSubmit">
      <q-card-section>
        <span class="text-h5" style="color: #475971;">Reserve Your Tickets:</span>
      </q-card-section>

      <q-card-section>
        <div class="row justify-center q-gutter-md">
          <q-input class="width-400" label="First Name *" v-model.trim="firstName" lazy-rules
                   :rules="[val => !!val || 'First name is required']"/>
          <q-input class="width-400" label="Last Name *" v-model.trim="lastName" lazy-rules
                   :rules="[val => !!val || 'Last name is required']"/>
          <q-input class="width-400" label="Email *" v-model.trim="email" lazy-rules
                   :rules="[val => !!val || 'Email is required', isValidEmail]"/>
          <q-input class="width-400" label="Phone" v-model="phone" mask="(###) ###-####" lazy-rules
                   :rules="[val => !val || val.length == 14 || 'Please enter your full phone number']"/>
          <q-input v-for="type in ticketTypes" :key="type.name" ref="ticketFields" class="width-400"
                   :label="type.name + ' @ ' + currency(type.price) + ' each'"
                   v-model.number="type.count" type="number" lazy-rules :rules="[
                         val => val !== null && val !== '' || 'Ticket count must be a number',
                         val => val >= 0 || 'Must be zero or more',
                         atLeastOneTicket,
                         validateTicketsAvailable
                       ]" @focus="onTicketFieldFocus"/>
        </div>

        <div v-if="notEnoughTickets" class="error">Not enough tickets are available.</div>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn type="submit" label="Submit"/>
      </q-card-actions>
    </q-form>
  </q-card>

  <q-dialog persistent v-model="showConfirmation">
    <q-card class="q-pa-sm max-width-900">
      <q-card-section>
        Please confirm the following information:
      </q-card-section>

      <q-card-section class="row justify-center q-gutter-md">
        <div class="width-400">
          <div class="text-h5">{{ firstName }} {{ lastName }}</div>
          <div>{{ email }}</div>
          <div v-if="phone">{{ phone }}</div>
        </div>

        <div>
          <q-markup-table>
            <tr>
              <th class="text-left" scope="col">Ticket Type</th>
              <th class="text-center" scope="col">Count</th>
              <th class="text-right" scope="col">Subtotal</th>
            </tr>

            <tr v-for="type in ticketTypes.filter(t => t.count > 0)" :key="type.code">
              <td class="text-left">{{ type.name }}</td>
              <td class="text-center">{{ type.count }}</td>
              <td class="text-right">{{ currency(type.count * type.price) }}</td>
            </tr>

            <tr>
              <td colspan="2" class="text-right text-weight-bold">Total:</td>
              <td class="text-right text-weight-bold">{{ currency(getGrandTotal()) }}</td>
            </tr>
          </q-markup-table>
        </div>
      </q-card-section>

      <q-card-section class="text-center">
        Does everything look correct?
      </q-card-section>

      <q-card-actions align="center">
        <q-btn label="Yes" @click="onConfirmation"/>
        <q-btn label="No" @click="onMakeOrderChanges"/>
      </q-card-actions>
    </q-card>
  </q-dialog>


  <q-dialog persistent v-model="showPayment">
    <q-card class="q-pa-sm max-width-900">
      <q-card-section>
        Thank you for reserving tickets to the Omaha Lithuanian Community 70th Anniversary Event!
      </q-card-section>
      <q-card-section>
        How would you like to pay?
      </q-card-section>

      <q-card-section class="row justify-center">
        <div class="width-400 q-gutter-sm">
          <q-radio v-model="paymentMethod" val="online" label="Pay online now"/>
          <br/>
          <q-radio v-model="paymentMethod" val="check" label="Pay by check later"/>
        </div>
        <div class="width-400">
          <div v-if="paymentMethod === 'online'">
            <PayPalButton :purchase-units="purchaseUnits" @approved="onPayPayPaymentAccepted" @error="onPayPalError"/>
          </div>
          <div v-if="paymentMethod === 'check'">
            <p>Please note that your tickets will not be reserved until payment has been received, so be sure to
              send your payment by check as soon as possible to ensure your reservation for the event.</p>

            <p>If you would prefer to pay online, please select the online option on the left at this time. If you
              would still prefer to pay by check, click the button below.</p>

            <q-btn label="Pay by Check" @click="onPayByCheck"/>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog persistent v-model="showThankYou">
    <q-card class="q-pa-sm max-width-900">
      <q-card-section>
        Thank you very much for supporting the Omaha Lithuanian-American Community! A confirmation has been sent to
        the email address you provided.
      </q-card-section>

      <q-card-actions>
        <q-btn label="Okay" @click="onReset"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.reservations {
  background-color: #eaebe6;
  margin-top: 10px;
}

.rsvp {
  background-color: #eaebe6;
  margin-top: 10px;
  padding-top: 3px;
  padding-bottom: 3px;
}

.width-400 {
  width: 400px;
}

.max-width-900 {
  max-width: 900px;
}
</style>
