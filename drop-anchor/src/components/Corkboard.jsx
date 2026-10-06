import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

const COLORS = ['yellow', 'pink', 'blue', 'green'];

export default function Corkboard() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('dropanchor_notes');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, text: "I am a good parent doing my best.", color: 'yellow', x: 50, y: 50 },
      { id: 2, text: "Burnout is not a moral failing. It's a sign I need rest.", color: 'blue', x: 300, y: 100 },
      { id: 3, text: "Reminders of Joy:\n- RuneScape ⚔️\n- Playing games 🎮\n- Watching sports 🏈\n- Sports betting 🎲\n\nMake time for these. They bring me happiness.", color: 'green', x: 150, y: 250 }
    ];
  });

  const [draggingNote, setDraggingNote] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('dropanchor_notes', JSON.stringify(notes));
  }, [notes]);

  // Handle pasting images from clipboard
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const newNote = {
              id: Date.now(),
              type: 'image',
              imageUrl: event.target.result,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              x: Math.random() * 200 + 50,
              y: Math.random() * 200 + 50
            };
            setNotes((prevNotes) => [...prevNotes, newNote]);
          };
          reader.readAsDataURL(blob);
          break; // Only process the first image found
        }
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      type: 'text',
      text: "New note...",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50
    };
    setNotes([...notes, newNote]);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const updateNoteText = (id, newText) => {
    setNotes(notes.map(n => n.id === id ? { ...n, text: newText } : n));
  };

  const startDrag = (e, note) => {
    setDraggingNote(note.id);
    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y
    });
  };

  const handleDrag = (e) => {
    if (!draggingNote) return;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    setNotes(notes.map(n => n.id === draggingNote ? { ...n, x, y } : n));
  };

  const endDrag = () => {
    setDraggingNote(null);
  };

  return (
    <div 
      className="corkboard-container"
      onMouseMove={handleDrag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    >
      <h2 style={{ color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', marginBottom: '0.5rem' }}>
        My Motivation Corkboard
      </h2>
      <p style={{ color: '#ccc', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', marginBottom: '1rem' }}>
        Pin your reflections, goals, and reminders of the person you are.<br/>
        <small style={{ color: 'var(--accent)' }}>💡 Tip: You can paste screenshots or images directly onto the board! (Ctrl+V or Cmd+V)</small>
      </p>

      {notes.map(note => (
        <div 
          key={note.id}
          className={`sticky-note ${note.color}`}
          style={{ 
            left: note.x, 
            top: note.y, 
            zIndex: draggingNote === note.id ? 10 : 1,
            height: note.type === 'image' ? 'auto' : undefined
          }}
          onMouseDown={(e) => startDrag(e, note)}
        >
          <div className="note-header">
            <button 
              onClick={() => deleteNote(note.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
            >
              <X size={16} />
            </button>
          </div>
          
          {note.type === 'image' ? (
            <img 
              src={note.imageUrl} 
              alt="Pasted content" 
              style={{ width: '100%', height: 'auto', borderRadius: '4px', pointerEvents: 'none' }} 
            />
          ) : (
            <textarea 
              className="note-content"
              value={note.text}
              onChange={(e) => updateNoteText(note.id, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
            />
          )}
        </div>
      ))}

      <button className="glass-button primary add-note-btn" onClick={addNote}>
        <Plus size={24} />
      </button>
    </div>
  );
}
