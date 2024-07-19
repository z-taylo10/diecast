document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = parseInt(urlParams.get('id'), 10);

    if (isNaN(itemId)) {
        alert('No valid item ID provided');
        window.location.href = '/masteredit.html';
        return;
    }

    fetch(`/api/diecast/${itemId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Item not found');
            }
            return response.json();
        })
        .then(data => {
            if (!data) {
                alert('Item not found');
                window.location.href = '/masteredit.html';
                return;
            }

            document.getElementById('item-id').value = data.ID;
            document.getElementById('brand').value = data.BRAND;
            document.getElementById('set').value = data.SET;
            document.getElementById('byear').value = data.BYEAR;
            document.getElementById('make').value = data.MAKE;
            document.getElementById('model').value = data.MODEL;
            document.getElementById('year').value = data.YEAR;
            document.getElementById('color').value = data.COLOR;
            document.getElementById('dupe').value = data.DUPE;
            document.getElementById('special').value = data.SPECIAL || '';
        })
        .catch(error => {
            console.error('Error fetching item:', error);
            alert('Error fetching item');
            window.location.href = '../edit/masteredit.html';
        });

    document.getElementById('edit-form').addEventListener('submit', (event) => {
        event.preventDefault();

        const updatedItem = {
            ID: parseInt(document.getElementById('item-id').value, 10),
            BRAND: document.getElementById('brand').value,
            SET: document.getElementById('set').value,
            BYEAR: parseInt(document.getElementById('byear').value, 10),
            MAKE: document.getElementById('make').value,
            MODEL: document.getElementById('model').value,
            YEAR: parseInt(document.getElementById('year').value, 10),
            COLOR: document.getElementById('color').value,
            DUPE: document.getElementById('dupe').value,
            SPECIAL: document.getElementById('special').value
        };

        fetch(`/api/diecast/${updatedItem.ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedItem)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Item updated successfully');
                window.location.href = '../edit/masteredit.html';
            } else {
                alert('Error updating item');
            }
        })
        .catch(error => console.error('Error updating item:', error));
    });
});
