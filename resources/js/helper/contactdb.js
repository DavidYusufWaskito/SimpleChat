// Open or create a database
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ChatApp", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("contacts")) {
                db.createObjectStore("contacts", { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Add a contact
async function addContact(contact) {
    const db = await openDB();
    const transaction = db.transaction("contacts", "readwrite");
    const store = transaction.objectStore("contacts");
    store.put(contact);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
}

// Get all contacts
async function getContacts() {
    const db = await openDB();
    const transaction = db.transaction("contacts", "readonly");
    const store = transaction.objectStore("contacts");

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function getContact(id) {
    const db = await openDB();
    const transaction = db.transaction("contacts", "readonly");
    const store = transaction.objectStore("contacts");

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Example usage
// addContact({ id: 1, name: "John Doe" }).then(() => {
//     console.log("Contact added!");
//     getContacts().then((contacts) => console.log("Contacts:", contacts));
// });


export { openDB, addContact, getContacts,getContact };