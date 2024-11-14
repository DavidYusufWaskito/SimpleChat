import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect,useState } from 'react';
export default function Dashboard({ auth, contacts }) {
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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        {contacts.map((contact, index) => (
                            <Link href={route('chat.index', contact.id)} key={index} className="p-4 border-b last:border-b-0">
                                <p className="text-gray-900 dark:text-gray-100">{contact.name}</p>
                            </Link>
                        ))}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
