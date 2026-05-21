import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { getReports, FetalReport, deleteReport } from "../lib/db";
import { Link, useNavigate } from "react-router-dom";
import {
  Baby,
  Plus,
  Trash2,
  Calendar,
  User,
  FileText,
  Settings,
  ClipboardList,
  LogOut
} from "lucide-react";
import { motion } from "motion/react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<FetalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const loadReports = async () => {
    if (user?.uid) {
      try {
        setIsLoading(true);
        const data = await getReports(user.uid);
        setReports(data.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (e) {
        console.warn("Failed to load reports:", e);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (user?.uid) {
      await deleteReport(id, user.uid);
      setDeleteConfirmId(null);
      loadReports();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-fuchsia-700 to-pink-500 bg-fixed text-white font-sans">
      <header className="sticky top-0 z-50 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 border border-white/30 backdrop-blur-md shadow-lg rounded-2xl">
                <Baby className="w-5 h-5 text-white drop-shadow-md" />
              </div>
              <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-md">
                Sonexa
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/templates"
                title="Manage Snippets"
                className="flex items-center justify-center w-10 h-10 bg-white/20 border border-white/30 backdrop-blur-md shadow-lg rounded-2xl hover:bg-white/30 hover:scale-105 transition-all"
              >
                <ClipboardList className="w-5 h-5 text-white drop-shadow-md" />
              </Link>
              <Link
                to="/profile"
                title="Settings"
                className="flex items-center justify-center w-10 h-10 bg-white/20 border border-white/30 backdrop-blur-md shadow-lg rounded-2xl hover:bg-white/30 hover:scale-105 transition-all"
              >
                <Settings className="w-5 h-5 text-white drop-shadow-md" />
              </Link>
              <div className="relative">
                <button
                  title="Profile Menu"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 bg-white/20 border border-white/30 backdrop-blur-md shadow-lg rounded-2xl hover:bg-white/30 hover:scale-105 transition-all overflow-hidden"
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white drop-shadow-md" />
                  )}
                </button>
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                    <div className="absolute right-0 mt-3 w-48 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <div className="h-px bg-white/10 w-full" />
                      <button 
                        onClick={() => { setIsProfileMenuOpen(false); logout(); navigate('/login'); }} 
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/80 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Patient Reports
            </h2>
            <p className="mt-2 text-sm text-white/80 font-medium">
              Manage and view your stored medical reports.
            </p>
          </div>
          <Link
            to="/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg shadow-black/20 text-sm font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 transition-all active:scale-[0.98] backdrop-blur-md"
          >
            <Plus className="w-4 h-4" />
            New Report
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/80"></div>
          </div>
        ) : reports.length === 0 ? (
          <div
            className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
              <FileText className="w-10 h-10 text-white/80" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-sm">
              No reports yet
            </h3>
            <p className="text-white/70 mb-8 max-w-sm mx-auto font-medium">
              Start creating your first medical report using intelligent
              templates.
            </p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 rounded-xl shadow-sm text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition-all active:scale-[0.98] backdrop-blur-md"
            >
              <Plus className="w-4 h-4" />
              Create Report
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, i) => (
              <div
                key={report.id}
                className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group animate-in fade-in zoom-in-95 relative z-10 hover:z-20"
                style={{ animationFillMode: "both", animationDelay: `${i * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-5">
                    <h3 className="text-lg font-bold text-white truncate pr-4 drop-shadow-sm">
                      {report.patientName}
                    </h3>
                    <div className="flex items-center">
                      {deleteConfirmId === report.id ? (
                        <div className="flex gap-1.5 transition-opacity">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(report.id); }}
                            className="text-white hover:text-white hover:bg-red-600 border border-transparent text-xs font-bold px-3 py-1.5 bg-red-500 rounded-lg transition-colors shadow-sm cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmId(null); }}
                            className="text-white hover:text-white hover:bg-white/20 border border-transparent text-xs font-bold px-3 py-1.5 bg-white/10 rounded-lg transition-colors shadow-sm cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/edit/${report.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-white hover:text-white hover:bg-white/20 border border-transparent hover:border-white/30 text-xs font-bold px-3 py-1.5 bg-white/10 rounded-lg transition-colors shadow-sm cursor-pointer"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmId(report.id); }}
                            className="text-red-300 hover:text-white p-1.5 hover:bg-red-500/80 bg-white/10 border border-transparent hover:border-red-500/50 rounded-lg transition-colors shadow-sm cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-white/80 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                        <User className="w-4 h-4 text-white/70" />
                      </div>
                      <span className="truncate">
                        ID: {report.patientId} • {report.age}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                        <Calendar className="w-4 h-4 text-white/70" />
                      </div>
                      <span>Visit: {report.visitDate}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <Link
                      to={`/print/${report.id}`}
                      className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 font-bold py-2.5 px-4 rounded-xl text-sm transition-all backdrop-blur-md shadow-sm"
                    >
                      Print
                    </Link>
                    <Link
                      to={`/new?cloneId=${report.id}`}
                      className="flex-1 text-center bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 font-bold py-2.5 px-4 rounded-xl text-sm transition-all backdrop-blur-md shadow-sm"
                    >
                      Template
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
