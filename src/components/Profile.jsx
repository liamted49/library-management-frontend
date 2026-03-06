import { useUser } from '../contexts/UserProvider';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useUser();

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Profile</h1>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/books">← Back to Books</Link> | <Link to="/borrow">My Borrow Requests</Link> | <Link to="/logout">Logout</Link>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '400px' }}>
        <h2>Profile Information</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> <span style={{ fontWeight: 'bold', color: user.role === 'ADMIN' ? '#ff6600' : '#0066ff' }}>{user.role}</span></p>
        <p><strong>Status:</strong> {user.isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}</p>
      </div>
    </div>
  );
}
