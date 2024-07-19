function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}

document.getElementById('logout-box').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/logout')
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            }
        });
});

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('excelFile', file);

    fetch('/upload-excel', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.text();
    })
    .then(data => {
        console.log(data);
        alert('File uploaded and processed successfully.');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error uploading file: ' + error.message);
    });
});

document.getElementById('download-box').addEventListener('click', function() {
    window.location.href = '/download-excel';
});

document.getElementById('add-delete-box').addEventListener('click', function() {
    window.location.href = 'modifymaster.html';
});
