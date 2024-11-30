import { useState,useEffect,createRef } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { getContact } from "@/helper/contactdb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { generateRSAKeys,importPrivateKeyArrayBuffer,decryptPrivateKey,base64ToArrayBuffer,encryptMessage,decryptMessage,importPublicKeyJWK,exportPublicKeyArrayBuffer, importPublicKeyArrayBuffer, exportPublicKeyJWK,loadPrivateKey} from "@/helper/cryptography";
export default function ChatPage({auth,senderPrivateKey,senderPublicKey,receiverId,receiverPublicKey}) {
    const EndOfMessageRef = createRef();
    const [receiverName, setReceiverName] = useState('');
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [typing, setTyping] = useState(false);
    const SecretPassPhrase = import.meta.env.VITE_CHAT_PRIVATE_KEY_SECRET || 'secret_passphrase';
    // Get the contact from indexeddb and read all message
    useEffect(() => {
        getContact(parseInt(receiverId)).then(contact => {
            setReceiverName(contact.name);
        });
        axios.put(route('messages.read.all',{SenderId: receiverId,ReceiverId: auth.user.id}));
    },[]);

    // Get and decrypt message from db (TEST)
    useEffect(() => {
        axios.post('/api/messages', {
            SenderId: auth.user.id,
            ReceiverId: receiverId
        }).then(async res => {
            console.log(res);
            const decryptedPrivateKey = await decryptPrivateKey(base64ToArrayBuffer(senderPrivateKey), SecretPassPhrase);
            const privateKey = await importPrivateKeyArrayBuffer(decryptedPrivateKey);

            // console.log(privateKey);

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
            const decryptedPrivateKey = await decryptPrivateKey(base64ToArrayBuffer(senderPrivateKey), SecretPassPhrase);
            const privateKey = await importPrivateKeyArrayBuffer(decryptedPrivateKey);

            console.log('Event triggered');
            console.log(e);
            if (e.receiverId == auth.user.id) {
                const decryptedReceiverMessage = await decryptMessage(e.receiver_message, privateKey);
                setMessages((prevMessages) => [...prevMessages, {
                    
                    sender_message: e.sender_message,
                    receiver_message: decryptedReceiverMessage,
                    sender_id: e.senderId,
                    receiver_id: e.receiverId,
                    send_at : e.sendAt
                }]);
                console.log(decryptedReceiverMessage);
                axios.put(route('messages.read.all',{SenderId: receiverId,ReceiverId: auth.user.id}));

            }

            
        }
        listener.listen('SendChatEvent',callBack);


        var listenerWhisper = window.Echo.private('chat-channel.' + auth.user.id);
        let typingTimeout;
        const callBackWhisper = (e) => {
            clearTimeout(typingTimeout);
            console.log(`${e.senderId} is typing`);
            console.log(e);
            setTyping(true);
            typingTimeout = setTimeout(() => {
                console.log(`${e.senderId} stopped typing`);
                setTyping(false);
            }, 1000);
        }
        listenerWhisper.listenForWhisper('TypingEvent', callBackWhisper);
        return () => {
            listenerWhisper.stopListeningForWhisper('TypingEvent',callBackWhisper);
            listener.stopListening('SendChatEvent',callBack);
        };
    },[auth.user.id]);

    useEffect(() => {
        EndOfMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages,typing]);

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
            receiver_id: receiverId,
            send_at: new Date()
        }])
        // Test
        // axios.post('/event/test', {
        //     SenderId: auth.user.id,
        //     ReceiverId: receiverId,
        //     receiver_message: message
        // })

        // Real
        importPublicKeyJWK(JSON.parse(receiverPublicKey)).then(imported => {
            encryptMessage(message, imported).then((encryptedMessage) => {
                importPublicKeyJWK(JSON.parse(senderPublicKey)).then(senderimported => {
                    encryptMessage(message, senderimported).then((encryptedSenderMessage) => {
                        console.log(senderPublicKey);
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

    const onMessageTyping = () => {
        // Whisper event typing to receiver
        var channel = window.Echo.private('chat-channel.' + receiverId);
        console.log(channel);
        channel.whisper('TypingEvent', {
            senderId: auth.user.id,
            receiverId: receiverId
        });
    }
    return (
        <AuthenticatedLayout
        user={auth.user}>
            <Head title="Chat" />
            <div className="sticky top-0 z-10 p-4 bg-white dark:bg-gray-800 shadow-md">
                <div className="flex justify-between items-center">
                    <p className="text-gray-900 dark:text-gray-100">{receiverName}</p>
                    <Link href={route('dashboard')} className="text-gray-900 dark:text-gray-100">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Link>
                </div>
            </div>
            <div className="py-20">
                <div id="messages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-y-auto">
                    {messages
                    .map((msg, index) => (
                        <div key={index} className={`flex items-end justify-${msg.sender_id == auth.user.id ? 'end' : 'start'} mb-4`}>
                            <div className={`relative bg-${msg.sender_id == auth.user.id ? 'blue-500' : 'gray-300'} dark:bg-${msg.sender_id == auth.user.id ? 'blue-800' : 'gray-700'} ${msg.sender_id == auth.user.id ? 'rounded-tl-lg rounded-bl-lg rounded-br-lg' : 'rounded-tr-lg rounded-bl-lg rounded-br-lg'} p-3 max-w-xs h-fit

                            `}>
                                
                                <p className={`break-words overflow-hidden text-pretty flex-grow text-${msg.sender_id == auth.user.id ? 'white' : 'black'} dark:text-${msg.sender_id == auth.user.id ? 'gray-200' : 'white'}`}>
                                    {msg.sender_id == auth.user.id ? msg.sender_message : msg.receiver_message}
                                </p>

                                <div className="relative  pb-2">  
                                    <p className={`absolute right-0 text-xs ${msg.sender_id == auth.user.id ? 'text-white dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', hourCycle: 'h23' }).format(new Date(msg.send_at))}
                                    </p>
                                </div>
                                
                            </div>
                        </div>
                    ))}
                    {typing && (
                        <div className="flex items-end justify-start mb-4">
                            <div className="relative bg-gray-300 dark:bg-gray-700 rounded-tr-lg rounded-bl-lg rounded-br-lg p-3 max-w-xs h-fit">
                                <p className="break-words overflow-hidden text-pretty flex-grow text-gray-500 dark:text-gray-400">
                                    {receiverName} is typing...
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <div ref={EndOfMessageRef}></div>
                </div>

            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 shadow-md">
                <div className="flex items-center">
                    <input onKeyDown={(e) => {

                        if (e.key === 'Enter') {
                            sendMessage();
                            return;
                        }
                        console.log("Typed");
                        onMessageTyping();
                        
                        }} type="text" className="w-full px-4 py-2 rounded-lg border" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
                    <button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ml-2">Send</button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}