import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './environment';

function ContactList({ token }: { token: string }) {
    const [contacts, setContacts] = useState<any[]>([]);

    useEffect(() => {
        async function fetchContacts() {
            const res = await fetch(API_BASE_URL + '/contacts?expand=Info,Info.InvoiceAddress,Info.DefaultPhone,Info.DefaultEmail,Info.DefaultAddress&hateoas=false&top=10', {
                headers: { Authorization: 'Bearer ' + token }
            });

            if (res.ok) {
                const contacts = await res.json();
                setContacts(contacts);
                console.log('Contacts:', contacts);
            } else {
                window.alert('Error: ' + await res.text());
            }
        }

        fetchContacts();
    }, [token]);

    return (
        <div className="mt-4">
            <h2>Contacts List</h2>
            {contacts.length > 0 ? (
                <ul className="list-group">
                    {contacts.map(contact => (
                        <li key={contact.ID} className="list-group-item">
                            {contact.Info.Name} - {contact.Info.DefaultEmail.EmailAddress}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted">No contacts fetched yet.</p>
            )}
        </div>
    );
}

export default ContactList;