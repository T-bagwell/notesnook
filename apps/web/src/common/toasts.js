import { db } from ".";
import { showToast } from "../utils/toast";

function showNotesMovedToast(note, noteIds, notebook) {
  let actions;

  const newNotebook = db.notebooks.notebook(notebook.id);
  let verb =
    noteIds.length > 1 ? "added" : note.notebook?.id ? "moved" : "added";
  let messageText = noteIds.length > 1 ? `${noteIds.length} notes` : "Note";
  messageText += ` ${verb} to "${newNotebook.title}"`;

  if (noteIds.length === 1) {
    const undoAction = async () => {
      if (note.notebook?.id) {
        db.notes.move(note.notebook, note.id);
        const notebook = db.notebooks.notebook(note.notebook.id);
        showToast("success", `Note moved back to "${notebook.title}"`);
      } else {
        await newNotebook.topics.topic(notebook.topic).delete(note.id);
        showToast("success", `Note removed from "${newNotebook.title}"`);
      }
    };
    actions = [{ text: "Undo", onClick: undoAction }];
  }
  showToast("success", messageText, actions);
}

export { showNotesMovedToast };