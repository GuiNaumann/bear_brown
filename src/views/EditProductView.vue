<template>
  <div class="dashboard">
    <!-- Barra lateral -->
    <AppSidebar :user="user || placeholderUser" currentSection="Produtos" />

    <!-- Conteúdo principal -->
    <main class="main-content">
      <div class="header">
        <h1>Editar Produto</h1>
      </div>

      <!-- Formulário de Edição -->
      <div class="form-container" v-if="product">
        <form @submit.prevent="handleSubmit" class="product-form">
          <!-- Nome do Produto -->
          <div class="form-group">
            <label for="name">Nome *</label>
            <input
                v-model="product.name"
                id="name"
                placeholder="Digite o nome do produto"
                required
            />
          </div>

          <!-- Quantidade e Preço -->
          <div class="form-group-inline">
            <div class="form-group">
              <label for="quantity">Quantidade *</label>
              <input
                  v-model.number="product.quantity"
                  id="quantity"
                  type="number"
                  placeholder="0"
                  required
              />
            </div>

            <div class="form-group">
              <label for="price">Preço *</label>
              <input
                  v-model.number="product.price"
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
              />
            </div>
          </div>

          <!-- Tamanho -->
          <div class="form-group">
            <label for="size">Tamanho</label>
            <select v-model="product.size" id="size">
              <option v-for="size in sizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>

          <!-- Descrição -->
          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea
                v-model="product.description"
                id="description"
                placeholder="Digite uma descrição"
                rows="3"
            ></textarea>
          </div>

          <!-- Foto do Produto -->
          <div class="form-group upload-container">
            <label for="image">Foto do Produto</label>
            <div class="image-preview-container">
              <img
                  v-if="product.imageURL"
                  :src="product.imageURL"
                  alt="Foto do Produto"
                  class="product-image-preview"
              />
            </div>
            <input
                type="file"
                id="image"
                @change="handleImageUpload"
                class="file-input"
            />
          </div>

          <!-- Botões -->
          <div class="actions">
            <button type="submit" :disabled="isLoading" class="save-button">
              {{ isLoading ? "Salvando..." : "Salvar" }}
            </button>
            <button type="button" @click="cancel" class="cancel-button">
              Cancelar
            </button>
          </div>

          <!-- Mensagens de Erro -->
          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>
        </form>
      </div>

      <!-- Carregando ou erro -->
      <div v-else>
        <p v-if="isLoading">Carregando produto...</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import AppSidebar from "@/components/Sidebar.vue";

export default {
  components: { AppSidebar },
  props: ["id"],
  data() {
    return {
      user: null,
      placeholderUser: {
        name: "Usuário Genérico",
        photo: "/generico.png",
      },
      product: null,
      sizes: ["PP", "P", "M", "G", "GG", "XG", "XGG"],
      isLoading: false,
      errorMessage: "",
      newImage: null, // Armazena a nova imagem carregada
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
    async fetchProductDetails() {
      try {
        this.isLoading = true;
        const response = await axios.get(
            `http://localhost:8080/private/product/get/${this.id}`,
            { withCredentials: true }
        );
        this.product = response.data;
      } catch (error) {
        this.errorMessage = "Erro ao carregar os detalhes do produto.";
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      this.newImage = file;
      if (file) {
        this.product.imageURL = URL.createObjectURL(file); // Atualiza a pré-visualização
      }
    },
    async convertFileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    },
    async handleSubmit() {
      if (!this.product.name || !this.product.quantity || !this.product.price) {
        this.errorMessage = "Preencha os campos obrigatórios!";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        let imageBase64 = null;
        if (this.newImage) {
          imageBase64 = await this.convertFileToBase64(this.newImage);
        }

        const payload = {
          ...this.product,
          imageBase64,
        };

        console.log("Payload enviado:", payload);

        await axios.post(
            `http://localhost:8080/private/product/update/${this.id}`,
            payload,
            { withCredentials: true } // Envia cookies
        );

        alert("Produto atualizado com sucesso!");
        this.$router.push("/produtos");
      } catch (error) {
        if (error.response) {
          console.error("Erro no servidor:", error.response.data);
        } else {
          console.error("Erro na requisição:", error.message);
        }
        this.errorMessage = "Erro ao atualizar o produto. Tente novamente.";
      } finally {
        this.isLoading = false;
      }
    },
    cancel() {
      this.$router.push("/produtos");
    },
  },
  async mounted() {
    await this.fetchUserInformation();
    await this.fetchProductDetails();
  },
};
</script>

<style scoped>
/* Mesmos estilos do cadastro, com adição para a pré-visualização de imagem */
.product-image-preview {
  width: 150px;
  height: 150px;
  object-fit: cover;
  margin-bottom: 10px;
  border-radius: 8px;
}

.dashboard {
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

h1 {
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

.product-form {
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
</style>
