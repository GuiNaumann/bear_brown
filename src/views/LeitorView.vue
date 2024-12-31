<template>
  <div class="leitor-view">
    <!-- Barra lateral -->
    <AppSidebar :user="user || placeholderUser" currentSection="Leitor" />

    <!-- Conteúdo principal -->
    <main class="main-content">
      <!-- Cabeçalho -->
      <div class="header">
        <h1 class="title">Leitor de Produtos</h1>
      </div>

      <!-- Área de Leitura -->
      <div class="reader-options">
        <!-- Input para Código de Barras -->
        <input
            ref="barcodeInput"
            type="text"
            v-model="barcodeInput"
            @keyup.enter="handleBarcodeInput"
            placeholder="Passe o código de barras aqui..."
            class="reader-input"
        />

        <!-- Botão para abrir Leitor de QR Code -->
        <button @click="startQRCodeReader" class="reader-button">
          📷 Leitor de QR Code
        </button>
      </div>

      <!-- Leitor de QR Code -->
      <div v-show="showQRCodeReader" class="qr-reader-container">
        <div id="qr-reader" class="qr-container" :class="{ 'detected': qrDetected }">
          <div class="qr-overlay"></div>
        </div>
        <button @click="stopQRCodeReader" class="stop-button">
          Parar Leitor
        </button>
      </div>

      <!-- Lista de Resultados -->
      <div class="results">
        <h2>Produtos Lidos</h2>
        <div v-if="products.length" class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <img :src="product.imageURL" alt="Imagem do Produto" class="product-image" />
            <div class="product-info">
              <h2 class="product-name">{{ product.name }}</h2>
              <p class="product-description">{{ product.description }}</p>
              <p class="product-quantity">Quantidade: {{ product.quantity }}</p>
              <button @click="removeProduct(product.id)" class="remove-button">
                Remover
              </button>
            </div>
          </div>
        </div>
        <p v-else class="no-products">Nenhum produto encontrado. Bip um código!</p>
      </div>
    </main>
  </div>
</template>

<script>
import AppSidebar from "@/components/Sidebar.vue";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

export default {
  name: "LeitorView",
  components: { AppSidebar },
  data() {
    return {
      user: null,
      placeholderUser: {
        name: "Usuário Genérico",
        photo: "/generico.png",
      },
      barcodeInput: "",
      products: [],
      showQRCodeReader: false,
      qrCodeScanner: null,
      isReading: false,
      bipAudio: new Audio("/bip.wav"),
      qrDetected: false,
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

    async handleBarcodeInput() {
      if (this.barcodeInput.trim() && !this.isReading) {
        this.isReading = true;
        const code = this.barcodeInput.trim();
        this.bipAudio.play();
        await this.addProductToList(code, "barcode");
        this.barcodeInput = "";
        await this.fetchProducts();

        setTimeout(() => {
          this.isReading = false;
        }, 2000);
      }
    },

    async addProductToList(code, type) {
      try {
        await axios.post(
            "http://localhost:8080/private/product/read-product",
            { code, type },
            { withCredentials: true } // Inclui os cookies na solicitação
        );
      } catch (error) {
        console.error("Erro ao adicionar produto à lista:", error);
        alert("Erro ao adicionar produto à lista.");
      }
    },

    async removeProduct(productId) {
      try {
        await axios.post(
            `http://localhost:8080/private/product/read-product/delete/${productId}`,
            { productId },
            { withCredentials: true } // Inclui os cookies na solicitação
        );
        await this.fetchProducts();
      } catch (error) {
        console.error("Erro ao remover produto da lista:", error);
        alert("Erro ao remover produto.");
      }
    },

    async fetchProducts() {
      try {
        const response = await axios.get(
            "http://localhost:8080/private/product/list/read-product",
            { withCredentials: true } // Inclui os cookies na solicitação
        );
        this.products = response.data.items || [];
      } catch (error) {
        console.error("Erro ao buscar produtos da lista:", error);
      }
    },


    startQRCodeReader() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Seu navegador não suporta o uso da câmera. Tente outro navegador.");
        return;
      }

      this.showQRCodeReader = true;

      this.$nextTick(async () => {
        try {
          this.qrCodeScanner = new Html5Qrcode("qr-reader");
          await this.qrCodeScanner.start(
              { facingMode: "environment" },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText) => {
                if (!this.isReading) {
                  this.bipAudio.play();
                  this.qrDetected = true;
                  this.addProductToList(decodedText, "qrcode");

                  this.isReading = true;
                  setTimeout(() => {
                    this.isReading = false;
                    this.qrDetected = false;
                  }, 3000);
                }
              },
              (errorMessage) => {
                console.warn("Erro ao ler QR Code:", errorMessage);
              }
          );
        } catch (error) {
          console.error("Erro ao iniciar o leitor de QR Code:", error);
          alert("Não foi possível iniciar o leitor. Verifique as permissões.");
          this.showQRCodeReader = false;
        }
      });
    },

    stopQRCodeReader() {
      if (this.qrCodeScanner) {
        this.qrCodeScanner
            .stop()
            .then(() => {
              this.qrCodeScanner.clear();
              this.qrCodeScanner = null;
              this.showQRCodeReader = false;
            })
            .catch((error) => {
              console.warn("Erro ao parar o leitor de QR Code:", error);
              this.showQRCodeReader = false;
            });
      } else {
        this.showQRCodeReader = false;
      }
    },
  },
  async mounted() {
    await this.fetchUserInformation();
    await this.fetchProducts();
  },
};
</script>

<style scoped>
.leitor-view {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.header {
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
}

.reader-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.reader-input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.reader-button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reader-button:hover {
  background-color: #0056b3;
}

.qr-reader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.qr-container {
  position: relative;
  width: 250px;
  height: 250px;
  border: 2px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.qr-container.detected {
  border-color: #00ff00;
  box-shadow: 0 0 10px 4px rgba(0, 255, 0, 0.6);
}

.qr-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150px;
  height: 150px;
  border: 2px dashed rgba(0, 255, 0, 0.7);
  transform: translate(-50%, -50%);
  pointer-events: none;
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
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.remove-button {
  padding: 5px 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.remove-button:hover {
  background-color: #c82333;
}

.no-products {
  text-align: center;
  color: #666;
  font-size: 16px;
}
</style>
