import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserProvider';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function BookBorrow() {
  const { user } = useUser();
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBorrow, setNewBorrow] = useState({
    bookId: '',
    targetDate: ''
  });

  const fetchBorrows = async () => {
    try {
      const response = await fetch(`${API_URL}/api/borrow`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBorrows(data);
      } else {
        setError('Failed to fetch borrow requests');
      }
    } catch (err) {
      setError('Error fetching borrow requests');
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/book`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchBorrows(), fetchBooks()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCreateBorrow = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookId: newBorrow.bookId,
          targetDate: newBorrow.targetDate
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewBorrow({ bookId: '', targetDate: '' });
        setShowCreateForm(false);
        fetchBorrows();
        alert(data.message);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create borrow request');
      }
    } catch (err) {
      setError('Error creating borrow request');
    }
  };

  const handleUpdateStatus = async (borrowId, newStatus) => {
    if (user.role !== 'ADMIN') return;

    try {
      const response = await fetch(`${API_URL}/api/borrow`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          borrowId,
          status: newStatus
        }),
      });

      if (response.ok) {
        fetchBorrows();
      } else {
        setError('Failed to update borrow request');
      }
    } catch (err) {
      setError('Error updating borrow request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'INIT': return '#ffa500';
      case 'ACCEPTED': return '#00aa00';
      case 'CLOSE-NO-AVAILABLE-BOOK': return '#ff4444';
      case 'CANCEL-ADMIN': return '#666666';
      case 'CANCEL-USER': return '#666666';
      default: return '#000000';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Borrow Requests</h1>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/books">← Back to Books</Link> | <Link to="/profile">Profile</Link> | <Link to="/logout">Logout</Link>
      </div>

      {/* Create Borrow Request Form */}
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create New Borrow Request'}
        </button>
        {showCreateForm && (
          <form onSubmit={handleCreateBorrow} style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
              <select
                value={newBorrow.bookId}
                onChange={(e) => setNewBorrow({...newBorrow, bookId: e.target.value})}
                required
              >
                <option value="">Select a book</option>
                {books.map(book => (
                  <option key={book._id} value={book._id}>
                    {book.title} by {book.author}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newBorrow.targetDate}
                onChange={(e) => setNewBorrow({...newBorrow, targetDate: e.target.value})}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <button type="submit">Submit Request</button>
            </div>
          </form>
        )}
      </div>

      {/* Borrow Requests List */}
      <div>
        <h2>Your Borrow Requests ({borrows.length})</h2>
        {borrows.length === 0 ? (
          <p>No borrow requests found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {borrows.map(borrow => (
              <div key={borrow._id} style={{ border: '1px solid #ddd', padding: '10px' }}>
                <h3>{borrow.book?.title || 'Unknown Book'}</h3>
                <p><strong>Author:</strong> {borrow.book?.author || 'Unknown'}</p>
                <p><strong>Location:</strong> {borrow.book?.location || 'Unknown'}</p>
                <p><strong>Status:</strong>
                  <span style={{
                    color: getStatusColor(borrow.status),
                    fontWeight: 'bold',
                    marginLeft: '5px'
                  }}>
                    {borrow.status}
                  </span>
                </p>
                <p><strong>Requested Date:</strong> {new Date(borrow.createdAt).toLocaleDateString()}</p>
                <p><strong>Target Date:</strong> {new Date(borrow.targetDate).toLocaleDateString()}</p>
                {borrow.updatedAt && borrow.updatedAt !== borrow.createdAt && (
                  <p><strong>Updated:</strong> {new Date(borrow.updatedAt).toLocaleDateString()}</p>
                )}

                {user.role === 'ADMIN' && borrow.status === 'INIT' && (
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => handleUpdateStatus(borrow._id, 'ACCEPTED')}>
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(borrow._id, 'CANCEL-ADMIN')}
                      style={{ marginLeft: '10px', backgroundColor: '#ff4444', color: 'white' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}