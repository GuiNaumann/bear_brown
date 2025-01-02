<template>
  <div class="local-list">
    <!-- Barra lateral -->
    <AppSidebar :user="user || placeholderUser" currentSection="Locais" />

    <!-- Conteúdo principal -->
    <main class="main-content">
      <!-- Cabeçalho -->
      <div class="header">
        <h1 class="title">Listagem de Locais</h1>
        <button class="create-button" @click="handleCreate">Cadastrar Novo Local</button>
      </div>

      <!-- Tabela de Locais -->
      <div class="table-container">
        <table class="local-table">
          <thead>
          <tr>
            <th>Nome do Local</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="local in locais" :key="local.id">
            <td>{{ local.name }}</td>
            <td class="actions">
              <button class="edit-button" @click="handleEdit(local.id)">Editar</button>
              <button class="delete-button" @click="handleDelete(local.id)">Excluir</button>
            </td>
          </tr>
          </tbody>
        </table>
        <p v-if="!locais.length" class="no-locais">Nenhum local cadastrado.</p>
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
  name: "LocalListView",
  components: { AppSidebar },
  data() {
    return {
      user: null,
      placeholderUser: {
        name: "Usuário Genérico",
        photo: "/generico.png",
      },
      locais: [], // Lista de locais
      totalCount: 0, // Total de locais
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
    async fetchLocais(page = 1) {
      try {
        const response = await axios.get("http://localhost:8080/private/locais", {
          params: {
            page,
            limit: this.itemsPerPage,
          },
          withCredentials: true,
        });
        this.locais = response.data.items;
        this.totalCount = response.data.totalCount;
        this.currentPage = page;
      } catch (error) {
        console.error("Erro ao buscar locais:", error);
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
    async handleCreate() {
      this.$router.push("/produtos/cadastrar");
    },
    async handleEdit(id) {
      this.$router.push({ name: "EditLocal", params: { id } });
    },
    async handleDelete(id) {
      const confirmDelete = confirm("Deseja realmente excluir este local?");
      if (confirmDelete) {
        try {
          await axios.delete(`http://localhost:8080/private/locais/delete/${id}`, {
            withCredentials: true,
          });
          this.fetchLocais(this.currentPage); // Recarrega a lista
        } catch (error) {
          console.error("Erro ao excluir local:", error.response || error.message);
        }
      }
    },
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.fetchLocais(page);
      }
    },
  },
  mounted() {
    this.fetchLocais(this.currentPage);
    this.fetchUserInformation();
  },
};
</script>

<style scoped>
.local-list {
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
  overflow-x: auto;
  padding: 20px;
}

.local-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.local-table th,
.local-table td {
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
}

.local-table th {
  background: #007bff;
  color: white;
  font-weight: bold;
}

.local-table tbody tr:hover {
  background: #f9f9f9;
}

.actions {
  display: flex;
  gap: 10px;
}

.edit-button {
  padding: 5px 10px;
  background: #ffc107;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-button:hover {
  background: #e0a800;
}

.delete-button {
  padding: 5px 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.delete-button:hover {
  background: #c82333;
}

.no-locais {
  text-align: center;
  color: #666;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
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
