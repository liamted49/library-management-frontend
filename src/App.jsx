import { useEffect, useState } from 'react';
import './App.css'
import { Route, Routes } from 'react-router-dom';
import RequireAuth from './middleware/RequireAuth';
import Profile from './components/Profile';
import Login from './components/Login';
import Logout from './components/Logout';
import Books from './components/Books';
import BookDetail from './components/BookDetail';
import BookBorrow from './components/BookBorrow';

function App() {

  return(
    <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='/logout' element={
        <RequireAuth>
          <Logout/>
        </RequireAuth>
      }/>
      <Route path='/profile' element={
        <RequireAuth>
          <Profile/>
        </RequireAuth>
      }/>
      <Route path='/books' element={
        <RequireAuth>
          <Books/>
        </RequireAuth>
      }/>
      <Route path='/books/:id' element={
        <RequireAuth>
          <BookDetail/>
        </RequireAuth>
      }/>
      <Route path='/borrow' element={
        <RequireAuth>
          <BookBorrow/>
        </RequireAuth>
      }/>
      <Route path='/' element={
        <RequireAuth>
          <Books/>
        </RequireAuth>
      }/>
    </Routes>
  );
}

export default App
