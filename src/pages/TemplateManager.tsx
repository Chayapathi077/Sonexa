import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { getTemplates, saveTemplate, deleteTemplate, ReportTemplate } from '../lib/db';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'headText', label: 'Head Anatomy' },
  { id: 'neckText', label: 'Neck Anatomy' },
  { id: 'spineText', label: 'Spine Anatomy' },
  { id: 'faceText', label: 'Face Anatomy' },
  { id: 'thoraxText', label: 'Thorax Anatomy' },
  { id: 'heartText', label: 'Heart Anatomy' },
  { id: 'abdomenText', label: 'Abdomen Anatomy' },
  { id: 'kubText', label: 'KUB Anatomy' },
  { id: 'extremitiesText', label: 'Extremities Anatomy' },
  { id: 'impressionHeading', label: 'Impression Heading' },
  { id: 'impressionBody', label: 'Impression Body' },
  { id: 'impressionEcho', label: 'Impression Echo' },
  { id: 'aneuploidyRisk', label: 'Aneuploidy Risk Assessment' },
  { id: 'counsellingNotes', label: 'Counselling Notes' },
  { id: 'cervix', label: 'Maternal/Cervix' },
];

export default function TemplateManager() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const loadTemplates = async () => {
    if (user?.uid) {
      const data = await getTemplates(user.uid);
      setTemplates(data.sort((a,b) => b.createdAt - a.createdAt));
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !name.trim() || !content.trim()) return;

    const template: ReportTemplate = {
      id: editingId || crypto.randomUUID(),
      userId: user.uid,
      category,
      name,
      content,
      createdAt: Date.now(),
    };

    await saveTemplate(template);
    await loadTemplates();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this snippet?')) {
      if (user?.uid) {
        await deleteTemplate(id, user.uid);
        loadTemplates();
      }
    }
  };

  const handleEdit = (tpl: ReportTemplate) => {
    setEditingId(tpl.id);
    setCategory(tpl.category);
    setName(tpl.name);
    setContent(tpl.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setContent('');
  };

  const groupedTemplates = CATEGORIES.map(cat => ({
    ...cat,
    items: templates.filter(t => t.category === cat.id)
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-fuchsia-700 to-pink-500 bg-fixed text-white font-sans pb-20">
      <header className="sticky top-0 z-50 pt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-[72px]">
            <Link to="/" className="flex items-center justify-center w-10 h-10 text-white/70 hover:text-white transition-all bg-white/20 border border-white/30 hover:bg-white/30 rounded-2xl backdrop-blur-md shadow-lg hover:scale-105">
              <ArrowLeft className="w-5 h-5 drop-shadow-md" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-wide drop-shadow-md">Manage Snippets</h1>
              <p className="text-xs text-white/70 font-medium">Create reusable text blocks for Fetal Anatomy, Impressions, etc.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Editor Form */}
        <div className="lg:col-span-1">
          <form className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/20 p-6 sticky top-24" onSubmit={handleSave}>
            <h2 className="text-xl font-bold mb-6 drop-shadow-sm">{editingId ? 'Edit Snippet' : 'Create Snippet'}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-inner text-white focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all sm:text-sm font-medium [&>option]:text-gray-900"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white/90 mb-2">Snippet Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Normal Head View"
                value={name}
                onChange={e => setName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-inner text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all sm:text-sm font-medium"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/90 mb-2">Content</label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-inner text-white focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all sm:text-sm font-medium"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-white/30 rounded-xl shadow-sm text-sm font-bold text-white bg-white/20 hover:bg-white/30 transition-all active:scale-[0.98] backdrop-blur-md"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Save'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-3 px-4 border border-white/20 rounded-xl shadow-sm text-sm font-bold text-white/70 bg-white/5 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98] backdrop-blur-md"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Snippets array */}
        <div className="lg:col-span-2 space-y-8">
          {groupedTemplates.length === 0 ? (
             <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-white/20 border-dashed backdrop-blur-sm">
               <p className="text-white/60 font-medium tracking-wide">No snippets created yet.</p>
             </div>
          ) : (
            groupedTemplates.map(group => (
              <div key={group.id} className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white border-b border-white/20 pb-3 mb-5 drop-shadow-sm">{group.label}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.items.map(tpl => (
                    <div key={tpl.id} className="bg-white/10 rounded-xl shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] border border-white/20 p-5 hover:bg-white/20 hover:border-white/40 transition-all group backdrop-blur-md relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-sm text-white drop-shadow-sm pr-12">{tpl.name}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                          <button onClick={() => handleEdit(tpl)} className="text-xs font-bold text-white bg-white/10 hover:bg-white/30 border border-white/20 px-2 py-1 rounded-lg transition-colors backdrop-blur-md">Edit</button>
                          <button onClick={() => handleDelete(tpl.id)} className="text-red-300 hover:text-white hover:bg-red-500/80 bg-white/10 border border-white/20 px-2 flex items-center justify-center rounded-lg transition-colors backdrop-blur-md"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                      <p className="text-sm text-white/70 whitespace-pre-wrap line-clamp-3 font-medium leading-relaxed" title={tpl.content}>
                        {tpl.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}

