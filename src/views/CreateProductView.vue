<template>
  <div class="dashboard">
    <!-- Barra lateral -->
    <AppSidebar :user="user || placeholderUser" currentSection="Produtos" />

    <!-- Conteúdo principal -->
    <main class="main-content">
      <div class="header">
        <h1>Cadastrar Novo Produto</h1>
      </div>

      <!-- Formulário de Cadastro -->
      <div class="form-container">
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

          <!-- Upload de Imagens -->
          <div class="form-group upload-container">
            <label for="images">Imagens</label>
            <div class="drop-area" @dragover.prevent @drop="handleDrop">
              <p>Arraste e solte arquivos aqui ou clique para selecionar</p>
              <input
                  type="file"
                  id="images"
                  multiple
                  @change="handleImageUpload"
                  class="file-input"
              />
            </div>

            <div v-if="images.length" class="image-preview-container">
              <div
                  class="image-preview"
                  v-for="(image, index) in images"
                  :key="index"
              >
                <img :src="getImagePreview(image)" alt="Pré-visualização" />
              </div>
            </div>
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
    </main>
  </div>
</template>

<script>
import axios from "axios";
import AppSidebar from "@/components/Sidebar.vue";

export default {
  components: { AppSidebar },
  data() {
    return {
      user: null,
      placeholderUser: { name: "Usuário Genérico", photo: "/generico.png" },
      product: { name: "", quantity: null, price: null, size: "", description: "" },
      sizes: ["PP", "P", "M", "G", "GG", "XG", "XGG"],
      images: [],
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    handleImageUpload(event) {
      this.images = Array.from(event.target.files);
    },
    handleDrop(event) {
      this.images = Array.from(event.dataTransfer.files);
    },
    getImagePreview(file) {
      return URL.createObjectURL(file);
    },
    async handleSubmit() {
      if (!this.product.name || !this.product.quantity || !this.product.price) {
        this.errorMessage = "Preencha os campos obrigatórios!";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        const payload = {
          name: this.product.name,
          quantity: this.product.quantity,
          price: this.product.price,
          size: this.product.size,
          description: this.product.description,
          images: this.images.map((file) => file.name),
        };

        await axios.post("https://seu-servidor.com/create/product", payload);
        alert("Produto cadastrado com sucesso!");

        this.product = { name: "", quantity: null, price: null, size: "", description: "" };
        this.images = [];
        this.$router.push("/produtos");
      } catch (error) {
        this.errorMessage = "Erro ao cadastrar produto. Tente novamente.";
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    cancel() {
      this.$router.push("/produtos");
    },
  },
  mounted() {
    this.user = this.placeholderUser;
  },
};
</script>

<style scoped>
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
  color: #333;
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
