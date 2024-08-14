let yearChartInstance;
let byearChartInstance;
let colorChartInstance;

// Global variables to store filtered year data
let filteredYearCounts = {};
let filteredYearLabels = [];
let filteredYearDataCounts = [];

// Add this new function to filter out excluded makes
function filterExcludedMakes(data, excludedMakes) {
    return data.filter(entry => !excludedMakes.includes(entry.MAKE));
}

// Modify the existing code to use the filter for the "Most Popular Years by Make" chart
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/diecast')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const brandCounts = {};
            const makeCounts = {};
            const yearCounts = {};
            const byearCounts = {};
            const colorCounts = {};
            const groupedColorCounts = {};

            let totalDiecast = 0;
            let totalDiecastCars = 0;
            let totalBoulevards = 0;
            let totalTreasureHunts = 0;

            data.forEach(entry => {
                totalDiecast++;
                const cars = typeof entry.MODEL === 'string' ? entry.MODEL.split(' | ') : [entry.MODEL];
                totalDiecastCars += cars.length;

                if (entry.SPECIAL && entry.SPECIAL.toLowerCase().includes('boulevard')) {
                    totalBoulevards++;
                }
                if (entry.SPECIAL && (entry.SPECIAL.toLowerCase().includes('treasure hunt') || entry.SPECIAL.toLowerCase().includes('super treasure hunt'))) {
                    totalTreasureHunts++;
                }

                // Count brands
                const brands = typeof entry.BRAND === 'string' ? entry.BRAND.split(' | ') : [entry.BRAND];
                brands.forEach(brand => {
                    if (brandCounts[brand]) {
                        brandCounts[brand]++;
                    } else {
                        brandCounts[brand] = 1;
                    }
                });

                // Count makes
                const makes = typeof entry.MAKE === 'string' ? entry.MAKE.split(' | ') : [entry.MAKE];
                makes.forEach(make => {
                    if (makeCounts[make]) {
                        makeCounts[make]++;
                    } else {
                        makeCounts[make] = 1;
                    }
                });

                // Count years
                const years = typeof entry.YEAR === 'string' ? entry.YEAR.split(' | ') : [entry.YEAR];
                years.forEach(year => {
                    if (yearCounts[year]) {
                        yearCounts[year]++;
                    } else {
                        yearCounts[year] = 1;
                    }
                });

                // Count BYEAR
                const byears = typeof entry.BYEAR === 'string' ? entry.BYEAR.split(' | ') : [entry.BYEAR];
                byears.forEach(byear => {
                    if (byearCounts[byear]) {
                        byearCounts[byear]++;
                    } else {
                        byearCounts[byear] = 1;
                    }
                });

                // Count colors
                const colors = typeof entry.COLOR === 'string' ? entry.COLOR.split(' | ') : [entry.COLOR];
                colors.forEach(color => {
                    // Remove parts of the color string that contain a hashtag and number
                    const cleanedColor = color.replace(/#\d+/g, '').trim();
                    if (colorCounts[cleanedColor]) {
                        colorCounts[cleanedColor]++;
                    } else {
                        colorCounts[cleanedColor] = 1;
                    }

                    // Group similar colors
                    const baseColor = getBaseColor(cleanedColor);
                    if (groupedColorCounts[baseColor]) {
                        groupedColorCounts[baseColor]++;
                    } else {
                        groupedColorCounts[baseColor] = 1;
                    }
                });
            });

            // Update the metrics in the DOM
            document.getElementById('total-diecast').textContent = totalDiecast;
            document.getElementById('total-diecast-cars').textContent = totalDiecastCars;
            document.getElementById('total-boulevards').textContent = totalBoulevards;
            document.getElementById('total-treasure-hunts').textContent = totalTreasureHunts;

            // Convert counts to arrays for Chart.js and sort them
            const sortedBrandCounts = sortCounts(brandCounts);
            const sortedMakeCounts = sortCounts(makeCounts);
            sortedYearCounts = sortCounts(yearCounts);
            sortedByearCounts = sortCounts(byearCounts);
            sortedColorCounts = sortCounts(colorCounts);
            const sortedGroupedColorCounts = sortCounts(groupedColorCounts);

            // Slice the top 40 for the graph
            const topMakeCounts = sortedMakeCounts.slice(0, 40);
            const topColorCounts = sortedColorCounts.slice(0, 40);
            const topGroupedColorCounts = sortedGroupedColorCounts.slice(0, 40);

            const brandLabels = sortedBrandCounts.map(item => item[0]);
            const brandData = sortedBrandCounts.map(item => item[1]);

            const makeLabels = topMakeCounts.map(item => item[0]);
            const makeData = topMakeCounts.map(item => item[1]);

            yearLabels = sortedYearCounts.map(item => item[0]);
            yearData = sortedYearCounts.map(item => item[1]);

            byearLabels = sortedByearCounts.map(item => item[0]);
            byearData = sortedByearCounts.map(item => item[1]);

            colorLabels = topColorCounts.map(item => item[0]);
            colorData = topColorCounts.map(item => item[1]);

            groupedColorLabels = topGroupedColorCounts.map(item => item[0]);
            groupedColorData = topGroupedColorCounts.map(item => item[1]);

            // Create brand chart
            const brandCtx = document.getElementById('brandChart').getContext('2d');
            new Chart(brandCtx, {
                type: 'bar',
                data: {
                    labels: brandLabels,
                    datasets: [{
                        label: 'Count',
                        data: brandData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'x', // Pan only on the x-axis
                                threshold: 0 // Set threshold to 0 for immediate response
                            },
                            zoom: {
                                wheel: {
                                    enabled: true
                                },
                                drag: {
                                    enabled: true,
                                    threshold: 0, // Set threshold to 0 for immediate response
                                    mode: 'x' // Drag only on the x-axis
                                },
                                pinch: {
                                    enabled: true
                                },
                                mode: 'x' // Zoom only on the x-axis
                            }
                        }
                    }
                }
            });

            // Create make chart
            const makeCtx = document.getElementById('makeChart').getContext('2d');
            new Chart(makeCtx, {
                type: 'bar',
                data: {
                    labels: makeLabels,
                    datasets: [{
                        label: 'Count',
                        data: makeData,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'x', // Pan only on the x-axis
                                threshold: 0 // Set threshold to 0 for immediate response
                            },
                            zoom: {
                                wheel: {
                                    enabled: true
                                },
                                drag: {
                                    enabled: true,
                                    threshold: 0, // Set threshold to 0 for immediate response
                                    mode: 'x' // Drag only on the x-axis
                                },
                                pinch: {
                                    enabled: true
                                },
                                mode: 'x' // Zoom only on the x-axis
                            }
                        }
                    }
                }
            });

            // Create year chart with filtered data
            const excludedMakes = ['Fake HotWheels Brand','Fake Generic Brand','Fake Matchbox Brand']; // Add makes to exclude here
            const filteredYearData = filterExcludedMakes(data, excludedMakes);

            filteredYearCounts = {};
            filteredYearData.forEach(entry => {
                const years = typeof entry.YEAR === 'string' ? entry.YEAR.split(' | ') : [entry.YEAR];
                years.forEach(year => {
                    if (filteredYearCounts[year]) {
                        filteredYearCounts[year]++;
                    } else {
                        filteredYearCounts[year] = 1;
                    }
                });
            });

            console.log('Filtered Year Counts:', filteredYearCounts);

            const sortedFilteredYearCounts = sortCounts(filteredYearCounts);
            filteredYearLabels = sortedFilteredYearCounts.map(item => item[0]);
            filteredYearDataCounts = sortedFilteredYearCounts.map(item => item[1]);

            console.log('Initial Filtered Year Labels:', filteredYearLabels);
            console.log('Initial Filtered Year Data Counts:', filteredYearDataCounts);

            createYearChart(filteredYearLabels, filteredYearDataCounts);

            // Create BYEAR chart
            createByearChart(byearLabels, byearData);

            // Create color chart
            createColorChart(colorLabels, colorData);

            // Display car brand stats in numerical format
            const carBrandStatsContainer = document.getElementById('carBrandStats');
            sortedMakeCounts.forEach(([make, count]) => {
                const makeStat = document.createElement('p');
                makeStat.textContent = `${make}: ${count}`;
                carBrandStatsContainer.appendChild(makeStat);
            });
        })
        .catch(error => console.error('Error fetching stats:', error));
});

// Function to create the year chart
function createYearChart(labels, data) {
    const yearCtx = document.getElementById('yearChart').getContext('2d');
    if (yearChartInstance) {
        yearChartInstance.destroy();
    }
    yearChartInstance = new Chart(yearCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        threshold: 0
                    },
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        drag: {
                            enabled: true,
                            threshold: 0,
                            mode: 'x'
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x'
                    }
                }
            }
        }
    });
}

// Function to create the BYEAR chart
function createByearChart(labels, data) {
    const byearCtx = document.getElementById('byearChart').getContext('2d');
    if (byearChartInstance) {
        byearChartInstance.destroy();
    }
    byearChartInstance = new Chart(byearCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        threshold: 0
                    },
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        drag: {
                            enabled: true,
                            threshold: 0,
                            mode: 'x'
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x'
                    }
                }
            }
        }
    });
}

// Function to create the color chart
function createColorChart(labels, data) {
    const colorCtx = document.getElementById('colorChart').getContext('2d');
    if (colorChartInstance) {
        colorChartInstance.destroy();
    }
    colorChartInstance = new Chart(colorCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        threshold: 0
                    },
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        drag: {
                            enabled: true,
                            threshold: 0,
                            mode: 'x'
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x'
                    }
                }
            }
        }
    });
}

// Add this new function to filter out excluded makes
function filterExcludedMakes(data, excludedMakes) {
    return data.filter(entry => !excludedMakes.includes(entry.MAKE));
}

// Convert counts to arrays for Chart.js and sort them
const sortCounts = (counts) => {
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
};


// Function to update the year chart based on the selected sorting option
function updateYearChart() {
    const sortOption = document.getElementById('yearSort').value;
    let sortedLabels, sortedData;

    console.log('Filtered Year Counts before sorting:', filteredYearCounts);

    if (sortOption === 'year') {
        // Sort by year in descending order
        const sortedFilteredYearCounts = Object.entries(filteredYearCounts).sort((a, b) => b[0] - a[0]);
        sortedLabels = sortedFilteredYearCounts.map(item => item[0]);
        sortedData = sortedFilteredYearCounts.map(item => item[1]);
    } else {
        // Use filtered data for default sorting
        sortedLabels = filteredYearLabels;
        sortedData = filteredYearDataCounts;
    }

    console.log('Sorted Labels:', sortedLabels);
    console.log('Sorted Data:', sortedData);

    createYearChart(sortedLabels, sortedData);
}

// Function to update the BYEAR chart based on the selected sorting option
function updateByearChart() {
    const sortOption = document.getElementById('byearSort').value;
    let sortedLabels, sortedData;

    if (sortOption === 'year') {
        sortedLabels = byearLabels.slice().sort((a, b) => b - a);
        sortedData = sortedLabels.map(label => byearData[byearLabels.indexOf(label)]);
    } else {
        sortedLabels = sortedByearCounts.map(item => item[0]);
        sortedData = sortedByearCounts.map(item => item[1]);
    }

    createByearChart(sortedLabels, sortedData);
}

// Function to update the color chart based on the selected sorting option
function updateColorChart() {
    const sortOption = document.getElementById('colorSort').value;
    let sortedLabels, sortedData;

    if (sortOption === 'grouped') {
        sortedLabels = groupedColorLabels.slice(0, 25);
        sortedData = groupedColorData.slice(0, 25);
    } else {
        sortedLabels = colorLabels;
        sortedData = colorData;
    }

    createColorChart(sortedLabels, sortedData);
}

// Function to reset the zoom for a given chart
function resetZoom(chartId) {
    const chart = Chart.getChart(chartId);
    if (chart) {
        chart.resetZoom();
    }
}

// Function to toggle the display of car brand stats
function toggleCarBrandStats() {
    const carBrandStats = document.getElementById('carBrandStats');
    carBrandStats.classList.toggle('hidden');
}

function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}