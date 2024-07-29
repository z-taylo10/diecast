document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/diecast')
        .then(response => response.json())
        .then(data => {
            const brandCounts = {};
            const makeCounts = {};
            const yearCounts = {};
            const byearCounts = {};
            const colorCounts = {};
            const groupedColorCounts = {};

            // Process the data to populate the counts
            data.forEach(entry => {
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

                // Count brand years
                const byears = typeof entry.BRAND_YEAR === 'string' ? entry.BRAND_YEAR.split(' | ') : [entry.BRAND_YEAR];
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
                    if (colorCounts[color]) {
                        colorCounts[color]++;
                    } else {
                        colorCounts[color] = 1;
                    }
                });

                // Count grouped colors
                const groupedColors = typeof entry.GROUPED_COLOR === 'string' ? entry.GROUPED_COLOR.split(' | ') : [entry.GROUPED_COLOR];
                groupedColors.forEach(groupedColor => {
                    if (groupedColorCounts[groupedColor]) {
                        groupedColorCounts[groupedColor]++;
                    } else {
                        groupedColorCounts[groupedColor] = 1;
                    }
                });
            });

            // Sort data by ID in descending order
            data.sort((a, b) => b.ID - a.ID);

            // Convert counts to arrays for Chartist.js and sort them
            const sortedBrandCounts = sortCountsMobile(brandCounts);
            const sortedMakeCounts = sortCountsMobile(makeCounts);
            const sortedYearCounts = sortCountsMobile(yearCounts);
            const sortedByearCounts = sortCountsMobile(byearCounts);
            const sortedColorCounts = sortCountsMobile(colorCounts);
            const sortedGroupedColorCounts = sortCountsMobile(groupedColorCounts);

            // Slice the top 10 for the mobile graph
            const topMakeCounts = sortedMakeCounts.slice(0, 10);
            const topColorCounts = sortedColorCounts.slice(0, 10);
            const topGroupedColorCounts = sortedGroupedColorCounts.slice(0, 10);

            const brandLabels = sortedBrandCounts.map(item => item[0]);
            const brandData = sortedBrandCounts.map(item => item[1]);

            const makeLabels = topMakeCounts.map(item => item[0]);
            const makeData = topMakeCounts.map(item => item[1]);

            const yearLabels = sortedYearCounts.map(item => item[0]);
            const yearData = sortedYearCounts.map(item => item[1]);

            const byearLabels = sortedByearCounts.map(item => item[0]);
            const byearData = sortedByearCounts.map(item => item[1]);

            const colorLabels = topColorCounts.map(item => item[0]);
            const colorData = topColorCounts.map(item => item[1]);

            const groupedColorLabels = topGroupedColorCounts.map(item => item[0]);
            const groupedColorData = topGroupedColorCounts.map(item => item[1]);

            // Create brand chart
            new Chartist.Bar('#mobileBrandChart', {
                labels: brandLabels,
                series: [brandData]
            }, {
                axisY: {
                    onlyInteger: true,
                    offset: 20
                },
                plugins: [
                    Chartist.plugins.ctAxisTitle({
                        axisX: {
                            axisTitle: 'Brand',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: 50
                            },
                            textAnchor: 'middle'
                        },
                        axisY: {
                            axisTitle: 'Count',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: -1
                            },
                            textAnchor: 'middle',
                            flipTitle: true
                        }
                    })
                ]
            });

            // Create make chart
            new Chartist.Bar('#mobileMakeChart', {
                labels: makeLabels,
                series: [makeData]
            }, {
                axisY: {
                    onlyInteger: true,
                    offset: 20
                },
                plugins: [
                    Chartist.plugins.ctAxisTitle({
                        axisX: {
                            axisTitle: 'Make',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: 50
                            },
                            textAnchor: 'middle'
                        },
                        axisY: {
                            axisTitle: 'Count',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: -1
                            },
                            textAnchor: 'middle',
                            flipTitle: true
                        }
                    })
                ]
            });

            // Create year chart
            new Chartist.Bar('#mobileYearChart', {
                labels: yearLabels,
                series: [yearData]
            }, {
                axisY: {
                    onlyInteger: true,
                    offset: 20
                },
                plugins: [
                    Chartist.plugins.ctAxisTitle({
                        axisX: {
                            axisTitle: 'Year',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: 50
                            },
                            textAnchor: 'middle'
                        },
                        axisY: {
                            axisTitle: 'Count',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: -1
                            },
                            textAnchor: 'middle',
                            flipTitle: true
                        }
                    })
                ]
            });

            // Create BYEAR chart
            new Chartist.Bar('#mobileByearChart', {
                labels: byearLabels,
                series: [byearData]
            }, {
                axisY: {
                    onlyInteger: true,
                    offset: 20
                },
                plugins: [
                    Chartist.plugins.ctAxisTitle({
                        axisX: {
                            axisTitle: 'BYEAR',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: 50
                            },
                            textAnchor: 'middle'
                        },
                        axisY: {
                            axisTitle: 'Count',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: -1
                            },
                            textAnchor: 'middle',
                            flipTitle: true
                        }
                    })
                ]
            });

            // Create color chart
            new Chartist.Bar('#mobileColorChart', {
                labels: colorLabels,
                series: [colorData]
            }, {
                axisY: {
                    onlyInteger: true,
                    offset: 20
                },
                plugins: [
                    Chartist.plugins.ctAxisTitle({
                        axisX: {
                            axisTitle: 'Color',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: 50
                            },
                            textAnchor: 'middle'
                        },
                        axisY: {
                            axisTitle: 'Count',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: -1
                            },
                            textAnchor: 'middle',
                            flipTitle: true
                        }
                    })
                ]
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

// Function to sort counts
const sortCountsMobile = (counts) => {
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
};