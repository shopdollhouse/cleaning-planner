/**
 * Undo/Redo history manager for task completions
 */

export interface HistoryEntry {
  id: string;
  period: 'morning' | 'afternoon' | 'evening';
  taskId: string;
  action: 'complete' | 'uncomplete';
  timestamp: number;
}

export interface UndoRedoState {
  past: HistoryEntry[];
  present: HistoryEntry | null;
  future: HistoryEntry[];
}

const MAX_HISTORY = 50;

export class UndoRedoManager {
  private history: HistoryEntry[] = [];
  private currentIndex: number = -1;

  push(entry: HistoryEntry) {
    // Remove future history when a new action is performed
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new entry
    this.history.push(entry);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): HistoryEntry | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo(): HistoryEntry | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  getState(): UndoRedoState {
    return {
      past: this.history.slice(0, this.currentIndex),
      present: this.history[this.currentIndex] || null,
      future: this.history.slice(this.currentIndex + 1),
    };
  }
}

export function createUndoRedoManager(): UndoRedoManager {
  return new UndoRedoManager();
}
