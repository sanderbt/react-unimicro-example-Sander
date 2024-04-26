import { useAuth } from 'react-oidc-context'
import { API_BASE_URL } from './environment';
import './App.css'

function App() {
    const auth = useAuth();

    if (!auth.isAuthenticated) {
        return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
    }

    return (
        <main>
            <span>Authenticated!</span>

            <button onClick={() => sendTestRequest(auth.user!.access_token)}>
                Send test request
            </button>

            <button className="text" onClick={() => auth.signoutRedirect()}>Log out</button>
        </main>
    );
}

async function sendTestRequest(token: string) {
    const res = await fetch(API_BASE_URL + '/biz/users?action=current-session', {
        headers: { Authorization: 'Bearer ' + token }
    });

    if (res.ok) {
        const user = await res.json();
        window.alert('Current user: ' + (user.Name || user.UserName || user.Email));
    } else {
        window.alert('Error: ' + await res.text());
    }
}

export default App
