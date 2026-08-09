<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import ProgressSpinner from "openvue/progressspinner";
</script>

<template>
    <div class="flex flex-1 flex-col items-center justify-center">
        <ProgressSpinner />
        <span class="ml-2">Loading...</span>
    </div>
</template>
