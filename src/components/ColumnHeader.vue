<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

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
