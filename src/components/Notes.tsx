import React, { useState, useEffect, useMemo } from 'react';
import { Note } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  StickyNote,
  Search,
  Plus,
  Trash2,
  Edit3,
  Pin,
  Tag,
  Calendar,
  Sparkles,
  Check,
  X,
  Copy,
  Download,
  Filter,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'সব ক্যাটাগরি', color: 'bg-slate-100 text-slate-700' },
  { value: 'general', label: 'সাধারণ', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { value: 'syllabus', label: 'সিলেবাস', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { value: 'exams', label: 'পরীক্ষা সংক্রান্ত', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { value: 'fees', label: 'ফি কালেকশন', color: 'bg-pink-50 text-pink-700 border-pink-100' },
  { value: 'notices', label: 'গুরুত্বপূর্ণ নোটিশ', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  { value: 'others', label: 'অন্যান্য', color: 'bg-purple-50 text-purple-700 border-purple-100' },
];

const COLORS = [
  { value: 'slate', name: 'ধূসর', bg: 'bg-slate-50 border-slate-200 text-slate-800', dot: 'bg-slate-400' },
  { value: 'indigo', name: 'নীল', bg: 'bg-indigo-50/70 border-indigo-100 text-indigo-950', dot: 'bg-indigo-500' },
  { value: 'emerald', name: 'সবুজ', bg: 'bg-emerald-50/70 border-emerald-100 text-emerald-950', dot: 'bg-emerald-500' },
  { value: 'amber', name: 'হলুদ', bg: 'bg-amber-50/70 border-amber-100 text-amber-950', dot: 'bg-amber-500' },
  { value: 'rose', name: 'লাল', bg: 'bg-rose-50/70 border-rose-100 text-rose-950', dot: 'bg-rose-500' },
  { value: 'purple', name: 'বেগুনী', bg: 'bg-purple-50/70 border-purple-100 text-purple-950', dot: 'bg-purple-500' },
];

const BENGALI_NUMBERS: { [key: string]: string } = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

function toBengaliNum(num: number | string): string {
  return num
    .toString()
    .split('')
    .map((char) => BENGALI_NUMBERS[char] || char)
    .join('');
}

interface NotesProps {
  notes?: Note[];
  onSaveNotes?: (updatedNotes: Note[]) => Promise<boolean>;
}

export default function Notes({ notes: propNotes, onSaveNotes }: NotesProps = {}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alpha'>('newest');

  // Note editor form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [noteColor, setNoteColor] = useState('slate');
  const [isPinned, setIsPinned] = useState(false);

  // Success indicator states
  const [showCopiedId, setShowCopiedId] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Sync state with prop changes
  useEffect(() => {
    if (propNotes !== undefined) {
      setNotes(propNotes);
    }
  }, [propNotes]);

  // Load notes on component mount
  useEffect(() => {
    if (propNotes !== undefined) {
      setNotes(propNotes);
      return;
    }
    const savedNotes = localStorage.getItem('sms_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Error loading notes from localStorage:', e);
      }
    } else {
      const defaultNotes: Note[] = [
        {
          id: '1',
          title: '২০২৬ শিক্ষাবর্ষের আইসিটি সিলেবাস আপডেট',
          content: 'আইসিটি একাডেমিক কোর্সের প্রথম অধ্যায়ের শর্ট কোশ্চেনগুলো ২০ জুলাইয়ের মধ্যে শেষ করতে হবে। অধ্যায় ২-এর জন্য বাড়তি ২টা লেকচার বরাদ্দ রাখতে হবে।',
          category: 'syllabus',
          color: 'indigo',
          isPinned: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'মডেল টেস্ট ১ নোটিশ বোর্ড',
          content: 'আগামী মাসের প্রথম সপ্তাহে মডেল টেস্ট ১ অনুষ্ঠিত হবে। সকল ব্যাচের সিলেবাস কভার হয়েছে কিনা তা ১৫ তারিখের ভেতরে কনফার্ম করতে হবে। প্রশ্নপত্র ডিজাইন টিমকে জমা দিতে হবে।',
          category: 'exams',
          color: 'amber',
          isPinned: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'বকেয়া ফি নোটিফিকেশন',
          content: 'যেসব শিক্ষার্থী বিগত ২ মাসের ফি পরিশোধ করেনি, তাদের অভিভাবকদের মোবাইলে ২৫ তারিখের ভেতরে অটো-এসএমএস পাঠাতে হবে। ফি কালেকশন মডিউল থেকে তালিকা বের করে নিতে হবে।',
          category: 'fees',
          color: 'rose',
          isPinned: false,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setNotes(defaultNotes);
      // We don't save defaultNotes to storage if propNotes is passed
    }
  }, []);

  // Sync state with localStorage/prop callback
  const saveNotesToStorage = async (updatedNotes: Note[]) => {
    if (onSaveNotes) {
      const success = await onSaveNotes(updatedNotes);
      if (success) {
        setNotes(updatedNotes);
      }
    } else {
      setNotes(updatedNotes);
      localStorage.setItem('sms_notes', JSON.stringify(updatedNotes));
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      return;
    }

    const now = new Date().toISOString();

    if (editingNoteId) {
      // Edit existing note
      const updated = notes.map((n) =>
        n.id === editingNoteId
          ? {
              ...n,
              title: title.trim() || 'শিরোনামহীন নোট',
              content: content.trim(),
              category,
              color: noteColor,
              isPinned,
              updatedAt: now,
            }
          : n
      );
      saveNotesToStorage(updated);
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim() || 'শিরোনামহীন নোট',
        content: content.trim(),
        category,
        color: noteColor,
        isPinned,
        createdAt: now,
        updatedAt: now,
      };
      saveNotesToStorage([newNote, ...notes]);
    }

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setCategory('general');
    setNoteColor('slate');
    setIsPinned(false);
    setIsFormOpen(false);
  };

  const handleEditClick = (note: Note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setNoteColor(note.color);
    setIsPinned(note.isPinned);
    setIsFormOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    setNoteToDelete(id);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      const filtered = notes.filter((n) => n.id !== noteToDelete);
      saveNotesToStorage(filtered);
      setNoteToDelete(null);
    }
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
    );
    saveNotesToStorage(updated);
  };

  const handleCopyContent = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setShowCopiedId(note.id);
      setTimeout(() => setShowCopiedId(null), 2000);
    });
  };

  const handleDownloadText = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    const element = document.createElement('a');
    const fullText = `শিরোনাম: ${note.title}\nক্যাটাগরি: ${
      CATEGORIES.find((cat) => cat.value === note.category)?.label || note.category
    }\nতারিখ: ${new Date(note.createdAt).toLocaleDateString('bn-BD')}\n\nমূল নোট:\n${note.content}`;
    const file = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title || 'Note'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter & Sort Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
        const s = searchTerm.toLowerCase();
        const matchesSearch =
          n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [notes, selectedCategory, searchTerm, sortBy]);

  // Separate Pinned and Unpinned
  const { pinnedNotes, unpinnedNotes } = useMemo(() => {
    const pinned = filteredNotes.filter((n) => n.isPinned);
    const unpinned = filteredNotes.filter((n) => !n.isPinned);
    return { pinnedNotes: pinned, unpinnedNotes: unpinned };
  }, [filteredNotes]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <StickyNote className="h-5.5 w-5.5 text-indigo-600 animate-pulse" />
            গুরুত্বপূর্ণ নোটবুক (Smart Notepad)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            কোচিংয়ের একাডেমিক প্ল্যান, প্রশ্নপত্র জমা, ফি বকেয়া নোটিশ বা যেকোনো তথ্য দ্রুত লিখে রাখুন ও ক্যাটাগরি অনুযায়ী সাজিয়ে রাখুন।
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs hover:shadow-indigo-600/10 transition active:scale-95 cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" /> নতুন নোট লিখুন
        </button>
      </div>

      {/* Editor Panel (Expandable) */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden"
          >
            <form onSubmit={handleSaveNote} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  {editingNoteId ? 'নোট এডিট করুন' : 'নতুন নোট সংরক্ষণ করুন'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Note title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block">নোটের শিরোনাম</label>
                  <input
                    type="text"
                    required
                    placeholder="নোটের আকর্ষণীয় একটি শিরোনাম দিন..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-bold"
                  />
                </div>

                {/* Pin toggle */}
                <div className="flex items-end justify-start pb-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Pin className="h-3.5 w-3.5 text-indigo-600 fill-indigo-600" />
                      নোটটি পিন করুন (Pin Note)
                    </span>
                  </label>
                </div>
              </div>

              {/* Note Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">বিস্তারিত নোট</label>
                <textarea
                  required
                  placeholder="আপনার প্রয়োজনীয় তথ্য, কাজের তালিকা বা যেকোনো রিমাইন্ডার এখানে লিখুন..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium leading-relaxed resize-y"
                />
              </div>

              {/* Category, color, submit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-end">
                {/* Select Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">ক্যাটাগরি নির্ধারণ করুন</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Scheme Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">ব্যাকগ্রাউন্ডের থিম কালার</label>
                  <div className="flex items-center gap-2">
                    {COLORS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setNoteColor(col.value)}
                        className={`h-7 w-7 rounded-full border flex items-center justify-center transition active:scale-95 cursor-pointer relative ${col.bg}`}
                        title={col.name}
                      >
                        {noteColor === col.value && (
                          <Check className="h-3 w-3 stroke-[3px] text-slate-800" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4 stroke-[3px]" />
                    {editingNoteId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full xl:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="নোটের শিরোনাম বা তথ্য খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-semibold"
          />
        </div>

        {/* Categories filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto py-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold select-none cursor-pointer border whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sort and Actions */}
        <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 bg-white cursor-pointer focus:outline-none"
          >
            <option value="newest">সর্বশেষ আপডেট</option>
            <option value="oldest">পূর্বে তৈরি করা</option>
            <option value="alpha">বর্ণানুক্রমিকভাবে</option>
          </select>
        </div>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3.5">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Pin className="h-3.5 w-3.5 text-indigo-600 fill-indigo-600" />
            পিন করা নোটবোর্ড ({toBengaliNum(pinnedNotes.length)})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedNotes.map((note) => {
              const currentTheme = COLORS.find((c) => c.value === note.color) || COLORS[0];
              const categoryObj = CATEGORIES.find((cat) => cat.value === note.category);
              return (
                <div
                  key={note.id}
                  className={`border p-5 rounded-2xl flex flex-col justify-between min-h-[190px] relative transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${currentTheme.bg}`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-2.5 mb-2.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider ${categoryObj?.color || 'bg-slate-100 text-slate-600'}`}>
                        {categoryObj?.label || 'সাধারণ'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleTogglePin(note.id, e)}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-md hover:bg-black/5 transition cursor-pointer"
                          title="পিন সরান"
                        >
                          <Pin className="h-3.5 w-3.5 fill-indigo-600" />
                        </button>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{note.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line line-clamp-4">
                        {note.content}
                      </p>
                    </div>
                  </div>

                  {/* Footer options */}
                  <div className="border-t border-black/5 pt-3.5 mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {toBengaliNum(new Date(note.updatedAt).toLocaleDateString('bn-BD'))}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Copy */}
                      <button
                        onClick={(e) => handleCopyContent(note, e)}
                        className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer relative"
                        title="কপি করুন"
                      >
                        {showCopiedId === note.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Download */}
                      <button
                        onClick={(e) => handleDownloadText(note, e)}
                        className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer"
                        title="ডাউনলোড (.txt)"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEditClick(note)}
                        className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer"
                        title="এডিট করুন"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main/Unpinned Notes Section */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-slate-400" />
          সকল নোটবুকসমূহ ({toBengaliNum(unpinnedNotes.length)})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unpinnedNotes.map((note) => {
            const currentTheme = COLORS.find((c) => c.value === note.color) || COLORS[0];
            const categoryObj = CATEGORIES.find((cat) => cat.value === note.category);
            return (
              <div
                key={note.id}
                className={`border p-5 rounded-2xl flex flex-col justify-between min-h-[190px] relative transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${currentTheme.bg}`}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-2.5 mb-2.5">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider ${categoryObj?.color || 'bg-slate-100 text-slate-600'}`}>
                      {categoryObj?.label || 'সাধারণ'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleTogglePin(note.id, e)}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-black/5 transition cursor-pointer"
                        title="পিন করুন"
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note Content */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{note.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line line-clamp-4">
                      {note.content}
                    </p>
                  </div>
                </div>

                {/* Footer options */}
                <div className="border-t border-black/5 pt-3.5 mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {toBengaliNum(new Date(note.updatedAt).toLocaleDateString('bn-BD'))}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Copy */}
                    <button
                      onClick={(e) => handleCopyContent(note, e)}
                      className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer relative"
                      title="কপি করুন"
                    >
                      {showCopiedId === note.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Download */}
                    <button
                      onClick={(e) => handleDownloadText(note, e)}
                      className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer"
                      title="ডাউনলোড (.txt)"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEditClick(note)}
                      className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer"
                      title="এডিট করুন"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state placeholder */}
        {filteredNotes.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center max-w-lg mx-auto shadow-xs">
            <span className="bg-slate-50 p-4 rounded-full border border-slate-100 text-slate-300 inline-block mb-3.5">
              <StickyNote className="h-8 w-8" />
            </span>
            <h4 className="font-extrabold text-slate-800 text-sm">কোনো সেভ করা নোট পাওয়া যায়নি!</h4>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              অনুগ্রহ করে উপরে "নতুন নোট লিখুন" বোতামে চাপ দিয়ে গুরুত্বপূর্ণ নোটিশ বা তথ্য লিখে ফেলুন।
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {noteToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNoteToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative z-10 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <span className="bg-rose-50 p-2.5 rounded-full border border-rose-100">
                  <Trash2 className="h-5 w-5" />
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">নোট ডিলিট নিশ্চিতকরণ</h3>
              </div>

              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                আপনি কি নিশ্চিতভাবে এই নোটটি ডিলিট করতে চান? ডিলিট করার পর এই তথ্যটি আর ফেরত পাওয়া যাবে না।
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteToDelete(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  না, ফিরে যান
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteNote}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs hover:shadow-rose-600/10 transition cursor-pointer"
                >
                  হ্যাঁ, ডিলিট করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
