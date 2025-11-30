// Variável global de produtos (começa vazia e será preenchida pelo JSON)
let products = [];

// Variáveis de estado do sistema
let cart = [];
let filteredProducts = [];
let currentSort = 'relevance';
let currentCategory = 'all';
let productQuantities = {};
let productPeriods = {};

// Mapeamento de nomes de categorias
const categoryNames = {
    'all': 'Todos os Departamentos',
    'notebook': 'Notebooks',
    'camera': 'Câmeras e Filmadoras',
    'console': 'Videogames',
    'smartphone': 'Smartphones',
    'audio': 'Áudio e Som'
};

// --- 1. CARREGAMENTO DE DADOS (INTEGRAÇÃO COM O PHP/JSON) ---

// Função principal que inicia o sistema
async function loadProducts() {
    try {
        // Primeiro tenta carregar diretamente do Supabase client (client-side) se estiver configurado
        if (window.SUPABASE_CLIENT) {
            try {
                const { data, error } = await window.SUPABASE_CLIENT.from('products').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                products = Array.isArray(data) ? data : [];
                    console.log('[main] loaded products directly from SUPABASE_CLIENT, count:', products.length);
            } catch (e) {
                console.warn('[main] erro ao buscar direto no Supabase client, tentando /api/products fallback:', e.message || e);
                // fallback para endpoint serverless
                let response;
                try {
                    response = await fetch('/api/products?t=' + new Date().getTime());
                } catch (err) {
                    response = null;
                }

                if (!response || !response.ok) {
                    // fallback para arquivo estático
                    const fallback = await fetch('products.json?t=' + new Date().getTime());
                    if (!fallback.ok) throw new Error('Não foi possível carregar os produtos do servidor nem do arquivo local');
                    products = await fallback.json();
                        console.log('[main] loaded products from products.json, count:', Array.isArray(products) ? products.length : 0);
                } else {
                    const body = await response.json();
                    products = body && body.data ? body.data : [];
                        console.log('[main] loaded products from /api/products, count:', Array.isArray(products) ? products.length : 0, ' body:', body);
                }
            }
        } else {
            // Sem cliente Supabase, usa API serverless e depois fallback local
            let response;
            try {
                response = await fetch('/api/products?t=' + new Date().getTime());
            } catch (e) {
                response = null;
            }

            if (!response || !response.ok) {
                const fallback = await fetch('products.json?t=' + new Date().getTime());
                if (!fallback.ok) throw new Error('Não foi possível carregar os produtos do servidor nem do arquivo local');
                products = await fallback.json();
                    console.log('[main] loaded products from products.json, count:', Array.isArray(products) ? products.length : 0);
            } else {
                const body = await response.json();
                products = body && body.data ? body.data : [];
                    console.log('[main] loaded products from /api/products, count:', Array.isArray(products) ? products.length : 0, ' body:', body);
            }
        }

        // Inicializa a lista filtrada com todos os produtos
        filteredProducts = [...products];

        // Inicializa as quantidades e períodos padrão para cada produto carregado
        products.forEach(product => {
            productQuantities[product.id] = 1;
            productPeriods[product.id] = 1;
        });

        // Renderiza a tela inicial
        renderProducts();

        // Após renderizar, atualiza os preços iniciais na interface
        setTimeout(() => {
            products.forEach(product => {
                if (product.status === 'available') {
                    updateProductPrice(product.id);
                    // Desabilita o botão de menos inicialmente
                    const minusBtn = document.querySelector(`[onclick="changeQuantity('${product.id}', -1)"]`);
                    if (minusBtn) minusBtn.disabled = true;
                }
            });
        }, 100);

    } catch (error) {
        console.error('Erro:', error);
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-16 text-red-500">
                    <h3 class="text-xl font-bold">Erro de conexão</h3>
                    <p>Não foi possível carregar os produtos do servidor. Verifique se o arquivo products.json existe.</p>
                </div>
            `;
        }
    }
}

// Helper para gerar IDs válidos no DOM a partir de UUIDs/strings
function safeId(id) {
    return String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
}

// --- 2. LÓGICA DE PRODUTOS (PREÇOS E QUANTIDADES) ---

// Função para mudar quantidade
function changeQuantity(productId, change) {
    const currentQty = productQuantities[productId] || 1;
    const newQty = Math.max(1, Math.min(10, currentQty + change));

    productQuantities[productId] = newQty;

    const idSafe = safeId(productId);
    const qtyDisplay = document.getElementById(`qty-${idSafe}`);
    if (qtyDisplay) qtyDisplay.textContent = newQty;

    const minusBtn = document.querySelector(`[onclick="changeQuantity('${productId}', -1)"]`);
    const plusBtn = document.querySelector(`[onclick="changeQuantity('${productId}', 1)"]`);

    if (minusBtn) minusBtn.disabled = newQty <= 1;
    if (plusBtn) plusBtn.disabled = newQty >= 10;

    updateProductPrice(productId);
}

// Função para atualizar preço do produto baseado na quantidade e período
function updateProductPrice(productId) {
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;

    const quantity = productQuantities[productId] || 1;
    const idSafe = safeId(productId);
    const periodSelect = document.getElementById(`period-${idSafe}`);
    const period = periodSelect ? parseInt(periodSelect.value) : 1;

    productPeriods[productId] = period;

    let periodMultiplier = period;
    // Lógica de desconto por período
    if (period >= 30) {
        periodMultiplier = period * 0.8; // 20% desconto mensal
    } else if (period >= 7) {
        periodMultiplier = period * 0.9; // 10% desconto semanal
    }

    const totalPrice = product.price * quantity * periodMultiplier;

    const totalDisplay = document.getElementById(`total-${idSafe}`);
    if (totalDisplay) {
        const totalAmount = totalDisplay.querySelector('.total-amount');
        if (totalAmount) totalAmount.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    }
}

// Função para obter nome do período formatado
function getPeriodName(days) {
    if (days === 1) return '1 dia';
    if (days === 3) return '3 dias';
    if (days === 7) return '1 semana';
    if (days === 30) return '1 mês';
    return `${days} dias`;
}

// Função para gerar as estrelas de avaliação HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '⭐';
    }
    if (halfStar) {
        starsHtml += '✨';
    }
    return starsHtml;
}

// --- 3. FILTROS E NAVEGAÇÃO ---

// Função para filtrar por categoria ao clicar nos links de navegação
function filterByCategory(category) {
    currentCategory = category;

    const breadcrumbCategory = document.getElementById('currentCategory');
    if (breadcrumbCategory) {
        if (category === 'all') {
            breadcrumbCategory.textContent = 'Aluguel de Tecnologia';
        } else {
            breadcrumbCategory.textContent = categoryNames[category] || category;
        }
    }

    updateSidebarFilters(category);
    updateActiveNavItem(category);
    filterProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função para atualizar os checkboxes da sidebar baseado na categoria selecionada
function updateSidebarFilters(category) {
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="cat-"]');
    allCheckboxes.forEach(cb => cb.checked = false);

    if (category === 'all') {
        const catAll = document.getElementById('cat-all');
        if (catAll) catAll.checked = true;
    } else {
        const catSpecific = document.getElementById(`cat-${category}`);
        if (catSpecific) catSpecific.checked = true;
    }
}

// Função para destacar o item ativo na navegação
function updateActiveNavItem(category) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    const activeItem = Array.from(navItems).find(item => {
        const onclick = item.getAttribute('onclick');
        if (!onclick) return false;

        if (category === 'all' && onclick.includes("'all'")) return true;
        if (category !== 'all' && onclick.includes(`'${category}'`)) return true;
        return false;
    });

    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Função principal de filtragem
function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const priceMinInput = document.getElementById('priceMin');
    const priceMaxInput = document.getElementById('priceMax');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const minPrice = priceMinInput ? (parseFloat(priceMinInput.value) || 0) : 0;
    const maxPrice = priceMaxInput ? (parseFloat(priceMaxInput.value) || Infinity) : Infinity;

    const selectedCategories = Array.from(document.querySelectorAll('input[type="checkbox"][id^="cat-"]:checked')).map(cb => cb.value).filter(Boolean);
    const selectedStatus = Array.from(document.querySelectorAll('input[type="checkbox"][id^="status-"]:checked')).map(cb => cb.value).filter(Boolean);

    filteredProducts = products.filter(product => {
        // Filtro de Texto
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);

        // Filtro de Categoria
        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.includes(product.category) ||
            (selectedCategories.length === 0 && currentCategory === 'all') ||
            (currentCategory !== 'all' && product.category === currentCategory);

        // Filtro de Status e Preço
        const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(product.status);
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });

    sortProducts();
}

// Função de Ordenação
function sortProducts() {
    const sortOption = document.getElementById('sortOptions');
    const sortValue = sortOption ? sortOption.value : 'relevance';

    filteredProducts.sort((a, b) => {
        if (sortValue === 'price-low') {
            return a.price - b.price;
        } else if (sortValue === 'price-high') {
            return b.price - a.price;
        } else if (sortValue === 'name') {
            return a.name.localeCompare(b.name);
        }
        return 0;
    });

    renderProducts();
}

// --- 4. RENDERIZAÇÃO (UI) ---

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');

    // Segurança caso o DOM não esteja pronto
    if (!grid) return;

    grid.innerHTML = '';

    // Atualiza contador de resultados
    if (resultsCount) {
        if (currentCategory === 'all') {
            resultsCount.textContent = `Mostrando ${filteredProducts.length} de ${products.length} produtos`;
        } else {
            const categoryTotal = products.filter(p => p.category === currentCategory).length;
            resultsCount.textContent = `Mostrando ${filteredProducts.length} de ${categoryTotal} produtos em ${categoryNames[currentCategory]}`;
        }
    }

    // Caso não haja produtos
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-16 text-gray-400">
                <h3 class="text-xl font-semibold mb-4 text-gray-600">🔍 Nenhum produto encontrado</h3>
                <p class="text-base mb-8">Tente ajustar os filtros ou buscar por outros termos.</p>
            </div>
        `;
        return;
    }

    // Loop de renderização dos cards
    filteredProducts.forEach(product => {
        const badgeClass = product.status === 'available'
            ? 'bg-green-100/10 text-green-600 border-green-200/20'
            : 'bg-red-100/10 text-red-500 border-red-200/20';
        const badgeText = product.status === 'available' ? '✅ Disponível' : '❌ Indisponível';
        const buttonDisabled = product.status === 'rented' ? 'disabled' : '';
        const reviewsCount = product.reviews || 0;
        const idSafe = safeId(product.id);

        // HTML do Card do Produto
        const productCard = `
            <div class="product-card bg-white rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-gray-100 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-transparent">
                <div class="w-full h-48 overflow-hidden flex items-center justify-center mb-4 relative rounded-xl bg-gray-50">
                    <img src="${product.image}" alt="${product.name}"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik04NyA4N2gyNnYyNkg4N1Y4N3oiIGZpbGw9IiNkMWQ1ZGIiLz4KPHA+'"
                         class="w-full h-full object-contain transition-transform duration-300 hover:scale-105">
                    <span class="product-badge absolute top-3 right-3 px-3 py-1 rounded-xl text-xs font-semibold uppercase glass-light border ${badgeClass}">${badgeText}</span>
                </div>
                <h2 class="text-base font-semibold text-gray-800 mb-3 leading-5 transition-colors duration-200 hover:text-primary">${product.name}</h2>
                <div class="flex items-center gap-2 mb-3 text-sm">
                    <span class="text-yellow-500 text-base">${generateStars(product.rating)}</span>
                    <span class="text-gray-400 text-xs">(${reviewsCount} avaliações)</span>
                </div>
                <div class="flex items-baseline gap-2 mb-4">
                    <span class="price-gradient text-2xl font-bold">R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
                    <span class="text-sm text-gray-400 font-medium">/ ${product.period || 'dia'}</span>
                </div>
                <p class="text-sm text-gray-600 mb-4 leading-6 line-clamp-2">${product.description}</p>
                <div class="mb-4">
                        <select id="period-${idSafe}" onchange="updateProductPrice('${product.id}')"
                            class="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white transition-colors duration-200 focus:outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/10">
                        <option value="1">1 dia</option>
                        <option value="3">3 dias</option>
                        <option value="7">1 semana (-10%)</option>
                        <option value="30">1 mês (-20%)</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="text-sm font-medium text-gray-600 block mb-2">Quantidade:</label>
                    <div class="flex items-center gap-3">
                        <button type="button" onclick="changeQuantity('${product.id}', -1)"
                                class="w-8 h-8 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-center font-semibold text-gray-600 transition-all duration-200 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                ${product.status === 'rented' ? 'disabled' : ''}>-</button>
                        <span class="min-w-8 text-center font-semibold text-gray-800" id="qty-${idSafe}">1</span>
                        <button type="button" onclick="changeQuantity('${product.id}', 1)"
                                class="w-8 h-8 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-center font-semibold text-gray-600 transition-all duration-200 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                ${product.status === 'rented' ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                <div class="flex justify-between items-center mb-4 px-3 py-3 bg-gray-50 rounded-lg text-sm" id="total-${idSafe}">
                    <span class="font-medium text-gray-600">Total:</span>
                    <span class="total-amount font-bold text-primary text-base">R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</span>
                </div>
                <button onclick="addToCart('${product.id}')"
                        class="${product.status === 'rented' ? 'bg-gray-400 cursor-not-allowed' : 'btn-gradient-primary hover:-translate-y-0.5 hover:shadow-lg'} w-full px-3 py-3.5 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 uppercase tracking-wide"
                        ${buttonDisabled}>
                    ${product.status === 'rented' ? '❌ Indisponível' : '🛒 Adicionar ao carrinho'}
                </button>
            </div>
        `;
        grid.innerHTML += productCard;
    });
}

// --- 5. LÓGICA DO CARRINHO ---

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product && product.status === 'available') {
        const quantity = productQuantities[productId] || 1;
        const period = productPeriods[productId] || 1;
        const periodName = getPeriodName(period);

        let periodMultiplier = period;
        if (period >= 30) {
            periodMultiplier = period * 0.8;
        } else if (period >= 7) {
            periodMultiplier = period * 0.9;
        }

        const unitPrice = product.price * periodMultiplier;

        const existingItemIndex = cart.findIndex(item =>
            item.id === productId &&
            item.selectedPeriod === period
        );

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity: quantity,
                selectedPeriod: period,
                selectedPeriodName: periodName,
                unitPrice: unitPrice,
                originalPrice: product.price
            });
        }

        updateCartCount();
        openCart();
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) cartCountEl.textContent = count;
}

function openCart() {
    const cartModal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartModal || !cartItems || !cartTotal) return;

    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <p class="text-base mb-8">🛒 Seu carrinho está vazio</p>
                <p>Adicione produtos para começar seu aluguel</p>
            </div>
        `;
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.unitPrice * item.quantity;
            total += itemTotal;

            let discountInfo = '';
            if (item.selectedPeriod >= 30) {
                discountInfo = '<span class="text-green-600 text-xs">📅 20% desconto mensal</span>';
            } else if (item.selectedPeriod >= 7) {
                discountInfo = '<span class="text-green-600 text-xs">📅 10% desconto semanal</span>';
            }

            const cartItemHtml = `
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4 py-6 border-b border-gray-100 last:border-b-0">
                    <div class="flex-1">
                        <div class="font-semibold mb-2 text-gray-800">${item.name}</div>
                        <div class="text-sm text-gray-600 leading-6 mb-3">
                            Quantidade: ${item.quantity} | Período: ${item.selectedPeriodName}<br>
                            Preço unitário: R$ ${parseFloat(item.originalPrice).toFixed(2)},00/dia | Total período: R$ ${item.unitPrice.toFixed(2).replace('.', ',')}
                            ${discountInfo ? '<br>' + discountInfo : ''}
                        </div>
                        <div class="flex items-center gap-3">
                            <button onclick="updateCartItemQuantity(${index}, -1)"
                                    class="w-7 h-7 border border-gray-300 bg-white rounded-sm cursor-pointer flex items-center justify-center text-xs font-semibold transition-all duration-200 hover:border-primary hover:text-primary disabled:opacity-50"
                                    ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span class="min-w-6 text-center font-semibold text-sm">${item.quantity}</span>
                            <button onclick="updateCartItemQuantity(${index}, 1)"
                                    class="w-7 h-7 border border-gray-300 bg-white rounded-sm cursor-pointer flex items-center justify-center text-xs font-semibold transition-all duration-200 hover:border-primary hover:text-primary">+</button>
                        </div>
                    </div>
                    <div class="flex flex-row sm:flex-col justify-between sm:items-end items-center gap-3 w-full sm:w-auto">
                        <div class="text-lg font-bold text-primary">R$ ${itemTotal.toFixed(2).replace('.', ',')}</div>
                        <button onclick="removeFromCart(${index})"
                                class="bg-none border border-gray-300 text-gray-600 px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-all duration-200 uppercase hover:bg-red-500 hover:text-white hover:border-red-500">
                            Remover
                        </button>
                    </div>
                </div>
            `;
            cartItems.innerHTML += cartItemHtml;
        });
    }

    cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    cartModal.style.display = 'block';
}

function updateCartItemQuantity(itemIndex, change) {
    if (itemIndex >= 0 && itemIndex < cart.length) {
        const newQuantity = Math.max(1, cart[itemIndex].quantity + change);
        cart[itemIndex].quantity = newQuantity;
        updateCartCount();
        openCart();
    }
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) cartModal.style.display = 'none';
}

function removeFromCart(itemIndex) {
    if (itemIndex >= 0 && itemIndex < cart.length) {
        cart.splice(itemIndex, 1);
        updateCartCount();
        openCart();
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    alert('Redirecionando para a página de checkout...');
    closeCart();
}

// --- 6. EVENT LISTENERS E INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    // Carrega os dados do JSON ao iniciar
    loadProducts();

    // Listener de Busca (Debounced para performance)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            setTimeout(filterProducts, 300);
        });
    }

    // Listeners de Preço
    const priceInputs = document.querySelectorAll('#priceMin, #priceMax');
    priceInputs.forEach(input => {
        input.addEventListener('input', () => {
            setTimeout(filterProducts, 500);
        });
    });

    // Listeners do Modal do Carrinho
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                closeCart();
            }
        });
    }

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });

    // Verificar estado de login na home
    const user = localStorage.getItem('user');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');

    if (user && loginLink && registerLink) {
        // Usuário logado: substituir Login por "Meu Painel" e esconder Registrar
        loginLink.innerHTML = '👤 Meu Painel';
        loginLink.href = './dashboard_logged/index.html';
        registerLink.style.display = 'none';

        // Adicionar botão de sair
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.className = 'nav-item text-gray-600 no-underline px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap font-medium hover:text-danger hover:bg-red-50';
        logoutLink.innerHTML = '🚪 Sair';
        logoutLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.reload();
        };

        loginLink.parentNode.appendChild(logoutLink);
    }
});

