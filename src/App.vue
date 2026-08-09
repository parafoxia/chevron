<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import ChevronMenubar from "./components/ChevronMenubar.vue";

const isMac = navigator.userAgent.includes("Mac");
</script>

<template>
    <div class="flex flex-col h-screen">
        <ChevronMenubar v-if="!isMac" />
        <RouterView />
    </div>
</template>
