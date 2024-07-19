document.getElementById('add-diecast-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    console.log('Form data:', data); // Debugging line

    fetch('/api/add-diecast', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        const messageDiv = document.getElementById('message');
        if (result.success) {
            messageDiv.textContent = 'Diecast added successfully!';
            messageDiv.style.color = 'green';
        } else {
            messageDiv.textContent = 'Error adding diecast: ' + result.error;
            messageDiv.style.color = 'red';
        }
    })
    .catch(error => {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'Error adding diecast: ' + error.message;
        messageDiv.style.color = 'red';
    });
});

function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}