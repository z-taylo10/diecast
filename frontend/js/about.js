function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}

document.getElementById('inspire-btn').addEventListener('click', function() {
    fetch('https://inspirobot.me/api?generate=true')
        .then(response => response.text())
        .then(data => {
            if (data.startsWith('http')) { // Check if the fetched data is a valid URL
                const img = document.getElementById('inspire-img');
                img.src = data;
                img.style.display = 'block'; // Make the image visible only if the URL is valid
            }
        })
        .catch(error => console.error('Error fetching inspirational image:', error));
});