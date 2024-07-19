document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const brand = urlParams.get('brand');
    if (brand) {
        const brandTitle = document.getElementById('brand-title');
        if (brandTitle) {
            brandTitle.textContent = `${brand} Sets`;
        }
        fetch('/api/diecast')
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter(item => item.BRAND === brand);
                populateSets(filteredData);
                // Trigger sorting after populating sets
                const sortOrder = sortOptions.value;
                const sets = Array.from(document.querySelectorAll('.set-item'));
                sortSets(sets, sortOrder);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('input', filterSets);

    const sortOptions = document.getElementById('sort-options');
    sortOptions.addEventListener('change', () => {
        const sortOrder = sortOptions.value;
        const sets = Array.from(document.querySelectorAll('.set-item'));
        sortSets(sets, sortOrder);
    });

    const condenseOptions = document.getElementById('condense-options');
    condenseOptions.addEventListener('change', () => {
        const condenseOption = condenseOptions.value;
        fetch('/api/diecast')
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter(item => item.BRAND === brand);
                populateSets(filteredData, condenseOption);
                // Trigger sorting after populating sets
                const sortOrder = sortOptions.value;
                const sets = Array.from(document.querySelectorAll('.set-item'));
                sortSets(sets, sortOrder);
            })
            .catch(error => console.error('Error fetching data:', error));
    });
});

const condenseKeywords = ['Mainline', 'Moving Parts'];

function populateSets(data, condenseOption = 'no') {
    const container = document.getElementById('set-items-container');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    container.innerHTML = ''; // Clear previous content

    if (condenseOption === 'yes-by-year') {
        const years = new Set(data.map(item => item.BYEAR));
        years.forEach(year => {
            const yearDiv = document.createElement('div');
            yearDiv.classList.add('set-item');
            yearDiv.dataset.year = year;
            yearDiv.textContent = year;
            yearDiv.addEventListener('click', () => {
                const setsForYear = data.filter(item => item.BYEAR === year);
                displaySetsForYear(setsForYear);
            });
            container.appendChild(yearDiv);
        });
    } else if (condenseOption === 'yes') {
        const condensedSets = {};

        data.forEach(item => {
            let key = item.SET;
            condenseKeywords.forEach(keyword => {
                if (item.SET.includes(keyword)) {
                    key = keyword;
                }
            });

            if (!condensedSets[key]) {
                condensedSets[key] = [];
            }
            condensedSets[key].push(item);
        });

        Object.keys(condensedSets).forEach(key => {
            const yearSet = new Set(condensedSets[key].map(item => item.BYEAR));
            yearSet.forEach(year => {
                const setDiv = document.createElement('div');
                setDiv.classList.add('set-item');
                setDiv.dataset.year = year;
                setDiv.dataset.set = key;
                setDiv.textContent = `${key} - ${year}`;
                setDiv.addEventListener('click', () => {
                    const setsForYear = condensedSets[key].filter(item => item.BYEAR === year);
                    displaySetsForYear(setsForYear, key);
                });
                container.appendChild(setDiv);
            });
        });
    } else {
        const uniqueSets = new Set();
        const sets = data.filter(item => {
            const setKey = `${item.SET}-${item.BYEAR}`;
            if (uniqueSets.has(setKey)) {
                return false;
            } else {
                uniqueSets.add(setKey);
                return true;
            }
        }).sort((a, b) => a.BYEAR - b.BYEAR || a.SET.localeCompare(b.SET));

        sets.forEach(item => {
            const setDiv = document.createElement('div');
            setDiv.classList.add('set-item');
            setDiv.dataset.year = item.BYEAR;
            setDiv.dataset.set = item.SET;
            setDiv.textContent = `${item.SET} - ${item.BYEAR}`;
            setDiv.addEventListener('click', () => {
                window.location.href = `set.html?set=${encodeURIComponent(item.SET)}&brand=${encodeURIComponent(item.BRAND)}&year=${item.BYEAR}`;
            });
            container.appendChild(setDiv);
        });
    }
}

function displaySetsForYear(sets, setName = '') {
    if (sets.length > 0) {
        const year = sets[0].BYEAR;
        const brand = sets[0].BRAND;
        window.location.href = `set.html?year=${encodeURIComponent(year)}&brand=${encodeURIComponent(brand)}${setName ? `&set=${encodeURIComponent(setName)}` : ''}`;
    }
}

function filterSets(event) {
    const filter = event.target.value.toLowerCase();
    const filterParts = filter.split(' '); // Split the search term into parts
    const sets = document.querySelectorAll('.set-item');
    sets.forEach(set => {
        const setName = set.dataset.set.toLowerCase();
        const year = set.dataset.year.toLowerCase();
        const combinedText = `${setName} ${year}`; // Combine set name and year
        console.log(`Set Name: ${setName}, Year: ${year}, Combined Text: ${combinedText}`); // Debugging line

        // Check if all parts of the filter are included in the combined text
        const matches = filterParts.every(part => combinedText.includes(part));
        set.style.display = matches ? '' : 'none';
    });
}

function sortSets(sets, sortOrder) {
    sets.sort((a, b) => {
        const yearA = parseInt(a.dataset.year, 10);
        const yearB = parseInt(b.dataset.year, 10);
        if (sortOrder === 'desc') {
            return yearB - yearA || a.dataset.set.localeCompare(b.dataset.set);
        } else {
            return yearA - yearB || a.dataset.set.localeCompare(b.dataset.set);
        }
    });

    const container = document.getElementById('set-items-container');
    sets.forEach(set => container.appendChild(set));
}

function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}