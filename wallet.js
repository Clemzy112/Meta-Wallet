// ======================
// WALLET STATE
// ======================

let provider = null;
let signer = null;
let userAddress = null;
let connectedChainId = 1;
let isConnected = false;

// ======================
// WALLET DETECTION & CONNECTION
// ======================

async function detectWallet() {
    if (!window.ethereum) {
        console.warn('No Ethereum provider detected');
        return null;
    }
    
    return {
        isMetaMask: window.ethereum.isMetaMask,
        isConnected: window.ethereum.isConnected?.(),
        chainId: parseInt(window.ethereum.chainId, 16)
    };
}

async function connectWallet(provider = 'metamask') {
    try {
        if (!window.ethereum) {
            throw new Error('No Web3 wallet found. Please install MetaMask or use Trust Wallet');
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts returned from wallet');
        }

        userAddress = accounts[0];
        signer = provider.getSigner();
        
        // Get current network
        const network = await provider.getNetwork();
        connectedChainId = network.chainId;
        
        isConnected = true;

        // Setup event listeners
        setupWalletListeners();
        
        return {
            success: true,
            address: userAddress,
            chainId: connectedChainId
        };

    } catch (error) {
        console.error('Wallet connection error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

function setupWalletListeners() {
    if (!window.ethereum) return;

    // Account change listener
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            userAddress = accounts[0];
            onWalletChanged();
        }
    });

    // Chain change listener
    window.ethereum.on('chainChanged', (chainId) => {
        connectedChainId = parseInt(chainId, 16);
        onNetworkChanged();
    });

    // Connection listener
    window.ethereum.on('connect', (connectInfo) => {
        console.log('Wallet connected:', connectInfo);
    });

    // Disconnection listener
    window.ethereum.on('disconnect', (error) => {
        console.log('Wallet disconnected:', error);
        disconnectWallet();
    });
}

function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;
    isConnected = false;
    connectedChainId = 1;
    
    // Trigger UI update
    onWalletChanged();
}

// ======================
// NETWORK SWITCHING
// ======================

async function switchNetwork(chainId) {
    try {
        if (!window.ethereum) {
            throw new Error('No Ethereum provider');
        }

        const chainIdHex = '0x' + chainId.toString(16);
        
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }]
            });
        } catch (error) {
            if (error.code === 4902) {
                // Network not added, try to add it
                const networkConfig = getNetworkConfig(chainId);
                await addNetwork(networkConfig);
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('Network switch error:', error);
        throw error;
    }
}

async function addNetwork(config) {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x' + config.chainId.toString(16),
                chainName: config.name,
                nativeCurrency: {
                    name: config.currency,
                    symbol: config.currency,
                    decimals: 18
                },
                rpcUrls: [config.rpcUrl],
                blockExplorerUrls: [config.explorer]
            }]
        });
    } catch (error) {
        console.error('Failed to add network:', error);
        throw error;
    }
}

// ======================
// BALANCE QUERIES
// ======================

async function getNativeBalance() {
    try {
        if (!provider || !userAddress) return '0';
        
        const balance = await provider.getBalance(userAddress);
        return ethers.utils.formatEther(balance);
    } catch (error) {
        console.error('Failed to get native balance:', error);
        return '0';
    }
}

async function getTokenBalance(tokenAddress, decimals) {
    try {
        if (!provider || !userAddress) return '0';
        
        const contract = new ethers.Contract(
            tokenAddress,
            ERC20_ABI,
            provider
        );
        
        const balance = await contract.balanceOf(userAddress);
        return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
        console.error('Failed to get token balance:', error);
        return '0';
    }
}

async function getAllBalances() {
    try {
        if (!isConnected) return {};
        
        const tokens = getNetworkTokens(connectedChainId);
        const balances = {};

        for (const token of tokens) {
            let balance = '0';
            
            if (token.type === 'native') {
                balance = await getNativeBalance();
            } else {
                balance = await getTokenBalance(token.address, token.decimals);
            }
            
            balances[token.symbol] = balance;
        }

        return balances;
    } catch (error) {
        console.error('Failed to get all balances:', error);
        return {};
    }
}

// ======================
// TOKEN OPERATIONS
// ======================

async function sendToken(to, amount, tokenAddress, decimals) {
    try {
        if (!signer || !userAddress) {
            throw new Error('Wallet not connected');
        }

        if (!ethers.utils.isAddress(to)) {
            throw new Error('Invalid recipient address');
        }

        const parsedAmount = ethers.utils.parseUnits(amount, decimals);

        let tx;

        if (tokenAddress) {
            // ERC20 token transfer
            const contract = new ethers.Contract(
                tokenAddress,
                ERC20_ABI,
                signer
            );

            tx = await contract.transfer(to, parsedAmount);
        } else {
            // Native token transfer
            tx = await signer.sendTransaction({
                to: to,
                value: parsedAmount
            });
        }

        const receipt = await tx.wait();
        return {
            success: true,
            hash: tx.hash,
            receipt: receipt
        };

    } catch (error) {
        console.error('Transfer error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function approveToken(tokenAddress, spender, amount, decimals) {
    try {
        if (!signer) {
            throw new Error('Wallet not connected');
        }

        const contract = new ethers.Contract(
            tokenAddress,
            ERC20_ABI,
            signer
        );

        const parsedAmount = ethers.utils.parseUnits(amount, decimals);

        const tx = await contract.approve(spender, parsedAmount);
        const receipt = await tx.wait();

        return {
            success: true,
            hash: tx.hash,
            receipt: receipt
        };

    } catch (error) {
        console.error('Approval error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function getAllowance(tokenAddress, spender, decimals) {
    try {
        if (!provider || !userAddress) return '0';

        const contract = new ethers.Contract(
            tokenAddress,
            ERC20_ABI,
            provider
        );

        const allowance = await contract.allowance(userAddress, spender);
        return ethers.utils.formatUnits(allowance, decimals);

    } catch (error) {
        console.error('Failed to get allowance:', error);
        return '0';
    }
}

// ======================
// TRANSACTION HISTORY
// ======================

async function getTransactionHistory(limit = 10) {
    try {
        if (!userAddress) return [];
        
        const networkConfig = getNetworkConfig(connectedChainId);
        // This is a simplified example - in production, use Etherscan API or subgraph
        return [];

    } catch (error) {
        console.error('Failed to fetch transaction history:', error);
        return [];
    }
}

// ======================
// PRICE & PORTFOLIO
// ======================

async function getPortfolioValue(balances) {
    try {
        const tokens = getNetworkTokens(connectedChainId);
        const priceIds = tokens
            .filter(t => t.coingeckoId)
            .map(t => t.coingeckoId);

        if (priceIds.length === 0) return 0;

        const prices = await COINGECKO_API.getPrices(priceIds);
        let totalValue = 0;

        for (const token of tokens) {
            if (!token.coingeckoId) continue;
            
            const balance = parseFloat(balances[token.symbol] || 0);
            const price = prices[token.coingeckoId]?.usd || 0;
            
            totalValue += balance * price;
        }

        return totalValue;

    } catch (error) {
        console.error('Failed to calculate portfolio value:', error);
        return 0;
    }
}

// ======================
// EVENT CALLBACKS (to be implemented in ui.js)
// ======================

function onWalletChanged() {
    // This will be overridden in ui.js
    console.log('Wallet state changed');
}

function onNetworkChanged() {
    // This will be overridden in ui.js
    console.log('Network changed');
}

// ======================
// GAS ESTIMATION
// ======================

async function estimateGas(to, amount, tokenAddress = null) {
    try {
        if (!signer || !userAddress) {
            throw new Error('Wallet not connected');
        }

        let gasEstimate;

        if (tokenAddress) {
            // ERC20 transfer gas estimate
            const contract = new ethers.Contract(
                tokenAddress,
                ERC20_ABI,
                signer
            );
            
            const decimals = await contract.decimals();
            const parsedAmount = ethers.utils.parseUnits(amount, decimals);
            
            gasEstimate = await contract.estimateGas.transfer(to, parsedAmount);
        } else {
            // Native transfer gas estimate
            gasEstimate = await signer.estimateGas({
                to: to,
                value: ethers.utils.parseEther(amount)
            });
        }

        const gasPrice = await provider.getGasPrice();
        const gasCost = gasEstimate.mul(gasPrice);
        const gasCostEth = ethers.utils.formatEther(gasCost);

        return {
            estimate: gasEstimate.toString(),
            gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
            cost: gasCostEth,
            costUSD: '0.00' // Would need current ETH price
        };

    } catch (error) {
        console.error('Gas estimation error:', error);
        return null;
    }
}

// Export for use in other modules
window.WalletManager = {
    connectWallet,
    disconnectWallet,
    switchNetwork,
    sendToken,
    approveToken,
    getTokenBalance,
    getNativeBalance,
    getAllBalances,
    getPortfolioValue,
    getTransactionHistory,
    estimateGas,
    getConnectedAddress: () => userAddress,
    getChainId: () => connectedChainId,
    isConnected: () => isConnected
};
