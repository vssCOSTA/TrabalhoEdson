const buyPoints = (points) => {
    const userId = Number(getCookie('userId')); 

    updatePoints(userId, points);

    alert('Successful purchase of points!')
}