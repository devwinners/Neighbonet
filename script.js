const addNoteButton = document.getElementById('addNote');
const bulletin = document.querySelector('.bulletin');


addNoteButton.addEventListener('click', () => {
    const note = document.createElement('div');
    note.className = 'note';
    note.innerHTML = `
        <textarea rows="4" cols="20" placeholder="Customize this note"></textarea>
        <button class="deleteNote">Delete</button>
    `;
    bulletin.appendChild(note);

    const deleteButton = note.querySelector('.deleteNote');
    deleteButton.addEventListener('click', () => {
        bulletin.removeChild(note); 
    });
});

