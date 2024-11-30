import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import NavigationLayout from '@/Layouts/NavigationLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect,useState,useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser,faUserPlus,faMessage } from '@fortawesome/free-solid-svg-icons';
import { getContacts } from '@/helper/contactdb';
import axios from 'axios';
export default function Dashboard({ auth}) {
    const [contacts,setContacts] = useState([]);
    const [unreadMessageCounts,setUnreadMessageCounts] = useState([]);
    const contactsRef = useRef([]);
    // Get contacts
    useEffect(() => {
        getContacts().then((contacts) => {
            // console.log(contacts);
            setContacts(contacts);
            contactsRef.current = contacts;
        });

        
    },[]);

    // Get unread messages count
    useEffect(() => {
        console.log("CC: ",contacts);
        if (contacts.length > 0) {
            Promise.all(
                contacts.map((contact) =>
                    axios.get(route('messages.unread.count', { SenderId: contact.id, ReceiverId: auth.user.id }))
                )
            ).then((res) => {
                setUnreadMessageCounts(res.map((item) => item.data));
            });
        }
    },[contacts]);

    // Listen for chat event
    useEffect(() => {
        var listener = window.Echo.private('chat-channel.' + auth.user.id);
        const callback = (e) => {
            // set unread message count 
            axios.get(route('messages.unread.count', {SenderId: e.senderId, ReceiverId: auth.user.id}))
                .then((res) => {
                    setUnreadMessageCounts((prevUnreadMessageCounts) => {
                        const updatedCounts = [...prevUnreadMessageCounts];
                        const index = contactsRef.current.findIndex((contact) => contact.id === e.senderId);

                        console.log("contacts (ref): ", contactsRef.current); // Debugging kontak
                        console.log("index: ", index);
                        console.log("senderId: ", e.senderId);

                        if (index >= 0) {
                            updatedCounts[index] = res.data;
                        }

                        return updatedCounts;
                    });
                })
                .catch((error) => {
                    console.error("Error fetching unread message count:", error);
                });
        };
        listener.listen('SendChatEvent',callback);
        return () => listener.stopListening('SendChatEvent',callback);
    },[auth.user.id]);

    useEffect(() => {
        console.log("UMC: ",unreadMessageCounts);
    },[unreadMessageCounts,contacts]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            
        >
            <Head title="Dashboard" />

            <NavigationLayout auth={auth}>
                <Link className='text-gray-500 dark:text-white flex flex-col items-center'>
                    <FontAwesomeIcon icon={faMessage} />
                    <p>Chats</p>
                </Link>
                <Link className='text-gray-500 dark:text-white flex flex-col items-center'>
                    <FontAwesomeIcon icon={faUser} />
                    <p>Account</p>
                </Link>
            </NavigationLayout>

            {/* Add contacts */}
            <Link href={route('contact.add')} className='fixed bottom-24 right-0 m-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl'>
                <div className='text-lg md:text-2xl'>
                    <FontAwesomeIcon icon={faUserPlus} />
                </div>
            </Link>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        {contacts.length === 0 ? (
                            <p className="p-4 text-gray-500 dark:text-gray-400">You have no contact. Please add one to start chatting.</p>
                        ) : (
                            contacts.map((contact, index) => (
                                <Link href={route('chat.index', contact.id)} key={index} className="p-4 border-b last:border-b-0 flex justify-between">
                                    <p className="text-gray-900 dark:text-gray-100">{contact.name}</p>
                                    {unreadMessageCounts.length > 0 && unreadMessageCounts[index].count > 0 && (
                                        <span className="rounded-full bg-blue-500 text-white min-w-6 px-2 py-1 text-xs text-center">
                                            {unreadMessageCounts[index].count}
                                        </span>
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
