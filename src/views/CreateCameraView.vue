<template>
  <div class="create-camera">
    <!-- Barra lateral -->
    <AppSidebar :user="user || placeholderUser" currentSection="Câmeras" />

    <!-- Conteúdo principal -->
    <main class="main-content">
      <div class="header">
        <h1 class="title">Cadastrar Nova Câmera</h1>
      </div>

      <!-- Formulário de Cadastro -->
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="camera-form">
          <!-- Nome da Câmera -->
          <div class="form-group">
            <label for="name">Nome *</label>
            <input
                v-model="camera.name"
                id="name"
                placeholder="Digite o nome da câmera"
                required
            />
          </div>

          <!-- Endereço IP e Porta -->
          <div class="form-group-inline">
            <div class="form-group">
              <label for="ipAddress">Endereço IP *</label>
              <input
                  v-model="camera.ipAddress"
                  id="ipAddress"
                  type="text"
                  placeholder="192.168.0.1"
                  required
              />
            </div>

            <div class="form-group">
              <label for="port">Porta *</label>
              <input
                  v-model.number="camera.port"
                  id="port"
                  type="number"
                  placeholder="80"
                  required
              />
            </div>
          </div>

          <!-- Usuário e Senha -->
          <div class="form-group-inline">
            <div class="form-group">
              <label for="username">Usuário *</label>
              <input
                  v-model="camera.username"
                  id="username"
                  type="text"
                  placeholder="Usuário da câmera"
                  required
              />
            </div>

            <div class="form-group">
              <label for="password">Senha *</label>
              <input
                  v-model="camera.password"
                  id="password"
                  type="password"
                  placeholder="Senha da câmera"
                  required
              />
            </div>
          </div>

          <!-- Caminho do Stream -->
          <div class="form-group">
            <label for="streamPath">Caminho do Stream *</label>
            <input
                v-model="camera.streamPath"
                id="streamPath"
                type="text"
                placeholder="/live/stream"
                required
            />
          </div>

          <!-- Tipo de Câmera -->
          <div class="form-group">
            <label for="cameraType">Tipo de Câmera *</label>
            <select v-model="camera.cameraType" id="cameraType" required>
              <option value="Intelbras">Intelbras</option>
              <option value="Yoosee">Yoosee</option>
            </select>
          </div>

          <!-- Local da Câmera -->
          <div class="form-group">
            <label for="localID">Local *</label>
            <select v-model.number="camera.localID" id="localID" required>
              <option v-for="local in locations" :key="local.id" :value="local.id">
                {{ local.name }}
              </option>
            </select>
          </div>

          <!-- Botões -->
          <div class="actions">
            <button type="submit" :disabled="isLoading" class="save-button">
              {{ isLoading ? "Salvando..." : "Salvar" }}
            </button>
            <button type="button" @click="cancel" class="cancel-button">Cancelar</button>
          </div>

          <!-- Mensagens de Erro -->
          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import AppSidebar from "@/components/Sidebar.vue";
import axios from "axios";

export default {
  name: "CreateCameraView",
  components: { AppSidebar },
  data() {
    return {
      user: null,
      placeholderUser: {
        name: "Usuário Genérico",
        photo: "/generico.png",
      },
      camera: {
        name: "",
        ipAddress: "",
        port: null,
        username: "",
        password: "",
        streamPath: "",
        cameraType: "Intelbras",
        localID: null, // Alterado para aceitar ID do local
      },
      locations: [],
      isLoading: false,
      errorMessage: "",
    };
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
    async fetchLocations() {
      try {
        const response = await axios.get("http://localhost:8080/private/camera/local/list", {
          withCredentials: true,
        });
        this.locations = response.data.items || [];
      } catch (error) {
        console.error("Erro ao buscar locais:", error);
      }
    },
    async handleSubmit() {
      if (
          !this.camera.name ||
          !this.camera.ipAddress ||
          !this.camera.port ||
          !this.camera.username ||
          !this.camera.password ||
          !this.camera.streamPath ||
          !this.camera.cameraType ||
          !this.camera.localID
      ) {
        this.errorMessage = "Preencha todos os campos obrigatórios!";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        await axios.post(
            "http://localhost:8080/private/camera/create",
            this.camera,
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
        );
        alert("Câmera cadastrada com sucesso!");
        this.$router.push("/leitor");
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.errorMessage = "Não autorizado. Verifique suas credenciais.";
        } else {
          this.errorMessage = "Erro ao cadastrar câmera. Tente novamente.";
        }
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    cancel() {
      this.$router.push("/leitor");
    },
  },
  mounted() {
    this.fetchUserInformation();
    this.fetchLocations();
  },
};
</script>

<style scoped>
.create-camera {
  display: flex;
  height: 100vh;
  background: #f9f9f9;
}

.main-content {
  flex: 1;
  padding: 30px;
}

.header {
  margin-bottom: 20px;
  text-align: left;
}

.title {
  font-size: 2rem;
  color: #007bff;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.camera-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group-inline {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  text-align: left;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #6c63ff;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

.save-button {
  background-color: #6c63ff;
}

.cancel-button {
  background-color: #f44336;
}

.save-button:hover {
  background-color: #574fbf;
}

.cancel-button:hover {
  background-color: #d32f2f;
}

.alert {
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  margin-top: 10px;
}
</style>
