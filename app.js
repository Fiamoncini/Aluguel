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

function exportarDados(formato) {
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    
    if (formato === 'csv') {
        // Exportar para CSV
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Cabeçalho
        csvContent += "ID,Loja,Nome,Valor,Vencimento,Status,WhatsApp,Notas\n";
        
        // Dados
        inquilinos.forEach(inquilino => {
            const linha = [
                inquilino.id,
                inquilino.unidade,
                inquilino.nome,
                inquilino.valor,
                inquilino.dataVencimento,
                inquilino.pago ? "Pago" : "Pendente",
                inquilino.whatsapp || "",
                inquilino.notas || ""
            ].join(",");
            
            csvContent += linha + "\n";
        });
        
        // Download do arquivo
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inquilinos-${dataAtual}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } else if (formato === 'json') {
        // Exportar para JSON
        const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inquilinos, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", jsonContent);
        link.setAttribute("download", `inquilinos-${dataAtual}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Função para gerar relatório simplificado em PDF (requer a biblioteca jsPDF)
// Adicione a referência da lib no seu HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

function gerarRelatorioPDF() {
    // Verifica se a biblioteca jsPDF está disponível
    if (typeof jspdf === 'undefined') {
        alert('A biblioteca jsPDF não está carregada. Por favor, adicione-a ao seu projeto.');
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Aluguéis', 105, 15, { align: 'center' });
    
    // Data do relatório
    doc.setFontSize(12);
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data: ${dataAtual}`, 195, 15, { align: 'right' });
    
    // Informações do Dashboard
    doc.setFontSize(14);
    doc.text('Resumo', 14, 30);
    
    doc.setFontSize(12);
    const total = inquilinos.length;
    const pagos = inquilinos.filter(i => i.pago).length;
    const pendentes = total - pagos;
    const valorTotal = inquilinos.reduce((soma, i) => soma + i.valor, 0);
    const valorPago = inquilinos.filter(i => i.pago).reduce((soma, i) => soma + i.valor, 0);
    const valorPendente = valorTotal - valorPago;
    
    doc.text(`Total de Inquilinos: ${total}`, 14, 40);
    doc.text(`Inquilinos com Pagamento em Dia: ${pagos}`, 14, 47);
    doc.text(`Inquilinos com Pagamento Pendente: ${pendentes}`, 14, 54);
    doc.text(`Valor Total: R$ ${formatarValor(valorTotal)}`, 14, 61);
    doc.text(`Valor Recebido: R$ ${formatarValor(valorPago)}`, 14, 68);
    doc.text(`Valor Pendente: R$ ${formatarValor(valorPendente)}`, 14, 75);
    
    // Tabela de Inquilinos
    doc.setFontSize(14);
    doc.text('Lista de Inquilinos', 14, 90);
    
    // Cabeçalhos da tabela
    doc.setFontSize(10);
    doc.text('Loja', 14, 100);
    doc.text('Nome', 50, 100);
    doc.text('Valor', 100, 100);
    doc.text('Vencimento', 130, 100);
    doc.text('Status', 170, 100);
    
    // Linha separadora
    doc.line(14, 103, 195, 103);
    
    // Dados da tabela
    let y = 110;
    inquilinos.forEach((inquilino) => {
        // Verifica se precisamos de uma nova página
        if (y > 270) {
            doc.addPage();
            y = 30; // Reset da posição Y para a nova página
            
            // Adiciona cabeçalhos na nova página
            doc.setFontSize(10);
            doc.text('Loja', 14, 20);
            doc.text('Nome', 50, 20);
            doc.text('Valor', 100, 20);
            doc.text('Vencimento', 130, 20);
            doc.text('Status', 170, 20);
            doc.line(14, 23, 195, 23);
            y = 30;
        }
        
        doc.text(inquilino.unidade, 14, y);
        doc.text(inquilino.nome, 50, y);
        doc.text(`R$ ${formatarValor(inquilino.valor)}`, 100, y);
        doc.text(inquilino.dataVencimento, 130, y);
        doc.text(inquilino.pago ? 'Pago' : 'Pendente', 170, y);
        
        y += 8;
    });
    
    // Salvar o documento
    doc.save(`relatorio-alugueis-${dataAtual.replace(/\//g, '-')}.pdf`);
}

// Adicionar menu de exportação
function exibirMenuExportacao() {
    // Criar dropdown de opções
    const menuExportar = document.createElement('div');
    menuExportar.id = 'menu-exportar';
    menuExportar.style.position = 'absolute';
    menuExportar.style.backgroundColor = 'var(--cor-card)';
    menuExportar.style.boxShadow = '0 2px 10px var(--cor-sombra)';
    menuExportar.style.borderRadius = '8px';
    menuExportar.style.padding = '10px';
    menuExportar.style.zIndex = '1000';
    
    // Posicionar abaixo do botão exportar
    const botaoExportar = document.getElementById('botao-exportar');
    const rect = botaoExportar.getBoundingClientRect();
    menuExportar.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menuExportar.style.left = `${rect.left + window.scrollX}px`;
    
    // Opções do menu
    menuExportar.innerHTML = `
        <div class="opcao-exportar" data-formato="csv">
            <i class="fas fa-file-csv"></i> Exportar como CSV
        </div>
        <div class="opcao-exportar" data-formato="json">
            <i class="fas fa-file-code"></i> Exportar como JSON
        </div>
        <div class="opcao-exportar" data-formato="pdf">
            <i class="fas fa-file-pdf"></i> Gerar Relatório PDF
        </div>
    `;
    
    // Estilizar opções
    const estiloOpcoes = `
        .opcao-exportar {
            padding: 8px 15px;
            cursor: pointer;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--cor-texto);
        }
        
        .opcao-exportar:hover {
            background-color: var(--cor-hover);
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = estiloOpcoes;
    document.head.appendChild(style);
    
    // Adicionar ao body
    document.body.appendChild(menuExportar);
    
    // Event listeners para as opções
    document.querySelectorAll('.opcao-exportar').forEach(opcao => {
        opcao.addEventListener('click', (e) => {
            const formato = e.currentTarget.getAttribute('data-formato');
            if (formato === 'pdf') {
                gerarRelatorioPDF();
            } else {
                exportarDados(formato);
            }
            fecharMenuExportacao();
        });
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', fecharMenuExportacaoClick);
}

function fecharMenuExportacaoClick(e) {
    const menu = document.getElementById('menu-exportar');
    const botaoExportar = document.getElementById('botao-exportar');
    
    if (menu && !menu.contains(e.target) && e.target !== botaoExportar) {
        fecharMenuExportacao();
    }
}

function fecharMenuExportacao() {
    const menu = document.getElementById('menu-exportar');
    if (menu) {
        document.body.removeChild(menu);
        document.removeEventListener('click', fecharMenuExportacaoClick);
    }
}

// Adicionar event listener para o botão exportar
document.addEventListener('DOMContentLoaded', () => {
    const botaoExportar = document.getElementById('botao-exportar');
    if (botaoExportar) {
        botaoExportar.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que o clique se propague
            
            // Verificar se o menu já está aberto
            const menuExistente = document.getElementById('menu-exportar');
            if (menuExistente) {
                fecharMenuExportacao();
            } else {
                exibirMenuExportacao();
            }
        });
    }
});



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
