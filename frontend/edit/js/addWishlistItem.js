document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-wishlist-form');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Fetch the current highest ID from the server
        fetch('/api/highest-wishlist-id')
            .then(response => response.json())
            .then(data => {
                const newId = data.highestId + 1; // Increment the highest ID by 1

                const newItem = {
                    ID: newId, // Add the numeric ID here
                    BRAND: document.getElementById('brand').value,
                    BYEAR: parseInt(document.getElementById('brandYear').value, 10), // Parse as integer
                    SET: document.getElementById('set').value,
                    MAKE: document.getElementById('make').value,
                    MODEL: document.getElementById('model').value,
                    YEAR: parseInt(document.getElementById('modelYear').value, 10), // Parse as integer
                    COLOR: document.getElementById('modelColor').value,
                    DUPE: document.getElementById('dupe').value,
                    SPECIAL: document.getElementById('special').value
                };

                fetch('/api/add-wishlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newItem)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '../wishlist.html';
                    } else {
                        console.error('Error adding wishlist item:', data.message);
                    }
                })
                .catch(error => console.error('Error adding wishlist item:', error));
            })
            .catch(error => console.error('Error fetching highest wishlist ID:', error));
    });
});