// =========================================
// LÓGICA DE INTERACCIÓN Y CATÁLOGO DINÁMICO
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DE INTERFAZ ---
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelectorAll('#navMenu a');
    
    const productGrid = document.querySelector('.product-grid'); // Contenedor del catálogo

    const searchToggle = document.getElementById('searchToggle'); 
    const mobileSearchOverlay = document.getElementById('mobileSearchOverlay'); 
    const closeSearchBtn = document.getElementById('closeSearchBtn'); 
    const searchInputFloat = document.getElementById('searchInputFloat'); 
    
    // Botón del Hero (Ver Paletas Top)
    const heroButton = document.querySelector('.btn-hero'); 

    // ** IMPORTANTE: PEGA AQUÍ LA URL CSV DE TU HOJA DE GOOGLE SHEETS **
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQ8C5Zaqbzrr5kH66ewK9_-GfwM0ELXODsNE3oTmSHS6M96kzKpS6gwNf1WItl9pce234KcWXVEmMu/pub?output=csv'
    let PRODUCTS_DATA = []; // Almacenará los productos cargados del CSV


    // ----------------------------------------
    // I. CARGA Y RENDERIZADO DEL CATÁLOGO
    // ----------------------------------------

    /** Carga los datos del CSV, los parsea y llama al filtro inicial. */
    async function loadCatalog() {
        try {
            productGrid.innerHTML = '<p>Cargando catálogo, un momento...</p>';
            
            // 1. Obtener el archivo CSV
            const response = await fetch(CSV_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();

            // 2. Parsear el CSV a un array de objetos
            PRODUCTS_DATA = parseCsv(csvText); 

            // 3. NUEVA LÓGICA: DETECCIÓN DE PÁGINA Y FILTRO INICIAL
            const currentPath = window.location.pathname.toLowerCase();
            let initialFilter = 'all';

            // Comprobamos si la URL contiene 'paletas.html' (o el nombre que uses)
            if (currentPath.includes('paletas.html')) {
                initialFilter = 'paleta'; 
            }
            
            // Renderiza la vista inicial (filtrada o completa)
            filterProductsByCategory(initialFilter);

        } catch (error) {
            console.error("Error al cargar o parsear el catálogo:", error);
            productGrid.innerHTML = '<p style="color: red;">⚠️ Error al cargar el catálogo. Por favor, revisa la URL del CSV y la conexión.</p>';
        }
    }

    /** Crea y muestra las tarjetas de producto en el grid. */
    function renderProducts(productsToRender) {
        productGrid.innerHTML = ''; // Limpiar el contenedor
        
        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p>No se encontraron productos que coincidan con la búsqueda.</p>';
            return;
        }

        productsToRender.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-id', producto.id);
            
            // Reemplazar espacios vacíos con placeholder si faltan datos
            const name = producto.nombre || 'Producto sin nombre';
            const price = producto.precio || 'Consultar';
            const desc = producto.descripcion || 'Descripción no disponible.';
            // Asegúrate de usar la columna 'imagen_url'
            const imgUrl = producto.img_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen'; 

            // Construcción del HTML de la tarjeta
            card.innerHTML = `
                <img src="${imgUrl}" alt="${name}">
                <h3>${name}</h3>
                <p class="price">$${price}</p>
                <p class="desc">${desc}</p>
                <button class="btn-detail" data-id="${producto.id}">Ver Detalle</button>
            `;
            productGrid.appendChild(card);
        });

        // Asegurarse de que los nuevos botones tengan el event listener
        initDetailButtons(); 
    }

    // ----------------------------------------
    // II. FUNCIONALIDAD DE FILTRADO GENERAL
    // ----------------------------------------

    /** Filtra y renderiza productos según una categoría específica. */
    function filterProductsByCategory(category) {
        if (!category || category === 'all') {
            // Mostrar todos si no hay filtro o es 'all'
            renderProducts(PRODUCTS_DATA);
            return;
        }
        
        // Filtramos el array global (PRODUCTS_DATA)
        const filteredResults = PRODUCTS_DATA.filter(producto => {
            // IMPORTANTE: Busca la columna 'categoria' en tu Google Sheet
            return producto.categoria && producto.categoria.toLowerCase() === category.toLowerCase();
        });

        // Renderizamos los resultados filtrados
        renderProducts(filteredResults);
        
        // Volvemos a asignar los event listeners a los nuevos botones de detalle
        initDetailButtons(); 
    }

    // ----------------------------------------
    // III. FUNCIONALIDAD DEL BUSCADOR (FILTRADO POR TEXTO)
    // ----------------------------------------

    /** Maneja la lógica de búsqueda y filtrado del catálogo. */
    function handleSearchFloat() {
        // ... (Tu código handleSearchFloat se mantiene igual)
        const query = searchInputFloat.value.trim().toLowerCase();
        
        if (query.length > 0) {
            const resultados = PRODUCTS_DATA.filter(producto => {
                const searchString = `${producto.nombre} ${producto.descripcion}`.toLowerCase();
                return searchString.includes(query);
            });
            renderProducts(resultados);
            
            mobileSearchOverlay.classList.remove('active');
            searchInputFloat.value = '';

        } else {
            // Si el campo está vacío, restauramos todos los productos
            filterProductsByCategory('all'); // Usamos el filtro 'all' para restaurar la vista original
            mobileSearchOverlay.classList.remove('active');
        }
    }

    // ----------------------------------------
    // IV. FUNCIONALIDAD DEL BOTÓN "VER DETALLE"
    // ----------------------------------------

    /** Asigna el listener de click a todos los botones 'Ver Detalle'. */
    function initDetailButtons() {
        const detailButtons = document.querySelectorAll('.btn-detail');
        detailButtons.forEach(button => {
            button.removeEventListener('click', handleDetailClick); 
            button.addEventListener('click', handleDetailClick);
        });
    }

    /** Muestra la información del producto seleccionado (Simulación). */
    function handleDetailClick(e) {
        // ... (Tu código handleDetailClick se mantiene igual)
        const productId = e.currentTarget.getAttribute('data-id'); 
        const productInfo = PRODUCTS_DATA.find(p => p.id === productId);

        if (productInfo) {
            alert(`--- DETALLE DEL PRODUCTO ---\n\nID: ${productInfo.id}\nNombre: ${productInfo.nombre}\nPrecio: $${productInfo.precio}\nDescripción: ${productInfo.descripcion}\n\nAquí se debería cargar una ventana modal (popup) con más fotos, especificaciones técnicas y un enlace directo a WhatsApp para ese producto.`);
        } else {
            alert(`No se encontró información para el producto ID: ${productId}`);
        }
    }

    // ----------------------------------------
    // V. FUNCIONES AUXILIARES (Parser Básico CSV)
    // ----------------------------------------

    /** Convierte el texto CSV en un array de objetos JavaScript. */
    function parseCsv(csvText) {
        // ... (Tu código parseCsv se mantiene igual)
        const rows = csvText.trim().split('\n');
        const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
        const data = [];
        
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',');
            const item = {};
            headers.forEach((header, index) => {
                item[header] = values[index] ? values[index].trim() : '';
            });
            
            if (item.id) {
                data.push(item);
            }
        }
        return data;
    }


    // ----------------------------------------
    // VI. EVENTOS DE INTERFAZ Y FILTRADO
    // ----------------------------------------
    
    // 1. Carga inicial del catálogo (¡ahora usa la nueva lógica de filtro!)
    loadCatalog(); 

    // 2. Eventos del Botón del Hero ("VER PALETAS TOP")
    if (heroButton) {
        heroButton.addEventListener('click', (e) => {
            const filterCategory = e.currentTarget.getAttribute('data-filter');
            
            // Opcional: Desplazarse al grid de productos
            document.querySelector('.product-grid').scrollIntoView({ behavior: 'smooth' });

            // Ejecutar la función de filtrado
            filterProductsByCategory(filterCategory);
        });
    }

    // 3. Eventos del Menú Hamburguesa
    // ... (Tu código de eventos de menú y buscador se mantiene igual)
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileSearchOverlay.classList.remove('active'); 
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active') && window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });
    
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            mobileSearchOverlay.classList.add('active');
            navMenu.classList.remove('active');
            setTimeout(() => { searchInputFloat.focus(); }, 100); 
        });
    }
    
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            mobileSearchOverlay.classList.remove('active');
        });
    }

    const searchFloatButton = document.querySelector('.search-box-float button');
    if (searchFloatButton) {
        searchFloatButton.addEventListener('click', handleSearchFloat);
    }
    
    if (searchInputFloat) {
        searchInputFloat.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchFloat();
            }
        });
    }
});