<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const path = route.query.path;
</script>

<template>
    <div class="flex-1">{{ path }}</div>
</template>
