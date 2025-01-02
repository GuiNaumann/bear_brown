<template>
  <aside class="sidebar">
    <!-- Informações do usuário -->
    <div class="user-info">
      <img :src="user.photo" alt="Foto do Usuário" class="user-photo" />
      <h2 class="user-name">{{ user.name }}</h2>
      <p class="user-role">{{ user.role }}</p>
    </div>

    <!-- Navegação lateral -->
    <nav class="menu">
      <ul>
        <li>
          <router-link
              :to="{ name: 'Dashboard' }"
              class="menu-link"
              :class="{ active: $route.name === 'Dashboard' }"
          >
            <i class="icon fa fa-video"></i> Monitoramento
          </router-link>
        </li>
        <li>
          <router-link
              :to="{ name: 'Produtos' }"
              class="menu-link"
              :class="{ active: $route.name === 'Produtos' }"
          >
            <i class="icon fa fa-map-marker"></i> Local
          </router-link>
        </li>
        <li>
          <router-link
              :to="{ name: 'Leitor' }"
              class="menu-link"
              :class="{ active: $route.name === 'Leitor' }"
          >
            <i class="icon fa fa-camera"></i> Câmera
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Botão de Logout -->
    <button class="logout-button" @click="handleLogout">Sair</button>
  </aside>
</template>

<script>
import axios from "axios";

export default {
  name: "AppSidebar",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async handleLogout() {
      try {
        // Chama o endpoint de logout
        await axios.post("http://localhost:8080/logout", {}, { withCredentials: true });

        // Redireciona para a página de login
        this.$router.push("/login");
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao fazer logout. Tente novamente.");
      }
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100vh;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
  font-family: "Arial", sans-serif;
}

.user-info {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 20px;
  width: 100%;
}

.user-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid white;
  object-fit: cover;
  margin-bottom: 10px;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  margin: 5px 0;
}

.user-role {
  font-size: 14px;
  color: #cfcfcf;
}

.menu {
  margin-top: 20px;
  width: 100%;
}

.menu ul {
  list-style: none;
  padding: 0;
  width: 100%;
}

.menu ul li {
  margin: 10px 0;
}

.menu-link {
  color: white;
  text-decoration: none;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  border-radius: 5px;
  transition: background 0.3s ease, transform 0.2s ease;
  font-size: 16px;
}

.menu-link .icon {
  margin-right: 10px;
  font-size: 18px;
}

.menu-link:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.menu-link.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: bold;
  transform: scale(1.05);
}

.logout-button {
  margin-top: 400px;
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  text-align: center;
  transition: background 0.3s ease;
}

.logout-button:hover {
  background-color: #d32f2f;
}
</style>
