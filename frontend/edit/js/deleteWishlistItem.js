document.addEventListener('DOMContentLoaded', () => {
    const entriesContainer = document.getElementById('entries');

    fetch('/api/wishlist')
        .then(response => response.json())
        .then(data => {
            displayEntries(data, entriesContainer);
        })
        .catch(error => console.error('Error fetching wishlist data:', error));
});

function displayEntries(data, container) {
    container.innerHTML = ''; // Clear previous entries
    data.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('entry');
        entryDiv.innerHTML = `
            <p><strong>Brand:</strong> ${entry.BRAND}</p>
            <p><strong>Make:</strong> ${entry.MAKE}</p>
            <p><strong>Model:</strong> ${entry.MODEL}</p>
            <p><strong>Year:</strong> ${entry.YEAR}</p>
            <p><strong>Color:</strong> ${entry.COLOR}</p>
            ${entry.SPECIAL ? `<p><strong>Special:</strong> ${entry.SPECIAL}</p>` : ''}
            <button onclick="deleteEntry(${entry.ID})">Delete</button>
        `;
        container.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    fetch(`/api/delete-wishlist/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            console.error('Error deleting wishlist item:', data.message);
        }
    })
    .catch(error => console.error('Error deleting wishlist item:', error));
}