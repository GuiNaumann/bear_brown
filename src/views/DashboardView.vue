<template>
  <div class="dashboard-container">
    <!-- Barra lateral -->
    <AppSidebar :user="user || placeholderUser" currentSection="Dashboard" />

    <!-- Conteúdo principal -->
    <main class="main-content">
      <!-- Cabeçalho -->
      <header class="header">
        <h1>Dashboard</h1>
        <p>Visão geral dos dados e informações</p>
      </header>

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
        <h3>Quantidade de Vendas</h3>
        <canvas id="salesChart"></canvas>
      </section>

      <!-- Listagens -->
      <section class="lists-section">
        <!-- Produtos Mais Vendidos -->
        <div class="list-container">
          <h3>Produtos Mais Vendidos</h3>
          <ul>
            <li v-for="(product, index) in topSellingProducts" :key="index">
              {{ product.name }} - {{ product.quantity }} unidades
            </li>
          </ul>
        </div>

        <!-- Vendas Recentes -->
        <div class="list-container">
          <h3>Vendas Recentes</h3>
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
      // Valores padrão dos 6 quadrados
      dashboardData: [
        { title: "Produtos cadastrados", value: 0 },
        { title: "Qtd produtos vendidos", value: 0 },
        { title: "Qtd de estoque", value: 0 },
        { title: "Valor de produtos cadastrados", value: 0 },
        { title: "Valor de produtos vendidos", value: 0 },
        { title: "Valor de estoque", value: 0 },
      ],
      topSellingProducts: [], // Lista de produtos mais vendidos
      recentSales: [],        // Lista de vendas recentes
      startDate: "",          // Filtro de data inicial
      endDate: "",            // Filtro de data final
      salesChart: null,       // Gráfico de vendas
    };
  },
  methods: {
    async fetchDashboardData() {
      try {
        const params = { startDate: this.startDate, endDate: this.endDate };
        const response = await axios.get("http://seu-endpoint/api/dashboard", { params });
        const data = response.data || {};

        // Preenche os cards com fallback para 0
        this.dashboardData = [
          { title: "Produtos cadastrados", value: data.productsRegistered || 0 },
          { title: "Qtd produtos vendidos", value: data.productsSold || 0 },
          { title: "Qtd de estoque", value: data.stockQuantity || 0 },
          { title: "Valor de produtos cadastrados", value: data.totalProductValue || 0 },
          { title: "Valor de produtos vendidos", value: data.totalSalesValue || 0 },
          { title: "Valor de estoque", value: data.stockValue || 0 },
        ];

        // Preenche as listagens com fallback vazio
        this.topSellingProducts = data.topSellingProducts || [];
        this.recentSales = data.recentSales || [];

        // Busca os dados do gráfico
        this.fetchSalesData();
      } catch (error) {
        console.error("Erro ao buscar dados do Dashboard:", error);

        // Mantém os valores padrão caso haja erro
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
        this.renderSalesChart([], []); // Gráfico vazio
      }
    },

    // Buscar dados do gráfico
    async fetchSalesData() {
      try {
        const response = await axios.get("http://seu-endpoint/api/sales-quantity");
        const salesData = response.data || [];

        const labels = salesData.map((item) => item.date);
        const values = salesData.map((item) => item.quantity);

        this.renderSalesChart(labels, values);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
        this.renderSalesChart([], []); // Gráfico vazio
      }
    },

    // Renderizar o gráfico
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
            y: { beginAtZero: true },
          },
        },
      });
    },
  },
  mounted() {
    this.fetchDashboardData();
  },
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Cabeçalho */
.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 2.5rem;
  color: #333;
}

/* Filtros */
.date-filters {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 8px;
}

/* Cards */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Gráfico */
.chart-section {
  margin-top: 30px;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Listagens */
.lists-section {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 30px;
}

.list-container {
  flex: 1;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.list-container h3 {
  margin-bottom: 10px;
  color: #007bff;
  font-size: 1.5rem;
}

.list-container ul {
  list-style: none;
  padding: 0;
}

.list-container li {
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.list-container li:last-child {
  border-bottom: none;
}
</style>
