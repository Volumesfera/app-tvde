// Continuação do app.js

function mostrarResumoSessao(sessao) {
    const dataInicio = new Date(sessao.dataInicio);
    const dataFim = new Date(sessao.dataFim);
    const duracao = calcularDuracao(dataInicio, dataFim);
    const faturacao = calcularFaturacao(sessao);
    const valorPorKm = faturacao / (sessao.kmsPercorridos || 1);
    const valorPorHora = calcularValorPorHora(faturacao, duracao);
    
    const resumoSessao = document.getElementById('resumo-sessao');
    resumoSessao.innerHTML = `
        <div class="resumo-item">
            <span>Motorista:</span>
            <span class="resumo-valor">${sessao.motorista}</span>
        </div>
        <div class="resumo-item">
            <span>Data Início:</span>
            <span class="resumo-valor">${formatarData(dataInicio)}</span>
        </div>
        <div class="resumo-item">
            <span>Data Fim:</span>
            <span class="resumo-valor">${formatarData(dataFim)}</span>
        </div>
        <div class="resumo-item">
            <span>Duração:</span>
            <span class="resumo-valor">${duracao}</span>
        </div>
        <div class="resumo-item">
            <span>KMs Iniciais:</span>
            <span class="resumo-valor">${sessao.kmsInicio.toFixed(1)} km</span>
        </div>
        <div class="resumo-item">
            <span>KMs Finais:</span>
            <span class="resumo-valor">${sessao.kmsFim.toFixed(1)} km</span>
        </div>
        <div class="resumo-item">
            <span>KMs Percorridos:</span>
            <span class="resumo-valor">${sessao.kmsPercorridos.toFixed(1)} km</span>
        </div>
        <div class="resumo-item">
            <span>Faturação Uber:</span>
            <span class="resumo-valor">${(sessao.saldoFinal.uber - sessao.saldoInicial.uber).toFixed(2)} €</span>
        </div>
        <div class="resumo-item">
            <span>Faturação Uber Reembolsos:</span>
            <span class="resumo-valor">${(sessao.saldoFinal.uberReembolsos - sessao.saldoInicial.uberReembolsos).toFixed(2)} €</span>
        </div>
        <div class="resumo-item">
            <span>Faturação Bolt:</span>
            <span class="resumo-valor">${(sessao.saldoFinal.bolt - sessao.saldoInicial.bolt).toFixed(2)} €</span>
        </div>
        <div class="resumo-item">
            <span>Faturação Transfers:</span>
            <span class="resumo-valor">${(sessao.saldoFinal.transfers - sessao.saldoInicial.transfers).toFixed(2)} €</span>
        </div>
        <div class="resumo-item">
            <span>Faturação Total:</span>
            <span class="resumo-valor">${faturacao.toFixed(2)} €</span>
        </div>
        <div class="resumo-item">
            <span>Valor por KM:</span>
            <span class="resumo-valor">${valorPorKm.toFixed(2)} €/km</span>
        </div>
        <div class="resumo-item">
            <span>Valor por Hora:</span>
            <span class="resumo-valor">${valorPorHora.toFixed(2)} €/h</span>
        </div>
    `;
    
    document.getElementById('modal-resumo').style.display = 'block';
}

function mostrarDetalhesSessao(sessao) {
    mostrarResumoSessao(sessao);
}

function calcularFaturacao(sessao) {
    const uberDiff = sessao.saldoFinal.uber - sessao.saldoInicial.uber;
    const uberReembolsosDiff = sessao.saldoFinal.uberReembolsos - sessao.saldoInicial.uberReembolsos;
    const boltDiff = sessao.saldoFinal.bolt - sessao.saldoInicial.bolt;
    const transfersDiff = sessao.saldoFinal.transfers - sessao.saldoInicial.transfers;
    
    return uberDiff + uberReembolsosDiff + boltDiff + transfersDiff;
}

function calcularValorPorHora(faturacao, duracaoString) {
    // Extrair horas e minutos da string de duração (formato: "X horas Y minutos")
    const regex = /(\d+) horas? (?:e )?(\d+) minutos?/;
    const match = duracaoString.match(regex);
    
    if (!match) return 0;
    
    const horas = parseInt(match[1]);
    const minutos = parseInt(match[2]);
    const duracaoEmHoras = horas + (minutos / 60);
    
    if (duracaoEmHoras === 0) return 0;
    
    return faturacao / duracaoEmHoras;
}

// Funções de exportação
function exportarParaExcel() {
    const motorista = document.getElementById('export-motorista').value;
    const dataInicio = document.getElementById('export-data-inicio').value;
    const dataFim = document.getElementById('export-data-fim').value;
    
    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione o período para exportação.');
        return;
    }
    
    // Filtrar sessões
    let sessoesFiltradas = [...sessoes];
    
    if (motorista) {
        sessoesFiltradas = sessoesFiltradas.filter(s => s.motorista === motorista);
    }
    
    const dataInicioObj = new Date(dataInicio);
    dataInicioObj.setHours(0, 0, 0, 0);
    
    const dataFimObj = new Date(dataFim);
    dataFimObj.setHours(23, 59, 59, 999);
    
    sessoesFiltradas = sessoesFiltradas.filter(s => {
        const dataSessao = new Date(s.dataInicio);
        return dataSessao >= dataInicioObj && dataSessao <= dataFimObj;
    });
    
    if (sessoesFiltradas.length === 0) {
        alert('Nenhuma sessão encontrada para o período selecionado.');
        return;
    }
    
    // Preparar dados para Excel
    const dados = sessoesFiltradas.map(sessao => {
        const dataInicio = new Date(sessao.dataInicio);
        const dataFim = new Date(sessao.dataFim);
        const duracao = calcularDuracao(dataInicio, dataFim);
        const faturacao = calcularFaturacao(sessao);
        const valorPorKm = faturacao / (sessao.kmsPercorridos || 1);
        const valorPorHora = calcularValorPorHora(faturacao, duracao);
        
        return {
            'Motorista': sessao.motorista,
            'Data Início': formatarData(dataInicio),
            'Data Fim': formatarData(dataFim),
            'Duração': duracao,
            'KMs Iniciais': sessao.kmsInicio.toFixed(1),
            'KMs Finais': sessao.kmsFim.toFixed(1),
            'KMs Percorridos': sessao.kmsPercorridos.toFixed(1),
            'Faturação Uber': (sessao.saldoFinal.uber - sessao.saldoInicial.uber).toFixed(2),
            'Faturação Uber Reembolsos': (sessao.saldoFinal.uberReembolsos - sessao.saldoInicial.uberReembolsos).toFixed(2),
            'Faturação Bolt': (sessao.saldoFinal.bolt - sessao.saldoInicial.bolt).toFixed(2),
            'Faturação Transfers': (sessao.saldoFinal.transfers - sessao.saldoInicial.transfers).toFixed(2),
            'Faturação Total': faturacao.toFixed(2),
            'Valor por KM': valorPorKm.toFixed(2),
            'Valor por Hora': valorPorHora.toFixed(2)
        };
    });
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, 'Sessões TVDE');
    
    // Gerar nome do arquivo
    const nomeArquivo = TVDE_${dataInicio}_a_${dataFim}.xlsx;
    
    // Exportar
    XLSX.writeFile(wb, nomeArquivo);
    
    alert(Dados exportados com sucesso para o arquivo ${nomeArquivo});
}

function enviarPorEmail() {
    const email = document.getElementById('export-email').value;
    
    if (!email) {
        alert('Por favor, informe um email para envio.');
        return;
    }
    
    // Exportar para Excel primeiro
    const motorista = document.getElementById('export-motorista').value;
    const dataInicio = document.getElementById('export-data-inicio').value;
    const dataFim = document.getElementById('export-data-fim').value;
    
    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione o período para exportação.');
        return;
    }
    
    // Filtrar sessões
    let sessoesFiltradas = [...sessoes];
    
    if (motorista) {
        sessoesFiltradas = sessoesFiltradas.filter(s => s.motorista === motorista);
    }
    
    const dataInicioObj = new Date(dataInicio);
    dataInicioObj.setHours(0, 0, 0, 0);
    
    const dataFimObj = new Date(dataFim);
    dataFimObj.setHours(23, 59, 59, 999);
    
    sessoesFiltradas = sessoesFiltradas.filter(s => {
        const dataSessao = new Date(s.dataInicio);
        return dataSessao >= dataInicioObj && dataSessao <= dataFimObj;
    });
    
    if (sessoesFiltradas.length === 0) {
        alert('Nenhuma sessão encontrada para o período selecionado.');
        return;
    }
    
    // Preparar dados para Excel
    const dados = sessoesFiltradas.map(sessao => {
        const dataInicio = new Date(sessao.dataInicio);
        const dataFim = new Date(sessao.dataFim);
        const duracao = calcularDuracao(dataInicio, dataFim);
        const faturacao = calcularFaturacao(sessao);
        const valorPorKm = faturacao / (sessao.kmsPercorridos || 1);
        const valorPorHora = calcularValorPorHora(faturacao, duracao);
        
        return {
            'Motorista': sessao.motorista,
            'Data Início': formatarData(dataInicio),
            'Data Fim': formatarData(dataFim),
            'Duração': duracao,
            'KMs Iniciais': sessao.kmsInicio.toFixed(1),
            'KMs Finais': sessao.kmsFim.toFixed(1),
            'KMs Percorridos': sessao.kmsPercorridos.toFixed(1),
            'Faturação Uber': (sessao.saldoFinal.uber - sessao.saldoInicial.uber).toFixed(2),
            'Faturação Uber Reembolsos': (sessao.saldoFinal.uberReembolsos - sessao.saldoInicial.uberReembolsos).toFixed(2),
            'Faturação Bolt': (sessao.saldoFinal.bolt - sessao.saldoInicial.bolt).toFixed(2),
            'Faturação Transfers': (sessao.saldoFinal.transfers - sessao.saldoInicial.transfers).toFixed(2),
            'Faturação Total': faturacao.toFixed(2),
            'Valor por KM': valorPorKm.toFixed(2),
            'Valor por Hora': valorPorHora.toFixed(2)
        };
    });
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, 'Sessões TVDE');
    
    // Gerar nome do arquivo
    const nomeArquivo = TVDE_${dataInicio}_a_${dataFim}.xlsx;
    
    // Exportar
    XLSX.writeFile(wb, nomeArquivo);
    
    // Informar ao usuário como proceder
    alert(O arquivo ${nomeArquivo} foi gerado e baixado para o seu dispositivo.\n\nComo o envio automático por email não está disponível nesta versão, por favor:\n1. Localize o arquivo baixado\n2. Anexe-o manualmente a um email\n3. Envie para ${email}\n\nNa versão definitiva, esta funcionalidade será implementada completamente.);
}

// Funções utilitárias
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatarData(data, apenasData = false) {
    if (!data) return '';
    
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    
    if (apenasData) {
        return ${dia}/${mes}/${ano};
    }
    
    const hora = data.getHours().toString().padStart(2, '0');
    const minuto = data.getMinutes().toString().padStart(2, '0');
    
    return ${dia}/${mes}/${ano} ${hora}:${minuto};
}

function formatarDataHoraParaInput(data) {
    if (!data) return '';
    
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    const hora = data.getHours().toString().padStart(2, '0');
    const minuto = data.getMinutes().toString().padStart(2, '0');
    
    return ${ano}-${mes}-${dia}T${hora}:${minuto};
}

function calcularDuracao(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return '';
    
    const diffMs = dataFim - dataInicio;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs === 0) {
        return ${diffMins} minutos;
    } else if (diffHrs === 1) {
        return 1 hora ${diffMins > 0 ? `e ${diffMins} minutos : ''}`;
    } else {
        return ${diffHrs} horas ${diffMins > 0 ? `e ${diffMins} minutos : ''}`;
    }
}
