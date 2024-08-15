function toggleMenu() {
    const navUl = document.querySelector('nav ul');
    navUl.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
    // Set focus to the document body to ensure keydown events are captured
    document.body.focus();

    fetch('/api/diecast')
        .then(response => response.json())
        .then(data => {
            // Sort data by ID in descending order
            data.sort((a, b) => {
                if (typeof a.ID !== 'number' || typeof b.ID !== 'number') {
                    console.error("ID is not a number", a.ID, b.ID);
                }
                return b.ID - a.ID;
            });

            // Populate brand and make dropdowns
            const brandSelect = document.getElementById('brand-select');
            const makeSelect = document.getElementById('make-select');
            const makeSelectLabel = document.getElementById('make-select-label');

            // Debugging: Log raw data to see what is actually fetched
            console.log("Raw data:", data);

            // Split brands and flatten the array before creating a set of unique brands
            const brands = [...new Set(data.flatMap(entry => entry.BRAND.split(' | ')))].sort();
            const makes = [...new Set(data.flatMap(entry => entry.MAKE.split(' | ')))].sort(); // Ensure splitting is applied here as well

            // Debugging: Log processed makes to ensure they are split correctly
            console.log("Processed makes:", makes);

            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandSelect.appendChild(option);
            });

            makes.forEach(make => {
                const option = document.createElement('option');
                option.value = make;
                option.textContent = make;
                makeSelect.appendChild(option);
            });

            const entriesPerPageMobile = 20; // 20 rows * 2 entries per row
            const entriesPerPageDesktop = 21; // 3 rows * 7 entries per row
            let entriesPerPage = entriesPerPageDesktop;

            function isMobile() {
                return window.innerWidth <= 600;
            }

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

            let currentSearchState = {
                brand: '',
                brandYear: '',
                make: '',
                carYear: '',
                generalSearch: ''
            };

            function displayEntries(page, filteredData = filterData()) {
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
                    if (entry.SPECIAL && entry.SPECIAL.toLowerCase().includes('store exclusive')) {
                        entryDiv.classList.add('special-entry3');
                    }
                    if (entry.SPECIAL && entry.SPECIAL.toLowerCase().includes('redline')) {
                        entryDiv.classList.add('special-entry4');
                    }
                    entryDiv.innerHTML = `
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

                    // Check if the entry content exceeds the max height
                    if (entryDiv.scrollHeight > entryDiv.clientHeight) {
                        const expandIcon = document.createElement('span');
                        expandIcon.classList.add('expand-icon');
                        expandIcon.textContent = '▼';
                        entryDiv.appendChild(expandIcon);

                        // Add event listener to the expand icon
                        expandIcon.addEventListener('click', () => {
                            entryDiv.classList.toggle('expanded');
                            expandIcon.textContent = entryDiv.classList.contains('expanded') ? '▲' : '▼';
                        });
                    }
                });
            }

            function createPagination(filteredData = filterData()) {
                paginationContainer.innerHTML = '';

                const prevButton = document.createElement('button');
                prevButton.id = 'prev-page';
                prevButton.innerHTML = '&#8592;';
                prevButton.style.display = currentPage > 1 ? 'inline-block' : 'none';
                prevButton.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        displayEntries(currentPage, filteredData);
                        createPagination(filteredData);
                    }
                });
                paginationContainer.appendChild(prevButton);

                function createPageButton(page) {
                    const pageButton = document.createElement('button');
                    pageButton.textContent = page;
                    pageButton.addEventListener('click', () => {
                        currentPage = page;
                        displayEntries(currentPage, filteredData);
                        createPagination(filteredData);
                    });
                    if (page === currentPage) {
                        pageButton.classList.add('active');
                    }
                    paginationContainer.appendChild(pageButton);
                }

                const totalPages = Math.ceil(filteredData.length / entriesPerPage);
                if (totalPages <= 1) return;

                createPageButton(1);

                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                    createPageButton(i);
                }

                if (currentPage < totalPages - 2) {
                    const ellipsis = document.createElement('button');
                    ellipsis.textContent = '...';
                    ellipsis.disabled = true;
                    paginationContainer.appendChild(ellipsis);
                }

                createPageButton(totalPages);

                const nextButton = document.createElement('button');
                nextButton.id = 'next-page';
                nextButton.innerHTML = '&#8594;';
                nextButton.style.display = currentPage < totalPages ? 'inline-block' : 'none';
                nextButton.addEventListener('click', () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        displayEntries(currentPage, filteredData);
                        createPagination(filteredData);
                    }
                });
                paginationContainer.appendChild(nextButton);
            }

            function filterData() {
                const { brand, brandYear, make, carYear, generalSearch } = currentSearchState;
                const specialSelect = document.getElementById('special-select').value;
                const dupeSelect = document.getElementById('dupe-select').value;

                const searchTerms = generalSearch.split(' ').map(term => term.toLowerCase());

                return data.filter(entry => {
                    const entryMakes = entry.MAKE.split(' | ').map(m => m.toLowerCase());
                    const entryYears = typeof entry.YEAR === 'string' ? entry.YEAR.split(' | ') : [entry.YEAR.toString()]; // Ensure entry.YEAR is a string
                    const hasSpecial = entry.SPECIAL && entry.SPECIAL.trim() !== '';
                    const isDupe = entry.DUPE.toLowerCase() === 'yes';

                    const specialCondition = (specialSelect === 'yes' && hasSpecial && 
                                              !entry.SPECIAL.toLowerCase().includes('boulevard') && 
                                              !entry.SPECIAL.toLowerCase().includes('damaged') &&
                                              !entry.SPECIAL.toLowerCase().includes('store exclusive')) ||
                                             (specialSelect === 'yes' && hasSpecial && 
                                              entry.SPECIAL.toLowerCase().includes('boulevard classic')) ||
                                             (specialSelect === 'yes-all-boulevards' && hasSpecial && 
                                              !entry.SPECIAL.toLowerCase().includes('damaged')) ||
                                             (specialSelect === 'yes-store-exclusives' && hasSpecial && 
                                              entry.SPECIAL.toLowerCase().includes('store exclusive')) ||
                                             (specialSelect === 'no' && !hasSpecial); // Updated condition for "No"

                    return (
                        (brand === '' || entry.BRAND.toLowerCase() === brand) &&
                        (brandYear === '' || entry.BYEAR.toString() === brandYear) &&
                        (make === '' || entryMakes.includes(make)) &&
                        (carYear === '' || entryYears.includes(carYear)) && // Adjusted to check if the carYear is included in the split years
                        searchTerms.every(term => 
                            String(entry.BRAND).toLowerCase().includes(term) ||
                            String(entry.SET).toLowerCase().includes(term) ||
                            String(entry.BYEAR).toLowerCase().includes(term) ||
                            entryMakes.some(m => m.includes(term)) ||
                            String(entry.MODEL).toLowerCase().includes(term) ||
                            entryYears.some(y => String(y).includes(term)) || // Adjusted for split years
                            String(entry.COLOR).toLowerCase().includes(term) ||
                            String(entry.DUPE).toLowerCase().includes(term) ||
                            (entry.SPECIAL && String(entry.SPECIAL).toLowerCase().includes(term))
                        ) &&
                        (specialSelect === '' || specialCondition) &&
                        (dupeSelect === '' || (dupeSelect === 'yes' && isDupe) || (dupeSelect === 'no' && !isDupe))
                    );
                });
            }

            function updateMakesDropdown(brand) {
                const makeSelect = document.getElementById('make-select');
                makeSelect.innerHTML = '<option value="">All Makes</option>'; // Reset makes dropdown

                let makes;
                if (brand) {
                    makes = data.filter(entry => entry.BRAND.toLowerCase() === brand.toLowerCase())
                                .flatMap(entry => entry.MAKE.split(' | '))
                                .filter((value, index, self) => self.indexOf(value) === index)
                                .sort();
                } else {
                    makes = [...new Set(data.flatMap(entry => entry.MAKE.split(' | ')))].sort();
                }

                makes.forEach(make => {
                    const option = document.createElement('option');
                    option.value = make;
                    option.textContent = make;
                    makeSelect.appendChild(option);
                });

                // Debugging: Log the makes to ensure they are processed correctly
                console.log("Updated makes:", makes);
            }

            // Ensure the brand value is passed correctly when updating makes dropdown
            brandSelect.addEventListener('change', () => {
                console.log("Brand selected:", brandSelect.value); // Check what value is being selected
                const selectedBrand = brandSelect.value;
                updateMakesDropdown(selectedBrand ? selectedBrand.toLowerCase() : '');
                performAdvancedSearch();
            });

            // Add event listener for makeSelect to update the dropdown value
            makeSelect.addEventListener('change', () => {
                performAdvancedSearch();
            });

            window.performAdvancedSearch = function() {
                currentSearchState = {
                    brand: brandSelect.value.toLowerCase(),
                    brandYear: document.getElementById('brand-year-input').value,
                    make: makeSelect.value.toLowerCase(),
                    carYear: document.getElementById('car-year-input').value,
                    generalSearch: document.getElementById('general-search-input').value.toLowerCase()
                };

                const filteredData = filterData();
                currentPage = 1;
                totalPages = Math.ceil(filteredData.length / entriesPerPage);

                if (filteredData.length === 0) {
                    entriesContainer.innerHTML = '<div class="no-results">No entries found.</div>';
                } else {
                    displayEntries(currentPage, filteredData);
                    createPagination(filteredData);
                }
            };

            // Initial display
            displayEntries(currentPage);
            createPagination();

            // Event listeners for filters
            brandSelect.addEventListener('change', performAdvancedSearch);
            document.getElementById('brand-year-input').addEventListener('input', performAdvancedSearch);
            makeSelect.addEventListener('change', performAdvancedSearch);
            document.getElementById('car-year-input').addEventListener('input', performAdvancedSearch);
            document.getElementById('general-search-input').addEventListener('input', performAdvancedSearch);
            document.getElementById('special-select').addEventListener('change', performAdvancedSearch);
            document.getElementById('dupe-select').addEventListener('change', performAdvancedSearch);

            // Handle window resize to adjust entries per page
            window.addEventListener('resize', () => {
                setEntriesPerPage();
                totalPages = Math.ceil(filterData().length / entriesPerPage);
                performAdvancedSearch();
            });

        // Function to handle arrow key navigation
        function handleArrowKeyNavigation(event) {
            if (event.key === 'ArrowLeft' && currentPage > 1) {
                currentPage--;
                displayEntries(currentPage, filterData());
                createPagination(filteredData);
            } else if (event.key === 'ArrowRight' && currentPage < totalPages) {
                currentPage++;
                displayEntries(currentPage, filterData());
                createPagination(filteredData);
            }
        }

        // Add event listener for arrow keys to navigate pages
        document.addEventListener('keydown', handleArrowKeyNavigation);

        // Ensure the focus is set to the document body after the DOM content is fully loaded
        document.body.focus();
        })
        .catch(error => console.error('Error fetching data:', error));

    fetch('/check-login')
        .then(response => response.json())
        .then(data => {
            const loginLink = document.getElementById('login-link');
            if (data.loggedIn) {
                loginLink.innerHTML = 'Admin';
                loginLink.href = 'admin.html'; // Update this line
            }
        });
});