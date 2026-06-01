// ======================
// MODAL MANAGEMENT
// ======================

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

function openReceiveModal() {
    closeAllModals();
    document.getElementById('receiveModal').classList.remove('hidden');
}

function closeReceiveModal() {
    document.getElementById('receiveModal').classList.add('hidden');
}

function openSendModal() {
    if (!isConnected) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }
    closeAllModals();
    populateSendTokenSelect();
    document.getElementById('sendModal').classList.remove('hidden');
}

function closeSendModal() {
    document.getElementById('sendModal').classList.add('hidden');
}

function openSwapModal() {
    if (!isConnected) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }
    closeAllModals();
    populateSwapTokenSelects();
    document.getElementById('swapModal').classList.remove('hidden');
}

function closeSwapModal() {
    document.getElementById('swapModal').classList.add('hidden');
}

function openNetworkModal() {
    closeAllModals();
    document.getElementById('networkModal').classList.remove('hidden');
}

function closeNetworkModal() {
    document.getElementById('networkModal').classList.add('hidden');
}

// ======================
// NETWORK SELECTOR
// ======================

document.addEventListener('DOMContentLoaded', () => {
    const networkBtn = document.getElementById('networkBtn');
    const networkDropdown = document.getElementById('networkDropdown');
    
    networkBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        networkDropdown?.classList.toggle('hidden');
    });
    
    document.addEventListener('click', () => {
        networkDropdown?.classList.add('hidden');
    });
    
    // Network selection
    document.querySelectorAll('.network-option').forEach(option => {
        option.addEventListener('click', async (e) => {
            const chainId = parseInt(option.dataset.chain);
            const name = option.dataset.name;
            
            try {
                await switchNetwork(chainId);
                networkDropdown?.classList.add('hidden');
            } catch (error) {
                showNotification(`Failed to switch to ${name}`, 'danger');
            }
        });
    });
});

// ======================
// FORM INTERACTIONS
// ======================

function populateSendTokenSelect() {
    const select = document.getElementById('sendToken');
    const tokens = getNetworkTokens(connectedChainId);
    
    select.innerHTML = '<option value="">-- Select Token --</option>';
    
    tokens.forEach(token => {
        const option = document.createElement('option');
        option.value = token.symbol;
        option.textContent = `${token.symbol} - ${token.name}`;
        select.appendChild(option);
    });
    
    select.addEventListener('change', updateSendDetails);
}

function populateSwapTokenSelects() {
    const fromSelect = document.getElementById('swapFromToken');
    const toSelect = document.getElementById('swapToToken');
    const tokens = getNetworkTokens(connectedChainId);
    
    const selectHTML = '<option value="">-- Select Token --</option>' +
        tokens.map(t => `<option value="${t.symbol}">${t.symbol} - ${t.name}</option>`).join('');
    
    fromSelect.innerHTML = selectHTML;
    toSelect.innerHTML = selectHTML;
    
    fromSelect.addEventListener('change', updateSwapDetails);
    document.getElementById('swapFromAmount').addEventListener('change', updateSwapDetails);
}

async function updateSendDetails() {
    const tokenSymbol = document.getElementById('sendToken').value;
    const token = getTokenBySymbol(connectedChainId, tokenSymbol);
    
    if (!token) return;
    
    const balance = await getTokenBalance(
        token.address,
        token.decimals
    );
    
    // Update display
    document.getElementById('sendAmount').placeholder = `Max: ${Number(balance).toFixed(4)}`;
}

async function updateSwapDetails() {
    const fromToken = document.getElementById('swapFromToken').value;
    const fromAmount = parseFloat(document.getElementById('swapFromAmount').value) || 0;
    
    if (!fromToken || fromAmount === 0) {
        document.getElementById('swapToAmount').value = '';
        return;
    }
    
    // Simplified swap calculation (1:1 for demo)
    document.getElementById('swapToAmount').value = fromAmount.toFixed(4);
    
    document.getElementById('priceImpact').textContent = '0.00%';
    document.getElementById('minReceived').textContent = (fromAmount * 0.99).toFixed(4);
}

async function setMaxAmount() {
    const tokenSymbol = document.getElementById('sendToken').value;
    const token = getTokenBySymbol(connectedChainId, tokenSymbol);
    
    if (!token) return;
    
    let balance = '0';
    
    if (token.type === 'native') {
        balance = await getNativeBalance();
    } else {
        balance = await getTokenBalance(token.address, token.decimals);
    }
    
    document.getElementById('sendAmount').value = Number(balance).toFixed(4);
}

// ======================
// SEND ASSET
// ======================

async function sendAsset() {
    try {
        const toAddress = document.getElementById('sendAddress').value;
        const amount = document.getElementById('sendAmount').value;
        const tokenSymbol = document.getElementById('sendToken').value;
        
        if (!toAddress || !amount || !tokenSymbol) {
            showNotification('Please fill all fields', 'warning');
            return;
        }
        
        if (!ethers.utils.isAddress(toAddress)) {
            showNotification('Invalid recipient address', 'danger');
            return;
        }
        
        const token = getTokenBySymbol(connectedChainId, tokenSymbol);
        if (!token) {
            showNotification('Token not found', 'danger');
            return;
        }
        
        showLoading('Sending transaction...');
        
        const result = await sendToken(
            toAddress,
            amount,
            token.address,
            token.decimals
        );
        
        if (result.success) {
            showNotification(`Transaction sent! Hash: ${result.hash.slice(0, 10)}...`, 'success');
            closeSendModal();
            document.getElementById('sendForm').reset();
            await loadPortfolio();
        } else {
            showNotification(result.error, 'danger');
        }
        
    } catch (error) {
        showNotification(error.message, 'danger');
    } finally {
        hideLoading();
    }
}

// ======================
// SWAP
// ======================

async function executeSwap() {
    try {
        const fromToken = document.getElementById('swapFromToken').value;
        const toToken = document.getElementById('swapToToken').value;
        const fromAmount = document.getElementById('swapFromAmount').value;
        
        if (!fromToken || !toToken || !fromAmount) {
            showNotification('Please fill all swap fields', 'warning');
            return;
        }
        
        if (fromToken === toToken) {
            showNotification('Please select different tokens', 'warning');
            return;
        }
        
        showNotification('Swap feature coming soon!', 'info');
        
    } catch (error) {
        showNotification(error.message, 'danger');
    }
}

// ======================
// RECEIVE & ADDRESS
// ======================

async function openReceiveModal() {
    if (!isConnected) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }
    
    const addressElement = document.getElementById('walletAddress');
    addressElement.textContent = userAddress;
    
    // Generate QR code
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';
    
    new QRCode(qrContainer, {
        text: userAddress,
        width: 200,
        height: 200,
        colorDark: '#000',
        colorLight: '#fff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    closeAllModals();
    document.getElementById('receiveModal').classList.remove('hidden');
}

async function copyAddress() {
    try {
        await navigator.clipboard.writeText(userAddress);
        
        const btn = event.target.closest('.copy-btn');
        btn.classList.add('copied');
        btn.textContent = '✓';
        
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>';
        }, 2000);
        
        showNotification('Address copied!', 'success');
    } catch (error) {
        showNotification('Failed to copy address', 'danger');
    }
}

// ======================
// NOTIFICATIONS
// ======================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles dynamically if not in CSS
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                font-weight: 500;
                animation: slideIn 0.3s ease-out;
                z-index: 2000;
            }
            
            .notification-success {
                background: #10B981;
                color: white;
            }
            
            .notification-warning {
                background: #F59E0B;
                color: white;
            }
            
            .notification-danger {
                background: #EF4444;
                color: white;
            }
            
            .notification-info {
                background: #3B82F6;
                color: white;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ======================
// LOADING STATES
// ======================

function showLoading(message = 'Loading...') {
    let loader = document.getElementById('globalLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.innerHTML = `
            <div style="
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1999;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    text-align: center;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f0f0f0;
                        border-top: 4px solid #00C9A7;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <p id="loaderText">${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = 'block';
    document.getElementById('loaderText').textContent = message;
}

function hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// ======================
// PORTFOLIO LOADING
// ======================

async function loadPortfolio() {
    try {
        if (!isConnected) return;
        
        showLoading('Loading portfolio...');
        
        const balances = await getAllBalances();
        const totalValue = await getPortfolioValue(balances);
        
        updatePortfolioDisplay(balances, totalValue);
        await loadAssets(balances);
        await loadTransactions();
        
    } catch (error) {
        console.error('Failed to load portfolio:', error);
        showNotification('Failed to load portfolio', 'danger');
    } finally {
        hideLoading();
    }
}

function updatePortfolioDisplay(balances, totalValue) {
    const totalBalanceElement = document.getElementById('totalBalance');
    const portfolioChangeElement = document.getElementById('portfolioChange');
    
    totalBalanceElement.textContent = formatUSD(totalValue);
    portfolioChangeElement.textContent = '+2.45%'; // Placeholder
    portfolioChangeElement.classList.add('positive');
}

async function loadAssets(balances) {
    const assetsList = document.getElementById('assetsList');
    const tokens = getNetworkTokens(connectedChainId);
    
    assetsList.innerHTML = '';
    
    const priceIds = tokens
        .filter(t => t.coingeckoId)
        .map(t => t.coingeckoId);
    
    let prices = {};
    if (priceIds.length > 0) {
        prices = await COINGECKO_API.getPrices(priceIds);
    }
    
    tokens.forEach((token, index) => {
        const balance = balances[token.symbol] || '0';
        const balanceNum = parseFloat(balance);
        
        if (balanceNum === 0) return; // Skip zero balance tokens
        
        const price = prices[token.coingeckoId]?.usd || 0;
        const value = balanceNum * price;
        const change = prices[token.coingeckoId]?.usd_24h_change || 0;
        
        const assetHTML = `
            <div class="asset-item">
                <div class="asset-header">
                    <div class="asset-info">
                        <img src="${token.logo}" alt="${token.symbol}" class="asset-logo">
                        <div class="asset-details">
                            <h3>${token.symbol}</h3>
                            <span class="asset-symbol">${token.name}</span>
                        </div>
                    </div>
                    <div class="asset-values">
                        <div class="asset-balance">${balanceNum.toFixed(4)} ${token.symbol}</div>
                        <div class="asset-usd">${formatUSD(value)}</div>
                        <div class="asset-change ${change >= 0 ? 'positive' : 'negative'}">
                            ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        assetsList.innerHTML += assetHTML;
    });
    
    document.getElementById('assetCount').textContent = `${tokens.filter(t => (balances[t.symbol] || '0') !== '0').length} assets`;
}

async function loadTransactions() {
    const txList = document.getElementById('txList');
    const networkConfig = getNetworkConfig(connectedChainId);
    
    try {
        // This would normally fetch from Etherscan API or similar
        // For now, show placeholder
        txList.innerHTML = `
            <div class="placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                <p>No transactions yet</p>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load transactions:', error);
    }
}

// ======================
// WALLET STATUS UPDATE
// ======================

function updateWalletStatus() {
    const connectBtn = document.getElementById('connectBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    if (isConnected) {
        connectBtn.textContent = `${shortenAddress(userAddress)} (Disconnect)`;
        connectBtn.classList.remove('btn-primary');
        connectBtn.classList.add('btn-secondary');
        
        statusIndicator.classList.add('connected');
        statusText.textContent = `Connected to ${getNetworkConfig(connectedChainId).name}`;
        
        document.getElementById('portfolioCard').classList.remove('hidden');
    } else {
        connectBtn.textContent = 'Connect Wallet';
        connectBtn.classList.remove('btn-secondary');
        connectBtn.classList.add('btn-primary');
        
        statusIndicator.classList.remove('connected');
        statusText.textContent = 'Connect Wallet';
    }
}

// Override wallet callback
function onWalletChanged() {
    updateWalletStatus();
    if (isConnected) {
        loadPortfolio();
    } else {
        document.getElementById('assetsList').innerHTML = `
            <div class="placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                <p>Connect wallet to view assets</p>
            </div>
        `;
    }
}

function onNetworkChanged() {
    showNotification(`Switched to ${getNetworkConfig(connectedChainId).name}`, 'success');
    loadPortfolio();
}

// Export for global use
window.UIManager = {
    openReceiveModal,
    closeReceiveModal,
    openSendModal,
    closeSendModal,
    openSwapModal,
    closeSwapModal,
    sendAsset,
    executeSwap,
    copyAddress,
    showNotification,
    loadPortfolio
};
