<script setup>
import {onMounted, ref} from "vue";
import {api} from "boot/axios";
import {copyToClipboard} from "quasar";

const state = ref({
  rows: []
});
const selected = ref([]);
const detail = ref({});
const showDetail = ref(false);

const columns = [
  {
    name: 'eventDate',
    required: true,
    label: 'Event Date',
    align: 'left',
    field: row => row.eventDate,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'name',
    required: true,
    label: 'Event Name',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'maxTickets',
    required: false,
    label: 'Available Tickets',
    align: 'left',
    field: row => row.maxTickets,
    format: val => `${val || 'Unlimited'}`,
    sortable: true
  },
];

function onNewEvent() {
  detail.value = {
    name: '',
    eventDate: '',
    ticketSaleStartDate: '',
    ticketSaleEndDate: '',
    ticketTypes: [],
  };
  showDetail.value = true;
}

function onRowClick(event, row) {
  detail.value = {
    id: row.id,
    name: row.name,
    eventDate: row.eventDate,
    ticketSaleStartDate: row.ticketSaleStartDate,
    ticketSaleEndDate: row.ticketSaleEndDate,
    maxTickets: row.maxTickets,
    ticketTypes: row.ticketTypes
  };
  showDetail.value = true;
}

function onDelete() {
  api.delete(`/api/events/${selected.value[0].id}`)
    .then(response => loadEventData())
    .catch(error => alert(error))
}

function onSave() {
  if(detail.value.id) {
    api.put(`/api/events/${detail.value.id}`, detail.value)
      .then(response => loadEventData())
      .catch(error => alert(error))
  } else {
    api.post(`/api/events`, detail.value)
      .then(response => loadEventData())
      .catch(error => alert(error))
  }
  showDetail.value = false;
}

function onCancel() {
  showDetail.value = false;
}

function onAddTicketType() {
  detail.value.ticketTypes.push({
    name: '',
    price: 0
  });
}

const loadingEvents = ref(false);

function loadEventData(startKey) {
  let url = '/api/events';

  if(!startKey) {
    state.value = {
      rows: []
    };
    loadingEvents.value = true;
  } else {
    url = `${url}?startKey=${startKey}`
  }

  api.get(url)
    .then(response => {
      state.value.rows = state.value.rows.concat(response.data.items);
      if(response.data.nextStartKey) {
        loadEventData(response.data.nextStartKey);
      } else {
        loadingEvents.value = false;
      }
    })
    .catch(error => alert(error))
}

/**
 * Called when the user clicks the copy event ID button.
 */
function onCopyEventId() {
  copyToClipboard(detail.value.id)
    .then(() => {
      alert(`Copied event id to clipboard.`);
    })
    .catch(() => {
      // ignore failure...
    })
}

onMounted(() => {
  loadEventData();
})
</script>

<template>
  <q-page padding class="bg-white q-gutter-md">
    <q-table title="Events" :rows="state.rows" :columns="columns" row-key="id" @row-click="onRowClick"
             selection="single" v-model:selected="selected" :loading="loadingEvents"/>
    <q-btn label="New Event" @click="onNewEvent"/>
    <q-btn label="Delete Selected Event" @click="onDelete"/>
  </q-page>

  <q-dialog persistent v-model="showDetail">
    <q-card style="max-width: 1000px;">
      <div class="q-pa-md">
        <q-card-section>
          <h5>Event</h5>
        </q-card-section>
        <q-card-section horizontal>
          <q-card-section>
            <q-form @submit="onSave" @reset="onCancel" class="q-gutter-md">
              <q-input filled v-model="detail.id" lable="Event ID" readonly>
                <template v-slot:append>
                  <q-btn icon="content_copy" flat class="cursor-pointer" @click="onCopyEventId"/>
                </template>
              </q-input>
              <q-input outlined v-model="detail.eventDate" label="Event Date" mask="date" :rules="['date']">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="detail.eventDate">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input outlined v-model="detail.name" label="Event Name" :rules="[v => !!v || 'The event must have a name']"/>
              <q-input outlined v-model="detail.ticketSaleStartDate" label="First Day of Ticket Sales (opt)" mask="date"
                       :rules="[v => /(^$)|(^-?[\d]+\/[0-1]\d\/[0-3]\d$)/.test(v || '') || 'Must be blank or a valid date']">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="detail.ticketSaleStartDate">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input outlined v-model="detail.ticketSaleEndDate" label="Last Day of Ticket Sales (opt)" mask="date"
                       :rules="[v => /(^$)|(^-?[\d]+\/[0-1]\d\/[0-3]\d$)/.test(v || '') || 'Must be blank or a valid date']">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="detail.ticketSaleEndDate">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input outlined number v-model.number="detail.maxTickets" label="Number of Available Tickets"/>
              <div>
                <q-btn label="Save" type="submit" color="primary"/>
                <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm"/>
              </div>
            </q-form>
          </q-card-section>
          <q-card-section>
            <q-card-section>
              <b>Ticket Types</b>
            </q-card-section>
            <q-card-section v-for="t in detail.ticketTypes" :key="t">
              <div class="q-gutter-md row items-start">
                <q-input outlined v-model="t.name" label="Ticket Type Name"/>
                <q-input outlined number v-model.number="t.price" label="Price" prefix="$"/>
              </div>
            </q-card-section>
            <q-card-section>
              <q-btn label="Add Ticket Type" color="primary" @click="onAddTicketType"/>
            </q-card-section>
          </q-card-section>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped>

</style>
