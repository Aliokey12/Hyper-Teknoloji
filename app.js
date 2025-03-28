const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dpblR5cGUiOiIxIiwiQ3VzdG9tZXJJRCI6IjU1NzI0IiwiRmlyc3ROYW1lIjoiRGVtbyIsIkxhc3ROYW1lIjoiSHlwZXIiLCJFbWFpbCI6ImRlbW9AaHlwZXIuY29tIiwiQ3VzdG9tZXJUeXBlSUQiOiIzMiIsIklzUmVzZWxsZXIiOiIwIiwiSXNBUEkiOiIxIiwiUmVmZXJhbmNlSUQiOiIiLCJSZWdpc3RlckRhdGUiOiIzLzI1LzIwMjUgMTowMDo0OCBQTSIsImV4cCI6MjA1NDEzNDExMCwiaXNzIjoiaHR0cHM6Ly9oeXBlcnRla25vbG9qaS5jb20iLCJhdWQiOiJodHRwczovL2h5cGVydGVrbm9sb2ppLmNvbSJ9.i_pqc2C5vSh1IegikQTkSxYk6MsjALLzp4g30KXqunM'
const URL = 'https://api.hyperteknoloji.com.tr/Products/List'

// Veri Çekme İşlemleri
async function productFetch() {
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                page: 0,
                pageSize: 10,
                productCategoryID:2
            })
        });

        if (!response.ok) {
            throw new Error(`API Yanıt Vermedi: ${response.status} ${response.statusText}`)
        }
        
        const veri = await response.json();
        
        if (veri.success && veri.data) {
            productDisplay(veri.data);
        } else {
            throw new Error(veri.message || 'API yanıtı başarısız');
        }
    } catch (error) {
        console.log('Ürünler Yüklenirken Hata Oluştu:', error)
        document.getElementById('product').innerHTML = '<p class="text-red-700">Bir Hata Oluştu Ürünler Yüklenemiyor</p>'
    }
}
// Görüntü Ayarları
function productDisplay(products) {
    const productGrid = document.getElementById('product')

    if (!products || !products.length) {
        productGrid.innerHTML = '<p class="text-red-500">Ürün Bulunamadı</p>'
        return
    }

    
    const product = products.slice(0, 10);

    const productCard = product.map(product =>
        `
        <div class="bg-gray-800 rounded-lg overflow-hidden relative" 
             data-price="${product.salePrice}"
             data-market-price="${product.marketPrice}"
             data-product-id="${product.productID}">
            <!-- Ürün Resmi -->
            <img src="${product.productData?.productMainImage || ''}" alt="${product.productName}" 
                 class="w-full h-48 object-cover">
            
            <!-- Stok Badge -->
            <div class="absolute top-2 right-2 bg-red-500 p-1 rounded">
                <span class="text-white text-sm">Stok: ${product.totalStock}</span>
            </div>
            
            <!-- Ürün Bilgileri -->
            <div class="p-4">
                <h3 class="text-xl font-bold text-white mb-2">${product.productName}</h3>
                <div class="text-sm text-gray-400 mb-2">${product.productSlug}</div>
                
                <!-- Fiyatlar -->
                <div class="flex justify-between items-center mb-4">
                    <div class="text-xl font-bold text-white">
                        ${product.salePrice} TL
                    </div>
                    ${product.marketPrice > product.salePrice ? 
                        `<div class="text-sm text-gray-400 line-through">
                            ${product.marketPrice} TL
                        </div>` : ''}
                </div>
                
                <!-- Butonlar -->
                <div class="flex gap-2 mt-4">
                    <button onclick="showDetails(${product.productID})" 
                            class="bg-blue-500 text-white px-4 py-2 rounded-md flex-1 hover:bg-blue-600">
                        GÖRÜNTÜLE
                    </button>
                    <button onclick="addToCart(${product.productID})" 
                            class="bg-blue-500 text-white px-4 py-2 rounded-md flex-1 hover:bg-blue-600"
                            ${product.totalStock <= 0 ? 'disabled' : ''}>
                        ${product.totalStock > 0 ? 'SEPETE EKLE' : 'STOKTA YOK'}
                    </button>
                </div>
            </div>
        </div>
        `).join('');

    productGrid.innerHTML = productCard;
}

 //Search Ayarları
function setupSearch() {
    const searchInput = document.querySelector('input[type="text"]');
    searchInput.addEventListener('input' , (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const productCard = document.querySelectorAll('#product > div')

        productCard.forEach(cart => {
            const productName = cart.querySelector('h3').textContent.toLowerCase()
            cart.style.display = productName.includes(searchTerm ? 'block' : 'none')
        })
    })
}

//Akıllı Sıralama
function sorting() {
const select = document.querySelector('select')
select.addEventListener('change' , (event) => {
    const product = Array.from(document.querySelectorAll('#product > div'))
    const sortBy = event.target.value;

    product.sort((a,b) => {
        const priceA = parseFloat(a.dataset.price)
        const priceB = parseFloat(b.dataset.price)

        if (sortBy === 'En Düşük Fiyat') {
            return priceA - priceB
        }else if(sortBy === 'En Yüksek Fiyat'){
            return priceB-priceA;
        }
        return 0;
    })
    
    const productGrid = document.getElementById('product')
    productGrid.innerHTML = '';
    product.forEach(product => productGrid.appendChild(product))

})

}


//Stok filtresi
function stockFilter() {
    const stockCheckbox = document.querySelector('input[type="checkbox"]');
    stockCheckbox.addEventListener('change', (event) => {
        const showOnlyInStock = event.target.checked;
        const productCard = document.querySelectorAll('#product > div');
        
        productCard.forEach(card => {
            const inStock = card.dataset.inStock === 'true';
            card.style.display = showOnlyInStock && !inStock ? 'none' : 'block';
        });
    });
}

//Detayları Görüntüle
function showDetails(productId) {
    // Ürün verileri
    const productElement = document.querySelector(`[data-product-id="${productId}"]`);
    if (!productElement) return;

    const product = {
        productID: productId,
        productName: productElement.querySelector('h3').textContent,
        productData: {
            productMainImage: productElement.querySelector('img').src,
            productDescription: productElement.querySelector('.text-gray-400').textContent
        },
        salePrice: productElement.dataset.price,
        marketPrice: productElement.dataset.marketPrice,
        totalStock: parseInt(productElement.querySelector('.bg-red-500 span').textContent.split(': ')[1])
    };

    // Modal oluşturma
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 relative">
            <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-white">
                <i class="fas fa-times text-xl"></i>
            </button>
            <div class="flex flex-col md:flex-row gap-6">
                <div class="flex-1">
                    <img src="${product.productData.productMainImage}" alt="${product.productName}" 
                         class="w-full h-64 object-cover rounded-lg">
                </div>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-white mb-4">${product.productName}</h2>
                    <p class="text-gray-300 mb-4">${product.productData.productDescription || 'Ürün açıklaması bulunmuyor.'}</p>
                    
                    <div class="flex items-center gap-2 mb-4">
                        <span class="text-2xl font-bold text-white">${product.salePrice} TL</span>
                        ${product.marketPrice > product.salePrice ? 
                            `<span class="text-gray-400 line-through">${product.marketPrice} TL</span>` : ''}
                    </div>
                    
                    <div class="flex items-center gap-2 mb-4">
                        <span class="text-sm ${product.totalStock > 0 ? 'text-green-500' : 'text-red-500'}">
                            ${product.totalStock > 0 ? 'Stokta' : 'Stokta Yok'}: ${product.totalStock}
                        </span>
                    </div>
                    
                    <button onclick="addToCart(${product.productID})" 
                            class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                            ${product.totalStock <= 0 ? 'disabled' : ''}>
                        ${product.totalStock > 0 ? 'SEPETE EKLE' : 'STOKTA YOK'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Carousel Functionality
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicators button');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;
    let slideInterval;

    // Show slide function
    function showSlide(index) {
        slides.forEach(slide => slide.style.opacity = '0');
        indicators.forEach(indicator => indicator.classList.remove('bg-white'));
        
        slides[index].style.opacity = '1';
        indicators[index].classList.add('bg-white');
        currentSlide = index;
    }

    // Next slide function
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    // Previous slide function
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    // Start auto slide
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Stop auto slide
    function stopAutoSlide() {
        clearInterval(slideInterval);
    }

    // Event listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoSlide();
        startAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
    });

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });

    // Start the carousel
    showSlide(0);
    startAutoSlide();
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    productFetch();
    setupSearch();
    sorting();
    stockFilter();
    initCarousel();
});