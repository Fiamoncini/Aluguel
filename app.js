// Elementos DOM
const tabelaInquilinos = document.getElementById('tabela-inquilinos');
const inputBusca = document.getElementById('busca');
const selectFiltro = document.getElementById('filtro');
const botaoAdicionar = document.getElementById('botao-adicionar');
const modalAdicionar = document.getElementById('modal-adicionar');
const modalEditar = document.getElementById('modal-editar');
const formAdicionar = document.getElementById('form-adicionar');
const formEditar = document.getElementById('form-editar');
const botaoCancelarAdicionar = document.getElementById('cancelar-adicionar');
const botaoCancelarEditar = document.getElementById('cancelar-editar');

// Elementos do Dashboard
const elementoTotalInquilinos = document.getElementById('total-inquilinos');
const elementoInquilinosPagos = document.getElementById('inquilinos-pagos');
const elementoInquilinosPendentes = document.getElementById('inquilinos-pendentes');
const elementoValorTotal = document.getElementById('valor-total');
const elementoValorPago = document.getElementById('valor-pago');
const elementoValorPendente = document.getElementById('valor-pendente');
const elementoBarraProgresso = document.getElementById('barra-progresso');
const elementoPorcentagemPagos = document.getElementById('porcentagem-pagos');

// Estado da aplicação
let inquilinos = [...inquilinosIniciais];
let termoPesquisa = '';
let filtroAtual = 'todos';

// Adicionar no início do seu arquivo de JavaScript, após a declaração das variáveis DOM
const botaoTema = document.getElementById('botao-tema');
let temaEscuro = localStorage.getItem('tema-escuro') === 'true';

// Função para alternar o tema
function alternarTema() {
    temaEscuro = !temaEscuro;
    document.body.classList.toggle('tema-escuro', temaEscuro);
    
    // Atualiza o ícone do botão
    botaoTema.innerHTML = temaEscuro ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Salva a preferência no localStorage
    localStorage.setItem('tema-escuro', temaEscuro);
}

// Event listener para o botão de tema
botaoTema.addEventListener('click', alternarTema);

// Aplicar o tema salvo ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Verifica o tema salvo
    document.body.classList.toggle('tema-escuro', temaEscuro);
    botaoTema.innerHTML = temaEscuro ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Resto da inicialização
    atualizarInterface();
});

// Função para abrir o WhatsApp com o número especificado
function abrirWhatsApp(numero) {
    // Formata o número removendo possíveis caracteres não numéricos
    const numeroLimpo = numero.replace(/\D/g, '');
    
    // Cria a URL do WhatsApp
    const url = `https://wa.me/${numeroLimpo}`;
    
    // Abre em uma nova janela/aba
    window.open(url, '_blank');
}

// Funções auxiliares
function formatarValor(valor) {
    return valor.toFixed(2).replace('.', ',');
}

// Funções principais
function salvarInquilinos() {
    localStorage.setItem('inquilinos', JSON.stringify(inquilinos));
}

function renderizarDashboard() {
    // Cálculos para o dashboard
    const total = inquilinos.length;
    const pagos = inquilinos.filter(i => i.pago).length;
    const pendentes = total - pagos;
    const valorTotal = inquilinos.reduce((soma, i) => soma + i.valor, 0);
    const valorPago = inquilinos.filter(i => i.pago).reduce((soma, i) => soma + i.valor, 0);
    const valorPendente = valorTotal - valorPago;
    const porcentagemPagos = total ? Math.round((pagos / total) * 100) : 0;
    
    // Atualiza os elementos do dashboard
    elementoTotalInquilinos.textContent = total;
    elementoInquilinosPagos.textContent = pagos;
    elementoInquilinosPendentes.textContent = pendentes;
    elementoValorTotal.textContent = `R$ ${formatarValor(valorTotal)}`;
    elementoValorPago.textContent = formatarValor(valorPago);
    elementoValorPendente.textContent = formatarValor(valorPendente);
    elementoBarraProgresso.style.width = `${porcentagemPagos}%`;
    elementoPorcentagemPagos.textContent = porcentagemPagos;
}

function filtrarInquilinos() {
    // Aplica filtros e busca
    return inquilinos.filter(inquilino => {
        const correspondeAoBuscar = 
            inquilino.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) || 
            inquilino.unidade.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
            (inquilino.whatsapp && inquilino.whatsapp.includes(termoPesquisa));
        
        if (filtroAtual === 'todos') return correspondeAoBuscar;
        if (filtroAtual === 'pagos') return correspondeAoBuscar && inquilino.pago;
        if (filtroAtual === 'pendentes') return correspondeAoBuscar && !inquilino.pago;
        
        return correspondeAoBuscar;
    });
}

function renderizarTabela() {
    const inquilinosFiltrados = filtrarInquilinos();
    
    // Limpa a tabela
    tabelaInquilinos.innerHTML = '';
    
    // Verifica se há inquilinos para mostrar
    if (inquilinosFiltrados.length === 0) {
        tabelaInquilinos.innerHTML = `
            <tr>
                <td colspan="7" class="tabela-vazia">Nenhum inquilino encontrado</td>
            </tr>
        `;
        return;
    }
    
    // Adiciona os inquilinos à tabela
    inquilinosFiltrados.forEach(inquilino => {
        const linha = document.createElement('tr');
        if (inquilino.pago) {
            linha.classList.add('pago');
        }
        
        linha.innerHTML = `
            <td>${inquilino.unidade}</td>
            <td>${inquilino.nome}</td>
            <td>R$ ${formatarValor(inquilino.valor)}</td>
            <td>${inquilino.dataVencimento}</td>
            <td>
                <span class="badge ${inquilino.pago ? 'badge-verde' : 'badge-vermelho'}">
                    ${inquilino.pago ? 'Pago' : 'Pendente'}
                </span>
            </td>
            <td>
                ${inquilino.whatsapp ? `
                    <button class="botao-whatsapp" data-numero="${inquilino.whatsapp}" title="Enviar mensagem">
                        <i class="fab fa-whatsapp"></i> ${inquilino.whatsapp}
                    </button>
                ` : '-'}
            </td>
            <td class="acoes">
                <button class="botao-acao ${inquilino.pago ? 'botao-acao-vermelho' : 'botao-acao-verde'}" data-acao="alternar" data-id="${inquilino.id}" title="${inquilino.pago ? 'Marcar como não pago' : 'Marcar como pago'}">
                    <i class="fas ${inquilino.pago ? 'fa-times' : 'fa-check'}"></i>
                </button>
                <button class="botao-acao botao-acao-azul" data-acao="editar" data-id="${inquilino.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="botao-acao botao-acao-vermelho" data-acao="excluir" data-id="${inquilino.id}" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tabelaInquilinos.appendChild(linha);
    });
    
    // Adiciona event listeners para os botões de ação
    document.querySelectorAll('.botao-acao').forEach(botao => {
        botao.addEventListener('click', manipularAcaoInquilino);
    });
    
    // Adiciona event listeners para os botões de WhatsApp
    document.querySelectorAll('.botao-whatsapp').forEach(botao => {
        botao.addEventListener('click', (evento) => {
            const numero = evento.currentTarget.getAttribute('data-numero');
            abrirWhatsApp(numero);
        });
    });
}

function manipularAcaoInquilino(evento) {
    const acao = evento.currentTarget.getAttribute('data-acao');
    const id = parseInt(evento.currentTarget.getAttribute('data-id'));
    
    switch (acao) {
        case 'alternar':
            alternarPagamento(id);
            break;
        case 'editar':
            abrirModalEditar(id);
            break;
        case 'excluir':
            excluirInquilino(id);
            break;
    }
}

function alternarPagamento(id) {
    inquilinos = inquilinos.map(inquilino => 
        inquilino.id === id ? {...inquilino, pago: !inquilino.pago} : inquilino
    );
    
    salvarInquilinos();
    atualizarInterface();
}

function excluirInquilino(id) {
    if (confirm('Tem certeza que deseja excluir este inquilino?')) {
        inquilinos = inquilinos.filter(inquilino => inquilino.id !== id);
        salvarInquilinos();
        atualizarInterface();
    }
}

function abrirModalAdicionar() {
    // Reseta o formulário
    formAdicionar.reset();
    document.getElementById('novo-valor').value = '';
    
    // Exibe o modal
    modalAdicionar.style.display = 'flex';
}

function fecharModalAdicionar() {
    modalAdicionar.style.display = 'none';
}

function abrirModalEditar(id) {
    const inquilino = inquilinos.find(i => i.id === id);
    
    if (!inquilino) return;
    
    // Preenche o formulário
    document.getElementById('editar-id').value = inquilino.id;
    document.getElementById('editar-nome').value = inquilino.nome;
    document.getElementById('editar-unidade').value = inquilino.unidade;
    document.getElementById('editar-whatsapp').value = inquilino.whatsapp || '';
    document.getElementById('editar-valor').value = inquilino.valor;
    document.getElementById('editar-data').value = inquilino.dataVencimento;
    document.getElementById('editar-pago').checked = inquilino.pago;
    
    // Exibe o modal
    modalEditar.style.display = 'flex';
}

function fecharModalEditar() {
    modalEditar.style.display = 'none';
}

function adicionarInquilino(evento) {
    evento.preventDefault();
    
    // Obtém os valores do formulário
    const nome = document.getElementById('novo-nome').value.trim();
    const unidade = document.getElementById('nova-unidade').value.trim();
    const whatsapp = document.getElementById('novo-whatsapp').value.trim();
    const valor = parseFloat(document.getElementById('novo-valor').value) || 0;
    const dataVencimento = document.getElementById('nova-data').value.trim();
    const pago = document.getElementById('novo-pago').checked;
    
    // Validação básica
    if (!nome || !unidade || !dataVencimento) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Cria novo ID
    const novoId = inquilinos.length > 0 
        ? Math.max(...inquilinos.map(i => i.id)) + 1 
        : 1;
    
    // Adiciona novo inquilino
    inquilinos.push({
        id: novoId,
        nome,
        unidade,
        whatsapp,
        valor,
        dataVencimento,
        pago
    });
    
    salvarInquilinos();
    fecharModalAdicionar();
    atualizarInterface();
}

function editarInquilino(evento) {
    evento.preventDefault();
    
    // Obtém os valores do formulário
    const id = parseInt(document.getElementById('editar-id').value);
    const nome = document.getElementById('editar-nome').value.trim();
    const unidade = document.getElementById('editar-unidade').value.trim();
    const whatsapp = document.getElementById('editar-whatsapp').value.trim();
    const valor = parseFloat(document.getElementById('editar-valor').value) || 0;
    const dataVencimento = document.getElementById('editar-data').value.trim();
    const pago = document.getElementById('editar-pago').checked;
    
    // Validação básica
    if (!nome || !unidade || !dataVencimento) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Atualiza o inquilino
    inquilinos = inquilinos.map(inquilino => 
        inquilino.id === id ? { id, nome, unidade, whatsapp, valor, dataVencimento, pago } : inquilino
    );
    
    salvarInquilinos();
    fecharModalEditar();
    atualizarInterface();
}

function atualizarInterface() {
    renderizarDashboard();
    renderizarTabela();
}

// Event Listeners
inputBusca.addEventListener('input', (e) => {
    termoPesquisa = e.target.value;
    renderizarTabela();
});

selectFiltro.addEventListener('change', (e) => {
    filtroAtual = e.target.value;
    renderizarTabela();
});

botaoAdicionar.addEventListener('click', abrirModalAdicionar);
botaoCancelarAdicionar.addEventListener('click', fecharModalAdicionar);
botaoCancelarEditar.addEventListener('click', fecharModalEditar);

formAdicionar.addEventListener('submit', adicionarInquilino);
formEditar.addEventListener('submit', editarInquilino);

// Fechamento do modal ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === modalAdicionar) {
        fecharModalAdicionar();
    }
    if (e.target === modalEditar) {
        fecharModalEditar();
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    atualizarInterface();
});
