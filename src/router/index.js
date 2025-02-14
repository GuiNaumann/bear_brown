import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/auth/LoginView.vue";
import ListagemView from "@/views/ListagemView.vue";
import DashboardView from "@/views/DashboardView.vue"; // Nova tela para Dashboard
import LeitorView from "@/views/LeitorView.vue"; // Nova tela para Leitor
import EditProductView from '@/views/EditProductView.vue';
import CreateProductView from "@/views/CreateProductView.vue";
import CreateCameraView from "@/views/CreateCameraView.vue";



const routes = [
    {
        path: "/", // Caminho da raiz
        redirect: "/login", // Redireciona para /login
    },
    {
        path: "/login",
        name: "Login",
        component: LoginView,
    },
    // Rotas privadas
    {
        path: "/dashboard",
        name: "Dashboard",
        component: DashboardView, // Tela específica para Dashboard
    },
    {
        path: "/produtos",
        name: "Produtos",
        component: ListagemView, // Já existente
    },
    {
        path: "/produtos/cadastrar",
        name: "CreateProduct",
        component: CreateProductView,
    },
    {
        path: "/cameras/cadastrar",
        name: "CreateCamera",
        component: CreateCameraView,
    },
    {
        path: "/produtos/editar/:id",
        name: "EditProduct",
        component: EditProductView,
        props: true,
    },
    {
        path: "/leitor",
        name: "Leitor",
        component: LeitorView, // Nova tela para Leitor
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

// Middleware para proteger rotas privadas
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem("token"); // Simulação de autenticação
    if (to.name !== "Login" && !isAuthenticated) {
        next({ name: "Login" }); // Redireciona para Login se não autenticado
    } else {
        next(); // Caso contrário, permite o acesso
    }
});

// router.beforeEach((to, from, next) => {
//     // Removendo a verificação temporariamente para testes
//     next();
// });

export default router;
