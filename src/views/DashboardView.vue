<template>
  <div class="monitoramento-container">
    <AppSidebar :user="user || placeholderUser" currentSection="Monitoramento" />

    <main class="main-content">
      <h1 class="title">Monitoramento</h1>

      <section class="filters">
        <label>
          Filtrar por nome:
          <input
              type="text"
              v-model="search"
              @input="fetchMonitoramentoData"
              placeholder="Digite o nome da câmera"
          />
        </label>

        <label>
          Filtrar por local:
          <select v-model="selectedLocal" @change="fetchMonitoramentoData">
            <option value="">Todos os locais</option>
            <option v-for="(local, index) in locais" :key="index" :value="local.id">
              {{ local.name }}
            </option>
          </select>
        </label>

        <label>
          Número de telas:
          <select v-model="screenCount" @change="fetchMonitoramentoData">
            <option v-for="n in [1, 4, 8, 16, 32, 64]" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
      </section>

      <section class="camera-grid" :style="gridStyle">
        <div v-for="(camera, index) in cameras" :key="index" class="camera-box">
          <h3>{{ camera.name }}</h3>
          <!-- Reproduz o HLS -->
          <video
              id="video-{{ index }}"
              class="video-js vjs-default-skin"
              controls
              autoplay
              muted
          ></video>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AppSidebar from "@/components/Sidebar.vue";
import axios from "axios";
import Hls from "hls.js";

export default {
  name: "MonitoramentoView",
  components: { AppSidebar },
  data() {
    return {
      user: null,
      placeholderUser: {
        name: "Usuário Genérico",
        photo: "/generico.png",
      },
      cameras: [],
      locais: [],
      selectedLocal: "",
      search: "",
      screenCount: 4,
    };
  },
  computed: {
    gridStyle() {
      const cols = Math.sqrt(this.screenCount);
      return `grid-template-columns: repeat(${cols}, 1fr);`;
    },
  },
  methods: {
    async fetchUserInformation() {
      try {
        const response = await axios.get("http://localhost:8080/personalInformation", {
          withCredentials: true,
        });
        this.user = {
          name: response.data.name || "Usuário Genérico",
          photo: response.data.image || "/generico.png",
        };
      } catch (error) {
        console.error("Erro ao buscar informações pessoais:", error);
        this.user = this.placeholderUser;
      }
    },
    async fetchLocais() {
      try {
        const response = await axios.get("http://localhost:8080/private/camera/local/list", {
          withCredentials: true,
        });
        this.locais = response.data || [];
      } catch (error) {
        console.error("Erro ao buscar locais:", error);
        this.locais = [];
      }
    },
    async fetchMonitoramentoData() {
      try {
        const params = {
          search: this.search,
          localId: this.selectedLocal,
          screenCount: this.screenCount,
        };
        const response = await axios.get("http://localhost:8080/private/camera/list", {
          params,
          withCredentials: true,
        });
        this.cameras = response.data.items || [];
        this.initializePlayers();
      } catch (error) {
        console.error("Erro ao buscar dados de monitoramento:", error);
        this.cameras = [];
      }
    },
    initializePlayers() {
      this.cameras.forEach((camera, index) => {
        const videoElement = document.getElementById(`video-${index}`);
        if (videoElement) {
          const streamUrl = camera.streamUrl; // URL do HLS gerada no backend

          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              videoElement.play();
            });
          } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
            videoElement.src = streamUrl;
            videoElement.addEventListener("loadedmetadata", () => {
              videoElement.play();
            });
          } else {
            console.error(`O navegador não suporta HLS para a câmera: ${camera.name}`);
          }
        }
      });
    },
  },
  mounted() {
    this.fetchUserInformation();
    this.fetchLocais();
    this.fetchMonitoramentoData();
  },
};
</script>

<style scoped>
.monitoramento-container {
  display: flex;
  height: 100vh;
}

.camera-box {
  background: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 10px;
}

.camera-box h3 {
  margin-bottom: 10px;
  font-size: 1.2rem;
  color: #333;
}

.camera-box video {
  width: 100%;
  border-radius: 5px;
}

.main-content {
  margin-left: 350px; /* Espaço para compensar a barra lateral */
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column; /* Organiza os elementos em coluna */
  align-items: center; /* Centraliza horizontalmente */
  justify-content: flex-start; /* Começa no topo */
  height: 100vh; /* Usa toda a altura da tela */
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 20px;
  text-align: center; /* Centraliza o texto */
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center; /* Alinha os itens ao centro */
  justify-content: center; /* Centraliza os filtros */
}

.filters input,
.filters select {
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.camera-grid {
  display: grid;
  gap: 10px;
  justify-content: center; /* Centraliza o grid */
}
</style>
