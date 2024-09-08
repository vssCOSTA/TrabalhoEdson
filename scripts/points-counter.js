// Função para atualizar o contador de pontos
function updatePointsCounter() {
    const pointsCounter = document.getElementById('points-counter');
    const points = localStorage.getItem('userPoints') || '0'; // Obtém os pontos do localStorage ou usa 0 se não existir
    pointsCounter.textContent = `Points: ${points}`;
}

// Inicializa o contador de pontos quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    updatePointsCounter();
});
