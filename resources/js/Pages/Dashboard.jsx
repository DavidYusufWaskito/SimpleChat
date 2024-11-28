import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import NavigationLayout from '@/Layouts/NavigationLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect,useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser,faUserPlus,faMessage } from '@fortawesome/free-solid-svg-icons';
import { getContacts } from '@/helper/contactdb';
export default function Dashboard({ auth}) {
    const [contacts,setContacts] = useState([]);

    // Get contacts
    useEffect(() => {
        getContacts().then((contacts) => {
            console.log(contacts);
            setContacts(contacts);
        });
    },[]);

    useEffect(() => {
        console.log(contacts);
    },[]);
    // Listen event
    useEffect(() => {
        var listener = window.Echo.channel('test-channel');
        const callBack = (e) => {
            console.log('Event triggered');
            console.log(e);
        }
        listener.listen('TestEvent',callBack);
        return () => {
            listener.stopListening('TestEvent',callBack);
        };
    },[auth.user.id]);
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
                                <Link href={route('chat.index', contact.id)} key={index} className="p-4 border-b last:border-b-0">
                                    <p className="text-gray-900 dark:text-gray-100">{contact.name}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
