// Fungsi untuk menghasilkan pasangan kunci RSA
async function generateRSAKeys() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",  // Algoritma RSA
            modulusLength: 2048,  // Panjang kunci RSA
            publicExponent: new Uint8Array([1, 0, 1]),  // Eksponen publik (65537)
            hash: "SHA-256",  // Hash yang digunakan
        },
        true,  // Apakah kunci dapat diekspor
        ["encrypt", "decrypt"]  // Operasi yang diizinkan untuk kunci ini
    );

    return keyPair;
}

function arrayBufferToBase64(buffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    // Dekode Base64 menjadi binary string
    const binaryString = atob(base64);

    // Membuat ArrayBuffer dengan panjang sesuai binary string
    const buffer = new ArrayBuffer(binaryString.length);

    // Membuat view untuk ArrayBuffer
    const view = new Uint8Array(buffer);

    // Menyalin byte dari binary string ke ArrayBuffer
    for (let i = 0; i < binaryString.length; i++) {
        view[i] = binaryString.charCodeAt(i);
    }

    return buffer;
}

async function encryptPrivateKey(privateKey, passphrase) {
    const key = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    const keyMaterial = await window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            "salt": new TextEncoder().encode("salt"),
            "iterations": 1000,
            "hash": "SHA-256"
        },
        key,
        { "name": "AES-GCM", "length": 256 },
        true,
        [ "encrypt", "decrypt" ]
    );
    const encryptedKey = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: new TextEncoder().encode("iv")
        },
        keyMaterial,
        privateKey
    );
    return encryptedKey;
}

async function decryptPrivateKey(encryptedKey, passphrase) {
    const key = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    const keyMaterial = await window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            "salt": new TextEncoder().encode("salt"),
            "iterations": 1000,
            "hash": "SHA-256"
        },
        key,
        { "name": "AES-GCM", "length": 256 },
        true,
        [ "encrypt", "decrypt" ]
    );
    const decryptedKey = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new TextEncoder().encode("iv")
        },
        keyMaterial,
        encryptedKey
    );
    return decryptedKey;
}

async function encryptPublicKey(publicKey, passphrase) {
    const key = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    const keyMaterial = await window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            "salt": new TextEncoder().encode("salt"),
            "iterations": 1000,
            "hash": "SHA-256"
        },
        key,
        { "name": "AES-GCM", "length": 256 },
        true,
        [ "encrypt", "decrypt" ]
    );
    const encryptedKey = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: new TextEncoder().encode("iv")
        },
        keyMaterial,
        publicKey
    );
    return encryptedKey;
}

async function decryptPublicKey(encryptedKey, passphrase) {
    const key = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    const keyMaterial = await window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            "salt": new TextEncoder().encode("salt"),
            "iterations": 1000,
            "hash": "SHA-256"
        },
        key,
        { "name": "AES-GCM", "length": 256 },
        true,
        [ "encrypt", "decrypt" ]
    );
    const decryptedKey = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new TextEncoder().encode("iv")
        },
        keyMaterial,
        encryptedKey
    );
    return decryptedKey;
}

async function exportPrivateKeyArrayBuffer(keyPair) {
    const exportedKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    return exportedKey;
}

async function importPrivateKeyArrayBuffer(exportedKey) {
    const importedKey = await window.crypto.subtle.importKey("pkcs8", exportedKey, {
        name: "RSA-OAEP",
        modulusLength: 2048,  // Panjang kunci RSA
        publicExponent: new Uint8Array([1, 0, 1]),  // Eksponen publik (65537)
        hash: "SHA-256",  // Hash yang digunakan
    }, true, ["decrypt"]);
    return importedKey;
}

async function exportPublicKeyArrayBuffer(keyPair) {
    const exportedKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    return exportedKey;
}

async function importPublicKeyArrayBuffer(exportedKey) {
    const importedKey = await window.crypto.subtle.importKey("spki", exportedKey, {
        name: "RSA-OAEP",
        modulusLength: 2048,  // Panjang kunci RSA
        publicExponent: new Uint8Array([1, 0, 1]),  // Eksponen publik (65537)
        hash: "SHA-256",  // Hash yang digunakan
    }, true, ["encrypt"]);
    return importedKey;
}

async function exportPublicKeyJWK(keyPair) {
    const exportedKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    return exportedKey;
}

async function importPublicKeyJWK(exportedKey) {
    const importedKey = await window.crypto.subtle.importKey("jwk", exportedKey, {
        name: "RSA-OAEP",
        modulusLength: 2048,  // Panjang kunci RSA
        publicExponent: new Uint8Array([1, 0, 1]),  // Eksponen publik (65537)
        hash: "SHA-256",  // Hash yang digunakan
    }, true, ["encrypt"]);
    return importedKey;
}

// Fungsi untuk mengenkripsi pesan menggunakan kunci publik
async function encryptMessage(message, publicKey) {
    const encodedMessage = new TextEncoder().encode(message);
    const encryptedMessage = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        publicKey,  // Kunci publik untuk enkripsi
        encodedMessage
    );
    // Mengonversi hasil enkripsi ke Base64 untuk disimpan atau dikirim
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedMessage)));
    return encryptedBase64;
}

// Fungsi untuk mendekripsi pesan menggunakan kunci privat
async function decryptMessage(encryptedMessage, privateKey) {
    const encryptedData = new Uint8Array(atob(encryptedMessage).split("").map(char => char.charCodeAt(0)));

    const decryptedData = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        privateKey,
        encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
}

// Fungsi untuk menyimpan kunci privat ke IndexedDB
async function storePrivateKey(privateKey) {
    const dbRequest = indexedDB.open("crypto-keys", 1);

    // Callback untuk membuat object store saat pertama kali membuka atau upgrade DB
    dbRequest.onupgradeneeded = function () {
        const db = dbRequest.result;
        db.createObjectStore("keys", { keyPath: "id" });
    };

    // Callback saat DB berhasil dibuka
    dbRequest.onsuccess = function () {
        const db = dbRequest.result;
        const transaction = db.transaction("keys", "readwrite");
        const store = transaction.objectStore("keys");

        // Menyimpan kunci privat di dalam store dengan id "privateKey"
        store.put({ id: "privateKey", key: privateKey });
        transaction.oncomplete = function () {
            console.log("Private key stored securely in IndexedDB");
        };
    };

    dbRequest.onerror = function () {
        console.error("Error storing private key in IndexedDB");
    };
}

// Fungsi untuk memuat kunci privat dari IndexedDB
async function loadPrivateKey() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("crypto-keys", 1);

        dbRequest.onsuccess = function () {
            const db = dbRequest.result;
            const transaction = db.transaction("keys", "readonly");
            const store = transaction.objectStore("keys");

            const getRequest = store.get("privateKey");
            getRequest.onsuccess = function () {
                resolve(getRequest.result?.key);
            };
            getRequest.onerror = function () {
                reject("Error loading private key from IndexedDB");
            };
        };

        dbRequest.onerror = function () {
            reject("Error opening IndexedDB");
        };
    });
}

export { 
    generateRSAKeys,
    arrayBufferToBase64,
    base64ToArrayBuffer, 
    encryptMessage, 
    decryptMessage, 
    storePrivateKey, 
    loadPrivateKey,
    exportPublicKeyArrayBuffer,
    importPublicKeyArrayBuffer,
    exportPublicKeyJWK,
    importPublicKeyJWK, 
    encryptPublicKey, 
    decryptPublicKey, 
    encryptPrivateKey, 
    decryptPrivateKey,
    exportPrivateKeyArrayBuffer,
    importPrivateKeyArrayBuffer
};