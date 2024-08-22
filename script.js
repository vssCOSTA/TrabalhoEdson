const apiData = 'https://api.openligadb.de/getmatchdata/bl1/2023';
const pageSize = 3;
let totalPages = 0; // Número total de páginas
let actualPage = 1;
const fallbackImageUrl = 'imgs/team-default.png';
let allData = [];

// Função para obter os dados das partidas
const getMatches = async () => {
    try {
        const response = await fetch(apiData);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Calcula o total de páginas
        totalPages = Math.ceil(data.length / pageSize);

        return data.sort((a, b) => a.matchDateTimeUTC + b.matchDateTimeUTC);;
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
};

// Função para inicializar a exibição das partidas
const initMatches = async (pageNumber) => {
    try {
        if (allData && allData.length <= 0){
            allData = await getMatches();
        }

        pageNumber = Math.max(pageNumber, 1) - 1; // Ajuste para zero-based index
        const start = pageNumber * pageSize;
        const end = start + pageSize;

        data = allData.slice(start, end);
        
        const teamsBackground = document.getElementById('teamsBackground');
        teamsBackground.innerHTML = ''; // Limpa qualquer conteúdo existente

        const title = document.createElement('h1');
        title.textContent = 'Partidas';
        title.style.textAlign = 'center'; // Alinha o título ao centro
        teamsBackground.appendChild(title);

        if (data && data.length > 0) {
            data.forEach((match) => {
                const matchContainer = document.createElement('div');
                matchContainer.className = 'match-container'; // Adiciona a classe para estilização
            
                const imagesContainer = document.createElement('div');
                imagesContainer.className = 'images-container'; // Container para as imagens e placar
            
                const team1Image = document.createElement('img');
                team1Image.alt = 'Team 1 Image';
                team1Image.style.width = '100px';
                team1Image.style.height = '100px';
                
                const primaryImageUrl = match.team1.teamIconUrl; // A URL da imagem principal               
                loadImageWithFallback(team1Image, primaryImageUrl, fallbackImageUrl);
            
                const vsIcon = document.createElement('img');
                vsIcon.src = 'imgs/vs.png';
                vsIcon.alt = 'VS Icon';
                vsIcon.style.width = '50px';
                vsIcon.style.height = '50px';
                vsIcon.style.marginLeft = '20px';
                vsIcon.style.marginRight = '20px';
            
                const team2Image = document.createElement('img');
                team2Image.alt = 'Team 2 Image';
                team2Image.style.width = '100px';
                team2Image.style.height = '100px';
                
                const primaryImage2Url = match.team2.teamIconUrl; // A URL da imagem principal
                loadImageWithFallback(team2Image, primaryImage2Url, fallbackImageUrl);
            
                imagesContainer.appendChild(team1Image);
                imagesContainer.appendChild(vsIcon);
                imagesContainer.appendChild(team2Image);
            
                const scoreboard = document.createElement('p');
                scoreboard.className = 'scoreboard';
                let pointsTeam1 = 0;
                let pointsTeam2 = 0;
                if (match.matchIsFinished === true && match.matchResults) {
                    match.matchResults.forEach((result) => {
                        pointsTeam1 = result.pointsTeam1;
                        pointsTeam2 = result.pointsTeam2;
                    });
                }
            
                scoreboard.textContent = `${match.team1.shortName} ${pointsTeam1} X ${pointsTeam2} ${match.team2.shortName}`;
            
                // Adiciona a data do jogo
                const dateElement = document.createElement('p');
                dateElement.className = 'match-date';
                const matchDate = new Date(match.matchDateTimeUTC);
                const formattedDate = matchDate.toLocaleDateString(); // Ajuste o formato conforme necessário
                dateElement.textContent = `Data do Jogo: ${formattedDate}`;
            
                // Adiciona todos os elementos ao container
                matchContainer.appendChild(dateElement);
                matchContainer.appendChild(imagesContainer);
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
    beforeButton.innerText = '<';
    beforeButton.disabled = actualPage === 1; // Desativa o botão se estiver na primeira página
    beforeButton.onclick = () => {
        actualPage--;
        initMatches(actualPage);
    };
    paginatorDiv.appendChild(beforeButton);

    let initialIndex = Math.max(1, Math.floor((actualPage) / 5) * 5);
    let endIndex = Math.min(totalPages, initialIndex + 5);

    for (let i = initialIndex; i <= endIndex; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.toggle('active', i === actualPage);
        button.onclick = () => {
            actualPage = i;
            initMatches(i);
        };
        paginatorDiv.appendChild(button);
    }

    const afterButton = document.createElement('button');
    afterButton.innerText = '>';
    afterButton.disabled = actualPage === totalPages; // Desativa o botão se estiver na última página
    afterButton.onclick = () => {
        actualPage++;
        initMatches(actualPage);
    };
    paginatorDiv.appendChild(afterButton);
}

// Função para atualizar o estado dos botões de paginação
function updatePaginator(currentPage) {
    const buttons = document.querySelectorAll('#paginator button');
    buttons.forEach((button, index) => {
        button.classList.toggle('active', button.innerText == currentPage);
    });
}

function loadImageWithFallback(imgElement, primaryUrl, fallbackUrl) {
    imgElement.src = primaryUrl;

    imgElement.onload = function() {
        imgElement.onload = null; // Limpa o evento
    };

    imgElement.onerror = function() {
        imgElement.src = fallbackUrl;
    };
}

// Inicializa a primeira página quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initMatches(actualPage);
});
