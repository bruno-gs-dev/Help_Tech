        // Static fallback product list (used only if API fetch fails)
        const staticProducts = [
            {
                id: 1,
                name: "Apple MacBook Pro 16\" M3 Pro - 18GB RAM, 512GB SSD",
                category: "notebook",
                price: 89,
                period: "dia",
                status: "available",
                description: "Notebook profissional para edição de vídeo e desenvolvimento",
                image: "../assets/img/macbook.jpg",
                rating: 4.8,
                reviews: 127
            },
            {
                id: 2,
                name: "Canon EOS R6 Mark II + Lente 24-105mm f/4L IS USM",
                category: "camera",
                price: 135,
                period: "dia",
                status: "available",
                description: "Câmera mirrorless full-frame profissional com estabilização",
                image: "../assets/img/camera_canon.jpg",
                rating: 4.9,
                reviews: 89
            },
            {
                id: 3,
                name: "Sony PlayStation 5 + 2 Controles + 5 Jogos",
                category: "console",
                price: 55,
                period: "dia",
                status: "rented",
                description: "Console next-gen com jogos exclusivos e ray tracing",
                image: "../assets/img/ps5.jpg",
                rating: 4.7,
                reviews: 234
            },
            {
                id: 4,
                name: "iPhone 15 Pro Max 256GB Titânio Natural",
                category: "smartphone",
                price: 180,
                period: "dia",
                status: "available",
                description: "Smartphone premium com câmera profissional ProRAW",
                image: "../assets/img/iphone.jpg",
                rating: 4.6,
                reviews: 156
            },
            {
                id: 5,
                name: "Smartphone Samsung Galaxy S25 Ultra 5G 256GB",
                category: "smartphone",
                price: 175,
                period: "dia",
                status: "available",
                description: "A Samsung apresenta o mais novo lançamento da linha S. Seu verdadeiro aliado AI",
                image: "../assets/img/samsung.png",
                rating: 4.9,
                reviews: 67
            },
            {
                id: 6,
                name: "Microsoft Xbox Series X + Game Pass Ultimate",
                category: "console",
                price: 48,
                period: "dia",
                status: "available",
                description: "Console 4K com acesso a mais de 100 jogos",
                image: "../assets/img/xbox.png",
                rating: 4.5,
                reviews: 198
            },
            {
                id: 7,
                name: "Dell XPS 13 Plus - Intel i7 12th Gen, 16GB, 1TB SSD",
                category: "notebook",
                price: 120,
                period: "dia",
                status: "available",
                description: "Ultrabook premium com tela OLED 4K e design sem bordas",
                image: "../assets/img/dell.jpg",
                rating: 4.4,
                reviews: 94
            },
            {
                id: 10,
                name: "Nintendo Switch OLED + Pro Controller + 8 Jogos",
                category: "console",
                price: 42,
                period: "dia",
                status: "available",
                description: "Console híbrido com tela OLED e biblioteca completa de jogos",
                image: "../assets/img/switch.jpg",
                rating: 4.6,
                reviews: 267
            }
        ];

        // Runtime product list (populated from API or fallback)
        let products = [];

    // Fallback image (inline SVG) para quando não houver imagem
    const IMAGE_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik04NyA4N2gyNnYyNkg4N1Y4N3oiIGZpbGw9IiNkMWQ1ZGIiLz4KPHA+';

        let cart = [];
        // filteredProducts will contain the products currently shown (depends on login state)
        let filteredProducts = [];
        let currentSort = 'relevance';
        let currentCategory = 'all';
        let productQuantities = {};
        let productPeriods = {};

        // Função para mudar quantidade
        function changeQuantity(productId, change) 
        {
            const currentQty = productQuantities[productId] || 1;
            const newQty = Math.max(1, Math.min(10, currentQty + change));
            
            productQuantities[productId] = newQty;
            
            const qtyDisplay = document.getElementById(`qty-${productId}`);
            if (qtyDisplay) 
            {
                qtyDisplay.textContent = newQty;
            }
            
            const minusBtn = document.querySelector(`[onclick="changeQuantity(${productId}, -1)"]`);
            const plusBtn = document.querySelector(`[onclick="changeQuantity(${productId}, 1)"]`);
            
            if (minusBtn) minusBtn.disabled = newQty <= 1;
            if (plusBtn) plusBtn.disabled = newQty >= 10;
            
            updateProductPrice(productId);
        }

        // Função para atualizar preço do produto baseado na quantidade e período
        function updateProductPrice(productId) 
        {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            const quantity = productQuantities[productId] || 1;
            const periodSelect = document.getElementById(`period-${productId}`);
            const period = periodSelect ? parseInt(periodSelect.value) : 1;
            
            productPeriods[productId] = period;
            
            let periodMultiplier = period;
            if (period >= 30) 
            {
                periodMultiplier = period * 0.8;
            } 
            else if (period >= 7) 
            {
                periodMultiplier = period * 0.9;
            }
            
            const totalPrice = product.price * quantity * periodMultiplier;
            
            const totalDisplay = document.getElementById(`total-${productId}`);
            if (totalDisplay) 
            {
                const totalAmount = totalDisplay.querySelector('.total-amount');
                if (totalAmount) 
                {
                    totalAmount.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
                }
            }
        }

        // Função para obter nome do período formatado
        function getPeriodName(days) 
        {
            if (days === 1) return '1 dia';
            if (days === 3) return '3 dias';
            if (days === 7) return '1 semana';
            if (days === 30) return '1 mês';
            return `${days} dias`;
        }

        // Função para filtrar por categoria ao clicar nos links de navegação
        function filterByCategory(category) 
        {
            currentCategory = category;
            
            const breadcrumbCategory = document.getElementById('currentCategory');
            if (category === 'all') 
            {
                breadcrumbCategory.textContent = 'Aluguel de Tecnologia';
            } 
            
            else 
            {
                breadcrumbCategory.textContent = categoryNames[category] || category;
            }
            
            updateSidebarFilters(category);
            updateActiveNavItem(category);
            filterProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Função para atualizar os checkboxes da sidebar baseado na categoria selecionada
        function updateSidebarFilters(category) 
        {
            const allCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="cat-"]');
            allCheckboxes.forEach(cb => cb.checked = false);
            
            if (category === 'all') 
            {
                document.getElementById('cat-all').checked = true;
            } 
            
            else 
            {
                document.getElementById(`cat-${category}`).checked = true;
            }
        }

        // Função para destacar o item ativo na navegação
        function updateActiveNavItem(category) 
        {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            const activeItem = Array.from(navItems).find(item => 
            {
                const onclick = item.getAttribute('onclick');
                if (!onclick) return false;
                
                if (category === 'all' && onclick.includes("'all'")) return true;
                if (category !== 'all' && onclick.includes(`'${category}'`)) return true;
                return false;
            });
            
            if (activeItem) 
            {
                activeItem.classList.add('active');
            }
        }

        // Função para gerar as estrelas de avaliação
        function generateStars(rating) 
        {
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 !== 0;
            let starsHtml = '';
            for (let i = 0; i < fullStars; i++) 
            {
                starsHtml += '⭐';
            }
            if (halfStar) 
            {
                starsHtml += '✨';
            }
            return starsHtml;
        }

        // Retorna true se o usuário estiver logado
        function isLoggedIn() {
            try {
                return Boolean(localStorage.getItem('user'));
            } catch (e) {
                return false;
            }
        }

        // Atualiza a lista `filteredProducts` de acordo com o estado de login
        function updateDisplayedProducts() {
            if (isLoggedIn()) {
                // usuário logado vê todos os produtos (incluindo indisponíveis para gerenciamento)
                filteredProducts = [...products];
            } else {
                // usuário não logado vê apenas produtos disponíveis
                filteredProducts = products.filter(p => p.status === 'available');
            }
        }

        // Inicializa quantidades/periodos e aplica fallback de imagem
        function initProductState() {
            products.forEach(product => {
                productQuantities[product.id] = productQuantities[product.id] || 1;
                productPeriods[product.id] = productPeriods[product.id] || 1;
                if (!product.image) product.image = IMAGE_FALLBACK;
            });
        }

        // Carrega produtos do servidor (/api/products), com fallback para /products.json e por fim para staticProducts
        async function loadProducts() {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const json = await res.json();
                    // nossa API pode retornar { success, data }
                    const data = json && json.data ? json.data : json;
                    products = Array.isArray(data) ? data : (data ? [data] : []);
                    console.log('[dashboard_logged] loaded products from /api/products', products.length);
                } else {
                    throw new Error('API status ' + res.status);
                }
            } catch (e) {
                console.warn('[dashboard_logged] /api/products failed, trying /products.json', e);
                try {
                    const r2 = await fetch('/products.json');
                    if (r2.ok) {
                        const j2 = await r2.json();
                        products = j2;
                        console.log('[dashboard_logged] loaded products from /products.json', products.length);
                    } else {
                        products = staticProducts;
                        console.log('[dashboard_logged] using staticProducts fallback', products.length);
                    }
                } catch (e2) {
                    products = staticProducts;
                    console.log('[dashboard_logged] using staticProducts fallback (fetch error)');
                }
            }

            initProductState();
            updateDisplayedProducts();
            filterProducts();
            renderProducts();

            // After rendering, ensure price displays and disable decrement buttons where needed
            setTimeout(() => {
                products.forEach(product => {
                    if (product.status === 'available') {
                        updateProductPrice(product.id);
                        const minusBtn = document.querySelector(`[onclick="changeQuantity(${product.id}, -1)"]`);
                        if (minusBtn) minusBtn.disabled = true;
                    }
                });
            }, 50);
        }

        // Função para renderizar os produtos
        function renderProducts() 
        {
            const grid = document.getElementById('productsGrid');
            const resultsCount = document.getElementById('resultsCount');
            
            grid.innerHTML = '';
            
            if (currentCategory === 'all') 
            {
                // Mostrar total referente à fonte (se usuário logado, total = produtos totais; caso contrário só disponíveis)
                const totalCount = isLoggedIn() ? products.length : products.filter(p => p.status === 'available').length;
                resultsCount.textContent = `Mostrando ${filteredProducts.length} de ${totalCount} produtos`;
            } 
            
            else 
            {
                const baseProducts = isLoggedIn() ? products : products.filter(p => p.status === 'available');
                const categoryTotal = baseProducts.filter(p => p.category === currentCategory).length;
                resultsCount.textContent = `Mostrando ${filteredProducts.length} de ${categoryTotal} produtos em ${categoryNames[currentCategory]}`;
            }

            if (filteredProducts.length === 0) 
            {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-16 text-gray-400">
                        <h3 class="text-xl font-semibold mb-4 text-gray-600">🔍 Nenhum produto encontrado</h3>
                        <p class="text-base mb-8">Tente ajustar os filtros ou buscar por outros termos.</p>
                    </div>
                `;
                return;
            }

            filteredProducts.forEach(product => 
            {
                const badgeClass = product.status === 'available' 
                    ? 'bg-green-100/10 text-green-600 border-green-200/20' 
                    : 'bg-red-100/10 text-red-500 border-red-200/20';
                const badgeText = product.status === 'available' ? '✅ Disponível' : '❌ Indisponível';
                const buttonDisabled = product.status === 'rented' ? 'disabled' : '';

                const productCard = `
                    <div class="product-card bg-white rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-gray-100 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-transparent">
                        <div class="w-full h-48 overflow-hidden flex items-center justify-center mb-4 relative rounded-xl bg-gray-50">
                               <img src="${product.image || IMAGE_FALLBACK}" alt="${product.name}" 
                                   onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik04NyA4N2gyNnYyNkg4N1Y4N3oiIGZpbGw9IiNkMWQ1ZGIiLz4KPHA+' 
                                   class="w-full h-full object-contain transition-transform duration-300 hover:scale-105">
                            <span class="product-badge absolute top-3 right-3 px-3 py-1 rounded-xl text-xs font-semibold uppercase glass-light border ${badgeClass}">${badgeText}</span>
                        </div>
                        <h2 class="text-base font-semibold text-gray-800 mb-3 leading-5 transition-colors duration-200 hover:text-primary">${product.name}</h2>
                        <div class="flex items-center gap-2 mb-3 text-sm">
                            <span class="text-yellow-500 text-base">${generateStars(product.rating)}</span>
                            <span class="text-gray-400 text-xs">(${product.reviews} avaliações)</span>
                        </div>
                        <div class="flex items-baseline gap-2 mb-4">
                            <span class="price-gradient text-2xl font-bold">R$ ${product.price},00</span>
                            <span class="text-sm text-gray-400 font-medium">/ ${product.period}</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-4 leading-6">${product.description}</p>
                        <div class="mb-4">
                            <select id="period-${product.id}" onchange="updateProductPrice(${product.id})" 
                                    class="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white transition-colors duration-200 focus:outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/10">
                                <option value="1">1 dia</option>
                                <option value="3">3 dias</option>
                                <option value="7">1 semana</option>
                                <option value="30">1 mês</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="text-sm font-medium text-gray-600 block mb-2">Quantidade:</label>
                            <div class="flex items-center gap-3">
                                <button type="button" onclick="changeQuantity(${product.id}, -1)" 
                                        class="w-8 h-8 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-center font-semibold text-gray-600 transition-all duration-200 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                                        ${product.status === 'rented' ? 'disabled' : ''}>-</button>
                                <span class="min-w-8 text-center font-semibold text-gray-800" id="qty-${product.id}">1</span>
                                <button type="button" onclick="changeQuantity(${product.id}, 1)" 
                                        class="w-8 h-8 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-center font-semibold text-gray-600 transition-all duration-200 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                                        ${product.status === 'rented' ? 'disabled' : ''}>+</button>
                            </div>
                        </div>
                        <div class="flex justify-between items-center mb-4 px-3 py-3 bg-gray-50 rounded-lg text-sm" id="total-${product.id}">
                            <span class="font-medium text-gray-600">Total:</span>
                            <span class="total-amount font-bold text-primary text-base">R$ ${product.price},00</span>
                        </div>
                        <button onclick="addToCart(${product.id})" 
                                class="${product.status === 'rented' ? 'bg-gray-400 cursor-not-allowed' : 'btn-gradient-primary hover:-translate-y-0.5 hover:shadow-lg'} w-full px-3 py-3.5 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 uppercase tracking-wide" 
                                ${buttonDisabled}>
                            ${product.status === 'rented' ? '❌ Indisponível' : '🛒 Adicionar ao carrinho'}
                        </button>
                    </div>
                `;
                grid.innerHTML += productCard;
            });
        }

        // Funções para manipulação do carrinho
        function addToCart(productId) 
        {
            const product = products.find(p => String(p.id) === String(productId));
            if (product && product.status === 'available') 
            {
                const quantity = productQuantities[productId] || 1;
                const period = productPeriods[productId] || 1;
                const periodName = getPeriodName(period);
                
                let periodMultiplier = period;
                if (period >= 30) 
                {
                    periodMultiplier = period * 0.8;
                } 
                else if (period >= 7) 
                {
                    periodMultiplier = period * 0.9;
                }
                
                const unitPrice = product.price * periodMultiplier;
                
                const existingItemIndex = cart.findIndex(item => 
                    item.id === productId && 
                    item.selectedPeriod === period
                );
                
                if (existingItemIndex !== -1) 
                {
                    cart[existingItemIndex].quantity += quantity;
                } 
                
                else 
                {
                    cart.push
                    ({ 
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

        function updateCartCount() 
        {
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.getElementById('cartCount').textContent = count;
        }

        function openCart() 
        {
            const cartModal = document.getElementById('cartModal');
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            
            cartItems.innerHTML = '';
            let total = 0;

            if (cart.length === 0) 
            {
                cartItems.innerHTML = `
                    <div class="text-center py-12 text-gray-400">
                        <p class="text-base mb-8">🛒 Seu carrinho está vazio</p>
                        <p>Adicione produtos para começar seu aluguel</p>
                    </div>
                `;
            } 
            
            else 
            {
                cart.forEach((item, index) => 
                {
                    const itemTotal = item.unitPrice * item.quantity;
                    total += itemTotal;
                    
                    let discountInfo = '';
                    if (item.selectedPeriod >= 30) 
                    {
                        discountInfo = '<span class="text-green-600 text-xs">📅 20% desconto mensal</span>';
                    } 
                    
                    else if (item.selectedPeriod >= 7) 
                    {
                        discountInfo = '<span class="text-green-600 text-xs">📅 10% desconto semanal</span>';
                    }
                    
                    const cartItemHtml = `
                        <div class="flex flex-col sm:flex-row justify-between items-start gap-4 py-6 border-b border-gray-100 last:border-b-0">
                            <div class="flex-1">
                                <div class="font-semibold mb-2 text-gray-800">${item.name}</div>
                                <div class="text-sm text-gray-600 leading-6 mb-3">
                                    Quantidade: ${item.quantity} | Período: ${item.selectedPeriodName}<br>
                                    Preço unitário: R$ ${item.originalPrice},00/dia | Total período: R$ ${item.unitPrice.toFixed(2).replace('.', ',')}
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

        // Função para atualizar quantidade no carrinho
        function updateCartItemQuantity(itemIndex, change) 
        {
            if (itemIndex >= 0 && itemIndex < cart.length) 
            {
                const newQuantity = Math.max(1, cart[itemIndex].quantity + change);
                cart[itemIndex].quantity = newQuantity;
                updateCartCount();
                openCart();
            }
        }

        function closeCart() 
        {
            const cartModal = document.getElementById('cartModal');
            cartModal.style.display = 'none';
        }

        function removeFromCart(itemIndex) 
        {
            if (itemIndex >= 0 && itemIndex < cart.length) 
            {
                cart.splice(itemIndex, 1);
                updateCartCount();
                openCart();
            }
        }

        function checkout() {
            if (cart.length === 0) 
            {
                alert('Seu carrinho está vazio!');
                return;
            }

            closeCart();
            
            // Show Success Modal with animation
            const modal = document.getElementById('successModal');
            const content = document.getElementById('successModalContent');
            const progressBar = document.getElementById('redirectProgressBar');
            
            if (modal && content && progressBar) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');

                // Trigger animations
                requestAnimationFrame(() => {
                    content.classList.remove('scale-95', 'opacity-0', 'translate-y-4');
                    content.classList.add('scale-100', 'opacity-100', 'translate-y-0');
                    progressBar.style.width = '100%';
                });

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = './checkout/index.html';
                }, 2000);
            } else {
                // Fallback if modal elements missing
                window.location.href = './checkout/index.html';
            }
        }

        // Funções de filtro e ordenação
        function filterProducts() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const minPrice = parseFloat(document.getElementById('priceMin').value) || 0;
            const maxPrice = parseFloat(document.getElementById('priceMax').value) || Infinity;
            
            const selectedCategories = Array.from(document.querySelectorAll('input[type="checkbox"][id^="cat-"]:checked')).map(cb => cb.value).filter(Boolean);
            const selectedStatus = Array.from(document.querySelectorAll('input[type="checkbox"][id^="status-"]:checked')).map(cb => cb.value).filter(Boolean);

            // Base de produtos depende do estado de login
            const baseProducts = isLoggedIn() ? products : products.filter(p => p.status === 'available');

            filteredProducts = baseProducts.filter(product => 
            {
                const matchesSearch = product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
                
                const matchesCategory = selectedCategories.length === 0 || 
                                       selectedCategories.includes(product.category) || 
                                       (selectedCategories.length === 0 && currentCategory === 'all') ||
                                       (currentCategory !== 'all' && product.category === currentCategory);
                
                const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(product.status);
                const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
                
                return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
            });
            
            sortProducts();
        }

        function sortProducts() 
        {
            const sortValue = document.getElementById('sortOptions').value;

            filteredProducts.sort((a, b) => {
                if (sortValue === 'price-low') 
                {
                    return a.price - b.price;
                } 
                
                else if (sortValue === 'price-high') 
                {
                    return b.price - a.price;
                } 
                
                else if (sortValue === 'name') 
                {
                    return a.name.localeCompare(b.name);
                }
                return 0;
            });

            renderProducts();
        }

        // Event listeners para filtros em tempo real
        document.addEventListener('DOMContentLoaded', () => 
        {
            // Load products from API (with fallbacks) and render
            loadProducts();
            
            
            
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', () => 
            {
                setTimeout(filterProducts, 300);
            });
            
            const priceInputs = document.querySelectorAll('#priceMin, #priceMax');
            priceInputs.forEach(input => 
            {
                input.addEventListener('input', () => 
                {
                    setTimeout(filterProducts, 500);
                });
            });
            
            const cartModal = document.getElementById('cartModal');
            cartModal.addEventListener('click', (e) => 
            {
                if (e.target === cartModal) 
                {
                    closeCart();
                }
            });
            
            document.addEventListener('keydown', (e) => 
            {
                if (e.key === 'Escape') 
                {
                    closeCart();
                }
            });
        });
        
        // Atualiza exibição quando outro _tab_ altera o estado de login via localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'user') {
                updateDisplayedProducts();
                filterProducts();
                renderProducts();
            }
        });

        // Chamar essa função após login/logout no mesmo tab para atualizar a UI
        function notifyLoginStateChange() {
            updateDisplayedProducts();
            filterProducts();
            renderProducts();
        }
        window.notifyLoginStateChange = notifyLoginStateChange;
        // product quantities and periods are initialized in initProductState() after loading products

        // Mapear nomes das categorias para exibição
        const categoryNames = {
            'all': 'Todos os Departamentos',
            'notebook': 'Notebooks',
            'camera': 'Câmeras e Filmadoras',
            'console': 'Videogames',
            'smartphone': 'Smartphones',
            'audio': 'Áudio e Som'
        };