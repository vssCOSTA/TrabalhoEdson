    const apiData = 'https://api.openligadb.de/getmatchdata/bl1/2023';
    const pageSize = 4;
    let totalPages = 0; // Número total de páginas
    let actualPage = 1;

    // Função para obter os dados das partidas
    const getMatches = async (pageNumber) => {
        pageNumber = Math.max(pageNumber, 1) - 1; // Ajuste para zero-based index
        const start = pageNumber * pageSize;
        const end = start + pageSize;

        try {
            const response = await fetch(apiData);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Calcula o total de páginas
            totalPages = Math.ceil(data.length / pageSize);

            return data.slice(start, end);
        } catch (error) {
            console.error('Erro:', error);
            return null;
        }
    };

    // Função para inicializar a exibição das partidas
    const initMatches = async (pageNumber) => {
        try {
            const data = await getMatches(pageNumber);
            
            console.log(data);

            const teamsBackground = document.getElementById('teamsBackground');
            teamsBackground.innerHTML = ''; // Limpa qualquer conteúdo existente

            const title = document.createElement('h1');
            title.textContent = 'Partidas';
            title.style.textAlign = 'center'; // Alinha o título ao centro
            teamsBackground.appendChild(title);

            if (data) {
                data.forEach((match) => {
                    const matchContainer = document.createElement('div');
                    matchContainer.className = 'match-container'; // Adiciona a classe para estilização

                    const team1Image = document.createElement('img');
                    team1Image.src = match.team1.teamIconUrl; // Assumindo que os dados contêm URLs de ícones de equipe
                    team1Image.alt = 'Team 1 Image';
                    team1Image.style.width = '100px';
                    team1Image.style.height = '100px';

                    const vsIcon = document.createElement('img');
                    vsIcon.src = 'imgs/vs.png';
                    vsIcon.alt = 'VS Icon';
                    vsIcon.style.width = '50px';
                    vsIcon.style.height = '50px';
                    vsIcon.style.marginLeft = '20px';
                    vsIcon.style.marginRight = '20px';

                    const team2Image = document.createElement('img');
                    team2Image.src = match.team2.teamIconUrl;
                    team2Image.alt = 'Team 2 Image';
                    team2Image.style.width = '100px';
                    team2Image.style.height = '100px';
                    
                    const scoreboard = document.createElement('p');
                    let pointsTeam1 = 0;
                    let pointsTeam2 = 0;
                    if (match.matchIsFinished == true){
                        if(match.matchResults){
                            match.matchResults.forEach((result) => {
                                pointsTeam1 = result.pointsTeam1;
                                pointsTeam2 = result.pointsTeam2;
                            })                            
                        }
                        
                    }
                    
                    scoreboard.textContent = match.team1.shortName + ' ' + pointsTeam1 + ' X ' + pointsTeam1 + ' ' + match.team2.shortName 


                    matchContainer.appendChild(team1Image);
                    matchContainer.appendChild(vsIcon);
                    matchContainer.appendChild(team2Image);
                    matchContainer.appendChild(scoreboard);

                    teamsBackground.appendChild(matchContainer);
                });

                createPaginator();
            } else {
                teamsBackground.innerHTML = 'Nenhuma partida encontrada.';
            }
        } catch (error) {
            console.error('Erro ao carregar os dados:', error);
            const teamsBackground = document.getElementById('teamsBackground');
            teamsBackground.innerHTML = 'Erro ao carregar os dados.';
        }
    };

    // Função para criar o paginator
    function createPaginator() {
        const teamsBackground = document.getElementById('teamsBackground');

        // Cria o div para o conteúdo
        const contentDiv = document.createElement('div');
        contentDiv.id = 'content';
        teamsBackground.appendChild(contentDiv);

        // Cria o div para os botões de paginação
        const paginatorDiv = document.createElement('div');
        paginatorDiv.id = 'paginator';
        paginatorDiv.className = 'paginator';
        teamsBackground.appendChild(paginatorDiv);


        const beforeButton = document.createElement('button');
        beforeButton.innerText = '<'
        beforeButton.onclick = () => {
            actualPage--;
            initMatches(actualPage);
            updatePaginator(actualPage);
        };
        paginatorDiv.appendChild(beforeButton);

        
        
        let initialIndex = actualPage % 5 == 0 ? actualPage : actualPage - actualPage % 5;
        initialIndex = initialIndex == 0 ? 1 : initialIndex;
        // Cria os botões de paginação
        for (let i = initialIndex; i <= initialIndex + 5; i++) {
            const button = document.createElement('button');
            button.innerText = i;
            button.classList.toggle('active', i === actualPage);
            button.onclick = () => {
                initMatches(i);
                updatePaginator(i);
            };
            paginatorDiv.appendChild(button);
        }


        const afterButton = document.createElement('button');
        afterButton.innerText = '>'
        afterButton.onclick = () => {
            actualPage++;
            initMatches(actualPage);
            updatePaginator(actualPage);
        };
        paginatorDiv.appendChild(afterButton);
    }

    // Função para atualizar o estado dos botões de paginação
    function updatePaginator(currentPage) {
        const buttons = document.querySelectorAll('#paginator button');
        buttons.forEach((button, index) => {
            actualPage = currentPage;
            button.classList.toggle('active', index + 1 === currentPage);
        });
    }

    // Inicializa o paginator quando o documento estiver pronto
    document.addEventListener('DOMContentLoaded', createPaginator);