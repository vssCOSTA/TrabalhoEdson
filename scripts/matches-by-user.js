const actualYear = new Date().getFullYear();
const apiData = `https://api.openligadb.de/getmatchdata/bl1/${actualYear}`;
const pageSize = 3;
let totalPages = 0;
let actualPage = 1;
let userId = Number(getCookie('userId'));
const fallbackImageUrl = 'imgs/team-default.png';
let allData = [];

const getMatches = async () => {
    try {
        const response = await fetch(apiData);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        totalPages = Math.ceil(data.length / pageSize);
        return data.sort((a, b) => a.matchDateTimeUTC + b.matchDateTimeUTC);
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
};

const initMatchesByUser = async (pageNumber) => {
    try {
        if (allData && allData.length <= 0) {
            allData = await getMatches();
        }

        getBetsByUser(userId, function (user) {
            const bets = user.bets;
            const auxiliarMatchIds = new Set(bets.map(item => item.matchId));
            data = allData.filter(item => auxiliarMatchIds.has(item.matchID));

            pageNumber = Math.max(pageNumber, 1) - 1;
            const start = pageNumber * pageSize;
            const end = start + pageSize;

            const teamsBackground = document.getElementById('teamsBackground');
            teamsBackground.innerHTML = ''; 

            const title = document.createElement('h1');
            title.textContent = 'Partidas';
            title.style.textAlign = 'center';
            teamsBackground.appendChild(title);

            if (data && data.length > 0) {
                data.forEach((match, index) => {
                    const matchContainer = document.createElement('div');
                    matchContainer.className = 'match-container';

                    const imagesContainer = document.createElement('div');
                    imagesContainer.className = 'images-container';

                    const team1Image = document.createElement('img');
                    team1Image.alt = 'Team 1 Image';
                    team1Image.style.width = '100px';
                    team1Image.style.height = '100px';

                    const primaryImageUrl = match.team1.teamIconUrl; 
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

                    const primaryImage2Url = match.team2.teamIconUrl;
                    loadImageWithFallback(team2Image, primaryImage2Url, fallbackImageUrl);

                    imagesContainer.appendChild(team1Image);
                    imagesContainer.appendChild(vsIcon);
                    imagesContainer.appendChild(team2Image);

                    const scoreboard = document.createElement('p');
                    scoreboard.className = 'scoreboard';
                    let pointsTeam1 = 0;
                    let pointsTeam2 = 0;
                    if (match.matchIsFinished && match.matchResults) {
                        match.matchResults.forEach((result) => {
                            pointsTeam1 = result.pointsTeam1;
                            pointsTeam2 = result.pointsTeam2;
                        });
                    }

                    scoreboard.textContent = `${match.team1.shortName} ${pointsTeam1} X ${pointsTeam2} ${match.team2.shortName}`;

                    const dateElement = document.createElement('p');
                    dateElement.className = 'match-date';
                    const matchDate = new Date(match.matchDateTimeUTC);
                    const formattedDate = matchDate.toLocaleDateString();
                    dateElement.textContent = `Data do Jogo: ${formattedDate}`;

                    matchContainer.appendChild(dateElement);
                    matchContainer.appendChild(imagesContainer);
                    matchContainer.appendChild(scoreboard);

                    teamsBackground.appendChild(matchContainer);
                });

                createPaginatorByUser(userId);
            } else {
                teamsBackground.innerHTML = 'No bets were placed on this account.';
            }
        });
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        const teamsBackground = document.getElementById('teamsBackground');
        teamsBackground.innerHTML = 'Erro ao carregar os dados.';
    }
};

function createPaginatorByUser() {
    const teamsBackground = document.getElementById('teamsBackground');

    const contentDiv = document.createElement('div');
    contentDiv.id = 'content';
    teamsBackground.appendChild(contentDiv);

    const paginatorDiv = document.createElement('div');
    paginatorDiv.id = 'paginator';
    paginatorDiv.className = 'paginator';
    teamsBackground.appendChild(paginatorDiv);

    const beforeButton = document.createElement('button');
    beforeButton.innerText = '<';
    beforeButton.disabled = actualPage === 1;
    beforeButton.onclick = () => {
        actualPage--;
        initMatchesByUser(userId, actualPage);
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
            initMatchesByUser(userId, i);
        };
        paginatorDiv.appendChild(button);
    }

    const afterButton = document.createElement('button');
    afterButton.innerText = '>';
    afterButton.disabled = actualPage === totalPages;
    afterButton.onclick = () => {
        actualPage++;
        initMatchesByUser(userId, actualPage);
    };
    paginatorDiv.appendChild(afterButton);
}

function loadImageWithFallback(imageElement, primaryUrl, fallbackUrl) {
    imageElement.src = primaryUrl;
    imageElement.onerror = function () {
        imageElement.src = fallbackUrl;
    };
}

window.onload = async function () {
    initMatchesByUser(1);
};
