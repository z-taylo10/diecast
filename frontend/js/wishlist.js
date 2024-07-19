function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-bar'); // Updated to use 'search-bar'

    fetch('/api/wishlist')
        .then(response => response.json())
        .then(data => {
            const wishlistContainer = document.getElementById('wishlist-entries');
            displayEntries(data, wishlistContainer);

            // Event listener for search input
            searchInput.addEventListener('input', () => {
                const filteredData = filterData(data, searchInput.value);
                displayEntries(filteredData, wishlistContainer);
            });
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
        `;
        container.appendChild(entryDiv);
    });
}

function filterData(data, searchTerm) {
    const terms = searchTerm.toLowerCase().split(/\s+/); // Split the search term into an array of keywords
    return data.filter(entry => {
        const text = `${entry.BRAND} ${entry.MAKE} ${entry.MODEL} ${entry.YEAR} ${entry.BYEAR} ${entry.COLOR} ${entry.SPECIAL || ''}`.toLowerCase();
        return terms.every(term => text.includes(term)); // Check if every term is included in the entry text
    });
}

fetch('/check-login')
.then(response => response.json())
.then(data => {
    const loginLink = document.getElementById('login-link');
    if (data.loggedIn) {
        loginLink.innerHTML = 'Admin';
        loginLink.href = 'admin.html'; // Update this line
    }
});