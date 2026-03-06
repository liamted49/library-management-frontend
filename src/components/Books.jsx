import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserProvider';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Books() {
  const { user } = useUser();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    quantity: '',
    location: ''
  });

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTitle) params.append('title', searchTitle);
      if (searchAuthor) params.append('author', searchAuthor);

      const url = `${API_URL}/api/book${params.toString() ? '?' + params.toString() : ''}`;
      console.log('Fetching books from:', url);

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Books fetched:', data);
        setBooks(data);
        setError('');
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        setError('Failed to fetch books');
        setBooks([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching books: ' + err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchTitle, searchAuthor]);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newBook.title,
          author: newBook.author,
          quantity: parseInt(newBook.quantity),
          location: newBook.location
        }),
      });

      if (response.ok) {
        setNewBook({ title: '', author: '', quantity: '', location: '' });
        setShowCreateForm(false);
        fetchBooks();
      } else {
        setError('Failed to create book');
      }
    } catch (err) {
      setError('Error creating book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`${API_URL}/api/book/${bookId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchBooks();
      } else {
        setError('Failed to delete book');
      }
    } catch (err) {
      setError('Error deleting book');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Library Management System</h1>
      <div style={{ marginBottom: '20px' }}>
        <p>Welcome, {user.name} ({user.role})</p>
        <Link to="/profile">Profile</Link> | <Link to="/borrow">My Borrow Requests</Link> | <Link to="/logout">Logout</Link>
      </div>

      {/* Search Filters */}
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Search Books</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by author"
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
          />
          <button onClick={() => { setSearchTitle(''); setSearchAuthor(''); }}>Clear</button>
        </div>
      </div>

      {/* Create Book Form - Admin Only */}
      {user.role === 'ADMIN' && (
        <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Add New Book'}
          </button>
          {showCreateForm && (
            <form onSubmit={handleCreateBook} style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="Title"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newBook.quantity}
                  onChange={(e) => setNewBook({...newBook, quantity: e.target.value})}
                  required
                  min="1"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newBook.location}
                  onChange={(e) => setNewBook({...newBook, location: e.target.value})}
                  required
                />
                <button type="submit">Create Book</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Books List */}
      <div>
        <h2>Available Books ({books.length})</h2>
        {books.length === 0 ? (
          <p>No books found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {books.map(book => (
              <div key={book._id} style={{ border: '1px solid #ddd', padding: '10px' }}>
                <h3>{book.title}</h3>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Quantity:</strong> {book.quantity}</p>
                <p><strong>Location:</strong> {book.location}</p>
                <p><strong>Status:</strong> {book.status}</p>
                <div style={{ marginTop: '10px' }}>
                  <Link to={`/books/${book._id}`}>View Details</Link>
                  {user.role === 'ADMIN' && (
                    <>
                      {' | '}
                      <button onClick={() => handleDeleteBook(book._id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}