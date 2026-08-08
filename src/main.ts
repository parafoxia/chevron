import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/global.css";
import OpenVue from "openvue/config";
import Aura from "@openvue/themes/aura";
import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "./components/HomeView.vue";
import DataView from "./components/DataView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/data", component: DataView },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);
app.use(OpenVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: "openvue",
        order: "theme, base, openvue, components, utilities",
      },
    },
  },
});
app.use(router);
app.mount("#app");
