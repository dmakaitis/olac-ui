<script setup>
import {onMounted, ref} from "vue";
import {api} from "boot/axios";

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
    format: val => `${val}`,
    sortable: true
  },
];

function onNewEvent() {
  alert("Clicked new event!");
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
  alert("Clicked delete!");
}

function onSave() {
  api.post("/api/events", detail.value)
    .then(response => loadEventData())
    .catch(error => alert(error))

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

function loadEventData() {
  api.get('/api/events')
    .then(response => {
      state.value = {
        rows: response.data.items
      }
    })
    .catch(error => alert(error))
}

function optDate(v) {
  /^-?[\d]+\/[0-1]\d\/[0-3]\d$/.test(v)
}

onMounted(() => {
  loadEventData();
})
</script>

<template>
  <q-page padding class="bg-white q-gutter-md">
    <q-table title="Events" :rows="state.rows" :columns="columns" row-key="id" @row-click="onRowClick"
             selection="single" v-model:selected="selected"/>
    <q-btn label="New Event" @click="onNewEvent"/>
    <q-btn label="Delete Selected Event" @click="onDelete"/>
  </q-page>

  <q-dialog persistent v-model="showDetail">
    <q-card style="max-width: 1000px;">
      <div class="q-pa-md">
        <q-card-section>
          <b>Event</b>
        </q-card-section>
        <q-card-section horizontal>
          <q-card-section>
            <q-form @submit="onSave" @reset="onCancel" class="q-gutter-md">
              <q-input filled v-model="detail.eventDate" label="Event Date" mask="date" :rules="['date']">
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
              <q-input outlined v-model="detail.name" label="Event Name"/>
              <q-input filled v-model="detail.ticketSaleStartDate" label="First Day of Ticket Sales (opt)" mask="date"
                       :rules="[v => /(^$)|(^-?[\d]+\/[0-1]\d\/[0-3]\d$)/.test(v) || 'Must be blank or a valid date']">
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
              <q-input filled v-model="detail.ticketSaleEndDate" label="Last Day of Ticket Sales (opt)" mask="date"
                       :rules="[v => /(^$)|(^-?[\d]+\/[0-1]\d\/[0-3]\d$)/.test(v) || 'Must be blank or a valid date']">
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
              <q-input outlined v-model="detail.maxTickets" label="Number of Available Tickets"/>
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
                <q-input outlined v-model="t.price" label="Price" prefix="$"/>
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
