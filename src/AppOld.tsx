import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { API_BASE_URL } from './environment';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const auth = useAuth();
    const [contacts, setContacts] = useState<any[]>([]);

    if (!auth.isAuthenticated) {
        return <button onClick={() => void auth.signinRedirect()} className="btn btn-primary">Log in</button>;
    }

    return (
        <main className="container mt-5">
            <h1>Your Contacts</h1>
            <div className="mb-3">
                <button onClick={() => fetchContacts(auth.user!.access_token, setContacts)} className="btn btn-primary me-2">
                    Fetch Contacts
                </button>

                <button onClick={() => fetchSingleContact(auth.user!.access_token, 1)} className="btn btn-secondary">
                    Fetch Single Contact
                </button>
                
            </div>

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

            <ContactForm token={auth.user!.access_token} />

            <button className="btn btn-danger mt-3" onClick={() => auth.signoutRedirect()}>Log out</button>
            
            
        </main>
    );
}

async function fetchContacts(token: string, setContacts: (contacts: any[]) => void) {
    const res = await fetch(API_BASE_URL + 'biz/contacts?expand=Info,Info.InvoiceAddress,Info.DefaultPhone,Info.DefaultEmail,Info.DefaultAddress&hateoas=false&top=10', {
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

async function fetchSingleContact(token: string, id: number) {
    const res = await fetch(`${API_BASE_URL}biz/contacts/${id}?expand=Info,Info.InvoiceAddress,Info.DefaultPhone,Info.DefaultEmail,Info.DefaultAddress`, {
        headers: { Authorization: 'Bearer ' + token }
    });

    if (res.ok) {
        const contact = await res.json();
        console.log('Contact:', contact);
    } else {
        window.alert('Error: ' + await res.text());
    }
}

function ContactForm({ token }: { token: string }) {
    const [name, setName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [phoneCountryCode, setPhoneCountryCode] = useState('');
    const [phoneDescription, setPhoneDescription] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [comment, setComment] = useState('');

    async function createContact(event: React.FormEvent) {
        event.preventDefault();

        const payload = {
            "Info": {
                "Name": name,
                "InvoiceAddress": {
                    "AddressLine1": addressLine1,
                    "AddressLine2": addressLine2,
                    "City": city,
                    "Country": country,
                    "CountryCode": countryCode,
                    "PostalCode": postalCode
                },
                "DefaultPhone": {
                    "CountryCode": phoneCountryCode,
                    "Description": phoneDescription,
                    "Number": phoneNumber
                },
                "DefaultEmail": {
                    "EmailAddress": email
                }
            },
            "Comment": comment
        };

        const res = await fetch(`${API_BASE_URL}biz/contacts`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const contact = await res.json();
            console.log('Created Contact:', contact);
            window.alert('Contact created successfully!');
        } else {
            window.alert('Error: ' + await res.text());
        }
    }

    return (
        <form onSubmit={createContact} className="mt-4">
            <h2>Create Contact</h2>
            <div className="mb-3">
                <label className="form-label">Name:</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Address Line 1:</label>
                <input type="text" className="form-control" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Address Line 2:</label>
                <input type="text" className="form-control" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">City:</label>
                <input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Country:</label>
                <input type="text" className="form-control" value={country} onChange={e => setCountry(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Country Code:</label>
                <select className="form-select" value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                    <option value="">Select Country Code</option>
                    <option value="US">US</option>
                    <option value="CA">CA</option>
                    <option value="DW">DW</option>
                    {/* Add more country codes as needed */}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Postal Code:</label>
                <input type="text" className="form-control" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Country Code:</label>
                <select className="form-select" value={phoneCountryCode} onChange={e => setPhoneCountryCode(e.target.value)}>
                    <option value="">Select Phone Country Code</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+999">+999</option>
                    {/* Add more phone country codes as needed */}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Description:</label>
                <select className="form-select" value={phoneDescription} onChange={e => setPhoneDescription(e.target.value)}>
                    <option value="">Select Description</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    {/* Add more descriptions as needed */}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Number:</label>
                <input type="text" className="form-control" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Email:</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Comment:</label>
                <input type="text" className="form-control" value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-success">Create Contact</button>
        </form>
    );
}

export default App;