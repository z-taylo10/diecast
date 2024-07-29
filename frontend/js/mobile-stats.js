document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/diecast')
        .then(response => response.json())
        .then(data => {
            // Sort data by ID in descending order
            data.sort((a, b) => b.ID - a.ID);

            // Convert counts to arrays for Chartist.js and sort them
            const sortedBrandCounts = sortCounts(brandCounts);
            const sortedMakeCounts = sortCounts(makeCounts);
            const sortedYearCounts = sortCounts(yearCounts);
            const sortedByearCounts = sortCounts(byearCounts);
            const sortedColorCounts = sortCounts(colorCounts);
            const sortedGroupedColorCounts = sortCounts(groupedColorCounts);

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
const sortCounts = (counts) => {
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
};