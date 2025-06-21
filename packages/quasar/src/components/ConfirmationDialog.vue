<script setup lang="ts">

</script>

<template>
  <q-dialog persistent vmodel="model-value">
    <q-card>
      <q-card-section>
        <slot/>
      </q-card-section>
      <q-separator/>
      <q-card-actions align="right">
        <q-btn v-close-popup flat color="primary" label="Yes" @click="$emit('yes')"/>
        <q-btn v-close-popup flat color="primary" label="No" @click="$emit('no')"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>

</style>
