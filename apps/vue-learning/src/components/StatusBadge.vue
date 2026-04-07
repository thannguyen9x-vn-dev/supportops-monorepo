<script setup lang="ts">
import type { RequestStatus } from '../types'
import { statusBadge, statusLabel } from '../styles/variants'

defineProps<{ status: RequestStatus }>()
</script>

<template>
  <span
    :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', statusBadge[status]]"
  >
    {{ statusLabel[status] }}
  </span>
</template>
