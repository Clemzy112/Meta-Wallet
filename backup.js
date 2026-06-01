// ======================
// BACKUP & SECURITY MODULE
// ======================

// ======================
// ENCRYPTION UTILITIES
// ======================

async function encryptData(data, password) {
    try {
        // Using SubtleCrypto for AES encryption
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        // Derive key from password
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('SafeWallet'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        
        // Generate IV
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Encrypt
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            dataBuffer
        );
        
        // Combine IV + encrypted data
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);
        
        return btoa(String.fromCharCode(...combined));
        
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

async function decryptData(encryptedString, password) {
    try {
        const encoder = new TextEncoder();
        const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
        
        // Extract IV
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);
        
        // Derive key from password
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('SafeWallet'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        
        // Decrypt
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedData
        );
        
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decryptedData));
        
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// ======================
// SEED PHRASE BACKUP
// ======================

function generateSeedPhrase() {
    const words = [
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
        'abuse', 'access', 'accident', 'account', 'achieve', 'acid', 'acoustic', 'acquire'
    ];
    
    const phrase = [];
    for (let i = 0; i < 12; i++) {
        phrase.push(words[Math.floor(Math.random() * words.length)]);
    }
    
    return phrase.join(' ');
}

function validateSeedPhrase(phrase) {
    const words = phrase.trim().split(/\s+/);
    
    if (words.length !== 12 && words.length !== 24) {
        return {
            valid: false,
            error: 'Seed phrase must be 12 or 24 words'
        };
    }
    
    return {
        valid: true,
        wordCount: words.length
    };
}

function exportSeedPhrase(password) {
    return {
        warning: 'NEVER share your seed phrase with anyone',
        steps: [
            '1. Open MetaMask Settings',
            '2. Go to Security & Privacy',
            '3. Click "Reveal Seed Phrase"',
            '4. Copy your 12-word phrase',
            '5. Store it OFFLINE in a safe place'
        ]
    };
}

// ======================
// JSON BACKUP
// ======================

async function exportWalletAsJSON(password) {
    try {
        if (!isConnected) {
            throw new Error('Wallet not connected');
        }
        
        const backupData = {
            address: userAddress,
            chainId: connectedChainId,
            network: getNetworkConfig(connectedChainId).name,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
        
        // Encrypt sensitive data
        const encrypted = await encryptData(backupData, password);
        
        if (!encrypted) {
            throw new Error('Encryption failed');
        }
        
        // Create download file
        const dataStr = JSON.stringify({
            encrypted: encrypted,
            algorithm: 'AES-256-GCM',
            version: '1.0.0'
        });
        
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wallet-backup-${userAddress.slice(-8)}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        return {
            success: true,
            message: 'Wallet backup exported successfully'
        };
        
    } catch (error) {
        console.error('Export error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function importWalletFromJSON(file, password) {
    try {
        const content = await file.text();
        const backupData = JSON.parse(content);
        
        if (!backupData.encrypted) {
            throw new Error('Invalid backup file format');
        }
        
        // Decrypt
        const decrypted = await decryptData(backupData.encrypted, password);
        
        if (!decrypted) {
            throw new Error('Invalid password or corrupted backup');
        }
        
        return {
            success: true,
            data: decrypted
        };
        
    } catch (error) {
        console.error('Import error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ======================
// BACKUP SCHEDULE
// ======================

let autoBackupEnabled = false;
let autoBackupInterval = null;

function enableAutoBackup(interval = 86400000) {
    autoBackupEnabled = true;
    
    autoBackupInterval = setInterval(() => {
        performAutoBackup();
    }, interval);
    
    localStorage.setItem('autoBackupEnabled', 'true');
}

function disableAutoBackup() {
    autoBackupEnabled = false;
    if (autoBackupInterval) {
        clearInterval(autoBackupInterval);
    }
    localStorage.setItem('autoBackupEnabled', 'false');
}

async function performAutoBackup() {
    console.log('Auto backup triggered');
}

// ======================
// BACKUP STATUS
// ======================

function getBackupStatus() {
    const lastBackup = localStorage.getItem('lastBackupTime');
    const backupCount = localStorage.getItem('backupCount') || '0';
    
    return {
        hasBackup: !!lastBackup,
        lastBackup: lastBackup ? new Date(lastBackup).toLocaleString() : 'Never',
        backupCount: parseInt(backupCount),
        autoBackupEnabled: autoBackupEnabled
    };
}

function recordBackup() {
    const count = parseInt(localStorage.getItem('backupCount') || '0') + 1;
    localStorage.setItem('lastBackupTime', new Date().toISOString());
    localStorage.setItem('backupCount', count.toString());
}

// ======================
// SECURITY CHECKLIST
// ======================

function getSecurityChecklist() {
    return {
        items: [
            {
                id: 'password',
                title: 'Use Strong Password',
                description: 'At least 12 characters with mixed case',
                completed: false
            },
            {
                id: 'backup',
                title: 'Create Backup',
                description: 'Export wallet data or seed phrase',
                completed: getBackupStatus().hasBackup
            },
            {
                id: 'verify',
                title: 'Verify Address',
                description: 'Always double-check recipient address',
                completed: false
            },
            {
                id: 'never-share',
                title: 'Never Share Keys',
                description: 'Keep seed phrase and private keys secret',
                completed: false
            }
        ],
        completionScore: function() {
            const completed = this.items.filter(i => i.completed).length;
            return Math.round((completed / this.items.length) * 100);
        }
    };
}

// ======================
// DEVICE BACKUP
// ======================

function downloadBackupFile(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// ======================
// RESTORE FROM BACKUP
// ======================

async function restoreFromBackup(backupData) {
    try {
        if (!backupData.address) {
            throw new Error('Invalid backup data');
        }
        
        return {
            success: true,
            message: 'Backup restored successfully',
            address: backupData.address
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ======================
// EXPORT MODULE
// ======================

window.BackupManager = {
    encryptData,
    decryptData,
    generateSeedPhrase,
    validateSeedPhrase,
    exportSeedPhrase,
    exportWalletAsJSON,
    importWalletFromJSON,
    enableAutoBackup,
    disableAutoBackup,
    getBackupStatus,
    recordBackup,
    getSecurityChecklist,
    downloadBackupFile,
    restoreFromBackup,
    BACKUP_OPTIONS: BACKUP_OPTIONS
};

// Initialize
const saved = localStorage.getItem('autoBackupEnabled');
if (saved === 'true') {
    enableAutoBackup();
}
