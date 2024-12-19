<template>
  <div class="dashboard-container">
    <!-- Barra lateral fixa -->
    <AppSidebar :user="user || placeholderUser" currentSection="Dashboard" />

    <!-- Conteúdo principal -->
    <main class="main-content">
      <!-- Cabeçalho -->
        <h1 class="title">Dashboard</h1>

      <!-- Filtros de Data -->
      <section class="date-filters">
        <label>
          Data de início:
          <input type="date" v-model="startDate" @change="fetchDashboardData" />
        </label>
        <label>
          Data final:
          <input type="date" v-model="endDate" @change="fetchDashboardData" />
        </label>
      </section>

      <!-- Cards do Dashboard -->
      <section class="dashboard-cards">
        <div class="card" v-for="(item, index) in dashboardData" :key="index">
          <h2>{{ item.title }}</h2>
          <p>{{ item.value }}</p>
        </div>
      </section>

      <!-- Gráfico de Vendas -->
      <section class="chart-section">
        <h3 class="section-title">Quantidade de Vendas</h3>
        <canvas id="salesChart"></canvas>
      </section>

      <!-- Listagens -->
      <section class="lists-section">
        <!-- Produtos Mais Vendidos -->
        <div class="list-container">
          <h3 class="section-title">Produtos Mais Vendidos</h3>
          <ul>
            <li v-for="(product, index) in topSellingProducts" :key="index">
              {{ product.name }} - {{ product.quantity }} unidades
            </li>
          </ul>
        </div>

        <!-- Vendas Recentes -->
        <div class="list-container">
          <h3 class="section-title">Vendas Recentes</h3>
          <ul>
            <li v-for="(sale, index) in recentSales" :key="index">
              {{ sale.customer }} - {{ sale.total }} R$
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import AppSidebar from "@/components/Sidebar.vue";
import axios from "axios";
import Chart from "chart.js/auto";

export default {
  name: "DashboardView",
  components: { AppSidebar },
  data() {
    return {
      user: null,
      placeholderUser: {
        name: "Usuário Genérico",
        photo: "/generico.png",
      },
      dashboardData: [
        { title: "Produtos cadastrados", value: 0 },
        { title: "Qtd produtos vendidos", value: 0 },
        { title: "Qtd de estoque", value: 0 },
        { title: "Valor de produtos cadastrados", value: 0 },
        { title: "Valor de produtos vendidos", value: 0 },
        { title: "Valor de estoque", value: 0 },
      ],
      topSellingProducts: [],
      recentSales: [],
      startDate: "",
      endDate: "",
      salesChart: null,
    };
  },
  methods: {
    async fetchUserInformation() {
      try {
        const response = await axios.get("http://localhost:8080/personalInformation", {
          withCredentials: true, // Permite envio de cookies
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

    async fetchDashboardData() {
      try {
        const params = { startDate: this.startDate, endDate: this.endDate };
        const response = await axios.get("http://localhost:8080/private/dashboard", { params });
        const data = response.data || {};

        this.dashboardData = [
          { title: "Produtos cadastrados", value: data.productsRegistered || 0 },
          { title: "Qtd produtos vendidos", value: data.productsSold || 0 },
          { title: "Qtd de estoque", value: data.stockQuantity || 0 },
          { title: "Valor de produtos cadastrados", value: data.totalProductValue || 0 },
          { title: "Valor de produtos vendidos", value: data.totalSalesValue || 0 },
          { title: "Valor de estoque", value: data.stockValue || 0 },
        ];

        this.topSellingProducts = data.topSellingProducts || [];
        this.recentSales = data.recentSales || [];
        this.fetchSalesData();
      } catch (error) {
        console.error("Erro ao buscar dados do Dashboard:", error);

        this.dashboardData = [
          { title: "Produtos cadastrados", value: 0 },
          { title: "Qtd produtos vendidos", value: 0 },
          { title: "Qtd de estoque", value: 0 },
          { title: "Valor de produtos cadastrados", value: 0 },
          { title: "Valor de produtos vendidos", value: 0 },
          { title: "Valor de estoque", value: 0 },
        ];

        this.topSellingProducts = [];
        this.recentSales = [];
        this.renderSalesChart([], []);
      }
    },

    async fetchSalesData() {
      try {
        const response = await axios.get("http://localhost:8080/private/sales-quantity");
        const salesData = response.data || [];

        const labels = salesData.map((item) => item.date);
        const values = salesData.map((item) => item.quantity);

        this.renderSalesChart(labels, values);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
        this.renderSalesChart([], []);
      }
    },

    renderSalesChart(labels, values) {
      const ctx = document.getElementById("salesChart");

      if (this.salesChart) {
        this.salesChart.destroy();
      }

      this.salesChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Quantidade de Vendas",
              data: values,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {beginAtZero: true},
          },
        },
      });
    },
  },
  mounted() {
    this.fetchUserInformation();
    this.fetchDashboardData();
  },
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
}

.main-content {
  margin-left: 250px; /* Compensa a largura da barra lateral */
  margin-top: -150px;
  padding: 150px; /* Adiciona espaçamento ao redor do conteúdo */
  box-sizing: border-box; /* Garante que padding não afeta a largura */
}

/* Barra lateral fixa */
.dashboard-container > :first-child {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: #f5f5f5;
  z-index: 1000;
}

/* Espaço reservado para barra lateral */
.main-content {
  margin-left: 250px;
}

/* Cabeçalho */
.header {
  margin-bottom: 20px;
  padding: 10px 20px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
  text-align: left;
}

/* Filtros */
.date-filters {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Cards */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Gráfico */
.chart-section {
  margin-top: 20px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  text-align: left;
  margin-bottom: 10px;
}

/* Listagens */
.lists-section {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.list-container {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
