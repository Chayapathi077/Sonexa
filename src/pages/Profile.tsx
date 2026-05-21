import React, { useState, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';
import { updateProfile, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { updateUserProfile, deleteUserData } from '../lib/db';
import { ArrowLeft, User, Lock, Trash2, Camera, AlertCircle, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (user) {
        if (displayName !== user.displayName) {
          await updateProfile(user, { displayName });
        }
        
        if (password) {
          if (!currentPassword) {
            throw new Error("Current password is required to change password.");
          }
          const credential = EmailAuthProvider.credential(user.email!, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, password);
        }
        setSuccess('Profile updated successfully');
        setPassword('');
        setCurrentPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError('Image must be less than 100MB');
      return;
    }

    try {
      setIsLoading(true);
      
      const compressedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      if (user) {
        await updateUserProfile(user.uid, { photoURL: compressedDataUrl });
        await refreshProfile();
        setSuccess('Profile image updated');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      if (user) {
        setIsLoading(true);
        await updateUserProfile(user.uid, { photoURL: '' });
        await refreshProfile();
        setSuccess('Profile image removed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action cannot be undone.')) {
      return;
    }

    try {
      if (user) {
        setIsLoading(true);
        if (currentPassword) {
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);
        }
        
        // Delete all associated user data from Turso DB
        await deleteUserData(user.uid);
        
        // Delete Firebase Auth User
        await deleteUser(user);
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. You may need to provide your current password first.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-fuchsia-700 to-pink-500 bg-fixed text-white font-sans py-10 px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 text-white hover:text-white transition-all bg-white/20 border border-white/30 hover:bg-white/30 rounded-2xl backdrop-blur-md shadow-lg scroll-smooth"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 drop-shadow-md" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Account Settings
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8">
          
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
              <Save className="w-5 h-5 shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-white/10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-white/5 border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-xl backdrop-blur-sm">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white/50" />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-3 -right-3 w-12 h-12 bg-pink-500 hover:bg-pink-400 text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold mb-1">{user?.displayName || 'User'}</h2>
              <p className="text-white/60 text-sm mb-4">{user?.email}</p>
              <div className="flex gap-3 justify-center sm:justify-start">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {user?.photoURL && (
                  <button 
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-bold bg-white/10 hover:bg-red-500/80 text-white rounded-xl transition-colors border border-white/20"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-medium placeholder-white/30 backdrop-blur-sm"
                placeholder="Enter your name"
              />
            </div>
            
            <div className="pt-4 border-t border-white/10 lg:pt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-white/80" /> Change Password
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-medium placeholder-white/30 backdrop-blur-sm"
                    placeholder="Required for sensitive changes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">New Password (Optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-medium placeholder-white/30 backdrop-blur-sm"
                    placeholder="Leave blank to keep same"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-[1.25rem] font-bold transition-all px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] active:scale-[0.98] duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5 backdrop-blur-2xl transition-all duration-300 group-hover:bg-white/10" />
                <div className="absolute inset-0 border-[1.5px] border-white/40 rounded-[1.25rem]" />
                <div className="absolute inset-0 border border-white/20 rounded-[1.25rem] shadow-[inset_0_2px_15px_rgba(255,255,255,0.4)]" />
                <span className="relative z-10 text-white flex items-center justify-center gap-2 drop-shadow-md text-lg tracking-wide">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8">
            <div className="relative group/danger overflow-hidden rounded-[2rem] p-8 md:p-10 shadow-[0_8px_32px_0_rgba(239,68,68,0.15)] transition-all duration-500 hover:shadow-[0_8px_32px_0_rgba(239,68,68,0.25)] border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/10 backdrop-blur-3xl">
              <div className="absolute inset-x-0 top-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-red-400/60 to-transparent opacity-70" />
              <div className="absolute inset-0 shadow-[inset_0_1px_25px_rgba(239,68,68,0.1)] rounded-[2rem] pointer-events-none" />
              
              <h3 className="relative text-red-300 font-bold mb-3 flex items-center gap-3 drop-shadow-md text-xl md:text-2xl tracking-wide">
                <Trash2 className="w-6 h-6 md:w-7 md:h-7 text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]" /> 
                Danger Zone
              </h3>
              <p className="relative text-white/80 text-sm md:text-base mb-8 drop-shadow-sm font-medium tracking-wide">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="relative group overflow-hidden rounded-[1.25rem] font-bold transition-all px-8 py-4 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_0_rgba(220,38,38,0.3)] active:scale-[0.98] duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-red-700/30 backdrop-blur-2xl transition-all duration-300 group-hover:from-red-500/40 group-hover:to-red-600/40" />
                <div className="absolute inset-0 border-[1.5px] border-red-400/50 rounded-[1.25rem]" />
                <div className="absolute inset-0 border border-red-500/30 rounded-[1.25rem] shadow-[inset_0_2px_15px_rgba(248,113,113,0.3)]" />
                <span className="relative z-10 text-red-100 group-hover:text-white flex items-center justify-center gap-2 drop-shadow-md text-base tracking-wide">
                  Delete Account
                </span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-400/40 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
