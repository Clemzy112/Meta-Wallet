// ======================
// SWAP & DEX MODULE
// ======================

let swapQuotes = {};
let selectedDex = null;

// ======================
// GET AVAILABLE DEXES
// ======================

function getAvailableDexes(chainId) {
    const networkConfig = getNetworkConfig(chainId);
    
    if (networkConfig.currency === 'ETH') {
        return SWAP_OPTIONS.ethereum;
    } else if (networkConfig.currency === 'BNB') {
        return SWAP_OPTIONS.binance;
    } else if (networkConfig.currency === 'TRX') {
        return SWAP_OPTIONS.tron;
    }
    
    return [];
}

// ======================
// GET SWAP QUOTES
// ======================

async function getSwapQuote(fromToken, toToken, amount, chainId) {
    try {
        // Using 1inch API for quote
        const fromTokenObj = getTokenBySymbol(chainId, fromToken);
        const toTokenObj = getTokenBySymbol(chainId, toToken);
        
        if (!fromTokenObj || !toTokenObj) {
            throw new Error('Token not found');
        }
        
        const fromAmount = ethers.utils.parseUnits(amount, fromTokenObj.decimals);
        
        // Simplified quote calculation (in production, use actual DEX APIs)
        const quote = {
            fromToken: fromToken,
            toToken: toToken,
            fromAmount: amount,
            toAmount: (parseFloat(amount) * 0.99).toString(), // 99% rate (1% slippage)
            rate: 0.99,
            priceImpact: 0.01,
            minReceived: (parseFloat(amount) * 0.9801).toString(), // With 1% slippage
            dexes: getAvailableDexes(chainId).slice(0, 3),
            estimatedTime: '10-30 seconds',
            gasEstimate: '0.005 ETH'
        };
        
        swapQuotes[`${fromToken}-${toToken}`] = quote;
        return quote;
        
    } catch (error) {
        console.error('Failed to get swap quote:', error);
        return null;
    }
}

// ======================
// EXECUTE SWAP ON DEX
// ======================

async function executeSwapOnDex(dexName, fromToken, toToken, amount, slippage = 1) {
    try {
        if (!isConnected) {
            throw new Error('Wallet not connected');
        }
        
        const dex = getAvailableDexes(connectedChainId)
            .find(d => d.name === dexName);
        
        if (!dex) {
            throw new Error('DEX not found');
        }
        
        // Redirect to DEX with swap parameters
        let swapUrl = dex.url;
        const networkConfig = getNetworkConfig(connectedChainId);
        
        if (dex.name === 'Uniswap V3') {
            swapUrl += `?inputCurrency=${getTokenAddress(fromToken, connectedChainId)}&outputCurrency=${getTokenAddress(toToken, connectedChainId)}`;
        } else if (dex.name === '1inch') {
            swapUrl += `#/swap`;
        }
        
        window.open(swapUrl, '_blank');
        
        return {
            success: true,
            message: `Opening ${dex.name}. Complete the swap and return here.`,
            dex: dexName
        };
        
    } catch (error) {
        console.error('Swap execution error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ======================
// GET TOKEN ADDRESS
// ======================

function getTokenAddress(symbol, chainId) {
    const token = getTokenBySymbol(chainId, symbol);
    return token?.address || '0x0000000000000000000000000000000000000000';
}

// ======================
// ESTIMATE SWAP GAS
// ======================

async function estimateSwapGas(fromToken, toToken, amount) {
    try {
        if (!provider) return null;
        
        const gasPrice = await provider.getGasPrice();
        const estimatedGas = ethers.BigNumber.from('150000'); // Typical swap gas
        
        const gasCost = estimatedGas.mul(gasPrice);
        const gasCostEth = ethers.utils.formatEther(gasCost);
        
        return {
            gas: estimatedGas.toString(),
            gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
            cost: gasCostEth,
            costUSD: '0.00' // Would need ETH price
        };
        
    } catch (error) {
        console.error('Gas estimation error:', error);
        return null;
    }
}

// ======================
// APPROVE TOKEN FOR SWAP
// ======================

async function approveForSwap(tokenSymbol, dexAddress, amount) {
    try {
        const token = getTokenBySymbol(connectedChainId, tokenSymbol);
        
        if (!token || token.type === 'native') {
            return { success: true }; // Native tokens don't need approval
        }
        
        const result = await approveToken(
            token.address,
            dexAddress,
            amount,
            token.decimals
        );
        
        return result;
        
    } catch (error) {
        console.error('Approval error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ======================
// PRICE IMPACT CALCULATOR
// ======================

function calculatePriceImpact(fromAmount, toAmount) {
    // Simplified calculation
    const marketRate = parseFloat(fromAmount);
    const actualRate = parseFloat(toAmount);
    const impact = ((marketRate - actualRate) / marketRate) * 100;
    return Math.max(0, impact);
}

// ======================
// SLIPPAGE SETTINGS
// ======================

const SLIPPAGE_SETTINGS = {
    LOW: 0.1,      // 0.1%
    MEDIUM: 0.5,   // 0.5%
    HIGH: 1.0,     // 1%
    CUSTOM: null   // User input
};

function getSlippageAmount(amount, slippage) {
    return (parseFloat(amount) * (slippage / 100)).toFixed(6);
}

// ======================
// SWAP HISTORY
// ======================

let swapHistory = [];

function addToSwapHistory(swap) {
    swapHistory.push({
        ...swap,
        timestamp: new Date().toISOString(),
        id: Date.now()
    });
    
    // Save to localStorage
    localStorage.setItem('swapHistory', JSON.stringify(swapHistory));
}

function getSwapHistory() {
    return swapHistory;
}

function clearSwapHistory() {
    swapHistory = [];
    localStorage.removeItem('swapHistory');
}

// Load swap history from localStorage
function loadSwapHistory() {
    const saved = localStorage.getItem('swapHistory');
    if (saved) {
        swapHistory = JSON.parse(saved);
    }
}

// ======================
// FAVORITE PAIRS
// ======================

let favoritePairs = [];

function addFavoritePair(fromToken, toToken) {
    const pair = `${fromToken}/${toToken}`;
    if (!favoritePairs.includes(pair)) {
        favoritePairs.push(pair);
        localStorage.setItem('favoritePairs', JSON.stringify(favoritePairs));
    }
}

function removeFavoritePair(fromToken, toToken) {
    const pair = `${fromToken}/${toToken}`;
    favoritePairs = favoritePairs.filter(p => p !== pair);
    localStorage.setItem('favoritePairs', JSON.stringify(favoritePairs));
}

function getFavoritePairs() {
    return favoritePairs;
}

function loadFavoritePairs() {
    const saved = localStorage.getItem('favoritePairs');
    if (saved) {
        favoritePairs = JSON.parse(saved);
    }
}

// ======================
// EXPORT
// ======================

window.SwapManager = {
    getAvailableDexes,
    getSwapQuote,
    executeSwapOnDex,
    estimateSwapGas,
    approveForSwap,
    calculatePriceImpact,
    getSlippageAmount,
    addToSwapHistory,
    getSwapHistory,
    clearSwapHistory,
    addFavoritePair,
    removeFavoritePair,
    getFavoritePairs,
    SLIPPAGE_SETTINGS
};

// Initialize
loadSwapHistory();
loadFavoritePairs();
