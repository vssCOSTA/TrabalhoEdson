const userId = Number(getCookie('userId'));
const opcoesSelect = document.getElementById('reedem-points-opcoes');

document.getElementById('reedem-points-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const valorSelecionado = Number(opcoesSelect.value); // Certifique-se de que é um número

    if (valorSelecionado) {
        // Obtém pontos do localStorage
        let userPoints = localStorage.getItem('userPoints');
        userPoints = parseInt(userPoints, 10) || 0;

        // Verifica se há pontos suficientes
        if (userPoints < valorSelecionado) {
            alert('Insufficient points');
            return;
        }

        // Atualiza pontos na IndexedDB e no localStorage
        updatePoints(userId, valorSelecionado * -1, () => {
            // Atualiza pontos no localStorage
            userPoints -= valorSelecionado;
            localStorage.setItem('userPoints', userPoints);

            // Atualiza o contador de pontos na página
            updatePointsCounterOnPage();

            // Limpa a seleção
            opcoesSelect.value = '';
        });
    } else {
        alert('Please select a valid option.');
    }
});
