// ===== SINGLE STAMP PURCHASE MODAL WITH SLIDER =====
// This replaces the old stamp selection interface

let currentStampIndex = 0;
const allStamps = [
    { id: 'neynar', name: 'Neynar', img: '/stamp/neynar-preview.png', icon: '🟣' },
    { id: 'farcaster', name: 'Farcaster', img: '/stamp/farcaster-preview.png', icon: '🟪' },
    { id: 'warplet', name: 'Warplet', img: '/stamp/warplet-preview.png', icon: '🎨' },
    { id: 'based', name: 'Based', img: '/stamp/based-preview.png', icon: '🌟' }
];

// Open single stamp purchase modal
function openStampPurchaseModal() {
    // Create modal if not exists
    let modal = document.getElementById('single-stamp-modal');
    if (!modal) {
        modal = createStampPurchaseModal();
        document.body.appendChild(modal);
    }
    
    // Render current stamp
    renderSingleStamp();
    
    // Show modal
    modal.classList.add('visible');
}

// Create modal HTML structure
function createStampPurchaseModal() {
    const modal = document.createElement('div');
    modal.id = 'single-stamp-modal';
    modal.className = 'custom-modal';
    
    modal.innerHTML = `
        <div class="modal-box" style="max-width: 420px; background: linear-gradient(135deg, #001a10, #002818); border: 3px solid var(--gold); border-radius: 20px; padding: 0; overflow: hidden;">
            <!-- Header -->
            <div style="text-align: center; padding: 24px 24px 16px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                <div id="stamp-title" style="font-size: 1.4rem; font-weight: bold; color: var(--gold); text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Cinzel', serif;">
                    NEYNAR STAMP
                </div>
            </div>
            
            <!-- Stamp Image Container (Swipeable) -->
            <div id="stamp-swipe-container" style="position: relative; padding: 32px 24px; display: flex; justify-content: center; align-items: center; min-height: 280px; touch-action: pan-y;">
                <div id="stamp-image-wrapper" style="position: relative; max-width: 280px;">
                    <img id="single-stamp-image" src="/stamp/neynar-preview.png" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.6);">
                </div>
            </div>
            
            <!-- Info Section -->
            <div id="stamp-info-section" style="padding: 0 24px 24px; background: rgba(0,0,0,0.3);">
                <!-- Eligibility Status -->
                <div id="stamp-eligibility" style="display: flex; gap: 12px; margin-bottom: 16px; background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.25); border-radius: 8px; padding: 12px;">
                    <div style="flex: 1; font-size: 0.75rem; line-height: 1.6; color: rgba(255,255,255,0.8);">
                        <div id="eligibility-status">✅ Qualified: Get 3 stamps FREE</div>
                        <div id="eligibility-requirement" style="margin-top: 4px; color: rgba(255,215,0,0.9);">🎯 Requirement: Neynar Score > 0.6</div>
                        <div id="eligibility-purchase" style="margin-top: 4px; color: rgba(255,255,255,0.75);">❌ Not qualified: 0.1 USDC = 3 stamps</div>
                        <div style="margin-top: 4px; color: rgba(255,255,255,0.75);">📤 Use: 1 stamp per send</div>
                    </div>
                    <!-- Balance -->
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 70px; border-left: 1px solid rgba(212,175,55,0.2); padding-left: 12px;">
                        <div style="font-size: 0.6rem; color: rgba(255,255,255,0.5);">Balance</div>
                        <div id="stamp-balance" style="font-size: 1.8rem; color: #4ade80; font-weight: bold; line-height: 1;">3</div>
                        <div style="font-size: 1rem; line-height: 1;">🎫</div>
                    </div>
                </div>
                
                <!-- Purchase Controls -->
                <div id="purchase-controls" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(212,175,55,0.25); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-size: 0.7rem; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-align: center;">
                        0.1 USDC = 3 stamps
                    </div>
                    <!-- Quantity Selector -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 12px;">
                        <button onclick="decreaseQuantity()" style="width: 48px; height: 48px; border: 2px solid var(--gold); background: transparent; color: var(--gold); border-radius: 8px; cursor: pointer; font-size: 1.5rem; font-weight: bold;">−</button>
                        <div style="font-size: 1.3rem; color: #fff; min-width: 80px; text-align: center; font-weight: bold;">×<span id="purchase-quantity">1</span></div>
                        <button onclick="increaseQuantity()" style="width: 48px; height: 48px; border: 2px solid var(--gold); background: transparent; color: var(--gold); border-radius: 8px; cursor: pointer; font-size: 1.5rem; font-weight: bold;">+</button>
                    </div>
                    <!-- Total -->
                    <div style="text-align: center; font-size: 0.9rem; color: var(--gold); margin-bottom: 12px;">
                        Total: <span id="purchase-total">3</span> 🎫 | <span id="purchase-price">0.1</span> USDC
                    </div>
                    <!-- Purchase Button -->
                    <button onclick="purchaseCurrentStamp()" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #d4af37, #ffd700); border: none; color: #0a1a0a; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s;">
                        💰 PURCHASE NOW
                    </button>
                </div>
            </div>
            
            <!-- Slider Dots (Bottom Navigation) -->
            <div style="padding: 16px 24px 24px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(212,175,55,0.2);">
                <div id="stamp-slider-dots" style="display: flex; justify-content: center; gap: 12px;">
                    <div class="slider-dot" data-index="0" style="width: 12px; height: 12px; border-radius: 50%; background: var(--gold); cursor: pointer; transition: all 0.3s;"></div>
                    <div class="slider-dot" data-index="1" style="width: 12px; height: 12px; border-radius: 50%; background: rgba(212,175,55,0.3); cursor: pointer; transition: all 0.3s;"></div>
                    <div class="slider-dot" data-index="2" style="width: 12px; height: 12px; border-radius: 50%; background: rgba(212,175,55,0.3); cursor: pointer; transition: all 0.3s;"></div>
                    <div class="slider-dot" data-index="3" style="width: 12px; height: 12px; border-radius: 50%; background: rgba(212,175,55,0.3); cursor: pointer; transition: all 0.3s;"></div>
                </div>
            </div>
            
            <!-- Close Button -->
            <button onclick="closeStampPurchaseModal()" style="position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border: 2px solid rgba(212,175,55,0.5); background: rgba(0,0,0,0.6); color: var(--gold); border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">✕</button>
        </div>
    `;
    
    // Add swipe support
    setupSwipeSupport(modal);
    
    // Add dot click handlers
    setTimeout(() => {
        const dots = modal.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.onclick = () => {
                currentStampIndex = index;
                renderSingleStamp();
            };
        });
    }, 100);
    
    return modal;
}

// Setup swipe/drag support
function setupSwipeSupport(modal) {
    const container = modal.querySelector('#stamp-swipe-container');
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        
        // Visual feedback during drag
        const wrapper = container.querySelector('#stamp-image-wrapper');
        wrapper.style.transform = `translateX(${diff}px)`;
        wrapper.style.transition = 'none';
    });
    
    container.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = currentX - startX;
        const wrapper = container.querySelector('#stamp-image-wrapper');
        wrapper.style.transition = 'transform 0.3s ease';
        wrapper.style.transform = 'translateX(0)';
        
        // Swipe threshold: 50px
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentStampIndex > 0) {
                // Swipe right -> previous stamp
                currentStampIndex--;
                renderSingleStamp();
            } else if (diff < 0 && currentStampIndex < allStamps.length - 1) {
                // Swipe left -> next stamp
                currentStampIndex++;
                renderSingleStamp();
            }
        }
    });
    
    // Mouse drag support (desktop)
    container.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
        container.style.cursor = 'grabbing';
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentX = e.clientX;
        const diff = currentX - startX;
        
        const wrapper = container.querySelector('#stamp-image-wrapper');
        wrapper.style.transform = `translateX(${diff}px)`;
        wrapper.style.transition = 'none';
    });
    
    container.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        container.style.cursor = 'grab';
        
        const diff = currentX - startX;
        const wrapper = container.querySelector('#stamp-image-wrapper');
        wrapper.style.transition = 'transform 0.3s ease';
        wrapper.style.transform = 'translateX(0)';
        
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentStampIndex > 0) {
                currentStampIndex--;
                renderSingleStamp();
            } else if (diff < 0 && currentStampIndex < allStamps.length - 1) {
                currentStampIndex++;
                renderSingleStamp();
            }
        }
    });
    
    container.addEventListener('mouseleave', () => {
        isDragging = false;
        container.style.cursor = 'grab';
        const wrapper = container.querySelector('#stamp-image-wrapper');
        wrapper.style.transition = 'transform 0.3s ease';
        wrapper.style.transform = 'translateX(0)';
    });
}

// Render current stamp data
function renderSingleStamp() {
    const stamp = allStamps[currentStampIndex];
    const userFid = window.currentUser?.fid || 3;
    const isOwned = userStamps[stamp.id]?.owned;
    const quantity = userStamps[stamp.id]?.quantity || 0;
    const eligibility = stampEligibility[stamp.id];
    const isEligible = eligibility?.eligible;
    
    // Update title
    document.getElementById('stamp-title').textContent = `${stamp.icon} ${stamp.name.toUpperCase()} STAMP`;
    
    // Update image
    const img = document.getElementById('single-stamp-image');
    img.src = stamp.img;
    img.style.opacity = '0';
    setTimeout(() => img.style.opacity = '1', 50);
    img.style.transition = 'opacity 0.3s ease';
    
    // Update balance
    document.getElementById('stamp-balance').textContent = quantity;
    
    // Update eligibility info based on stamp type
    const statusEl = document.getElementById('eligibility-status');
    const requirementEl = document.getElementById('eligibility-requirement');
    const purchaseEl = document.getElementById('eligibility-purchase');
    
    if (stamp.id === 'neynar') {
        statusEl.innerHTML = isEligible ? '✅ Qualified: Get 3 stamps FREE' : '❌ Not qualified';
        requirementEl.innerHTML = '🎯 Requirement: Neynar Score > 0.6';
        purchaseEl.innerHTML = '❌ Not qualified: 0.1 USDC = 3 stamps';
    } else if (stamp.id === 'farcaster') {
        statusEl.innerHTML = isEligible ? '✅ Qualified: Get 5 stamps FREE' : '❌ Not qualified';
        requirementEl.innerHTML = '🎯 Requirement: Farcaster Power Badge';
        purchaseEl.innerHTML = '❌ Not qualified: 0.37 USDC = 5 stamps';
    } else if (stamp.id === 'warplet') {
        statusEl.innerHTML = isEligible ? '✅ Qualified: Get 5 stamps FREE' : '❌ Not qualified';
        requirementEl.innerHTML = '🎯 Requirement: Warplet NFT holder';
        purchaseEl.innerHTML = '⚠️ Cannot purchase - NFT holders only';
    } else if (stamp.id === 'based') {
        statusEl.innerHTML = '🌟 Premium Collector Stamp';
        requirementEl.innerHTML = '🎯 Unlock: Own all 3 basic stamps';
        purchaseEl.innerHTML = '💎 Mint: 0.99 USDC (unlimited use)';
    }
    
    // Update dots
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        if (index === currentStampIndex) {
            dot.style.background = 'var(--gold)';
            dot.style.transform = 'scale(1.3)';
        } else {
            dot.style.background = 'rgba(212,175,55,0.3)';
            dot.style.transform = 'scale(1)';
        }
    });
}

// Quantity controls
let purchaseQty = 1;

function increaseQuantity() {
    purchaseQty++;
    updatePurchaseTotal();
}

function decreaseQuantity() {
    if (purchaseQty > 1) {
        purchaseQty--;
        updatePurchaseTotal();
    }
}

function updatePurchaseTotal() {
    const stamp = allStamps[currentStampIndex];
    let pricePerUnit = 0.1;
    let stampsPerUnit = 3;
    
    if (stamp.id === 'farcaster') {
        pricePerUnit = 0.37;
        stampsPerUnit = 5;
    } else if (stamp.id === 'warplet') {
        pricePerUnit = 0.5;
        stampsPerUnit = 5;
    } else if (stamp.id === 'based') {
        pricePerUnit = 0.99;
        stampsPerUnit = 999;
    }
    
    const totalStamps = purchaseQty * stampsPerUnit;
    const totalPrice = (purchaseQty * pricePerUnit).toFixed(2);
    
    document.getElementById('purchase-quantity').textContent = purchaseQty;
    document.getElementById('purchase-total').textContent = totalStamps;
    document.getElementById('purchase-price').textContent = totalPrice;
}

// Purchase current stamp
function purchaseCurrentStamp() {
    const stamp = allStamps[currentStampIndex];
    const userFid = window.currentUser?.fid || 3;
    
    if (TEST_MODE) {
        // TEST MODE: Instant purchase
        const totalStamps = parseInt(document.getElementById('purchase-total').textContent);
        
        if (!userStamps[stamp.id]) {
            userStamps[stamp.id] = {
                owned: true,
                quantity: totalStamps,
                acquired_method: 'purchase',
                acquired_at: new Date().toISOString()
            };
        } else {
            userStamps[stamp.id].quantity = (userStamps[stamp.id].quantity || 0) + totalStamps;
        }
        
        saveUserStamps(userFid);
        renderSingleStamp();
        
        alert(`✅ Purchase Successful!\n\n• Added ${totalStamps} stamps 🎫\n• New balance: ${userStamps[stamp.id].quantity} stamps`);
        
        // Reset quantity
        purchaseQty = 1;
        updatePurchaseTotal();
    } else {
        // PRODUCTION MODE: Real payment
        alert('Payment integration coming soon!');
    }
}

// Close modal
function closeStampPurchaseModal() {
    const modal = document.getElementById('single-stamp-modal');
    if (modal) {
        modal.classList.remove('visible');
    }
}

// Initialize on load
updatePurchaseTotal();
