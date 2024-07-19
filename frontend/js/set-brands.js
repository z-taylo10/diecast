document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/diecast')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => populateBrands(data))
        .catch(error => console.error('Error fetching data:', error));
});

function populateBrands(data) {
    const container = document.getElementById('set-brands');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    const brands = [...new Set(data.map(item => item.BRAND))];

    brands.forEach(brand => {
        const brandSection = document.createElement('div');
        brandSection.classList.add('brand-section');

        const brandLink = document.createElement('a');
        brandLink.href = `brand-sets.html?brand=${encodeURIComponent(brand)}`;
        brandLink.style.textDecoration = 'none'; // Remove underline
        brandLink.style.color = 'inherit'; // Inherit color

        const brandHeader = document.createElement('h3');
        brandHeader.textContent = brand;

        brandLink.appendChild(brandHeader);
        brandSection.appendChild(brandLink);
        container.appendChild(brandSection);
    });
}

function toggleMenu() {
    const navbar = document.getElementById('navbar').querySelector('ul');
    navbar.classList.toggle('show');
}