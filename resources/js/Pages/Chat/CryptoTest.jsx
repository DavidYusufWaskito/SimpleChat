import { useState,useEffect } from "react";
import { generateRSAKeys,exportPrivateKeyArrayBuffer,importPrivateKeyArrayBuffer, encryptMessage, decryptMessage,encryptPrivateKey,decryptPrivateKey } from "@/helper/cryptography";

export default function CryptoTest({props}) {
    const KeyPairs = generateRSAKeys();
    const SecretPassPhrase = import.meta.env.VITE_CHAT_PRIVATE_KEY_SECRET || 'secret_passphrase';
    const Message = "Hello World";
    const [encryptedMessage, setEncryptedMessage] = useState('');
    const [decryptedMessage, setDecryptedMessage] = useState('');
    
    useEffect(() => {
        KeyPairs.then((keyPair) => {
            console.log("Public key: ",keyPair.publicKey); 
            console.log("Private key: ",keyPair.privateKey);
            encryptMessage(Message, keyPair.publicKey).then((encryptedMessage) => {
                setEncryptedMessage(encryptedMessage);

                // Test encrypt private key, decrypt it then use it to decrypt message
                exportPrivateKeyArrayBuffer(keyPair).then((exportedPrivateKey) => {
                    encryptPrivateKey(exportedPrivateKey, SecretPassPhrase).then((encryptedPrivateKey) => {
                        console.log("Encrypted Private key: ", encryptedPrivateKey);
                        decryptPrivateKey(encryptedPrivateKey, SecretPassPhrase).then((decryptedPrivateKey) => {
                            importPrivateKeyArrayBuffer(decryptedPrivateKey).then((decryptedPrivateKey) => {
                                console.log("Decrypted Private key: ", decryptedPrivateKey);
                                decryptMessage(encryptedMessage, decryptedPrivateKey).then((decryptedMessage) => {
                                    setDecryptedMessage(decryptedMessage);
                                });
                            })
                        });
                    })
                })
                
                // encryptPrivateKey(keyPair.privateKey).then((encryptedPrivateKey) => {
                //     console.log("Encrypted Private key: ", encryptedPrivateKey);
                //     decryptPrivateKey(encryptedPrivateKey).then((decryptedPrivateKey) => {
                //         decryptMessage(encryptedMessage, decryptedPrivateKey).then((decryptedMessage) => {
                //             setDecryptedMessage(decryptedMessage);
                //         });
                //     });
                // });

                // decryptMessage(encryptedMessage, keyPair.privateKey).then((decryptedMessage) => {
                //     setDecryptedMessage(decryptedMessage);
                // });
            });
        });
    },[])
    return (
        <>
            <h1>Testing Cryptography</h1>
            <p>Secret Pass Phrase: {SecretPassPhrase}</p>
            <p>Message: {Message}</p>
            <p>Encrypted Message: {encryptedMessage}</p>
            <p>Decrypted Message: {decryptedMessage}</p>
        </>
    );
}