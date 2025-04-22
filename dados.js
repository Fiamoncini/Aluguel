// Dados iniciais dos inquilinos
const dadosIniciais = [
];

// Verifica se já existem dados no localStorage
const inquilinosIniciais = localStorage.getItem('inquilinos') 
    ? JSON.parse(localStorage.getItem('inquilinos')) 
    : dadosIniciais;