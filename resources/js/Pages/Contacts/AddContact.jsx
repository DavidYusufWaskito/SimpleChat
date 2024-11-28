import { useState,useEffect } from "react";
import { Link,Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NavigationLayout from "@/Layouts/NavigationLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage,faUser } from "@fortawesome/free-solid-svg-icons";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import axios from "axios";
import { openDB, addContact, getContacts } from "@/helper/contactdb";
export default function AddContact({ auth }) {
    const [contactData,setContactData] = useState({
        id:0,
        name:'',
        email:'',
    });

    const [error,setError] = useState({
        status: '',
        message:'',
    });

    const onEmailTyped = (e) => {

        const emailAssignment = new Promise((resolve) => {
            setContactData((prevState) => {
                const updatedState = { ...prevState, email: e.target.value };
                resolve(updatedState);
                return updatedState;
            });
        });

        emailAssignment.then((updatedContactData) => {
            axios.post(route('user.email.check'),{email:updatedContactData.email}).then((response) => {
                console.log(response);
                setError({
                    status: '200',
                    message: 'Found user with this email',
                })
                setContactData((prevState) => {
                    const updatedState = { ...prevState, id: response.data.id };
                    return updatedState;
                });
            }).catch((error) => {
                console.log(error);
                setError({
                    status:error.response.status,
                    message:error.response.data.message,
                });
            });
        });
    }

    const onSaveButton = () => {
        addContact(contactData).then((response) => {
            console.log(response);
            setError({
                status: '200',
                message: 'Contact added!',
            })
            setContactData({
                id:0,
                name:'',
                email:'',
            });
            getContacts().then((response) => {
                console.log(response);
            });
        }).catch((error) => {
            console.log(error);
        });
    }
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Contacts" />
            <NavigationLayout auth={auth}>
                <Link href={route('dashboard')} className='text-gray-500 dark:text-white flex flex-col items-center'>
                    <FontAwesomeIcon icon={faMessage} />
                    <p>Chats</p>
                </Link>
                <Link className='text-gray-500 dark:text-white flex flex-col items-center'>
                    <FontAwesomeIcon icon={faUser} />
                    <p>Account</p>
                </Link>
            </NavigationLayout>
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="space-y-6 ">
                        <div>
                            <InputLabel value="Name" />
                            <TextInput id="name" type="text" name="name" value={contactData.name} onChange={(e) => setContactData({...contactData,name:e.target.value})} className="mt-1 block w-full" />
                        </div>

                        <div>
                            <div className="flex items-center gap-5">
                                <InputLabel value="Email" />
                                <p className="text-sm text-gray-500">Make sure the email is valid and registered with us</p>
                            </div>
                            <TextInput id="email" type="email" name="email" value={contactData.email} onChange={(e) => {
                                
                                onEmailTyped(e);
                            }} className="mt-1 block w-full" />

                            {error.message && <p className={error.status === '200' ? 'text-gray-500' : 'text-red-500'}>{error.message}</p>}
                            
                        </div>

                        <div className="flex items-center justify-end mt-4">
                            <PrimaryButton className="w-full py-3 md:w-auto text-center" onClick={onSaveButton} disabled={error.status !== '200'}><p className="w-full">Save</p></PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );

}