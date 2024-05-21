import React, { useState } from 'react';
import { API_BASE_URL } from './environment';

function NewContact({ token }: { token: string }) {
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

        const res = await fetch(`${API_BASE_URL}/contacts`, {
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

export default NewContact;