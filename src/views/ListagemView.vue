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
          <img :src="item.imageURL" alt="Produto" class="product-image" />
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
    };
  },
  methods: {
    async fetchItems() {
      try {
        const response = await axios.get("http://localhost:8080/private/product/list", {
          withCredentials: true,
        });
        // Acesse a propriedade "items" da resposta
        this.items = response.data.items.map(item => ({
          ...item,
          price: item.price ?? 0, // Define preço como 0 se não estiver definido
        }));
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      }
    },
    // Busca as informações pessoais do usuário no endpoint
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
      console.log("Editar item:", id);
    },
    async handleDelete(id) {
      const confirmDelete = confirm("Deseja realmente excluir este item?");
      if (confirmDelete) {
        try {
          await axios.delete(`http://localhost:8080/private/product/delete/${id}`, {
            withCredentials: true, // Certifique-se de enviar os cookies
          });
          this.items = this.items.filter((item) => item.id !== id);
        } catch (error) {
          console.error("Erro ao excluir item:", error.response || error.message);
        }
      }
    }
  },
  mounted() {
    this.fetchItems();
    this.fetchUserInformation();
  },
};
</script>

<style scoped>
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

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
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

.no-products {
  text-align: center;
  font-size: 16px;
  color: #666;
}
</style>
