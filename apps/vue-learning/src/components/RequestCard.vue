<script setup lang="ts">
// LESSON: defineProps + defineEmits = component interface
// Props = data vào, Emits = events ra (giống callback props trong React)
import { computed } from 'vue'
import type { Request } from '../types'
import { TODAY } from '../data/requests'
import { priorityBadge, priorityBorder, priorityLabel } from '../styles/variants'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{ request: Request }>()

const emit = defineEmits<{ select: [id: number] }>()

const isOverdue = computed(
  () => props.request.status !== 'done' && props.request.due_date < TODAY,
)

const cardClass = computed(() => [
  'group cursor-pointer rounded-lg border border-gray-200 border-l-4 bg-white p-4',
  'shadow-sm transition-all hover:shadow-md hover:border-gray-300',
  priorityBorder[props.request.priority],
])

const dueDateClass = computed(() =>
  isOverdue.value ? 'text-xs font-semibold text-red-600' : 'text-xs text-gray-400',
)

const assigneeInitial = computed(() =>
  props.request.assignee ? props.request.assignee[0].toUpperCase() : '?',
)
</script>

<template>
  <div @click="emit('select', request.id)" :class="cardClass">
    <div class="flex items-start justify-between gap-3">

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
          {{ request.title }}
        </p>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge :status="request.status" />
          <span :class="['rounded px-1.5 py-0.5 text-xs font-medium', priorityBadge[request.priority]]">
            {{ priorityLabel[request.priority] }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 flex-col items-end gap-2">
        <div
          class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600"
          :title="request.assignee ?? 'Unassigned'"
        >
          {{ assigneeInitial }}
        </div>
        <div class="text-right">
          <p :class="dueDateClass">Due {{ request.due_date }}</p>
          <p v-if="isOverdue" class="text-xs font-medium text-red-500">Overdue</p>
        </div>
      </div>

    </div>
  </div>
</template>
