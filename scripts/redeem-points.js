const userId = Number(getCookie('userId'));

const opcoesSelect = document.getElementById('reedem-points-opcoes');

document.getElementById('reedem-points-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const valorSelecionado = opcoesSelect.value;
    if (valorSelecionado) {
        updatePoints(userId, valorSelecionado * -1)
        opcoesSelect.value = '';
    } else {
        alert('Please select a valid option.');
    }
});