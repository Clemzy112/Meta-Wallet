/* ======================
   MULTI-NETWORK WALLET HANDLER
   ====================== */

// Supported networks configuration
const NETWORKS = {
    1: {
        name: 'Ethereum Mainnet',
        symbol: 'eth',
        chainId: 1,
        rpcUrl: 'https://eth.llamarpc.com',
        logo: 'https://cryptoicons.org/api/icon/eth/200',
        nativeCurrency: 'ETH'
    },
    56: {
        name: 'BNB Chain',
        symbol: 'bnb',
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        logo: 'https://cryptoicons.org/api/icon/bnb/200',
        nativeCurrency: 'BNB'
    },
    137: {
        name: 'Polygon',
        symbol: 'matic',
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com/',
        logo: 'https://cryptoicons.org/api/icon/matic/200',
        nativeCurrency: 'MATIC'
    },
    43114: {
        name: 'Avalanche C-Chain',
        symbol: 'avax',
        chainId: 43114,
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        logo: 'https://cryptoicons.org/api/icon/avax/200',
        nativeCurrency: 'AVAX'
    },
    250: {
        name: 'Fantom Opera',
        symbol: 'ftm',
        chainId: 250,
        rpcUrl: 'https://rpc.fantom.network/',
        logo: 'https://cryptoicons.org/api/icon/ftm/200',
        nativeCurrency: 'FTM'
    },
    42161: {
        name: 'Arbitrum One',
        symbol: 'arb',
        chainId: 42161,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        logo: 'https://cryptoicons.org/api/icon/arb/200',
        nativeCurrency: 'ETH'
    },
    10: {
        name: 'Optimism',
        symbol: 'op',
        chainId: 10,
        rpcUrl: 'https://mainnet.optimism.io',
        logo: 'https://cryptoicons.org/api/icon/op/200',
        nativeCurrency: 'ETH'
    }
};

// Store connected wallet info
let connectedWallet = {
    address: null,
    networks: {},
    totalBalance: 0
};

// Connect wallet to all networks
async function connectWalletMultiNetwork() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            showNotification('MetaMask is not installed. Please install it to continue.', 'error');
            return;
        }

        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        const walletAddress = accounts[0];
        connectedWallet.address = walletAddress;

        // Update UI
        updateWalletStatus(true);
        document.getElementById('statusText').textContent = `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;

        // Connect to all networks
        await connectToAllNetworks(walletAddress);

        // Listen for network changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => {
            refreshAllNetworks();
        });

        showNotification('Wallet connected successfully!', 'success');

    } catch (error) {
        console.error('Wallet connection error:', error);
        showNotification('Failed to connect wallet: ' + error.message, 'error');
    }
}

// Connect to all networks and fetch balances
async function connectToAllNetworks(address) {
    const networks = Object.values(NETWORKS);
    
    for (const network of networks) {
        try {
            // Fetch native token balance
            const balance = await fetchNativeBalance(network.chainId, address);
            
            // Store network data
            connectedWallet.networks[network.chainId] = {
                ...network,
                nativeBalance: balance,
                assets: []
            };

        } catch (error) {
            console.error(`Error connecting to ${network.name}:`, error);
        }
    }

    // Update UI with all networks
    updateAllNetworksUI();
}

// Fetch native token balance for a specific network
async function fetchNativeBalance(chainId, address) {
    try {
        const network = NETWORKS[chainId];
        const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
        
        const balance = await provider.getBalance(address);
        const formattedBalance = ethers.utils.formatEther(balance);
        
        return parseFloat(formattedBalance);

    } catch (error) {
        console.error(`Error fetching balance for chain ${chainId}:`, error);
        return 0;
    }
}

// Update UI with all networks connected
function updateAllNetworksUI() {
    const connectedNetworks = Object.keys(connectedWallet.networks).length;
    const networkBadgeElement = document.getElementById('networkBadge');
    
    if (networkBadgeElement) {
        let html = `
            <span class="networks-count">${connectedNetworks} Networks Connected</span>
            <div class="network-icons">
        `;
        
        // Show up to 4 network icons
        Object.values(connectedWallet.networks).slice(0, 4).forEach(network => {
            html += `<img src="${network.logo}" alt="${network.name}" title="${network.name}">`;
        });
        
        if (connectedNetworks > 4) {
            html += `<span style="font-size: 0.75rem; margin-left: 4px;">+${connectedNetworks - 4}</span>`;
        }
        
        html += `</div>`;
        networkBadgeElement.innerHTML = html;
    }

    // Calculate and display total balance
    calculateTotalBalance();

    // Display all assets
    displayMultiNetworkAssets();
}

// Calculate total balance across all networks
function calculateTotalBalance() {
    let totalUSD = 0;

    Object.values(connectedWallet.networks).forEach(network => {
        // Add native token balance
        if (network.nativeBalance > 0) {
            const priceKey = network.symbol.toUpperCase();
            // You would fetch actual prices from an API
            totalUSD += network.nativeBalance * 100; // Mock price
        }

        // Add token balances
        if (network.assets && network.assets.length > 0) {
            network.assets.forEach(asset => {
                totalUSD += asset.balance * (asset.price || 0);
            });
        }
    });

    connectedWallet.totalBalance = totalUSD;
    
    const totalBalanceElement = document.getElementById('totalBalance');
    if (totalBalanceElement) {
        totalBalanceElement.textContent = `$${totalUSD.toFixed(2)}`;
    }
}

// Display assets from all networks
function displayMultiNetworkAssets() {
    const assetsList = document.getElementById('assetsList');
    
    if (!assetsList) return;

    let html = '';
    let assetCount = 0;

    Object.values(connectedWallet.networks).forEach(network => {
        // Display native token
        if (network.nativeBalance > 0) {
            html += `
                <div class="asset-item">
                    <div class="asset-header">
                        <div class="asset-info">
                            <img src="${network.logo}" alt="${network.nativeCurrency}" class="asset-logo">
                            <div class="asset-details">
                                <h3>${network.nativeCurrency}</h3>
                                <span class="asset-symbol">${network.name}</span>
                            </div>
                        </div>
                        <div class="asset-values">
                            <div class="asset-balance">${network.nativeBalance.toFixed(6)} ${network.nativeCurrency}</div>
                            <div class="asset-usd">$${(network.nativeBalance * 100).toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="asset-network-badge">
                        <img src="${network.logo}" alt="${network.name}">
                        <span>${network.name}</span>
                    </div>
                </div>
            `;
            assetCount++;
        }

        // Display other assets if available
        if (network.assets && network.assets.length > 0) {
            network.assets.forEach(asset => {
                html += `
                    <div class="asset-item">
                        <div class="asset-header">
                            <div class="asset-info">
                                <img src="${asset.logo}" alt="${asset.symbol}" class="asset-logo">
                                <div class="asset-details">
                                    <h3>${asset.name}</h3>
                                    <span class="asset-symbol">${asset.symbol}</span>
                                </div>
                            </div>
                            <div class="asset-values">
                                <div class="asset-balance">${asset.balance.toFixed(6)} ${asset.symbol}</div>
                                <div class="asset-usd">$${(asset.balance * asset.price).toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="asset-network-badge">
                            <img src="${network.logo}" alt="${network.name}">
                            <span>${network.name}</span>
                        </div>
                    </div>
                `;
                assetCount++;
            });
        }
    });

    if (html === '') {
        html = `
            <div class="placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                <p>No assets found across connected networks</p>
            </div>
        `;
    } else {
        // Update asset count
        const assetCountElement = document.getElementById('assetCount');
        if (assetCountElement) {
            assetCountElement.textContent = `${assetCount} assets across all networks`;
        }
    }

    assetsList.innerHTML = html;
}

// Refresh all networks
async function refreshAllNetworks() {
    if (!connectedWallet.address) return;
    
    await connectToAllNetworks(connectedWallet.address);
}

// Handle account changes
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // Wallet disconnected
        disconnectWallet();
    } else {
        // Account changed
        connectedWallet.address = accounts[0];
        refreshAllNetworks();
    }
}

// Disconnect wallet
function disconnectWallet() {
    connectedWallet = {
        address: null,
        networks: {},
        totalBalance: 0
    };
    
    updateWalletStatus(false);
    document.getElementById('statusText').textContent = 'Connect Wallet';
    document.getElementById('assetsList').innerHTML = `
        <div class="placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            <p>Connect wallet to view assets</p>
        </div>
    `;
}

// Update wallet connection status indicator
function updateWalletStatus(isConnected) {
    const statusIndicator = document.getElementById('statusIndicator');
    const connectBtn = document.getElementById('connectBtn');
    
    if (statusIndicator) {
        if (isConnected) {
            statusIndicator.classList.add('connected');
        } else {
            statusIndicator.classList.remove('connected');
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can implement a toast notification system here
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWalletMultiNetwork);
    }
});

// Export functions for modal usage
function openReceiveModal() {
    if (!connectedWallet.address) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }
    
    const receiveModal = document.getElementById('receiveModal');
    receiveModal.classList.remove('hidden');
    
    // Display wallet address
    document.getElementById('walletAddress').textContent = connectedWallet.address;
    
    // Generate QR code
    const qrCode = document.getElementById('qrCode');
    if (qrCode) {
        qrCode.innerHTML = ''; // Clear previous QR code
        new QRCode(qrCode, {
            text: connectedWallet.address,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

function openSendModal() {
    if (!connectedWallet.address) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }
    
    const sendModal = document.getElementById('sendModal');
    sendModal.classList.remove('hidden');
    populateSendTokens();
}

function openSwapModal() {
    if (!connectedWallet.address) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }
    
    const swapModal = document.getElementById('swapModal');
    swapModal.classList.remove('hidden');
    populateSwapTokens();
}

function closeReceiveModal() {
    document.getElementById('receiveModal').classList.add('hidden');
}

function closeSendModal() {
    document.getElementById('sendModal').classList.add('hidden');
}

function closeSwapModal() {
    document.getElementById('swapModal').classList.add('hidden');
}

function copyAddress() {
    const address = document.getElementById('walletAddress').textContent;
    navigator.clipboard.writeText(address).then(() => {
        showNotification('Address copied to clipboard!', 'success');
        
        // Visual feedback
        const copyBtn = event.target.closest('.copy-btn');
        if (copyBtn) {
            copyBtn.classList.add('copied');
            setTimeout(() => copyBtn.classList.remove('copied'), 2000);
        }
    });
}

function populateSendTokens() {
    // Populate send token dropdown with all assets
    const sendToken = document.getElementById('sendToken');
    let html = '<option value="">-- Select Token --</option>';
    
    Object.values(connectedWallet.networks).forEach(network => {
        if (network.nativeBalance > 0) {
            html += `<option value="${network.nativeCurrency}" data-network="${network.chainId}">${network.nativeCurrency} (${network.name})</option>`;
        }
    });
    
    sendToken.innerHTML = html;
}

function populateSwapTokens() {
    // Populate swap token dropdowns
    const swapFromToken = document.getElementById('swapFromToken');
    const swapToToken = document.getElementById('swapToToken');
    let html = '<option value="">-- Select Token --</option>';
    
    Object.values(connectedWallet.networks).forEach(network => {
        if (network.nativeBalance > 0) {
            html += `<option value="${network.nativeCurrency}" data-network="${network.chainId}">${network.nativeCurrency} (${network.name})</option>`;
        }
    });
    
    swapFromToken.innerHTML = html;
    swapToToken.innerHTML = html;
}

function sendAsset() {
    showNotification('Send functionality coming soon!', 'info');
}

function executeSwap() {
    showNotification('Swap functionality coming soon!', 'info');
}

function setMaxAmount() {
    const sendToken = document.getElementById('sendToken').value;
    const sendAmount = document.getElementById('sendAmount');
    
    // Find the token and set max amount
    let maxBalance = 0;
    Object.values(connectedWallet.networks).forEach(network => {
        if (network.nativeCurrency === sendToken) {
            maxBalance = network.nativeBalance;
        }
    });
    
    sendAmount.value = maxBalance.toFixed(6);
}
