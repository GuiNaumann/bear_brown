<template>
  <div class="dashboard">
    <!-- Barra lateral -->
    <AppSidebar :user="user || placeholderUser" currentSection="Locais" />

    <!-- Conteúdo principal -->
    <main class="main-content">
      <div class="header">
        <h1>{{ isEditing ? "Editar Local" : "Cadastrar Novo Local" }}</h1>
      </div>

      <!-- Formulário de Cadastro -->
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="local-form">
          <!-- Nome do Local -->
          <div class="form-group">
            <label for="name">Nome do Local *</label>
            <input
                v-model="local.name"
                id="name"
                placeholder="Digite o nome do local"
                required
            />
          </div>

          <!-- Endereço -->
          <div class="form-group">
            <label for="address">Endereço *</label>
            <input
                v-model="local.address"
                id="address"
                placeholder="Digite o endereço do local"
                required
            />
          </div>

          <!-- Cidade e Estado -->
          <div class="form-group-inline">
            <div class="form-group">
              <label for="city">Cidade *</label>
              <input
                  v-model="local.city"
                  id="city"
                  placeholder="Digite a cidade"
                  required
              />
            </div>
            <div class="form-group">
              <label for="state">Estado *</label>
              <select v-model="local.state" id="state" required>
                <option value="" disabled>Selecione o estado</option>
                <option v-for="state in states" :key="state" :value="state">
                  {{ state }}
                </option>
              </select>
            </div>
          </div>

          <!-- Descrição -->
          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea
                v-model="local.description"
                id="description"
                placeholder="Digite uma descrição"
                rows="3"
            ></textarea>
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
  props: ["id"], // Recebe o ID como prop para edição
  data() {
    return {
      user: null,
      placeholderUser: {
        name: "Usuário Genérico",
        photo: "/generico.png",
      },
      local: { name: "", address: "", city: "", state: "", description: "" },
      states: [
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
        "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
        "SP", "SE", "TO"
      ],
      isLoading: false,
      errorMessage: "",
    };
  },
  computed: {
    isEditing() {
      return !!this.id; // Verifica se está no modo de edição
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
    async fetchLocalData() {
      if (!this.isEditing) return; // Apenas busca dados se for edição

      this.isLoading = true;
      try {
        const response = await axios.get(`http://localhost:8080/private/camera/local/get/${this.id}`, {
          withCredentials: true,
        });
        this.local = response.data; // Preenche o formulário com os dados recebidos
      } catch (error) {
        console.error("Erro ao buscar informações do local:", error);
        this.errorMessage = "Erro ao carregar informações do local.";
      } finally {
        this.isLoading = false;
      }
    },
    async handleSubmit() {
      if (!this.local.name || !this.local.address || !this.local.city || !this.local.state) {
        this.errorMessage = "Preencha todos os campos obrigatórios!";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        const payload = {
          name: this.local.name,
          address: this.local.address,
          city: this.local.city,
          state: this.local.state,
          description: this.local.description,
        };

        if (this.isEditing) {
          await axios.post(
              `http://localhost:8080/private/camera/local/update/${this.id}`,
              payload,
              { withCredentials: true }
          );
          alert("Local atualizado com sucesso!");
        } else {
          await axios.post(
              "http://localhost:8080/private/camera/local/create",
              payload,
              { withCredentials: true }
          );
          alert("Local cadastrado com sucesso!");
        }

        this.local = { name: "", address: "", city: "", state: "", description: "" };
        this.$router.push("/produtos");
      } catch (error) {
        this.errorMessage = "Erro ao salvar local. Tente novamente.";
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
    this.fetchUserInformation();
    this.fetchLocalData(); // Busca os dados do local caso esteja no modo de edição
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

.local-form {
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
