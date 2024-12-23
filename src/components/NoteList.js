import React from 'react';

const NoteList = ({ notes, onDeleteNote }) => {
    return (
        <ul>
            {notes.map((note, index) => (
                <li key={index}>
                    {note}
                    <button onClick={() => onDeleteNote(index)} style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        <i className="fa fa-trash"></i> Delete
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default NoteList;
