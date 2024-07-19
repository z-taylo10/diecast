function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/diecast')
        .then(response => response.json())
        .then(data => {
            console.log("Original data:", data); // Log original data to inspect its structure

            // Sort data by ID in descending order
            data.sort((a, b) => {
                if (typeof a.ID !== 'number' || typeof b.ID !== 'number') {
                    console.error("ID is not a number", a.ID, b.ID);
                }
                return b.ID - a.ID;
            });

            const entriesPerPageMobile = 20;
            const entriesPerPageDesktop = 21;
            let entriesPerPage = entriesPerPageMobile;

            // Function to check if the device is mobile
            function isMobile() {
                return window.innerWidth <= 600;
            }

            // Function to set the number of entries per page based on device type
            function setEntriesPerPage() {
                if (isMobile()) {
                    entriesPerPage = entriesPerPageMobile;
                } else {
                    entriesPerPage = entriesPerPageDesktop;
                }
            }

            setEntriesPerPage();

            let currentPage = 1;
            let totalPages = Math.ceil(data.length / entriesPerPage);

            const entriesContainer = document.getElementById('entries');
            const paginationContainer = document.getElementById('pagination');
            const searchInput = document.querySelector('header input[type="search"]');
            let searchTerm = '';

            function displayEntries(page, filteredData = data) {
                if (!entriesContainer) {
                    console.error('Entries container not found');
                    return;
                }

                entriesContainer.innerHTML = '';
                const start = (page - 1) * entriesPerPage;
                const end = start + entriesPerPage;
                const pageEntries = filteredData.slice(start, end);

                if (pageEntries.length === 0) {
                    const noResultsDiv = document.createElement('div');
                    noResultsDiv.classList.add('no-results');
                    noResultsDiv.textContent = 'No entries found.';
                    entriesContainer.appendChild(noResultsDiv);
                    return;
                }

                pageEntries.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('entry');
                    if (entry.SPECIAL && !entry.SPECIAL.toLowerCase().includes('boulevard')) {
                        entryDiv.classList.add('special-entry');
                    }
                    if (entry.SPECIAL && entry.SPECIAL.toLowerCase().includes('boulevard')) {
                        entryDiv.classList.add('special-entry1');
                    }
                    if (entry.SPECIAL && entry.SPECIAL.toLowerCase().includes('damaged')) {
                        entryDiv.classList.add('special-entry2');
                    }
                    entryDiv.innerHTML = `
                        <div class="delete-icon" onclick="confirmDelete(${entry.ID})">✖</div>
                        <p><strong>Brand:</strong> ${entry.BRAND}</p>
                        <p><strong>Set:</strong> ${entry.SET}</p>
                        <p><strong>Set Year:</strong> ${entry.BYEAR}</p>
                        <hr>
                        <p><strong>Make:</strong> ${entry.MAKE}</p>
                        <p><strong>Model:</strong> ${entry.MODEL}</p>
                        <p><strong>Year:</strong> ${entry.YEAR}</p>
                        <p><strong>Color:</strong> ${entry.COLOR}</p>
                        <p><strong>Dupe:</strong> ${entry.DUPE}</p>
                        ${entry.SPECIAL ? `<p><strong>Special:</strong> ${entry.SPECIAL}</p>` : ''}
                    `;
                    entriesContainer.appendChild(entryDiv);
                });
            }

            function createPagination(filteredData = data) {
                paginationContainer.innerHTML = '';
                totalPages = Math.ceil(filteredData.length / entriesPerPage);

                if (totalPages <= 1) {
                    return; // Do not create pagination buttons if there is only one page
                }

                function createPageButton(page) {
                    const button = document.createElement('button');
                    button.textContent = page;
                    if (page === currentPage) {
                        button.classList.add('active');
                    }
                    button.addEventListener('click', () => {
                        currentPage = page;
                        displayEntries(currentPage, filteredData);
                        createPagination(filteredData);
                    });
                    paginationContainer.appendChild(button);
                }

                createPageButton(1);

                if (currentPage > 3) {
                    const ellipsis = document.createElement('button');
                    ellipsis.textContent = '...';
                    ellipsis.addEventListener('click', () => {
                        const jumpPage = prompt('Enter page number:');
                        if (jumpPage && !isNaN(jumpPage) && jumpPage > 0 && jumpPage <= totalPages) {
                            currentPage = parseInt(jumpPage);
                            displayEntries(currentPage, filteredData);
                            createPagination(filteredData);
                        }
                    });
                    paginationContainer.appendChild(ellipsis);
                }

                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                    createPageButton(i);
                }

                if (currentPage < totalPages - 2) {
                    const ellipsis = document.createElement('button');
                    ellipsis.textContent = '...';
                    ellipsis.addEventListener('click', () => {
                        const jumpPage = prompt('Enter page number:');
                        if (jumpPage && !isNaN(jumpPage) && jumpPage > 0 && jumpPage <= totalPages) {
                            currentPage = parseInt(jumpPage);
                            displayEntries(currentPage, filteredData);
                            createPagination(filteredData);
                        }
                    });
                    paginationContainer.appendChild(ellipsis);
                }

                createPageButton(totalPages);
            }

            function filterData() {
                const searchTerms = searchTerm.split(' ').map(term => term.toLowerCase()); // Split search input into terms and normalize to lower case
                return data.filter(entry => 
                    searchTerms.every(term => // Check if every term matches at least one field
                        String(entry.BRAND).toLowerCase().includes(term) ||
                        String(entry.SET).toLowerCase().includes(term) ||
                        String(entry.BYEAR).toLowerCase().includes(term) ||
                        String(entry.MAKE).toLowerCase().includes(term) ||
                        String(entry.MODEL).toLowerCase().includes(term) ||
                        String(entry.YEAR).toLowerCase().includes(term) ||
                        String(entry.COLOR).toLowerCase().includes(term) ||
                        String(entry.DUPE).toLowerCase().includes(term) ||
                        (entry.SPECIAL && String(entry.SPECIAL).toLowerCase().includes(term))
                    )
                );
            }

            displayEntries(currentPage, filterData());
            createPagination(filterData());

            // Update entries per page and pagination on window resize
            window.addEventListener('resize', () => {
                setEntriesPerPage();
                totalPages = Math.ceil(filterData().length / entriesPerPage);
                displayEntries(currentPage, filterData());
                createPagination(filterData());
            });

            // Add event listener to the search input
            searchInput.addEventListener('input', (event) => {
                searchTerm = event.target.value.toLowerCase();
                currentPage = 1;
                displayEntries(currentPage, filterData());
                createPagination(filterData());
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

function confirmDelete(id) {
    const confirmation = confirm('Do you really wish to delete this item?');
    if (confirmation) {
        deleteItem(id);
    }
}

function deleteItem(id) {
    fetch(`/api/delete-diecast/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Item deleted successfully');
            location.reload(); // Reload the page to reflect changes
        } else {
            alert('Error deleting item');
        }
    })
    .catch(error => console.error('Error deleting item:', error));
}