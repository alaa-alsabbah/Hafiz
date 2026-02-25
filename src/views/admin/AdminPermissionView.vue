<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { AppLoading } from '@/components/common'
import { BaseTabs } from '@/components/ui'
import {
  getAdminLeaves,
  approveRejectLeave,
  type AdminLeave,
} from '@/services/admin.service'
import { ADMIN_PERMISSION_PAGE } from '@/config/admin.constants'

const loading = ref(true)
const error = ref<string | null>(null)
const data = ref<AdminLeave[]>([])

// isPending: 1 = pending (انتظار), 0 = processed (موافق/رفض)
const isPendingFilter = ref<1 | 0>(1)
const actionLoading = ref<number | null>(null) // id of card being processed
const expandedReasons = ref<Set<number>>(new Set())

const tabs = [
  { id: 'pending', label: ADMIN_PERMISSION_PAGE.TAB_PENDING, value: 1 as const },
  { id: 'processed', label: ADMIN_PERMISSION_PAGE.TAB_PROCESSED, value: 0 as const },
]

async function fetchLeaves() {
  loading.value = true
  error.value = null
  try {
    const response = await getAdminLeaves(isPendingFilter.value)
    if (response.success && response.data) {
      data.value = Array.isArray(response.data) ? response.data : []
    } else {
      data.value = []
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل الطلبات'
    data.value = []
  } finally {
    loading.value = false
  }
}

async function handleApprove(leave: AdminLeave) {
  actionLoading.value = leave.id
  try {
    const res = await approveRejectLeave(leave.id, 1)
    if (res.success) {
      await fetchLeaves()
    } else {
      error.value = res.message ?? 'فشل الموافقة'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ'
  } finally {
    actionLoading.value = null
  }
}

async function handleReject(leave: AdminLeave) {
  actionLoading.value = leave.id
  try {
    const res = await approveRejectLeave(leave.id, 0)
    if (res.success) {
      await fetchLeaves()
    } else {
      error.value = res.message ?? 'فشل الرفض'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ'
  } finally {
    actionLoading.value = null
  }
}

function getInitials(name: string): string {
  const parts = name?.trim().split(/\s+/) ?? []
  if (parts.length >= 2) {
    return (parts[0][0] || '') + (parts[1][0] || '')
  }
  return (name?.[0] ?? '?').toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = [
    'rgba(59, 130, 246, 0.9)',   // blue
    'rgba(234, 179, 8, 0.9)',    // yellow
    'rgba(168, 85, 247, 0.9)',   // purple
    'rgba(34, 197, 94, 0.9)',    // green
  ]
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function formatDateRange(from: string, to: string): string {
  if (!from || !to) return '---'
  const d1 = new Date(from)
  const d2 = new Date(to)
  return `${d1.toLocaleDateString('ar-EG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} - ${d2.toLocaleDateString('ar-EG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`
}

const REASON_MAX_LENGTH = 120

function toggleReasonExpand(id: number) {
  const set = new Set(expandedReasons.value)
  if (set.has(id)) {
    set.delete(id)
  } else {
    set.add(id)
  }
  expandedReasons.value = set
}

function isReasonExpanded(id: number): boolean {
  return expandedReasons.value.has(id)
}

watch(isPendingFilter, () => fetchLeaves())
onMounted(() => fetchLeaves())
</script>

<template>
  <div class="admin-permission" data-component="AdminPermissionView">


    <div v-if="error" class="admin-permission__error">{{ error }}</div>

    <div class="admin-permission__tabs">
      <BaseTabs
        :model-value="isPendingFilter"
        :tabs="tabs"
        @update:model-value="isPendingFilter = ($event ?? 1) as 1 | 0"
      />
    </div>

    <div v-if="loading" class="admin-permission__loading">
      <AppLoading :full-screen="false" text="جاري تحميل الطلبات..." />
    </div>

    <div
      v-else-if="data.length === 0"
      class="admin-permission__empty"
    >
      {{ isPendingFilter === 1 ? ADMIN_PERMISSION_PAGE.EMPTY_PENDING : ADMIN_PERMISSION_PAGE.EMPTY_PROCESSED }}
    </div>

    <div v-else class="admin-permission__grid">
      <div
        v-for="leave in data"
        :key="leave.id"
        class="admin-permission__card"
      >
        <div class="admin-permission__card-header">
          <div class="admin-permission__card-info">
            <div class="admin-permission__card-name-row">
              <span class="admin-permission__card-name">{{ leave.full_name }}</span>
              <span
                class="admin-permission__card-tag"
                :class="{
                  'admin-permission__card-tag--active': isPendingFilter === 1,
                  'admin-permission__card-tag--approved': leave.status === 'موافق',
                  'admin-permission__card-tag--rejected': leave.status === 'رفض',
                }"
              >
                {{ isPendingFilter === 1 ? ADMIN_PERMISSION_PAGE.STATUS_ACTIVE : leave.status }}
              </span>
            </div>
            <span class="admin-permission__card-track">{{ leave.program_track || '---' }}</span>
          </div>
          <div
            class="admin-permission__avatar"
            :style="{ backgroundColor: getAvatarColor(leave.full_name) }"
          >
            {{ getInitials(leave.full_name) }}
          </div>
        </div>

        <div class="admin-permission__card-body">
          <p class="admin-permission__card-reason">
            {{ isReasonExpanded(leave.id) ? leave.reason : (leave.reason?.slice(0, REASON_MAX_LENGTH) || '') }}
            <span v-if="leave.reason && leave.reason.length > REASON_MAX_LENGTH && !isReasonExpanded(leave.id)">...</span>
            <button
              v-if="leave.reason && leave.reason.length > REASON_MAX_LENGTH"
              type="button"
              class="admin-permission__load-more"
              @click="toggleReasonExpand(leave.id)"
            >
              {{ isReasonExpanded(leave.id) ? ADMIN_PERMISSION_PAGE.SHOW_LESS : ADMIN_PERMISSION_PAGE.LOAD_MORE }}
            </button>
          </p>
          <div class="admin-permission__card-dates">
            {{ formatDateRange(leave.from_date, leave.to_date) }}
          </div>
        </div>

        <div v-if="isPendingFilter === 1" class="admin-permission__card-actions">
          <button
            type="button"
            class="admin-permission__btn admin-permission__btn--approve"
            :disabled="actionLoading === leave.id"
            @click="handleApprove(leave)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ ADMIN_PERMISSION_PAGE.BTN_APPROVE }}
          </button>
          <button
            type="button"
            class="admin-permission__btn admin-permission__btn--reject"
            :disabled="actionLoading === leave.id"
            @click="handleReject(leave)"
          >
            {{ ADMIN_PERMISSION_PAGE.BTN_REJECT }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-permission {
  direction: rtl;
  width: 100%;
  max-width: 100%;

  &__header {
    margin-bottom: $spacing-4;
  }

  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
  }

  &__error {
    padding: $spacing-4;
    color: var(--color-error);
    text-align: center;
    margin-bottom: $spacing-4;
  }

  &__tabs {
    margin-bottom: $spacing-6;

    .base-tabs {
      min-width: 280px;
    }
  }

  &__loading {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__empty {
    padding: $spacing-8;
    text-align: center;
    color: var(--color-text-secondary);
    background: var(--color-background-card);
    border-radius: $radius-xl;
    border: 1px dashed var(--color-border);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: $spacing-4;
  }

  &__card {
    background: var(--color-background-card);
    border-radius: $radius-xl;
    padding: $spacing-4;
    box-shadow: $shadow-md;
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: $spacing-4;
  }

  &__card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $spacing-3;
  }

  &__card-info {
    flex: 1;
    min-width: 0;
  }

  &__card-name-row {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__card-name {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
  }

  &__card-tag {
    padding: $spacing-1 $spacing-2;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    &--active {
      background: rgba(34, 197, 94, 0.15);
      color: #16a34a;
    }

    &--approved {
      background: rgba(34, 197, 94, 0.15);
      color: #16a34a;
    }

    &--rejected {
      background: rgba(239, 68, 68, 0.15);
      color: #dc2626;
    }
  }

  &__card-track {
    display: block;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin-top: $spacing-1;
  }

  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: #fff;
    flex-shrink: 0;
  }

  &__card-body {
    flex: 1;
  }

  &__card-reason {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0 0 $spacing-3 0;
  }

  &__load-more {
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: $font-size-sm;
    cursor: pointer;
    padding: 0;
    margin-right: $spacing-1;

    &:hover {
      text-decoration: underline;
    }
  }

  &__card-dates {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }

  &__card-actions {
    display: flex;
    gap: $spacing-3;
    padding-top: $spacing-2;
    border-top: 1px solid var(--color-border);
  }

  &__btn {
    flex: 1;
    padding: $spacing-2 $spacing-4;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-2;
    transition: all $transition-fast;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &--approve {
      background: var(--color-primary);
      color: #fff;
      border: none;

      &:hover:not(:disabled) {
        background: #008a5c;
      }
    }

    &--reject {
      background: #fff;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);

      &:hover:not(:disabled) {
        background: #f9fafb;
      }
    }
  }
}
</style>
