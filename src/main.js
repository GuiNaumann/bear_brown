import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createMetaManager } from "vue-meta";

const app = createApp(App);

app.use(router);
app.use(createMetaManager()); // Usa o gerenciador de metadados da versão correta
app.mount("#app");
