function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new URLSearchParams(new FormData(this));
    fetch('/login', {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            response.text().then(text => alert(text));
        }
    });
});