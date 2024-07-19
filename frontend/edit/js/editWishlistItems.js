document.addEventListener('DOMContentLoaded', () => {
    const entriesContainer = document.getElementById('entries');

    fetch('/api/wishlist')
        .then(response => response.json())
        .then(data => {
            // Ensure numeric fields are parsed as integers
            data.forEach(entry => {
                entry.ID = parseInt(entry.ID, 10);
                entry.BYEAR = parseInt(entry.BYEAR, 10);
                entry.YEAR = parseInt(entry.YEAR, 10);
            });
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
            <button onclick="editEntry(${entry.ID})">Edit</button>
        `;
        container.appendChild(entryDiv);
    });
}

function editEntry(id) {
    window.location.href = `edit-wishlist.html?id=${id}`;
}