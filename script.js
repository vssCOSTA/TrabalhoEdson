const apiData = 'https://api.openligadb.de/getmatchdata/bl1/2024/Borussia%20Dor';

const pageSize = 4;

const getMatches = async (pageNumber) => {
    pageNumber = pageNumber <= 0 ? 1 : pageNumber * pageSize
    
    let pageCount = pageNumber + pageSize

    try {
        const response = await fetch(apiData);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data.slice(pageNumber, pageCount));
        return data.slice(pageNumber, pageCount);
    } catch (error) {
        console.error('Erro:', error);
        return null;  // Retorna null em caso de erro
    }
};

const initMatches = async (pageNumber) => {
    try {
        const data = await getMatches(pageNumber);
        
        const teamsBackground = document.getElementById('teamsBackground');
        teamsBackground.innerHTML = ''; // Limpa qualquer conteúdo existente

        const title = document.createElement('h1');
        title.textContent = 'Partidas';
        title.style.textAlign = 'center'; // Alinha o título ao centro
        teamsBackground.appendChild(title);

        data.forEach((match) => {
            // Cria um container para cada par de equipes
            const matchContainer = document.createElement('div');
            matchContainer.className = 'match-container'; // Adiciona a classe para estilização

            // Cria o elemento de imagem para a equipe 1
            const team1Image = document.createElement('img');
            team1Image.src = match.team1.teamIconUrl; // Assumindo que os dados contêm URLs de ícones de equipe
            team1Image.alt = 'Team 1 Image';
            team1Image.style.width = '100px'; // Define a largura das imagens
            team1Image.style.height = '100px';

            // Cria o elemento de imagem para o ícone vs
            const vsIcon = document.createElement('img');
            vsIcon.src = 'imgs/vs.png'; // Ajuste o caminho conforme necessário
            vsIcon.alt = 'VS Icon';
            vsIcon.style.width = '50px'; // Ajuste o tamanho do ícone VS conforme necessário
            vsIcon.style.height = '50px';
            vsIcon.style.marginLeft = '20px';
            vsIcon.style.marginRight = '20px';

            // Cria o elemento de imagem para a equipe 2
            const team2Image = document.createElement('img');
            team2Image.src = match.team2.teamIconUrl;
            team2Image.alt = 'Team 2 Image';
            team2Image.style.width = '100px'; // Define a largura das imagens
            team2Image.style.height = '100px';

            // Adiciona as imagens ao container
            matchContainer.appendChild(team1Image);
            matchContainer.appendChild(vsIcon);
            matchContainer.appendChild(team2Image);

            // Adiciona o container ao div 'teamsBackground'
            teamsBackground.appendChild(matchContainer);
        });

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        const teamsBackground = document.getElementById('teamsBackground');
        teamsBackground.innerHTML = 'Erro ao carregar os dados.';
    }
};
