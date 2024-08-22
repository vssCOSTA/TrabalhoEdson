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
        let db = event.target.result;
        console.log("Banco de dados aberto com sucesso.");
    };

    request.onerror = function (event) {
        console.log("Erro ao abrir o banco de dados:", event.target.errorCode);
    };
}


const registerUser = (user) => {

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
                };

                action.onerror = function (event) {
                    console.log("Erro ao adicionar Usuário:", event.target.errorCode);
                };
            }
        }
    });
}


const loginUser = (username, password) => {
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
                } else {
                    console.log("Login Inválido")
                }
            } else {
                console.log("Usuário não encontrado")
            }
        };

        action.onerror = function (event) {
            console.log("Erro ao encontrar Usuário:", event.target.errorCode);
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