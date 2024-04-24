<script setup lang="ts">
import {ref} from 'vue';
import {IndexedPayment} from "src/types";

const emit = defineEmits<{
  save: [data: IndexedPayment],
  cancel: []
}>();

const props = defineProps<{payment: IndexedPayment}>();

const data = ref<IndexedPayment>({
  index: -1,
  amount: 0,
  method: 'CHECK',
  status: 'SUCCESSFUL',
  notes: ''
});
const methodOptions = ['ONLINE', 'CHECK', 'COMP'];
const statusOptions = ['PENDING', 'SUCCESSFUL', 'FAILED'];

function resetData() {
  console.log("Resetting payment data")
  console.log(`   Provided: ${JSON.stringify(props.payment)}`)

  data.value.index = props.payment.index;
  data.value.amount = props.payment.amount || 0;
  data.value.method = props.payment.method || 'CHECK';
  data.value.status = props.payment.status || 'SUCCESSFUL';
  data.value.notes = props.payment.notes || '';
}

function onSave() {
  emit('save', data.value);
}

function onCancel() {
  emit('cancel');
}
</script>

<template>
  <q-dialog persistent vmodel="model-value" @before-show="resetData">
    <q-card class="q-gutter-md">
      <q-card-section class="text-h6">
        Add New Payment
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <q-input outlined label="Amount" v-model.number="data.amount" prefix="$"/>
        <q-select outlined label="Payment Method" :options="methodOptions" v-model="data.method"/>
        <q-select outlined label="Payment Status" :options="statusOptions" v-model="data.status"/>
        <q-input outlined label="Notes" v-model.trim="data.notes"/>
      </q-card-section>
      <q-separator/>
      <q-card-actions>
        <q-btn v-close-popup color="primary" label="Save" type="submit" @click="onSave"/>
        <q-btn v-close-popup color="primary" label="Cancel" type="reset" flat @click="onCancel"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>

</style>
