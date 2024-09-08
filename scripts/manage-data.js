const dbName = 'DB';
const tblName = 't_users';

const createDatabase = () => {
    let request = indexedDB.open(dbName, 3);

    request.onupgradeneeded = function (event) {
        let db = event.target.result;

        let objectStore = db.createObjectStore(tblName, { keyPath: "id", autoIncrement: true });

        objectStore.createIndex("username", "username", { unique: true });
    };

    request.onsuccess = function (event) {
        let userAdmin = {
            username: 'ADMIN',
            password: '1234',
            points: 2000,
            bets: [
                { matchId: 72216, winnerTeamId: 7, bet: 1000, betVerified: false },
                { matchId: 72214, winnerTeamId: 6, bet: 2500, betVerified: false },
                { matchId: 72221, winnerTeamId: 0, bet: 1400, betVerified: false },
                { matchId: 72215, winnerTeamId: 0, bet: 10400, betVerified: false },
            ]
        }

        registerUser(userAdmin, function () { });
    };

    request.onerror = function (event) {
        console.log("Erro ao abrir o banco de dados:", event.target.errorCode);
    };
}


const registerUser = (user, callback) => {
    userExists(user.username, function (exists) {
        if (!exists) {
            let request = indexedDB.open(dbName, 3);

            request.onsuccess = function (event) {
                let db = event.target.result;

                let transaction = db.transaction([tblName], "readwrite");
                let objectStore = transaction.objectStore(tblName);

                let action = objectStore.add(user);

                action.onsuccess = function (event) {
                    console.log("Usuário registrado com ID:", event.target.result);

                    // Armazena os dados do novo usuário no localStorage após o registro
                    localStorage.setItem('userId', event.target.result); // ID do novo usuário
                    localStorage.setItem('userPoints', user.points); // Pontos do novo usuário
                    localStorage.setItem('username', user.username); // Nome do novo usuário

                    // Chame o callback para notificar que o registro foi bem-sucedido
                    callback(event.target.result);
                };

                action.onerror = function (event) {
                    console.log("Erro ao adicionar Usuário:", event.target.errorCode);
                    callback(0);
                };
            };
        } else {
            console.log("Usuário já existe");
            callback(0);
        }
    });
};


const loginUser = (username, password, callback) => {
    let request = indexedDB.open(dbName, 3);

    request.onsuccess = function (event) {
        let db = event.target.result;

        let transaction = db.transaction([tblName], "readonly");
        let objectStore = transaction.objectStore(tblName);

        let index = objectStore.index("username");
        let action = index.get(username);

        action.onsuccess = function (event) {
            if (action.result && action.result.password === password) {
                // Armazena informações no localStorage
                localStorage.setItem('userId', action.result.id);
                localStorage.setItem('userPoints', action.result.points);
                localStorage.setItem('username', action.result.username); // Armazena o nome do usuário
                console.log("Logado com sucesso");
                callback(action.result.id);
            } else {
                console.log("Login Inválido");
                callback(0);
            }
        };

        action.onerror = function (event) {
            console.log("Erro ao encontrar Usuário:", event.target.errorCode);
            callback(0);
        };
    };

    request.onerror = function (event) {
        console.log("Erro ao abrir o banco de dados:", event.target.errorCode);
        callback(0);
    };
};


const userExists = (username, callback) => {
    let request = indexedDB.open(dbName, 3);

    request.onsuccess = function (event) {
        let db = event.target.result;

        let transaction = db.transaction([tblName], "readonly");
        let objectStore = transaction.objectStore(tblName);

        let index = objectStore.index("username");
        let action = index.get(username);

        action.onsuccess = function (event) {
            if (action.result) {
                callback(true);  // Usuário encontrado
            } else {
                callback(false); // Usuário não encontrado
            }
        };

        action.onerror = function (event) {
            console.log("Erro ao encontrar Usuário:", event.target.errorCode);
            callback(false);  // Trate o erro como usuário não encontrado
        };
    };

    request.onerror = function (event) {
        console.log("Erro ao abrir o banco de dados:", event.target.errorCode);
        callback(false);  // Trate o erro como usuário não encontrado
    };
};

const getCookie = (name) => {
    const value = `; ${document.cookie}`;

    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift());
    }

    return null;
}

const setCookie = (name, value, hours) => {
    let expires = "";
    if (hours) {
        const date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000)); // Converte horas para milissegundos
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

const deleteCookie = (nome) => {
    const dataExpiracao = "Thu, 01 Jan 1970 00:00:00 GMT";

    document.cookie = `${nome}=; expires=${dataExpiracao}; path=/`;
}


const bet = (userId, matchId, winnerTeamId, points) => {
    
    let userPoints = localStorage.getItem('userPoints');
    userPoints = parseInt(userPoints, 10);

    if (isNaN(userPoints)) {
        userPoints = 0; // 
    }

    if (userPoints < points) {
        alert('Insufficient points');
        return;
    }

    // Atualiza os pontos no localStorage
    userPoints -= points;
    localStorage.setItem('userPoints', userPoints);

    let request = indexedDB.open(dbName, 3);

    request.onsuccess = function (event) {
        let db = event.target.result;

        let transaction = db.transaction([tblName], "readwrite");
        let objectStore = transaction.objectStore(tblName);

        let action = objectStore.get(userId);

        action.onsuccess = function (event) {
            const user = action.result;

            if (user) {
                // Adiciona a nova aposta
                const newBet = { matchId: matchId, winnerTeamId: Number(winnerTeamId), bet: Number(points), betVerified: false };
                user.bets.push(newBet);

                const putRequest = objectStore.put(user);

                putRequest.onsuccess = function () {
                    // Atualize o visor de pontos após a aposta ser bem-sucedida
                    updatePointsCounter();
                    alert('Bet successfully placed');
                };

                putRequest.onerror = function (event) {
                    console.error('Error placing bet:', event.target.error);
                };
            }
        };

        action.onerror = function (event) {
            console.log("Error retrieving user:", event.target.errorCode);
        };
    };

    request.onerror = function (event) {
        console.log("Error opening database:", event.target.errorCode);
    };
}



const updatePoints = (userId, points, callback) => {
    let request = indexedDB.open(dbName, 3);

    request.onsuccess = function (event) {
        let db = event.target.result;

        let transaction = db.transaction([tblName], "readwrite");
        let objectStore = transaction.objectStore(tblName);

        let action = objectStore.get(userId);

        action.onsuccess = function (event) {
            const user = action.result;

            if (user) {
                user.points += points;

                if (user.points < 0) {
                    alert('Insufficient points');
                    return;
                }

                const putRequest = objectStore.put(user);

                putRequest.onsuccess = function () {
                    // Atualiza pontos no localStorage
                    let userPoints = localStorage.getItem('userPoints');
                    userPoints = parseInt(userPoints, 10) || 0;
                    userPoints += points;
                    localStorage.setItem('userPoints', userPoints);

                    // Atualiza o contador de pontos na página
                    updatePointsCounterOnPage();

                    if (callback) callback();
                };

                putRequest.onerror = function (event) {
                    console.error('Error updating points:', event.target.error);
                };
            }
        };

        action.onerror = function (event) {
            console.log("Error retrieving user:", event.target.errorCode);
            if (callback) callback();
        };
    };

    request.onerror = function (event) {
        console.log("Error opening database:", event.target.errorCode);
        if (callback) callback();
    };
};



const closeBets = (userId) => {
    let request = indexedDB.open(dbName, 3);

    request.onsuccess = function (event) {
        let db = event.target.result;

        let transaction = db.transaction([tblName], "readwrite");
        let objectStore = transaction.objectStore(tblName);

        let action = objectStore.get(userId);

        action.onsuccess = function (event) {
            const user = action.result;

            for (let i = 0; i < user.bets.length; i++) {
                user.bets[i].betVerified = true
            }

            if (user) {
                const putRequest = objectStore.put(user);

                putRequest.onsuccess = function () {
                };

                putRequest.onerror = function (event) {
                    console.error('Erro ao adicionar pontos ', event.target.error);
                };
            }
        };

        action.onerror = function (event) {
            console.log("Erro ao encontrar Usuário:", event.target.errorCode);
            callback(false);
        };
    };

    request.onerror = function (event) {
        console.log("Erro ao abrir o banco de dados:", event.target.errorCode);
        callback(false);
    };
}


const getBetsByUser = (userId, callback) => {
    let request = indexedDB.open(dbName, 3);

    request.onsuccess = function (event) {
        let db = event.target.result;

        let transaction = db.transaction([tblName], "readwrite");
        let objectStore = transaction.objectStore(tblName);

        let action = objectStore.get(userId);

        action.onsuccess = function (event) {
            const user = action.result;

            callback(user);
        };

        action.onerror = function (event) {
            console.log("Erro ao encontrar Usuário:", event.target.errorCode);
            callback(null);  // Trate o erro como usuário não encontrado
        };
    };

    request.onerror = function (event) {
        console.log("Erro ao abrir o banco de dados:", event.target.errorCode);
        callback(null);  // Trate o erro como usuário não encontrado
    };
}



createDatabase();


document.getElementById('logout').addEventListener('click', function (event) {

    deleteCookie('userId');
    window.location.href = 'login.html';
});





