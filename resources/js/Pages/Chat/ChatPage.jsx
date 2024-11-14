import { useState,useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
export default function ChatPage({auth,receiverId,receiverName}) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    // Get message from db (TEST)
    useEffect(() => {
        axios.post('/event/messages', {
            SenderId: auth.user.id,
            ReceiverId: receiverId
        }).then(res => {
            console.log(res);
            console.log(res.data.messages);
            setMessages(res.data.messages);
        })
    },[])

    // Listen event
    useEffect(() => {
        var listener = window.Echo.channel('test-channel.' + receiverId);
        const callBack = (e) => {
            console.log('Event triggered');
            console.log(e);
            setMessages((prevMessages) => [...prevMessages, {
                message: e.message,
                sender_id: e.senderId,
                receiver_id: e.receiverId
            }]);
        }
        listener.listen('TestEvent',callBack);
        return () => {
            listener.stopListening('TestEvent',callBack);
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
            message: message,
            sender_id: auth.user.id,
            receiver_id: receiverId
        }])
        // Test
        axios.post('/event/test', {
            SenderId: auth.user.id,
            ReceiverId: receiverId,
            message: message
        })

        axios.post('/chat/send', {
            SenderId: auth.user.id,
            ReceiverId: receiverId,
            message: message
        });

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
                                <p className={`break-words text-pretty overflow-hidden w-full text-${msg.sender_id == auth.user.id ? 'white' : 'black'} dark:text-${msg.sender_id == auth.user.id ? 'gray-200' : 'white'}`}>{msg.message}</p>
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