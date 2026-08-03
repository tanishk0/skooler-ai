import fs from "fs";
import path from "path";
import { connectDB } from "./connect";
import {
  IStudyMaterial,
  IShortNote,
  IStudySession,
  StudyMaterialModel,
  ShortNoteModel,
  StudySessionModel,
} from "./models";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

interface LocalStore {
  materials: IStudyMaterial[];
  shortNotes: IShortNote[];
  studySessions: IStudySession[];
}

function initLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial: LocalStore = {
        materials: [],
        shortNotes: [],
        studySessions: [],
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(data) as LocalStore;
  } catch (err) {
    console.error("Local store error:", err);
    return { materials: [], shortNotes: [], studySessions: [] };
  }
}

function saveLocalStore(store: LocalStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("Error writing local store:", err);
  }
}

// Data Storage Interface
export const dbStore = {
  // Study Materials
  async saveMaterial(material: IStudyMaterial): Promise<IStudyMaterial> {
    const conn = await connectDB();
    if (conn) {
      const doc = await StudyMaterialModel.create(material);
      return doc.toObject() as IStudyMaterial;
    } else {
      const store = initLocalStore();
      const existingIdx = store.materials.findIndex((m) => m.id === material.id);
      if (existingIdx >= 0) {
        store.materials[existingIdx] = material;
      } else {
        store.materials.unshift(material);
      }
      saveLocalStore(store);
      return material;
    }
  },

  async getMaterials(): Promise<IStudyMaterial[]> {
    const conn = await connectDB();
    if (conn) {
      const docs = await StudyMaterialModel.find().sort({ createdAt: -1 });
      return docs.map((d) => d.toObject() as IStudyMaterial);
    } else {
      const store = initLocalStore();
      return store.materials;
    }
  },

  async getMaterialById(id: string): Promise<IStudyMaterial | null> {
    const conn = await connectDB();
    if (conn) {
      const doc = await StudyMaterialModel.findOne({ id });
      return doc ? (doc.toObject() as IStudyMaterial) : null;
    } else {
      const store = initLocalStore();
      return store.materials.find((m) => m.id === id) || null;
    }
  },

  async deleteMaterial(id: string): Promise<boolean> {
    const conn = await connectDB();
    if (conn) {
      await StudyMaterialModel.deleteOne({ id });
      await ShortNoteModel.deleteMany({ materialId: id });
      await StudySessionModel.deleteMany({ materialId: id });
      return true;
    } else {
      const store = initLocalStore();
      store.materials = store.materials.filter((m) => m.id !== id);
      store.shortNotes = store.shortNotes.filter((n) => n.materialId !== id);
      store.studySessions = store.studySessions.filter((s) => s.materialId !== id);
      saveLocalStore(store);
      return true;
    }
  },

  // Short Notes
  async saveShortNote(note: IShortNote): Promise<IShortNote> {
    const conn = await connectDB();
    if (conn) {
      const doc = await ShortNoteModel.create(note);
      return doc.toObject() as IShortNote;
    } else {
      const store = initLocalStore();
      store.shortNotes.unshift(note);
      saveLocalStore(store);
      return note;
    }
  },

  async getShortNotesByMaterial(materialId: string): Promise<IShortNote[]> {
    const conn = await connectDB();
    if (conn) {
      const docs = await ShortNoteModel.find({ materialId }).sort({ createdAt: -1 });
      return docs.map((d) => d.toObject() as IShortNote);
    } else {
      const store = initLocalStore();
      return store.shortNotes.filter((n) => n.materialId === materialId);
    }
  },

  // Study Sessions (Quizzes & Feynman evaluations)
  async saveStudySession(session: IStudySession): Promise<IStudySession> {
    const conn = await connectDB();
    if (conn) {
      const doc = await StudySessionModel.create(session);
      return doc.toObject() as IStudySession;
    } else {
      const store = initLocalStore();
      store.studySessions.unshift(session);
      saveLocalStore(store);
      return session;
    }
  },

  async getSessionsByMaterial(materialId: string): Promise<IStudySession[]> {
    const conn = await connectDB();
    if (conn) {
      const docs = await StudySessionModel.find({ materialId }).sort({ createdAt: -1 });
      return docs.map((d) => d.toObject() as IStudySession);
    } else {
      const store = initLocalStore();
      return store.studySessions.filter((s) => s.materialId === materialId);
    }
  },
};
