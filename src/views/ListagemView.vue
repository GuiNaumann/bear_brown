<template>
  <div class="dashboard">
    <!-- Barra lateral -->
    <AppSidebar :user="user || placeholderUser" currentSection="Produtos" />

    <!-- Área principal -->
    <main class="main-content">
      <div class="header">
        <h1>Produtos</h1>
        <button class="create-button" @click="handleCreate">Cadastrar Novo</button>
      </div>
      <div class="product-grid">
        <div v-for="item in items" :key="item.id" class="product-card">
          <div class="image-container">
            <img :src="item.imageURL" alt="Produto" class="product-image" />
          </div>
          <div class="product-info">
            <h2 class="product-name">{{ item.name }}</h2>
            <p class="product-description">{{ item.description }}</p>
            <p class="product-price">
              R$ {{ item.price ? item.price.toFixed(2) : "0.00" }}
            </p>
            <p class="product-size">Tamanho: {{ item.size }}</p>
            <div class="product-actions">
              <button class="edit-button" @click="handleEdit(item.id)">Editar</button>
              <button class="delete-button" @click="handleDelete(item.id)">Excluir</button>
            </div>
          </div>
        </div>
      </div>
      <p v-if="!items.length" class="no-products">Nenhum produto encontrado.</p>

      <!-- Paginação -->
      <div class="pagination" v-if="totalCount > itemsPerPage">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          Anterior
        </button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
          Próximo
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import AppSidebar from "@/components/Sidebar.vue";
import axios from "axios";

export default {
  components: { AppSidebar },
  data() {
    return {
      user: null,
      placeholderUser: {
        name: "Usuário Genérico",
        photo: "/generico.png",
      },
      items: [],
      totalCount: 0, // Total de itens
      currentPage: 1, // Página atual
      itemsPerPage: 30, // Quantidade de itens por página
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalCount / this.itemsPerPage);
    },
  },
  methods: {
    async fetchItems(page = 1) {
      try {
        const response = await axios.get("http://localhost:8080/private/product/list", {
          params: {
            page,
            limit: this.itemsPerPage,
          },
          withCredentials: true,
        });
        this.items = response.data.items.map((item) => ({
          ...item,
          price: item.price ?? 0, // Define preço como 0 se não estiver definido
        }));
        this.totalCount = response.data.totalCount; // Atualiza o total de itens
        this.currentPage = page; // Define a página atual
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
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
      this.$router.push({ name: "EditProduct", params: { id } });
    },
    async handleDelete(id) {
      const confirmDelete = confirm("Deseja realmente excluir este item?");
      if (confirmDelete) {
        try {
          await axios.delete(`http://localhost:8080/private/product/delete/${id}`, {
            withCredentials: true,
          });
          this.fetchItems(this.currentPage); // Recarrega os itens da página atual
        } catch (error) {
          console.error("Erro ao excluir item:", error.response || error.message);
        }
      }
    },
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.fetchItems(page);
      }
    },
  },
  mounted() {
    this.fetchItems(this.currentPage);
    this.fetchUserInformation();
  },
};
</script>

<style scoped>
/* Estilos atualizados */
.dashboard {
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.image-container {
  height: 200px;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin: 10px 0;
}

.product-price {
  font-size: 16px;
  font-weight: bold;
  color: #007bff;
}

.product-size {
  font-size: 14px;
  color: #666;
}

.product-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.pagination button {
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 16px;
  color: #333;
}
</style>
