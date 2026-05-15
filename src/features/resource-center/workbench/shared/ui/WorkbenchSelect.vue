<script setup lang="ts">
import '../styles/workbench-select.css'

import { computed, onBeforeUnmount, ref, watch } from 'vue'

interface WorkbenchSelectOption {
  value: string
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: Array<WorkbenchSelectOption>
    ariaLabel?: string
    placeholder?: string
    size?: 'md' | 'sm'
    disabled?: boolean
  }>(),
  {
    ariaLabel: '',
    placeholder: '请选择',
    size: 'md',
    disabled: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'change', value: string): void
}>()

const open = ref(false)
const highlightedIndex = ref(-1)
const rootRef = ref<HTMLElement | null>(null)

const selectedOption = computed(
  () => props.options.find((option) => option.value === props.modelValue) ?? null,
)

const currentLabel = computed(() => selectedOption.value?.label ?? props.placeholder)

function syncHighlightedIndex() {
  highlightedIndex.value = props.options.findIndex((option) => option.value === props.modelValue)
}

watch(
  () => props.modelValue,
  () => {
    syncHighlightedIndex()
  },
  { immediate: true },
)

function openMenu() {
  if (props.disabled) {
    return
  }
  open.value = true
  syncHighlightedIndex()
}

function closeMenu() {
  open.value = false
}

function toggleOpen() {
  if (open.value) {
    closeMenu()
    return
  }
  openMenu()
}

function findNextEnabledIndex(startIndex: number, direction: 1 | -1) {
  const total = props.options.length
  if (total === 0) {
    return -1
  }

  let currentIndex = startIndex
  for (let step = 0; step < total; step += 1) {
    currentIndex = (currentIndex + direction + total) % total
    if (!props.options[currentIndex]?.disabled) {
      return currentIndex
    }
  }

  return -1
}

function moveHighlight(direction: 1 | -1) {
  const nextIndex = findNextEnabledIndex(highlightedIndex.value, direction)
  if (nextIndex >= 0) {
    highlightedIndex.value = nextIndex
  }
}

function handleOptionSelect(option: WorkbenchSelectOption) {
  if (option.disabled) {
    return
  }
  emit('update:modelValue', option.value)
  emit('change', option.value)
  closeMenu()
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!open.value) {
      openMenu()
    }
    moveHighlight(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) {
      openMenu()
    }
    moveHighlight(-1)
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleOpen()
    return
  }

  if (event.key === 'Escape') {
    closeMenu()
  }
}

function handleListKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveHighlight(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveHighlight(-1)
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const option = props.options[highlightedIndex.value]
    if (option) {
      handleOptionSelect(option)
    }
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu()
  }
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!rootRef.value?.contains(event.target as Node)) {
    closeMenu()
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
}

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', handleDocumentPointerDown)
  }
})
</script>

<template>
  <div
    ref="rootRef"
    class="workbench-select"
    :class="[{ 'is-open': open, 'is-disabled': disabled }, `is-${size}`]"
  >
    <button
      type="button"
      class="workbench-select__trigger"
      :aria-expanded="open"
      :aria-label="ariaLabel || currentLabel"
      :disabled="disabled"
      @click="toggleOpen"
      @keydown="handleTriggerKeydown"
    >
      <span class="workbench-select__label">{{ currentLabel }}</span>
      <span class="workbench-select__chevron" aria-hidden="true"></span>
    </button>

    <div
      v-if="open"
      class="workbench-select__menu"
      tabindex="-1"
      role="listbox"
      :aria-label="ariaLabel || currentLabel"
      @keydown="handleListKeydown"
    >
      <button
        v-for="(option, index) in options"
        :key="option.value"
        type="button"
        class="workbench-select__option"
        :class="{
          'is-selected': option.value === modelValue,
          'is-highlighted': index === highlightedIndex,
          'is-disabled': option.disabled,
        }"
        :disabled="option.disabled"
        @click="handleOptionSelect(option)"
      >
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
