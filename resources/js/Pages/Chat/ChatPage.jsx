import { useState,useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { generateRSAKeys,importPrivateKeyArrayBuffer,decryptPrivateKey,base64ToArrayBuffer,encryptMessage,decryptMessage,importPublicKeyJWK,exportPublicKeyArrayBuffer, importPublicKeyArrayBuffer, exportPublicKeyJWK,loadPrivateKey} from "@/helper/cryptography";
export default function ChatPage({auth,receiverId,receiverName,receiverPublicKey}) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const SecretPassPhrase = import.meta.env.VITE_CHAT_PRIVATE_KEY_SECRET || 'secret_passphrase';
    console.log(auth.user.private_key);
    // Get and decrypt message from db (TEST)
    useEffect(() => {
        axios.post('/event/messages', {
            SenderId: auth.user.id,
            ReceiverId: receiverId
        }).then(async res => {
            console.log(res);
            const decryptedPrivateKey = await decryptPrivateKey(base64ToArrayBuffer(auth.user.private_key), SecretPassPhrase);
            const privateKey = await importPrivateKeyArrayBuffer(decryptedPrivateKey);

            console.log(privateKey);

            // const decryptedMessages = await Promise.all(res.data.messages.filter(msg => msg.sender_id == auth.user.id || msg.receiver_id == auth.user.id).map(async (msg) => {
            //     const decryptedSenderMessage = await decryptMessage(msg.sender_message,privateKey);
            //     console.log(msg.receiver_message);
            //     // const decryptedReceiverMessage = await decryptMessage(msg.receiver_message, privateKey);
            //     return { ...msg, sender_message: decryptedSenderMessage};
            // }));
            const decryptedMessages = await Promise.all(
                res.data.messages
                    .filter(msg => msg.sender_id == auth.user.id || msg.receiver_id == auth.user.id)
                    .map(async (msg) => {
                        if (msg.sender_id == auth.user.id) {
                            const decryptedSenderMessage = await decryptMessage(msg.sender_message, privateKey);
                            return { ...msg, sender_message: decryptedSenderMessage };
                        } else {
                            const decryptedReceiverMessage = await decryptMessage(msg.receiver_message, privateKey);
                            return { ...msg, receiver_message: decryptedReceiverMessage };
                        }
                    })
            );
            console.log(decryptedMessages);
            setMessages(decryptedMessages);
        })
    },[])

    // Listen event
    useEffect(() => {
        var listener = window.Echo.private('chat-channel.' + auth.user.id);
        const callBack = async (e) => {
            // const privateKey = await loadPrivateKey();
            const decryptedPrivateKey = await decryptPrivateKey(base64ToArrayBuffer(auth.user.private_key), SecretPassPhrase);
            const privateKey = await importPrivateKeyArrayBuffer(decryptedPrivateKey);

            console.log('Event triggered');
            console.log(e);
            if (e.receiverId == auth.user.id) {
                const decryptedReceiverMessage = await decryptMessage(e.receiver_message, privateKey);
                setMessages((prevMessages) => [...prevMessages, {
                    
                    sender_message: e.sender_message,
                    receiver_message: decryptedReceiverMessage,
                    sender_id: e.senderId,
                    receiver_id: e.receiverId
                }]);
                console.log(decryptedReceiverMessage);
            }
            // const decryptedMessages = await Promise.all(
            //     res.data.messages
            //         .filter(msg => msg.sender_id == auth.user.id || msg.receiver_id == auth.user.id)
            //         .map(async (msg) => {
            //             if (msg.sender_id == auth.user.id) {
            //                 const decryptedSenderMessage = await decryptMessage(msg.sender_message, privateKey);
            //                 return { ...msg, sender_message: decryptedSenderMessage };
            //             } else {
            //                 const decryptedReceiverMessage = await decryptMessage(msg.receiver_message, privateKey);
            //                 return { ...msg, receiver_message: decryptedReceiverMessage };
            //             }
            //         })
            // );
            // console.log(decryptedMessages);
            // setMessages(decryptedMessages);

            // setMessages((prevMessages) => [...prevMessages, {
            //     message: e.message,
            //     sender_id: e.senderId,
            //     receiver_id: e.receiverId
            // }]);
        }
        listener.listen('SendChatEvent',callBack);
        return () => {
            listener.stopListening('SendChatEvent',callBack);
        };
    },[auth.user.id]);
    useEffect(() => {
        console.log(messages);
    },[messages]);

    const sendMessage = () => {
        // window.Echo.private('test-channel.' + receiverId).whisper('TestEvent', {
        //     message: 'Hello World',
        //     senderId: auth.user.id,
        //     receiverId: receiverId
        // });
        if (message === '') return;
        setMessages((prevMessages) => [...prevMessages, {
            sender_message: message,
            sender_id: auth.user.id,
            receiver_id: receiverId
        }])
        // Test
        axios.post('/event/test', {
            SenderId: auth.user.id,
            ReceiverId: receiverId,
            receiver_message: message
        })

        // Real
        importPublicKeyJWK(JSON.parse(receiverPublicKey)).then(imported => {
            encryptMessage(message, imported).then((encryptedMessage) => {
                importPublicKeyJWK(JSON.parse(auth.user.public_key)).then(senderimported => {
                    encryptMessage(message, senderimported).then((encryptedSenderMessage) => {
                        console.log(auth.user.public_key);
                        console.log(receiverPublicKey);
                        console.log(encryptedMessage);
                        console.log(encryptedSenderMessage); 
                        axios.post(route('chat.send'), {
                            SenderId: auth.user.id,
                            ReceiverId: receiverId,
                            sender_message: encryptedSenderMessage,
                            receiver_message:encryptedMessage
                        });
                    })
                })
            })
        })

        setMessage('');
    }
    return (
        <AuthenticatedLayout
        user={auth.user}>
            <Head title="Chat" />
            <div className="sticky top-0 z-10 p-4 bg-white dark:bg-gray-800 shadow-md">
                <div className="flex items-center">
                    <p className="text-gray-900 dark:text-gray-100">{receiverName}</p>
                </div>
            </div>
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-y-auto ">
                    {messages
                    .map((msg, index) => (
                        <div key={index} className={`flex items-end justify-${msg.sender_id == auth.user.id ? 'end' : 'start'} mb-4`}>
                            <div className={`relative bg-${msg.sender_id == auth.user.id ? 'blue-500' : 'gray-300'} dark:bg-${msg.sender_id == auth.user.id ? 'blue-800' : 'gray-700'} ${msg.sender_id == auth.user.id ? 'rounded-tl-lg rounded-bl-lg rounded-br-lg' : 'rounded-tr-lg rounded-bl-lg rounded-br-lg'} p-3 max-w-xs h-fit

                            `}>
                                <p className={`break-words text-pretty overflow-hidden w-full text-${msg.sender_id == auth.user.id ? 'white' : 'black'} dark:text-${msg.sender_id == auth.user.id ? 'gray-200' : 'white'}`}>{msg.sender_id == auth.user.id ? msg.sender_message : msg.receiver_message}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 shadow-md">
                <div className="flex items-center">
                    <input type="text" className="w-full px-4 py-2 rounded-lg border" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
                    <button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ml-2">Send</button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}