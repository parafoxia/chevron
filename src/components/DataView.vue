<!--
SPDX-FileCopyrightText: 2026 Ethan Henderson

SPDX-License-Identifier: MIT OR Apache-2.0
-->

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const path = route.query.path;
</script>

<template>
    <div class="flex-1">{{ path }}</div>
</template>
