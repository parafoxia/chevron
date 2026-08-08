<script setup lang="ts">
defineProps<{
    params: { displayName: string; dtype: string; arrowDType: string };
}>();
</script>

<template>
    <div class="flex flex-col">
        <span>{{ params.displayName }}</span>
        <span class="text-xs text-gray-400">{{ params.arrowDType }}</span>
    </div>
</template>
