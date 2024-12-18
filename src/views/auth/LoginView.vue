<template>
  <div class="login-page">
    <div class="login-container">
      <div class="illustration">
        <img src="/images/login.png" alt="Ilustração" />
      </div>
      <div class="form-container">
        <h1>Bem-vindo de volta!</h1>
        <p class="subtitle">Entre com sua conta para continuar</p>
        <form @submit.prevent="handleLogin">
          <div class="form-groups">
            <label for="login">Email ou CPF</label>
            <input
                type="text"
                id="login"
                v-model="form.login"
                placeholder="Digite seu Email ou CPF"
                required
            />
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <div class="password-container">
              <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="form.password"
                  placeholder="Digite sua senha"
                  required
              />
              <button
                  type="button"
                  class="toggle-password"
                  @click="togglePasswordVisibility"
              >
                <img
                    :src="showPassword ? '/images/olho.png' : '/images/olho_fechado.png'"
                    :alt="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                />
              </button>
            </div>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Entrar</button>
            <a href="#" class="forgot-password">Esqueceu a senha?</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
import { loginUser } from "@/services/authService";

export default {
  name: "LoginView",
  setup() {
    const form = reactive({
      login: "", // Email ou CPF
      password: "",
    });

    const errorMessage = ref(null);
    const showPassword = ref(false);

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const cleanCPF = (cpf) => {
      return cpf.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
    };

    const isEmail = (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    };

    const isCPF = (value) => {
      const cpf = cleanCPF(value); // Limpa o CPF antes de validar
      const cpfRegex = /^\d{11}$/; // Verifica se tem exatamente 11 números
      return cpfRegex.test(cpf);
    };

    const validateLoginField = () => {
      const cleanedLogin = cleanCPF(form.login);
      if (!isEmail(form.login) && !isCPF(cleanedLogin)) {
        errorMessage.value = "Por favor, insira um email ou CPF válido.";
        return false;
      }
      return true;
    };

    const handleLogin = async () => {
      if (!validateLoginField()) return;

      if (isCPF(form.login)) {
        form.login = cleanCPF(form.login); // Limpa CPF antes de enviar ao backend
      }

      try {
        const response = await loginUser(form);
        console.log("Login bem-sucedido:", response);
        errorMessage.value = null; // Limpa mensagens de erro em caso de sucesso
      } catch (error) {
        errorMessage.value =
            error.response?.data?.message ||
            "Erro ao realizar login. Verifique suas credenciais.";
      }
    };

    return {
      form,
      errorMessage,
      showPassword,
      togglePasswordVisibility,
      handleLogin,
    };
  },
};

</script>

<style scoped>
/* Login Page */
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #007bff, #0056b3);
}

/* Login Container */
.login-container {
  display: flex;
  flex-direction: row;
  max-width: 900px;
  width: 100%;
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Illustration Section */
.illustration {
  flex: 1;
  background: linear-gradient(135deg, #eaf4fe, #d0e9ff);
  display: flex;
  justify-content: center;
  align-items: center;
}

.illustration img {
  max-width: 80%;
  height: auto;
}

/* Form Section */
.form-container {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
  width: 100%;
}

.form-groups {
  margin-bottom: 1.5rem;
  text-align: left;
  width: 93.5%;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #34495e;
}

.password-container {
  position: relative;
  width: 100%; /* Garante que o contêiner tenha a largura máxima */
}

.password-container input {
  width: 100%; /* Garante que o campo ocupe todo o espaço do contêiner */
  padding-right: 2.5rem; /* Adiciona espaço para o botão do olho */
  box-sizing: border-box; /* Inclui padding e borda no cálculo do tamanho */
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced6e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.2);
}

button.toggle-password {
  position: absolute;
  top: 50%; /* Centraliza verticalmente o botão */
  right: 10px; /* Posiciona à direita do contêiner */
  transform: translateY(-50%); /* Ajusta o alinhamento vertical */
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

button.toggle-password img {
  width: 20px;
  height: 20px;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-primary {
  background: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.btn-primary:active {
  background-color: #004494;
  transform: translateY(0);
}

.forgot-password {
  color: #007bff;
  font-size: 0.9rem;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}
</style>
