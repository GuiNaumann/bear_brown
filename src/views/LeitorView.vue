<template>
  <div class="camera-list">
    <!-- Barra lateral -->
    <AppSidebar :user="user || placeholderUser" currentSection="Câmeras" />

    <!-- Conteúdo principal -->
    <main class="main-content">
      <!-- Cabeçalho -->
      <div class="header">
        <h1 class="title">Listagem de Câmeras</h1>
        <button class="create-button" @click="handleCreate">Cadastrar Nova Câmera</button>
      </div>

      <!-- Tabela de Câmeras -->
      <div class="table-container">
        <table class="camera-table">
          <thead>
          <tr>
            <th>Nome</th>
            <th>Endereço IP</th>
            <th>Local</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="camera in cameras" :key="camera.id">
            <td>{{ camera.name }}</td>
            <td>{{ camera.ipAddress }}</td>
            <td>{{ camera.location }}</td>
            <td>
              <button class="edit-button" @click="handleEdit(camera.id)">Editar</button>
              <button class="delete-button" @click="handleDelete(camera.id)">Excluir</button>
            </td>
          </tr>
          </tbody>
        </table>
        <p v-if="!cameras.length" class="no-cameras">Nenhuma câmera cadastrada.</p>
      </div>

      <!-- Paginação -->
      <div class="pagination" v-if="totalCount > itemsPerPage">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Anterior</button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Próximo</button>
      </div>
    </main>
  </div>
</template>

<script>
import AppSidebar from "@/components/Sidebar.vue";
import axios from "axios";

export default {
  name: "CameraListView",
  components: { AppSidebar },
  data() {
    return {
      user: null,
      placeholderUser: {
        name: "Usuário Genérico",
        photo: "/generico.png",
      },
      cameras: [],
      totalCount: 0, // Total de câmeras cadastradas
      currentPage: 1, // Página atual
      itemsPerPage: 10, // Itens por página
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalCount / this.itemsPerPage);
    },
  },
  methods: {
    async fetchCameras(page = 1) {
      try {
        const response = await axios.get("http://localhost:8080/private/camera/list", {
          params: {
            page,
            limit: this.itemsPerPage,
          },
          withCredentials: true,
        });
        this.cameras = response.data.items || [];
        this.totalCount = response.data.totalCount || 0;
        this.currentPage = page;
      } catch (error) {
        console.error("Erro ao buscar câmeras:", error);
        this.cameras = [];
      }
    },
    async handleCreate() {
      this.$router.push("/cameras/cadastrar");
    },
    async handleEdit(cameraId) {
      this.$router.push({ name: "EditCamera", params: { id: cameraId } });
    },
    async handleDelete(cameraId) {
      const confirmDelete = confirm("Deseja realmente excluir esta câmera?");
      if (confirmDelete) {
        try {
          await axios.delete(`http://localhost:8080/private/camera/delete/${cameraId}`, {
            withCredentials: true,
          });
          await this.fetchCameras(this.currentPage); // Atualiza a listagem
        } catch (error) {
          console.error("Erro ao excluir câmera:", error);
        }
      }
    },
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
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.fetchCameras(page);
      }
    },
  },
  mounted() {
    this.fetchUserInformation();
    this.fetchCameras(this.currentPage);
  },
};
</script>

<style scoped>
.camera-list {
  display: flex;
  height: 100vh;
  background: #f8f9fa;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
}

.create-button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.create-button:hover {
  background: #0056b3;
}

.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.camera-table {
  width: 100%;
  border-collapse: collapse;
}

.camera-table th,
.camera-table td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.camera-table th {
  background-color: #007bff;
  color: white;
}

.edit-button,
.delete-button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  margin-right: 5px;
}

.edit-button {
  background-color: #ffc107;
}

.edit-button:hover {
  background-color: #e0a800;
}

.delete-button {
  background-color: #dc3545;
}

.delete-button:hover {
  background-color: #c82333;
}

.no-cameras {
  text-align: center;
  color: #666;
  margin-top: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination button {
  padding: 10px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.pagination button:disabled {
  background: #ddd;
  cursor: not-allowed;
}

.pagination span {
  font-size: 1rem;
}
</style>
