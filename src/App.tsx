import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_BASE_URL } from './environment';
import logo from './logo/unimicro-logo-morkeblaa_RGB.png';
//import ContactList from './ContactList';
//import NewContact from './NewContact.tsx';

function App() {
    const auth = useAuth();

    if (!auth.isAuthenticated) {
        return (
            <div className="container mt-5">
                <img src={logo} alt="Logo" className="logo" />
                <h1 className="title">My Contacts</h1>
                <button onClick={() => void auth.signinRedirect()} className="btn btn-primary">Log in</button>
            </div>
        );
    }

    return (
        <Router>
            <div className="container mt-5">
                <img src={logo} alt="Logo" className="logo" />
                <h1 className="title">My Contacts</h1>
                <div className="mb-3">
                    <Link to="/contacts" className="btn btn-primary">
                        Go to Contact List
                    </Link>
                    &nbsp;
                    &nbsp;
                    <Link to="/new-contact" className="btn btn-primary">
                        Create New Contact
                    </Link>
                    &nbsp;
                    &nbsp;
                    <button className="btn btn-danger" onClick={() => auth.signoutRedirect()}>Log out</button>
                </div>
                
                
                <Routes>
                    <Route path="/contacts" element={<ContactList token={auth.user!.access_token} />} />
                    <Route path="/new-contact" element={<NewContact token={auth.user!.access_token} />} />
                    <Route path="/update-contact/:contactId" element={<UpdateContact token={auth.user!.access_token} />} />
                </Routes>
            </div>
        </Router>
    );
}


function ContactList({ token }: { token: string }) {
    const [contacts, setContacts] = useState<any[]>([]);
    const [expandedContactId, setExpandedContactId] = useState<number | null>(null);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const fetchContacts = async () => {
            const res = await fetch(`${API_BASE_URL}biz/contacts?expand=Info,Info.InvoiceAddress,Info.DefaultPhone,Info.DefaultEmail,Info.DefaultAddress&hateoas=false&top=10`, {
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

    const toggleContactDetails = (contactId: number) => {
        setExpandedContactId(expandedContactId === contactId ? null : contactId);
    };

    const deleteContact = async (contactId: number) => {
        const res = await fetch(`${API_BASE_URL}biz/contacts/${contactId}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        });

        if (res.ok) {
            setContacts(contacts.filter(contact => contact.ID !== contactId));
            window.alert('Contact deleted successfully!');
        } else {
            window.alert('Error: ' + await res.text());
        }
    };

    const updateContact = (contactId: number) => {
        navigate(`/update-contact/${contactId}`);
    };

    const filteredContacts = contacts.filter(contact =>
        contact.Info.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.Info.DefaultEmail.EmailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.Info.DefaultPhone.Number.includes(searchTerm) ||
        contact.Info.InvoiceAddress.AddressLine1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.Info.InvoiceAddress.City.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.Info.InvoiceAddress.Country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mt-4">
            <h2>Contacts List</h2>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            {filteredContacts.length > 0 ? (
                <ul className="list-group">
                    {filteredContacts.map(contact => (
                        <li key={contact.ID} className="list-group-item">
                            <div onClick={() => toggleContactDetails(contact.ID)} style={{ cursor: 'pointer' }}>
                                {contact.Info.Name} - {contact.Info.DefaultEmail.EmailAddress}
                            </div>
                            {expandedContactId === contact.ID && (
                                <div className="mt-2">
                                    <p>Address: {contact.Info.InvoiceAddress.AddressLine1}, {contact.Info.InvoiceAddress.PostalCode}, {contact.Info.InvoiceAddress.City}, {contact.Info.InvoiceAddress.Country}</p>
                                    <p>Phone: {contact.Info.DefaultPhone.CountryCode} {contact.Info.DefaultPhone.Number}</p>
                                    <p>Email: {contact.Info.DefaultEmail.EmailAddress}</p>
                                    <button onClick={() => deleteContact(contact.ID)} className="btn btn-danger me-2">Delete</button>
                                    <button onClick={() => updateContact(contact.ID)} className="btn btn-primary">Update</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted">No contacts found.</p>
            )}
        </div>
    );
}

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
            //window.alert('Contact created successfully!');
            setName('');
            setAddressLine1('');
            setAddressLine2('');
            setCity('');
            setCountry('');
            setCountryCode('');
            setPostalCode('');
            setPhoneCountryCode('');
            setPhoneDescription('');
            setPhoneNumber('');
            setEmail('');
            setComment('');
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
                <input type="text" className="form-control" value={countryCode} onChange={e => setCountryCode(e.target.value)} />
                {/* <select className="form-select" value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                    <option value="">Select Country Code</option>
                    <option value="US">US</option>
                    <option value="CA">CA</option>
                    <option value="DW">DW</option>
                    //{ Her kan man legge til flere koder }
                </select> */}
            </div>
            <div className="mb-3">
                <label className="form-label">Postal Code:</label>
                <input type="text" className="form-control" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Country Code:</label>
                <input type="text" className="form-control" value={phoneCountryCode} onChange={e => setPhoneCountryCode(e.target.value)} />
                {/* <select className="form-select" value={phoneCountryCode} onChange={e => setPhoneCountryCode(e.target.value)}>
                    <option value="">Select Phone Country Code</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+999">+999</option>
                    //{Her kan man legge til flere koder }
                </select> */}
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

function UpdateContact({ token }: { token: string }) {
    const { contactId } = useParams<{ contactId: string }>();
    const navigate = useNavigate();
    const [contact, setContact] = useState<any>(null);

    useEffect(() => {
        const fetchContact = async () => {
            const res = await fetch(`${API_BASE_URL}biz/contacts/${contactId}?expand=Info,Info.InvoiceAddress,Info.DefaultPhone,Info.DefaultEmail,Info.DefaultAddress`, {
                headers: { Authorization: 'Bearer ' + token }
            });

            if (res.ok) {
                const contact = await res.json();
                setContact(contact);
                console.log('Contact:', contact);
            } else {
                window.alert('Error: ' + await res.text());
            }
        }

        fetchContact();
    }, [token, contactId]);

    const updateContact = async (event: React.FormEvent) => {
        event.preventDefault();

        const payload = {
            "ID": contact.ID, // Ensure the ID is included
            "Info": {
                "ID": contact.Info.ID,
                "Name": contact.Info.Name,
                "InvoiceAddress": {
                    "ID": contact.Info.InvoiceAddress.ID,
                    "AddressLine1": contact.Info.InvoiceAddress.AddressLine1,
                    "AddressLine2": contact.Info.InvoiceAddress.AddressLine2,
                    "City": contact.Info.InvoiceAddress.City,
                    "Country": contact.Info.InvoiceAddress.Country,
                    "CountryCode": contact.Info.InvoiceAddress.CountryCode,
                    "PostalCode": contact.Info.InvoiceAddress.PostalCode
                },
                "DefaultPhone": {
                    "ID": contact.Info.DefaultPhone.ID,
                    "CountryCode": contact.Info.DefaultPhone.CountryCode,
                    "Description": contact.Info.DefaultPhone.Description,
                    "Number": contact.Info.DefaultPhone.Number
                },
                "DefaultEmail": {
                    "ID": contact.Info.DefaultEmail.ID,
                    "EmailAddress": contact.Info.DefaultEmail.EmailAddress
                }
            },
            "Comment": contact.Comment
        };

        const res = await fetch(`${API_BASE_URL}biz/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            // window.alert('Contact updated successfully!');
            navigate('/contacts');
        } else {
            const error = await res.json();
            console.error('Update Error:', error);
            window.alert('Error: ' + error.Messages[0].Message);
        }
    };

    if (!contact) {
        return <div>Loading...</div>;
    }

    return (
        <form onSubmit={updateContact} className="mt-4">
            <h2>Update Contact</h2>
            <div className="mb-3">
                <label className="form-label">Name:</label>
                <input type="text" className="form-control" value={contact.Info.Name} onChange={e => setContact({ ...contact, Info: { ...contact.Info, Name: e.target.value } })} />
            </div>
            <div className="mb-3">
                <label className="form-label">Address Line 1:</label>
                <input type="text" className="form-control" value={contact.Info.InvoiceAddress.AddressLine1} onChange={e => setContact({ ...contact, Info: { ...contact.Info, InvoiceAddress: { ...contact.Info.InvoiceAddress, AddressLine1: e.target.value } } })} />
            </div>
            <div className="mb-3">
                <label className="form-label">Address Line 2:</label>
                <input type="text" className="form-control" value={contact.Info.InvoiceAddress.AddressLine2} onChange={e => setContact({ ...contact, Info: { ...contact.Info, InvoiceAddress: { ...contact.Info.InvoiceAddress, AddressLine2: e.target.value } } })} />
            </div>
            <div className="mb-3">
                <label className="form-label">City:</label>
                <input type="text" className="form-control" value={contact.Info.InvoiceAddress.City} onChange={e => setContact({ ...contact, Info: { ...contact.Info, InvoiceAddress: { ...contact.Info.InvoiceAddress, City: e.target.value } } })} />
            </div>
            <div className="mb-3">
                <label className="form-label">Country:</label>
                <input type="text" className="form-control" value={contact.Info.InvoiceAddress.Country} onChange={e => setContact({ ...contact, Info: { ...contact.Info, InvoiceAddress: { ...contact.Info.InvoiceAddress, Country: e.target.value } } })} />
            </div>
            <div className="mb-3">
                <label className="form-label">Country Code:</label>
                <input type="text" className="form-control" value={contact.Info.InvoiceAddress.CountryCode} onChange={e => setContact({ ...contact, Info: { ...contact.Info, InvoiceAddress: { ...contact.Info.InvoiceAddress, CountryCode: e.target.value } } })} />
                {/* <select className="form-select" value={contact.Info.InvoiceAddress.CountryCode} onChange={e => setContact({ ...contact, Info: { ...contact.Info, InvoiceAddress: { ...contact.Info.InvoiceAddress, CountryCode: e.target.value } } })}>
                    <option value="">Select Country Code</option>
                    <option value="US">US</option>
                    <option value="CA">CA</option>
                    <option value="DW">DW</option>
                    { Add more country codes as needed }
                </select> */}
            </div>
            <div className="mb-3">
                <label className="form-label">Postal Code:</label>
                <input type="text" className="form-control" value={contact.Info.InvoiceAddress.PostalCode} onChange={e => setContact({ ...contact, Info: { ...contact.Info, InvoiceAddress: { ...contact.Info.InvoiceAddress, PostalCode: e.target.value } } })} />
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Country Code:</label>
                <input type="text" className="form-control" value={contact.Info.DefaultPhone.CountryCode} onChange={e => setContact({ ...contact, Info: { ...contact.Info, DefaultPhone: { ...contact.Info.DefaultPhone, CountryCode: e.target.value } } })} />
                {/* <select className="form-select" value={contact.Info.DefaultPhone.CountryCode} onChange={e => setContact({ ...contact, Info: { ...contact.Info, DefaultPhone: { ...contact.Info.DefaultPhone, CountryCode: e.target.value } } })}>
                    <option value="">Select Phone Country Code</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+999">+999</option>
                    { Add more phone country codes as needed }
                </select> */}
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Description:</label>
                <select className="form-select" value={contact.Info.DefaultPhone.Description} onChange={e => setContact({ ...contact, Info: { ...contact.Info, DefaultPhone: { ...contact.Info.DefaultPhone, Description: e.target.value } } })}>
                    <option value="">Select Description</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    {/* Add more descriptions as needed */}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Number:</label>
                <input type="text" className="form-control" value={contact.Info.DefaultPhone.Number} onChange={e => setContact({ ...contact, Info: { ...contact.Info, DefaultPhone: { ...contact.Info.DefaultPhone, Number: e.target.value } } })} />
            </div>
            <div className="mb-3">
                <label className="form-label">Email:</label>
                <input type="email" className="form-control" value={contact.Info.DefaultEmail.EmailAddress} onChange={e => setContact({ ...contact, Info: { ...contact.Info, DefaultEmail: { ...contact.Info.DefaultEmail, EmailAddress: e.target.value } } })} />
            </div>
            <div className="mb-3">
                <label className="form-label">Comment:</label>
                <input type="text" className="form-control" value={contact.Comment} onChange={e => setContact({ ...contact, Comment: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-success">Update Contact</button>
        </form>
    );
}

export default App;