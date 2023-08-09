<script setup>
import {onMounted, ref} from "vue";
import {api} from "boot/axios";
import {date, exportFile, useQuasar} from "quasar";
import {currency} from "boot/helper";
import {useStore} from "vuex";
import ReservationDialog from "components/ReservationDialog.vue";
import PaymentDialog from "components/PaymentDialog.vue";
import ConfirmationDialog from "components/ConfirmationDialog.vue";

const store = useStore();
const splitterSize = ref(400);
const reservationTable = ref({});
const filter = ref('');

const loadingEvents = ref(false);
const events = ref([]);

const loadingReservations = ref(false);
const reservations = ref([]);
const totalTicketCount = ref(0);
const totalAmountDue = ref(0);
const totalPaid = ref(0);

const selectedEvents = ref([]);
const selectedEventId = ref('');
const ticketTypes = ref([]);

const selectedReservations = ref([]);
const selectedReservation = ref({});

const showDetail = ref(false);

const showPaymentDialog = ref(false);
const selectedPayment = ref({});

const confirmDelete = ref(false);

const eventColumns = [
  {name: 'event', label: 'Event', field: row => row.name, align: 'left', sort: true},
  {name: 'date', label: 'Date', field: row => row.date, align: 'left', sort: true}
];
const reservationColumns = [
  {name: 'id', label: 'Reservation Number', field: row => row.reservationId, align: 'left', sortable: true},
  {
    name: 'reservationTimestamp',
    label: 'Date/Time Reserved',
    field: row => row.reservationTimestamp,
    align: 'left',
    format: val => date.formatDate(val, 'MMM D, YYYY HH:mm:ss'),
    sortable: true
  },
  {name: 'first-name', label: 'First Name', field: row => row.firstName, align: 'left'},
  {name: 'lastName', label: 'Last Name', field: row => row.lastName, align: 'left', sortable: true},
  {name: 'email', label: 'Email', field: row => row.email, align: 'left', sortable: true},
  {name: 'phone', label: 'Phone', field: row => row.phone, align: 'left'},
  {name: 'status', label: 'Status', field: row => row.status, align: 'left', sortable: true},
  {
    name: 'tickets',
    label: 'Tickets',
    field: row => row.ticketCounts,
    align: 'center',
    format: val => `${val.reduce((a, b) => a + b.count, 0)}`
  },
  {
    name: 'amount-due',
    label: 'Amount Due',
    field: row => row.ticketCounts,
    format: val => `${currency(val.reduce((a, b) => a + (b.count * b.costPerTicket), 0))}`
  },
  {
    name: 'amount-paid',
    label: 'Amount Paid',
    field: row => row.payments,
    format: val => `${currency(val.reduce((a, b) => a + parseFloat(b.amount), 0.0))}`
  }
];

/**
 * Load all events from the datastore.
 *
 * @param startKey the optional start key if the events need to be loaded in batches.
 */
function loadEvents(startKey) {
  let url = '/api/events';

  if (!startKey) {
    events.value = [];
    loadingEvents.value = true;
  } else {
    url = `${url}?startKey=${startKey}`
  }

  api.get(url)
    .then(response => {
      // noinspection JSValidateTypes
      events.value = events.value.concat(response.data.items.map(e => {
        return {id: e.id, name: e.name, date: e.eventDate, ticketTypes: e.ticketTypes}
      }));
      if (response.data.nextStartKey) {
        loadEvents(response.data.nextStartKey);
      } else {
        loadingEvents.value = false;
      }
    })
    .catch(error => alert(error))
}

// noinspection JSValidateTypes
/**
 * Load reservations from the datastore for the currently selected event.
 *
 * @param startKey the optional start key if the reservations need to be laoded in batches.
 */
function loadReservations(startKey) {
  let url = `/api/events/${selectedEventId.value}/reservations`;

  if (!startKey) {
    reservations.value = [];
    totalTicketCount.value = 0;
    totalAmountDue.value = 0;
    totalPaid.value = 0;
    loadingReservations.value = true;
  } else {
    url = `${url}?startKey=${startKey}`
  }

  api.get(url)
    .then(response => {
      totalTicketCount.value = response.data.items.reduce((a, b) => a + b.ticketCounts.reduce((c, d) => c + d.count, 0), totalTicketCount.value);
      totalAmountDue.value = response.data.items.reduce((a, b) => a + b.ticketCounts.reduce((c, d) => c + (d.count * d.costPerTicket), 0), totalAmountDue.value);
      totalPaid.value = response.data.items.reduce((a, b) => a + b.payments.reduce((c, d) => c + d.amount, 0), totalPaid.value);

      // noinspection JSValidateTypes
      reservations.value = reservations.value.concat(response.data.items.map(r => {
        return {
          id: r.id,
          reservationId: r.reservationId,
          reservationTimestamp: r.reservationTimestamp,
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          phone: r.phone,
          status: r.status,
          ticketCounts: r.ticketCounts,
          amountDue: 0,
          payments: r.payments
        }
      }));
      if (response.data.nextStartKey) {
        loadReservations(response.data.nextStartKey);
      } else {
        loadingReservations.value = false;
      }
    })
    .catch(error => alert(error))
}

/**
 * Called when the user has selected an event for which to view reservations.
 *
 * @param event the selected event.
 */
function eventSelected(event) {
  if (event.id !== selectedEventId.value) {
    selectedEventId.value = event.id;
    ticketTypes.value = event.ticketTypes.map(t => {
      return {
        description: t.name,
        costPerTicket: t.price
      };
    })
    loadReservations();
  }
}

/**
 * Called when the user clicks an event in order to make that event the selected event.
 *
 * @param event the UI event.
 * @param row the row containing the event data.
 */
function onClickEvent(event, row) {
  selectedEvents.value = [row];
  eventSelected(row);
}

/**
 * Called when the user selects or unselects an event using Quasar's selection UI.
 *
 * @param details the Quasar provided selection details.
 */
function onSelectEvent(details) {
  if (details.added) {
    eventSelected(details.rows[0])
  } else {
    selectedEventId.value = '';
    reservations.value = []
    totalTicketCount.value = 0;
    totalAmountDue.value = 0;
    totalPaid.value = 0;
  }
}

function onExportTable() {
  console.log("Exporting table...");

  //   api.get(`/api/event/reservations.csv?sortBy=${sortBy}&desc=${descending}&filter=${this.filter}`)
  api.get(`/api/events/${selectedEventId.value}/reservations.csv`)
    .then(response => {
      const status = exportFile('reservations.csv', response.data, 'text/csv');

      if (status !== true) {
        useQuasar().notify({
          message: "Browser denied file download",
          color: "negative",
          icon: "warning"
        })
      }
    });
}

/**
 * Called when the user clicks the new reservation button. Populates the reservation data with initial values then opens
 * the reservation editing dialog box.
 */
function onNewReservation() {
  if (selectedEventId.value) {
    selectedReservation.value = {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'PENDING_PAYMENT',
      payments: [],
      ticketCounts: []
    };

    ticketTypes.value.forEach(type => {
      type.count = 0;
    });

    showDetail.value = true;
  }
}

/**
 * Called when the user clicks the delete reservation button. Opens the confirmation dialog.
 */
function onDeleteReservation() {
  if (selectedReservations.value.length) {
    confirmDelete.value = true;
  }
}

/**
 * Called when the user clicks on a reservation. Populates and opens the reservation editing dialog box.
 *
 * @param event the UI event.
 * @param row the selected reservation data.
 */
function onClickReservation(event, row) {
  selectedReservation.value = row;

  ticketTypes.value.forEach(type => {
    type.count = 0;

    let ticketCount = selectedReservation.value.ticketCounts.find(c => c.typeName === type.description);
    if (ticketCount) {
      type.count = ticketCount.count;
    }
  });

  showDetail.value = true;
}

/**
 * Save a reservation to the datastore.
 *
 * @param reservationData the reservation data to save.
 */
function onSaveReservation(reservationData) {
  reservationData.ticketCounts = ticketTypes.value
    .filter(t => t.count > 0)
    .map(t => {
      return {
        typeName: t.description,
        costPerTicket: t.costPerTicket,
        count: t.count
      }
    });

  if (!reservationData.id) {
    reservationData.id = null;
  }
  if (!reservationData.reservationId) {
    reservationData.reservationId = null;
  }

  if (reservationData.id) {
    // Update the existing reservation
    api.put(`/api/events/${selectedEventId.value}/reservations/${reservationData.id}`, reservationData)
      .then(response => loadReservations())
      .catch(error => alert(error));
  } else {
    // Insert a new reservation
    api.post(`/api/events/${selectedEventId.value}/reservations`, reservationData)
      .then(response => loadReservations())
      .catch(error => alert(error));
  }

  showDetail.value = false;
}

/**
 * Called when the user decides to cancel changes made to a reservation.
 */
function onCancel() {
  showDetail.value = false;
}

/**
 * Called when the user clicks on a payment in the edit reservation dialog box.
 *
 * @param data the payment the user clicked on.
 */
function onEditPayment(data) {
  selectedPayment.value = data;
  showPaymentDialog.value = true;
}

/**
 * Called when the user saves changes to the payment they are currently editing. Simply updated the data in the
 * currently selected reservation being edited in the reservation dialog box.
 *
 * @param data the updated payment information.
 */
function onSavePayment(data) {
  if (data.index >= 0) {
    selectedReservation.value.payments[data.index].amount = data.amount;
    selectedReservation.value.payments[data.index].status = data.status;
    selectedReservation.value.payments[data.index].method = data.method;
    selectedReservation.value.payments[data.index].notes = data.notes;
  } else {
    selectedReservation.value.payments.push({
      amount: data.amount,
      status: data.status,
      method: data.method,
      notes: data.notes
    })
  }
  showPaymentDialog.value = false;
}

/**
 * Called when the user elects to cancel changes made to a payment.
 */
function onCancelPayment() {
  showPaymentDialog.value = false;
}

/**
 * Returns 'true' if the currently authenticated user has administrator privileges.
 *
 * @returns 'true' if the currently authenticated user has administrator privileges; 'false' otherwise.
 */
function isAdmin() {
  return store.getters['auth/isAdmin'];
}

/**
 * Called after the user has confirmed they would like to delete a reservation.
 */
function onConfirmDelete() {
  confirmDelete.value = false;
  api.delete(`/api/events/${selectedEventId.value}/reservations/${selectedReservations.value[0].id}`)
    .then(response => {
      selectedReservations.value = [];
      loadReservations();
    })
    .catch(error => alert(error));
}

onMounted(() => {
  loadEvents();
});
</script>

<template>
  <q-page padding class="q-gutter-md">
    <q-splitter unit="px" :limits="[250, Infinity]" v-model="splitterSize" disable>

      <template v-slot:before>
        <q-table title="Events" :columns="eventColumns" :rows="events" row-key="id" selection="single"
                 @row-click="onClickEvent" @selection="onSelectEvent" v-model:selected="selectedEvents"
                 :loading="loadingEvents">
        </q-table>
      </template>
      <template v-slot:after>
        <q-table ref="reservationTable" title="Reservations" :columns="reservationColumns" :rows="reservations"
                 row-key="id" @row-click="onClickReservation" :selection="isAdmin() ? 'single' : 'none'"
                 v-model:selected="selectedReservations" :loading="loadingReservations" :filter="filter">
          <template v-slot:top-left>
            <span class="q-table__title">{{ reservationTable.title }}</span><br/>
            <q-input borderless dense debounce="300" placeholder="Search" v-model="filter">
              <template v-slot:prepend>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>
          <template v-slot:top-right>
            <div class="text-right">
              <q-btn color="primary" icon-right="archive" label="Export to CSV" no-caps @click="onExportTable"/>
              <br/>
              (export using current search and sort settings)
            </div>
          </template>
          <template v-slot:bottom-row>
            <q-tr>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td class="text-weight-bold text-right">Total:</q-td>
              <q-td class="text-weight-bold text-center">{{ totalTicketCount }}</q-td>
              <q-td class="text-weight-bold text-right">{{ currency(totalAmountDue) }}</q-td>
              <q-td class="text-weight-bold text-right">{{ currency(totalPaid) }}</q-td>
            </q-tr>
          </template>
        </q-table>
        <q-btn label="New Reservation" @click="onNewReservation" :disable="!selectedEventId"/>
        <q-btn v-if="isAdmin()" label="Delete Selected Reservation" @click="onDeleteReservation"
               :disable="!selectedReservations.length"/>
      </template>
    </q-splitter>
  </q-page>

  <ReservationDialog :reservation="selectedReservation" :ticket-types="ticketTypes" v-model="showDetail"
                     @save="onSaveReservation" @cancel="onCancel" @edit-payment="onEditPayment"/>
  <PaymentDialog :payment="selectedPayment" v-model="showPaymentDialog" @save="onSavePayment"
                 @cancel="onCancelPayment"/>
  <ConfirmationDialog v-model="confirmDelete" @yes="onConfirmDelete">
    Are you sure you want to delete reservation number <b>{{ selectedReservations[0].reservationId }}</b> for
    <b>{{ selectedReservations[0].firstName }}
      {{ selectedReservations[0].lastName }}</b>'?
  </ConfirmationDialog>
</template>
