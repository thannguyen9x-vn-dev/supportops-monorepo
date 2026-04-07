<script setup lang="ts">
// LESSON: Trang detail — focus vào:
// - useRoute để đọc URL params (giống useParams trong React Router / Next.js)
// - computed để derive data từ params
// - onMounted lifecycle hook

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { requests, TODAY } from '../data/requests'
import { priorityBadgeDetail, priorityLabel } from '../styles/variants'
import StatusBadge from '../components/StatusBadge.vue'

// LESSON: useRoute = đọc URL params, query, etc
// Giống useParams() + useSearchParams() trong React Router
const route = useRoute()
const router = useRouter()

// LESSON: ref cho mutable state cục bộ của component
const isLoading = ref(true)

// LESSON: computed tự re-run khi route.params.id thay đổi
const requestId = computed(() => Number(route.params.id))

const request = computed(() => requests.find((r) => r.id === requestId.value) ?? null)

const isOverdue = computed(() => {
  if (!request.value || request.value.status === 'done') return false
  return request.value.due_date < TODAY
})

const isClosedLate = computed(() => {
  if (!request.value?.closed_date) return false
  return request.value.closed_date > request.value.due_date
})

const dueDateClass = computed(() =>
  isOverdue.value ? 'mt-1 text-sm font-medium text-red-600' : 'mt-1 text-sm font-medium text-gray-800',
)

// LESSON: onMounted = lifecycle hook, chạy sau khi component được mount vào DOM
// Giống useEffect(() => { ... }, []) trong React — chạy một lần sau render đầu tiên
// Thực tế dùng để fetch API; ở đây ta simulate loading bằng setTimeout
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

function goBack() {
  router.back()
}

function stepDotClass(step: string) {
  const base = 'h-2.5 w-2.5 rounded-full'
  if (request.value?.status === step) return `${base} bg-blue-500 ring-4 ring-blue-100`
  const isPast =
    request.value?.status === 'done' ||
    (request.value?.status === 'in_progress' && step === 'open')
  return `${base} ${isPast ? 'bg-gray-400' : 'bg-gray-200'}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back button -->
    <button
      @click="goBack"
      class="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to requests
    </button>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-4 animate-pulse">
      <div class="h-8 w-2/3 rounded bg-gray-200"></div>
      <div class="h-4 w-1/3 rounded bg-gray-200"></div>
      <div class="h-32 rounded-xl bg-gray-200"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="!request" class="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <p class="font-medium text-red-700">Request not found</p>
      <p class="mt-1 text-sm text-red-500">ID #{{ requestId }} does not exist</p>
    </div>

    <!-- LESSON: v-else chạy khi tất cả v-if / v-else-if trước đó false -->
    <template v-else>
      <!-- Header -->
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge :status="request.status" />

          <span
            :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', priorityBadgeDetail[request.priority]]"
          >
            {{ priorityLabel[request.priority] }} Priority
          </span>

          <span v-if="isOverdue" class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
            Overdue
          </span>
        </div>

        <h1 class="text-2xl font-bold text-gray-900">{{ request.title }}</h1>
        <p class="text-sm text-gray-400">Request #{{ request.id }}</p>
      </div>

      <!-- Detail card -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <!-- Assignee section -->
        <div class="border-b border-gray-100 px-6 py-4">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-400">Assignee</p>
          <div class="mt-2 flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
            >
              {{ request.assignee ? request.assignee[0].toUpperCase() : '?' }}
            </div>
            <span class="text-sm font-medium text-gray-800">
              {{ request.assignee ?? 'Unassigned' }}
            </span>
          </div>
        </div>

        <!-- Dates grid -->
        <div class="grid grid-cols-3 divide-x divide-gray-100">
          <div class="px-6 py-4">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-400">Created</p>
            <p class="mt-1 text-sm font-medium text-gray-800">{{ request.created_date }}</p>
          </div>

          <div class="px-6 py-4">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-400">Due date</p>
            <p :class="dueDateClass">{{ request.due_date }}</p>
          </div>

          <div class="px-6 py-4">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-400">Closed</p>
            <p class="mt-1 text-sm font-medium text-gray-800">
              {{ request.closed_date ?? '—' }}
            </p>
            <p v-if="isClosedLate" class="mt-0.5 text-xs text-amber-600">Closed after due date</p>
          </div>
        </div>
      </div>

      <!-- Timeline / status info -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-400">Status</p>
        <div class="mt-3 flex items-center gap-4">
          <div
            v-for="step in ['open', 'in_progress', 'done']"
            :key="step"
            class="flex items-center gap-2"
          >
            <div :class="stepDotClass(step)"></div>
            <span class="text-xs capitalize text-gray-500">{{ step.replace('_', ' ') }}</span>
            <svg v-if="step !== 'done'" class="h-3 w-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
