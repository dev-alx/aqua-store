// Global variables
let allProducts = [];
let currentProduct = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        
        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allProducts = await response.json();
        
        // Populate category filter
        populateCategoryFilter();
        
        // Display all products initially
        displayProducts(allProducts);
        
        // Update results count
        updateResultsCount(allProducts.length);
    } catch (error) {
        console.error('Error loading products:', error);
        showError();
    }
}

// Populate category filter dropdown
function populateCategoryFilter() {
    const categories = [...new Set(allProducts.map(p => p.categoria))];
    const categoryFilter = document.getElementById('category-filter');
    
    // Sort categories alphabetically (opcional)
    categories.sort();
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Display products in the grid
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <h3>😔 No se encontraron productos</h3>
                <p>Intenta cambiar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="openModal('${product.codigo}')">
            <div class="product-image-container">
                <img class="product-image" src="${product.fotos[0]}" alt="${product.nombre}">
                <span class="product-code">${product.codigo}</span>
                <span class="product-status ${product.estado}">${product.estado}</span>
            </div>
            <div class="product-info">
                <span class="product-category">${product.categoria}</span>
                <h3 class="product-name">${product.nombre}</h3>
                <p class="product-description">${product.descripcion}</p>
                <div class="product-footer">
                    <span class="product-price">$${formatPrice(product.precio)}</span>
                    <span class="product-images-count">📷 ${product.fotos.length} fotos</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Format price with thousands separator
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Setup event listeners for filters
function setupEventListeners() {
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    
    categoryFilter.addEventListener('change', filterProducts);
    statusFilter.addEventListener('change', filterProducts);
    searchInput.addEventListener('input', filterProducts);
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Filter products based on selected filters
function filterProducts() {
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    let filtered = allProducts;
    
    // Filter by category
    if (categoryFilter) {
        filtered = filtered.filter(p => p.categoria === categoryFilter);
    }
    
    // Filter by status
    if (statusFilter) {
        filtered = filtered.filter(p => p.estado === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm) ||
            p.descripcion.toLowerCase().includes(searchTerm) ||
            p.codigo.toLowerCase().includes(searchTerm) ||
            p.categoria.toLowerCase().includes(searchTerm)
        );
    }
    
    displayProducts(filtered);
    updateResultsCount(filtered.length);
}

// Update results count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    resultsCount.textContent = `Mostrando ${count} producto${count !== 1 ? 's' : ''}`;
}

// Open product modal
function openModal(codigo) {
    currentProduct = allProducts.find(p => p.codigo === codigo);
    if (!currentProduct) return;
    
    const modal = document.getElementById('product-modal');
    
    // Set product details
    document.getElementById('modal-code').textContent = currentProduct.codigo;
    document.getElementById('modal-title').textContent = currentProduct.nombre;
    document.getElementById('modal-category').textContent = currentProduct.categoria;
    document.getElementById('modal-description').textContent = currentProduct.descripcion;
    document.getElementById('modal-price').textContent = `$${formatPrice(currentProduct.precio)}`;
    
    const statusElement = document.getElementById('modal-status');
    statusElement.textContent = currentProduct.estado;
    statusElement.className = `modal-status ${currentProduct.estado}`;
    
    // Set main image
    document.getElementById('modal-main-img').src = currentProduct.fotos[0];
    
    // Set thumbnails
    const thumbnailsContainer = document.getElementById('modal-thumbnails');
    thumbnailsContainer.innerHTML = currentProduct.fotos.map((foto, index) => `
        <div class="modal-thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${foto}', event)">
            <img src="${foto}" alt="${currentProduct.nombre}">
        </div>
    `).join('');
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Change main image in modal
function changeMainImage(imageUrl, event) {
    document.getElementById('modal-main-img').src = imageUrl;
    
    // Update active thumbnail
    document.querySelectorAll('.modal-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Contact via WhatsApp
function contactWhatsApp() {
    if (!currentProduct) return;
    
    const message = `Hola, me interesa el producto:\n\n` +
                   `Código: ${currentProduct.codigo}\n` +
                   `Nombre: ${currentProduct.nombre}\n` +
                   `Precio: $${formatPrice(currentProduct.precio)}\n\n` +
                   `¿Está disponible?`;
    
    const whatsappNumber = '1234567890'; // Change this to your WhatsApp number
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
}

// Show error message
function showError() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
            <h3>❌ Error al cargar los productos</h3>
            <p>Por favor, verifica que el archivo products.json existe y es válido</p>
        </div>
    `;
}

