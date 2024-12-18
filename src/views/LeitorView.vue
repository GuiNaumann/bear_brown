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
      <div v-show="showQRCodeReader" class="viewport">
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
        <ul>
          <li v-for="(product, index) in products" :key="index">
            {{ product.name }} - {{ product.code }} - {{ product.quantity }} unidades
          </li>
        </ul>
        <p v-if="!products.length">Nenhum produto encontrado. Bip um código!</p>
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
      showQRCodeReader: false,
      products: [],
      qrCodeScanner: null,
      isReading: false, // Bloqueia leitura por 3 segundos
      bipAudio: new Audio("/bip.wav"), // Som do bip
      qrDetected: false, // Controla a borda verde
    };
  },
  methods: {
    async fetchUserInformation() {
      try {
        const response = await axios.get("http://seu-endpoint/api/personalInformation");
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
        this.isReading = true; // Bloqueia nova leitura
        const code = this.barcodeInput.trim();
        this.bipAudio.play(); // Reproduz o som
        await this.fetchAndAddProduct(code, "barcode");
        this.barcodeInput = "";

        setTimeout(() => {
          this.isReading = false; // Desbloqueia leitura após 3 segundos
        }, 2000);
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
                  console.log("QR Code detectado:", decodedText);

                  // Som do bip
                  this.bipAudio.play();

                  // Adiciona o efeito verde
                  this.qrDetected = true;

                  // Envia o código para processamento
                  this.fetchAndAddProduct(decodedText, "qrcode");

                  this.isReading = true;

                  // Remove a borda verde após 3 segundos e desbloqueia a leitura
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
              console.log("Leitor de QR Code parado com sucesso.");
            })
            .catch((error) => {
              console.warn("Erro ao parar o leitor de QR Code:", error);
              this.showQRCodeReader = false;
            });
      } else {
        this.showQRCodeReader = false;
      }
    },

    async fetchAndAddProduct(code, type) {
      try {
        const response = await axios.post("http://seu-endpoint/api/read-product", { code, type });
        const product = response.data.product;

        if (product) {
          const existingProduct = this.products.find((p) => p.code === product.code);
          if (existingProduct) {
            existingProduct.quantity += 1;
          } else {
            this.products.push({ ...product, quantity: 1 });
          }
        } else {
          alert("Produto não encontrado ou estoque insuficiente!");
        }
      } catch (error) {
        console.error("Erro ao buscar o produto:", error);
      }
    },
  },
  mounted() {
    this.fetchUserInformation();
    this.$refs.barcodeInput?.focus();
  },
};
</script>

<style scoped>
.leitor-view {
  display: flex;
  height: 100vh;
}

.main-content {
  margin-left: 280px; /* Compensa a largura da barra lateral */
  margin-top: -20px;
  padding: 30px; /* Adiciona espaçamento ao redor do conteúdo */
  box-sizing: border-box; /* Garante que padding não afeta a largura */
  flex: 1;
}

.leitor-view > :first-child {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: #f5f5f5;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 20px;
  padding: 10px 20px;
}

.header .title {
  font-size: 2.2rem;
  color: #007bff;
  font-weight: bold;
  text-align: left;
}

.reader-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.reader-input {
  padding: 10px;
  font-size: 16px;
  width: 50%;
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
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.reader-button:hover {
  background-color: #0056b3;
}

.stop-button {
  background-color: #e53e3e;
  color: white;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.stop-button:hover {
  background-color: #c53030;
}

.viewport {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.qr-container {
  position: relative;
  width: 300px;
  height: 300px;
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

.results {
  margin-top: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.results h2 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.results ul {
  list-style: none;
  padding: 0;
}

.results li {
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.results li:last-child {
  border-bottom: none;
}
</style>
