const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function buyPoints(points) {
    // Obtém os pontos do localStorage
    let currentPoints = Number(localStorage.getItem('userPoints')) || 0;
    
    // Adiciona os pontos comprados
    currentPoints += points;
    
    // Salva o novo saldo no localStorage
    localStorage.setItem('userPoints', currentPoints);
    
    // Atualiza o contador de pontos na interface
    updatePointsCounter();
    
    // Mensagem de sucesso
    alert(`${points} points purchased successfully!`);
}


const updatePoints = (userId, points) => {
    let request = indexedDB.open(dbName, 3);

    request.onsuccess = function (event) {
        let db = event.target.result;

        let transaction = db.transaction([tblName], "readwrite");
        let objectStore = transaction.objectStore(tblName);

        let action = objectStore.get(userId);

        action.onsuccess = function (event) {
            const user = action.result;

            if (!user) {
                alert('User not found');
                return;
            }

            user.points = (user.points || 0) + points;

            const putRequest = objectStore.put(user);

            putRequest.onsuccess = function () {
                // Atualize o localStorage com o novo valor de pontos
                localStorage.setItem('points', user.points);
                // Atualize a exibição dos pontos
                updatePointsDisplay();
            };

            putRequest.onerror = function (event) {
                console.error('Error updating points:', event.target.error);
            };
        };

        action.onerror = function (event) {
            console.log("Error finding user:", event.target.errorCode);
        };
    };

    request.onerror = function (event) {
        console.log("Error opening database:", event.target.errorCode);
    };
}



// Chame esta função quando a página carregar
document.addEventListener('DOMContentLoaded', updatePointsDisplay);
