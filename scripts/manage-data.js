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
                { matchId: 66631, winnerTeamId: 7, bet: 100, matchDone: true }
            ]
        }
        
        registerUser(userAdmin);
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
                    callback(event.target.result)
                };

                action.onerror = function (event) {
                    console.log("Erro ao adicionar Usuário:", event.target.errorCode);
                    callback(0)
                };
            }
        } 
    });
}


const loginUser = (username, password, callback) => {
    let request = indexedDB.open(dbName, 3);

    request.onsuccess = function (event) {
        let db = event.target.result;

        let transaction = db.transaction([tblName], "readwrite");
        let objectStore = transaction.objectStore(tblName);

        let index = objectStore.index("username");
        let action = index.get(username);

        action.onsuccess = function (event) {
            if (action.result) {
                if (action.result.password == password) {
                    console.log("Logado com sucesso")
                    callback(action.result.id)
                } else {
                    console.log("Login Inválido")
                    callback(0)
                }
            } else {
                console.log("Usuário não encontrado")
                callback(0)
            }
        };

        action.onerror = function (event) {
            console.log("Erro ao encontrar Usuário:", event.target.errorCode);
            callback(0)
        };
    }
}

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

// Exemplo de uso
excluirCookie('nomeDoCookie');


createDatabase();