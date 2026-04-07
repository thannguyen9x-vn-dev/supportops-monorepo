<script setup lang="ts">
// App.vue = root shell, chỉ render router-view
// Giống _layout.tsx trong Next.js
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-4xl mx-auto flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
        <span class="text-sm font-semibold text-gray-700 tracking-wide uppercase">
          SupportOps — Vue Learning
        </span>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-6 py-8">
      <!-- router-view = tempat page component dirender -->
      <!-- Giống <Outlet /> trong React Router, hoặc {children} trong Next.js -->
      <router-view />
    </main>
  </div>
</template>
