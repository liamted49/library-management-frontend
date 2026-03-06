import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserProvider';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function BookDetail() {
  const { user } = useUser();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    quantity: '',
    location: ''
  });

  const fetchBook = async () => {
    try {
      const response = await fetch(`${API_URL}/api/book/${id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBook(data);
        setEditForm({
          title: data.title,
          author: data.author,
          quantity: data.quantity.toString(),
          location: data.location
        });
      } else {
        setError('Failed to fetch book');
      }
    } catch (err) {
      setError('Error fetching book');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/book/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editForm.title,
          author: editForm.author,
          quantity: parseInt(editForm.quantity),
          location: editForm.location
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchBook();
      } else {
        setError('Failed to update book');
      }
    } catch (err) {
      setError('Error updating book');
    }
  };

  const handleDeleteBook = async () => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`${API_URL}/api/book/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Redirect to books list
        window.location.href = '/books';
      } else {
        setError('Failed to delete book');
      }
    } catch (err) {
      setError('Error deleting book');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/books">← Back to Books</Link>
      <h1>Book Details</h1>

      {isEditing ? (
        <form onSubmit={handleUpdateBook} style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
          <h2>Edit Book</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Author"
              value={editForm.author}
              onChange={(e) => setEditForm({...editForm, author: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={editForm.quantity}
              onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
              required
              min="1"
            />
            <input
              type="text"
              placeholder="Location"
              value={editForm.location}
              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
              required
            />
            <div>
              <button type="submit">Update Book</button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ marginLeft: '10px' }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
          <h2>{book.title}</h2>
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Quantity:</strong> {book.quantity}</p>
          <p><strong>Location:</strong> {book.location}</p>
          <p><strong>Status:</strong> {book.status}</p>
          <p><strong>Created:</strong> {new Date(book.createdAt).toLocaleDateString()}</p>
          <p><strong>Updated:</strong> {new Date(book.updatedAt).toLocaleDateString()}</p>

          {user.role === 'ADMIN' && (
            <div style={{ marginTop: '20px' }}>
              <button onClick={() => setIsEditing(true)}>Edit Book</button>
              <button onClick={handleDeleteBook} style={{ marginLeft: '10px', backgroundColor: '#ff4444', color: 'white' }}>
                Delete Book
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}