<script setup lang="ts">
// LESSON: Đây là trang chính — tập trung hầu hết Vue concepts cơ bản
// ref, computed, v-model, v-for, v-if, component communication

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { requests, TODAY } from '../data/requests'
import type { StatusFilter } from '../types'
import RequestCard from '../components/RequestCard.vue'

// LESSON: useRouter = programmatic navigation, giống useRouter trong Next.js
const router = useRouter()

// LESSON: ref() = reactive primitive state
// Khi đọc giá trị trong <script> phải dùng .value
// Trong <template> Vue tự unwrap, không cần .value
const selectedStatus = ref<StatusFilter>('all')
const sortByPriority = ref(false)

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

// LESSON: computed auto-tracks reactive dependencies
// Khi selectedStatus.value hoặc sortByPriority.value thay đổi → tự re-compute
// Không cần khai báo [selectedStatus, sortByPriority] như useCallback/useMemo
const filteredRequests = computed(() => {
  let result = [...requests]

  if (selectedStatus.value !== 'all') {
    result = result.filter((r) => r.status === selectedStatus.value)
  }

  if (sortByPriority.value) {
    result.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
  }

  return result
})

// Counts cho tabs
const counts = computed(() => {
  const map: Record<StatusFilter, number> = { all: requests.length, open: 0, in_progress: 0, done: 0 }
  for (const r of requests) {
    map[r.status] = (map[r.status] ?? 0) + 1
  }
  return map
})

// Overdue count (badge header)
const overdueCount = computed(
  () => requests.filter((r) => r.status !== 'done' && r.due_date < TODAY).length,
)

function navigateTo(id: number) {
  // router.push = giống router.push trong Next.js hoặc navigate() trong React Router
  router.push(`/requests/${id}`)
}

// LESSON: function trả về class string — giữ template sạch
// Nhận tab làm argument vì class phụ thuộc vào selectedStatus (reactive)
const TAB_BASE = 'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all'
function tabBtnClass(tab: { value: StatusFilter }) {
  return tab.value === selectedStatus.value
    ? `${TAB_BASE} bg-white text-gray-900 shadow-sm`
    : `${TAB_BASE} text-gray-500 hover:text-gray-700`
}
function tabCountClass(tab: { value: StatusFilter }) {
  return tab.value === selectedStatus.value
    ? 'rounded-full px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700'
    : 'rounded-full px-1.5 py-0.5 text-xs bg-gray-200 text-gray-500'
}

// computed cho button đơn lẻ (không có argument)
const sortBtnClass = computed(() =>
  sortByPriority.value
    ? 'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors border-blue-300 bg-blue-50 text-blue-700'
    : 'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
)
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Work Requests</h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ requests.length }} requests total
          <!-- v-if = chỉ render nếu điều kiện đúng -->
          <span v-if="overdueCount > 0" class="ml-2 font-medium text-red-600">
            · {{ overdueCount }} overdue
          </span>
        </p>
      </div>

      <!-- Sort toggle -->
      <button @click="sortByPriority = !sortByPriority" :class="sortBtnClass">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        Sort by priority
      </button>
    </div>

    <!-- Status filter tabs -->
    <!-- LESSON: v-for duyệt array, :key giống key prop trong React -->
    <div class="flex gap-1 rounded-lg bg-gray-100 p-1">
      <button
        v-for="tab in STATUS_TABS"
        :key="tab.value"
        @click="selectedStatus = tab.value"
        :class="tabBtnClass(tab)"
      >
        {{ tab.label }}
        <span :class="tabCountClass(tab)">{{ counts[tab.value] }}</span>
      </button>
    </div>

    <!-- Request list -->
    <!-- LESSON: v-if / v-else = conditional block -->
    <div v-if="filteredRequests.length > 0" class="space-y-3">
      <!-- LESSON: @select = lắng nghe custom event từ RequestCard -->
      <!-- RequestCard emit('select', id) → đây nhận và gọi navigateTo(id) -->
      <RequestCard
        v-for="request in filteredRequests"
        :key="request.id"
        :request="request"
        @select="navigateTo"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
      <div class="rounded-full bg-gray-100 p-4">
        <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p class="mt-4 text-sm font-medium text-gray-600">No requests found</p>
      <p class="mt-1 text-xs text-gray-400">Try a different status filter</p>
    </div>
  </div>
</template>
