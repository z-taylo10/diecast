document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const setName = urlParams.get('set');
    const brand = urlParams.get('brand');
    const year = urlParams.get('year'); // Get the year from the URL

    if (brand && year) {
        fetch(`/api/diecast`)
            .then(response => response.json())
            .then(data => {
                let filteredData;
                if (setName) {
                    filteredData = data.filter(item => item.SET.includes(setName) && item.BRAND === brand && item.BYEAR.toString() === year);
                } else {
                    filteredData = data.filter(item => item.BRAND === brand && item.BYEAR.toString() === year);
                }
                console.log('Filtered Data:', filteredData); // Debugging statement
                if (filteredData.length > 0) {
                    const setTitle = document.getElementById('set-title');
                    if (setTitle) {
                        if (setName) {
                            setTitle.textContent = `${setName} - ${brand} ${year}`;
                        } else {
                            setTitle.textContent = `${brand} Sets from ${year}`;
                        }
                    }
                }
                populateCars(filteredData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Add event listener for the search bar
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', filterCars);
    }

    // Add event listener for the filter input
    const filterInput = document.getElementById('filter-input');
    if (filterInput) {
        filterInput.addEventListener('input', filterCars);
    }
});

function populateCars(data) {
    const container = document.getElementById('cars-container');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    data.forEach(item => {
        // Ensure item.MAKE and item.MODEL are strings
        const makes = String(item.MAKE || '').split(' | ');
        const models = String(item.MODEL || '').split(' | ');
        console.log('Makes:', makes); // Debugging statement
        console.log('Models:', models); // Debugging statement
        let makeModel = '';
        
        if (makes.length === 1 && models.length > 1) {
            // If there is only one make but multiple models
            const make = makes[0];
            models.forEach(model => {
                makeModel += `<h3>${make} ${model}</h3>`;
            });
        } else {
            // If there are multiple makes and models
            for (let i = 0; i < makes.length; i++) {
                let make = makes[i];
                let model = models[i] || ''; // Ensure model exists
                // Check for the word "Brand" in the make and add a colon after it
                if (make.includes('Brand')) {
                    make = make.replace('Brand', 'Brand:');
                }
                makeModel += `<h3>${make} ${model}</h3>`;
            }
        }
        
        console.log('MakeModel HTML:', makeModel); // Debugging statement

        const carDiv = document.createElement('div');
        carDiv.classList.add('car-item');
        if (item.SPECIAL && !item.SPECIAL.toLowerCase().includes('boulevard')) {
            carDiv.classList.add('special-car');
        }
        if (item.SPECIAL && item.SPECIAL.toLowerCase().includes('boulevard')) {
            carDiv.classList.add('special-car1');
        }
        if (item.SPECIAL && item.SPECIAL.toLowerCase().includes('damaged')) {
            carDiv.classList.add('special-car2');
        }
        if (item.SPECIAL && item.SPECIAL.toLowerCase().includes('store exclusive')) {
            carDiv.classList.add('special-car3');
        }

        carDiv.innerHTML = `
            ${makeModel}
            <p>Set: ${item.SET}</p>
            <p>Year: ${item.YEAR}</p>
            <p>Color: ${item.COLOR}</p>
            ${item.SPECIAL ? `<p>Special: ${item.SPECIAL}</p>` : ''}
        `;
        console.log('CarDiv HTML:', carDiv.innerHTML); // Debugging statement
        container.appendChild(carDiv);
    });
}

function filterCars(event) {
    const filter = event.target.value.toLowerCase();
    const cars = document.querySelectorAll('.car-item');
    cars.forEach(car => {
        const text = car.textContent.toLowerCase();
        car.style.display = text.includes(filter) ? '' : 'none';
    });
}

function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}