// ======================
// NETWORKS CONFIGURATION
// ======================

const NETWORKS = {
  // ETHEREUM
  1: {
    name: 'Ethereum Mainnet',
    displayName: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorer: 'https://etherscan.io',
    currency: 'ETH',
    type: 'mainnet',
    icon: '🔵',
    color: '#627EEA'
  },
  11155111: {
    name: 'Sepolia Testnet',
    displayName: 'Ethereum (Testnet)',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://sepolia.etherscan.io',
    currency: 'ETH',
    type: 'testnet',
    icon: '🔵',
    color: '#627EEA',
    educationalDisplay: true
  },
  3: {
    name: 'Ropsten Testnet',
    displayName: 'Ethereum (Testnet)',
    chainId: 3,
    rpcUrl: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorer: 'https://ropsten.etherscan.io',
    currency: 'ETH',
    type: 'testnet',
    icon: '🔵',
    color: '#627EEA',
    educationalDisplay: true
  },

  // BINANCE SMART CHAIN
  56: {
    name: 'BSC Mainnet',
    displayName: 'BNB Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    currency: 'BNB',
    type: 'mainnet',
    icon: '🟡',
    color: '#F3BA2F'
  },
  97: {
    name: 'BSC Testnet',
    displayName: 'BNB Chain (Testnet)',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-b.binance.org:8545',
    explorer: 'https://testnet.bscscan.com',
    currency: 'BNB',
    type: 'testnet',
    icon: '🟡',
    color: '#F3BA2F',
    educationalDisplay: true
  },

  // TRON
  2: {
    name: 'TRON Mainnet',
    displayName: 'TRON',
    chainId: 2,
    rpcUrl: 'https://api.trongrid.io',
    explorer: 'https://tronscan.org',
    currency: 'TRX',
    type: 'mainnet',
    icon: '🔴',
    color: '#EB0029',
    isTron: true
  },
  3030: {
    name: 'TRON Nile Testnet',
    displayName: 'TRON (Testnet)',
    chainId: 3030,
    rpcUrl: 'https://nile.trongrid.io',
    explorer: 'https://nile.tronscan.org',
    currency: 'TRX',
    type: 'testnet',
    icon: '🔴',
    color: '#EB0029',
    isTron: true,
    educationalDisplay: true
  },

  // BITCOIN (tBTC - Testnet)
  18: {
    name: 'Bitcoin Testnet',
    displayName: 'Bitcoin (Testnet)',
    chainId: 18,
    rpcUrl: 'https://testnet.bitcoin.org',
    explorer: 'https://testnet.blockchain.info',
    currency: 'tBTC',
    type: 'testnet',
    icon: '🟠',
    color: '#F7931A',
    isBitcoin: true,
    educationalDisplay: true
  }
};

// ======================
// TOKENS CONFIGURATION
// ======================

const TOKENS = {
  // ETHEREUM MAINNET
  1: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: null,
      type: 'native',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      color: '#627EEA',
      coingeckoId: 'ethereum'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      color: '#26A17B',
      coingeckoId: 'tether'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      color: '#2775CA',
      coingeckoId: 'usd-coin'
    },
    {
      symbol: 'SHIB',
      name: 'Shiba Inu',
      decimals: 18,
      address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
      color: '#F1622E',
      coingeckoId: 'shiba-inu'
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/dai-dai-logo.png',
      color: '#F5AC1B',
      coingeckoId: 'dai'
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      address: '0x2260FAC5E5542a773Aa44fBCfeDd86b8040f1A02',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
      color: '#F7931A',
      coingeckoId: 'wrapped-bitcoin'
    }
  ],

  // ETHEREUM SEPOLIA TESTNET
  11155111: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: null,
      type: 'native',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      color: '#627EEA',
      coingeckoId: 'ethereum',
      testnet: true
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      address: '0xda9d5Ac1B516B49218F373D792437303982e53e8',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      color: '#26A17B',
      coingeckoId: 'tether',
      testnet: true
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0x6Aed826f1e6e38e2E8a2ef1972d5054eBd3BAFC0',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      color: '#2775CA',
      coingeckoId: 'usd-coin',
      testnet: true
    },
    {
      symbol: 'SHIB',
      name: 'Shiba Inu',
      decimals: 18,
      address: '0x9e546e69a5519d0d9aB7e5504F01fac2cA375dc5',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
      color: '#F1622E',
      coingeckoId: 'shiba-inu',
      testnet: true
    }
  ],

  // ETHEREUM ROPSTEN TESTNET
  3: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: null,
      type: 'native',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      color: '#627EEA',
      coingeckoId: 'ethereum',
      testnet: true
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      address: '0x110a343bc3d1ceed82f56e839cf6862b3121827d',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      color: '#26A17B',
      coingeckoId: 'tether',
      testnet: true
    }
  ],

  // BSC MAINNET
  56: [
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      decimals: 18,
      address: null,
      type: 'native',
      logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
      color: '#F3BA2F',
      coingeckoId: 'binancecoin'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      address: '0x55d398326f99059fF775485246999027B3197955',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      color: '#26A17B',
      coingeckoId: 'tether'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0x8AC76a51cc950d9822D68b83Fe1Ad97B32Cd580d',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      color: '#2775CA',
      coingeckoId: 'usd-coin'
    },
    {
      symbol: 'SHIB',
      name: 'Shiba Inu',
      decimals: 18,
      address: '0x2859e4944f1f4fe89e98406f0eab91eb1c0d3a2f',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
      color: '#F1622E',
      coingeckoId: 'shiba-inu'
    }
  ],

  // BSC TESTNET
  97: [
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      decimals: 18,
      address: null,
      type: 'native',
      logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
      color: '#F3BA2F',
      coingeckoId: 'binancecoin',
      testnet: true
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDf',
      type: 'erc20',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      color: '#26A17B',
      coingeckoId: 'tether',
      testnet: true
    }
  ],

  // TRON MAINNET
  2: [
    {
      symbol: 'TRX',
      name: 'TRON',
      decimals: 6,
      address: null,
      type: 'native',
      logo: 'https://cryptologos.cc/logos/tron-trx-logo.png',
      color: '#EB0029',
      coingeckoId: 'tron'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      address: 'TR7NHqjeKQxGTCi8q282RJWJJWAJ5TtySJ',
      type: 'trc20',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      color: '#26A17B',
      coingeckoId: 'tether'
    }
  ],

  // BITCOIN TESTNET
  18: [
    {
      symbol: 'tBTC',
      name: 'Bitcoin Testnet',
      decimals: 8,
      address: null,
      type: 'native',
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      color: '#F7931A',
      coingeckoId: 'bitcoin',
      testnet: true
    }
  ]
};

// ======================
// ERC20 ABI (Simplified)
// ======================

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)'
];

// ======================
// WALLET PROVIDERS
// ======================

const WALLET_PROVIDERS = {
  metamask: {
    name: 'MetaMask',
    icon: '🦊',
    check: () => window.ethereum && window.ethereum.isMetaMask,
    connect: async () => {
      return await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
    }
  },
  walletconnect: {
    name: 'WalletConnect',
    icon: '📱',
    check: () => true,
    connect: async () => {
      console.log('WalletConnect implementation pending');
      throw new Error('WalletConnect not yet implemented');
    }
  }
};

// ======================
// COINGECKO API
// ======================

const COINGECKO_API = {
  baseUrl: 'https://api.coingecko.com/api/v3',

  async getPrices(ids) {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      );
      if (!response.ok) throw new Error('API error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      return {};
    }
  },

  async getTokenData(id) {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/${id}?localization=false`
      );
      if (!response.ok) throw new Error('API error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch token data:', error);
      return null;
    }
  }
};

// ======================
// UTILITY FUNCTIONS
// ======================

function getNetworkConfig(chainId) {
  return NETWORKS[chainId] || NETWORKS[1];
}

function getNetworkTokens(chainId) {
  return TOKENS[chainId] || TOKENS[1];
}

function getTokenBySymbol(chainId, symbol) {
  const tokens = getNetworkTokens(chainId);
  return tokens.find(t => t.symbol === symbol) || null;
}

function getTokenByAddress(chainId, address) {
  const tokens = getNetworkTokens(chainId);
  return tokens.find(t => t.address === address) || null;
}

function shortenAddress(address, length = 6) {
  if (!address || typeof address !== 'string') return '';
  return address.slice(0, length) + '...' + address.slice(-length);
}

function formatBalance(balance, decimals = 2) {
  const num = parseFloat(balance) || 0;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

function formatUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
}

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// ======================
// DEX SWAP OPTIONS
// ======================

const SWAP_OPTIONS = {
  ethereum: [
    {
      name: 'Uniswap V3',
      icon: '🦄',
      url: 'https://app.uniswap.org',
      color: '#FF007A',
      description: 'Leading DEX on Ethereum'
    },
    {
      name: '1inch',
      icon: '🔀',
      url: 'https://app.1inch.io',
      color: '#1C3AFD',
      description: 'Multi-DEX aggregator'
    },
    {
      name: 'SushiSwap',
      icon: '🍣',
      url: 'https://www.sushi.com/swap',
      color: '#FA52A0',
      description: 'Community DEX'
    }
  ],
  binance: [
    {
      name: 'PancakeSwap',
      icon: '🥞',
      url: 'https://pancakeswap.finance',
      color: '#25BE63',
      description: 'Leading BSC DEX'
    },
    {
      name: '1inch',
      icon: '🔀',
      url: 'https://app.1inch.io',
      color: '#1C3AFD',
      description: 'Multi-chain aggregator'
    }
  ],
  tron: [
    {
      name: 'SunSwap',
      icon: '☀️',
      url: 'https://sunswap.com',
      color: '#FFD700',
      description: 'TRON native DEX'
    }
  ]
};

// ======================
// NETWORK GROUPS
// ======================

const NETWORK_GROUPS = {
  ethereum: {
    mainnet: [1],
    testnet: [11155111, 3]
  },
  binance: {
    mainnet: [56],
    testnet: [97]
  },
  tron: {
    mainnet: [2],
    testnet: [3030]
  },
  bitcoin: {
    testnet: [18]
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NETWORKS,
    TOKENS,
    ERC20_ABI,
    WALLET_PROVIDERS,
    COINGECKO_API,
    SWAP_OPTIONS,
    NETWORK_GROUPS,
    getNetworkConfig,
    getNetworkTokens,
    getTokenBySymbol,
    getTokenByAddress,
    shortenAddress,
    formatBalance,
    formatUSD,
    isValidAddress
  };
}
