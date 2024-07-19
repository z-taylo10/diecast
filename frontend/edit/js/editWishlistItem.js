document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('edit-form');
    const itemId = new URLSearchParams(window.location.search).get('id');

    fetch(`/api/wishlist/${itemId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('item-id').value = data.ID;
            document.getElementById('brand').value = data.BRAND;
            document.getElementById('byear').value = data.BYEAR;
            document.getElementById('set').value = data.SET;
            document.getElementById('make').value = data.MAKE;
            document.getElementById('model').value = data.MODEL;
            document.getElementById('year').value = data.YEAR;
            document.getElementById('color').value = data.COLOR;
            document.getElementById('dupe').value = data.DUPE;
            document.getElementById('special').value = data.SPECIAL;
        })
        .catch(error => console.error('Error fetching wishlist item:', error));

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const updatedItem = {
            ID: document.getElementById('item-id').value,
            BRAND: document.getElementById('brand').value,
            BYEAR: document.getElementById('byear').value,
            SET: document.getElementById('set').value,
            MAKE: document.getElementById('make').value,
            MODEL: document.getElementById('model').value,
            YEAR: document.getElementById('year').value,
            COLOR: document.getElementById('color').value,
            DUPE: document.getElementById('dupe').value,
            SPECIAL: document.getElementById('special').value
        };

        fetch(`/api/wishlist/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedItem)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '../wishlist.html';
            } else {
                console.error('Error updating wishlist item:', data.message);
            }
        })
        .catch(error => console.error('Error updating wishlist item:', error));
    });
});