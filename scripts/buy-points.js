const buyPoints = (packageType) => {
    const userId = Number(getCookie('userId'));
    let points;

    if (packageType == 'basic'){
        points = 100;
    } else if (packageType == 'intermediate') {
        points = 500;
    } else if (packageType == 'premium') {
        points = 1000;
    } else {
        alert('Pacote inválido')
        return
    }
        
    updatePoints(userId, points);
}