import React, { useState } from 'react';
import NoteInput from './components/NoteInput';
import NoteList from './components/NoteList';
import './App.css';

const App = () => {
    const [notes, setNotes] = useState([]);

    const addNote = (noteContent) => {
        setNotes([...notes, noteContent]);
    };

    const deleteNote = (index) => {
        const newNotes = notes.filter((_, i) => i !== index);
        setNotes(newNotes);
    };

    return (
        <div>
            <h1>Voice-to-Text Note Taker</h1>
            <NoteInput onAddNote={addNote} />
            <NoteList notes={notes} onDeleteNote={deleteNote} />
        </div>
    );
};

export default App;
