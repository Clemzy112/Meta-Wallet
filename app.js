// ======================
// APP INITIALIZATION
// ======================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing MultiChain Wallet DApp');
    
    initializeEventListeners();
    setupThemeToggle();
    checkWalletConnection();
    
    console.log('✅ App initialized successfully');
});

// ======================
// EVENT LISTENERS
// ======================

function initializeEventListeners() {
    // Connect/Disconnect Wallet
    const connectBtn = document.getElementById('connectBtn');
    connectBtn?.addEventListener('click', handleWalletConnection);
    
    // Modal overlays
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.target.closest('.modal')?.classList.add('hidden');
        });
    });
    
    // Close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal')?.classList.add('hidden');
        });
    });
    
    // Prevent modal close when clicking on content
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    
    // Form submissions
    setupFormHandlers();
    
    // Window events
    window.addEventListener('focus', () => {
        if (isConnected) {
            loadPortfolio();
        }
    });
    
    // Handle Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function setupFormHandlers() {
    // Send form
    const sendAmountInput = document.getElementById('sendAmount');
    sendAmountInput?.addEventListener('input', (e) => {
        // Validate input
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
    });
    
    // Swap inputs
    const swapFromAmount = document.getElementById('swapFromAmount');
    swapFromAmount?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
        updateSwapDetails();
    });
}

// ======================
// WALLET CONNECTION
// ======================

async function handleWalletConnection() {
    if (isConnected) {
        // Disconnect
        disconnectWallet();
        updateWalletStatus();
    } else {
        // Connect
        await connectWalletFlow();
    }
}

async function connectWalletFlow() {
    try {
        const walletInfo = await detectWallet();
        
        if (!walletInfo) {
            showNotification(
                '❌ No Web3 wallet detected. Please install MetaMask or use Trust Wallet.',
                'danger'
            );
            return;
        }
        
        showLoading('Connecting wallet...');
        
        const result = await connectWallet();
        
        if (result.success) {
            showNotification(
                `✅ Wallet connected! ${shortenAddress(result.address)}`,
                'success'
            );
            updateWalletStatus();
            await loadPortfolio();
        } else {
            showNotification(`❌ Connection failed: ${result.error}`, 'danger');
        }
        
    } catch (error) {
        console.error('Connection error:', error);
        showNotification('❌ Failed to connect wallet', 'danger');
    } finally {
        hideLoading();
    }
}

async function checkWalletConnection() {
    try {
        const walletInfo = await detectWallet();
        
        if (walletInfo?.isConnected) {
            // Try to reconnect
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });
            
            if (accounts.length > 0) {
                const result = await connectWallet();
                if (result.success) {
                    updateWalletStatus();
                    await loadPortfolio();
                }
            }
        }
    } catch (error) {
        console.error('Auto-connect failed:', error);
    }
}

// ======================
// THEME TOGGLE
// ======================

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const appWrapper = document.querySelector('.app-wrapper');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    applyTheme(savedTheme);
    
    themeToggle?.addEventListener('click', () => {
        const isDarkMode = appWrapper?.classList.contains('dark-theme');
        const newTheme = isDarkMode ? 'light-theme' : 'dark-theme';
        
        appWrapper?.classList.remove('dark-theme', 'light-theme');
        appWrapper?.classList.add(newTheme);
        
        localStorage.setItem('theme', newTheme);
        
        // Animate theme toggle button
        themeToggle.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            themeToggle.style.transform = 'rotate(0deg)';
        }, 300);
    });
}

function applyTheme(theme) {
    const appWrapper = document.querySelector('.app-wrapper');
    appWrapper?.classList.remove('dark-theme', 'light-theme');
    appWrapper?.classList.add(theme);
}

// ======================
// NETWORK SWITCHING
// ======================

async function switchNetworkUI(chainId) {
    try {
        showLoading('Switching network...');
        await switchNetwork(chainId);
    } catch (error) {
        const networkName = getNetworkConfig(chainId).name;
        showNotification(`Failed to switch to ${networkName}`, 'danger');
    } finally {
        hideLoading();
    }
}

// ======================
// GLOBAL ERROR HANDLER
// ======================

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showNotification('An unexpected error occurred', 'danger');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    showNotification('An unexpected error occurred', 'danger');
});

// ======================
// EXPORT FOR TESTING
// ======================

window.AppState = {
    get isConnected() {
        return isConnected;
    },
    get userAddress() {
        return userAddress;
    },
    get chainId() {
        return connectedChainId;
    },
    get provider() {
        return provider;
    },
    get signer() {
        return signer;
    }
};

// ======================
// VERSION & INFO
// ======================

console.log(`
╔════════════════════════════════════════╗
║   MultiChain Wallet DApp v1.0.0      ║
║   Professional EVM Wallet Interface   ║
╚════════════════════════════════════════╝

✨ Features:
  ✓ Multi-chain support (Ethereum, Sepolia, Ropsten)
  ✓ EVM wallet integration (MetaMask)
  ✓ Real-time balance tracking
  ✓ Transaction management
  ✓ Dark/Light theme
  ✓ Professional SafePal-style UI

🔗 Networks supported:
  • Ethereum Mainnet (Chain ID: 1)
  • Sepolia Testnet (Chain ID: 11155111)
  • Ropsten Testnet (Chain ID: 3)

💡 Pro Tips:
  • Use Sepolia testnet for testing
  • Get testnet ETH from faucets
  • Always verify addresses before sending
  • Keep your private keys secure

📊 Built with:
  • ethers.js for blockchain interaction
  • Modern responsive CSS
  • Pure JavaScript (no frameworks)

🚀 Ready to use!
`);
