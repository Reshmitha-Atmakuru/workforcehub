import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { User, Mail, Shield, Building, Calendar, Award, Camera, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, userRole, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/profile');
      if (res.data) setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, WEBP).' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await API.post('/profile/upload-image', { profileImageUrl: base64Data });
        const updated = res.data || { ...user, profileImageUrl: base64Data };
        setProfile(updated);
        updateUser(updated);
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      } catch (err) {
        console.error('Error uploading image:', err);
        setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setUploading(false);
      setMessage({ type: 'error', text: 'Failed to read image file.' });
    };

    reader.readAsDataURL(file);
  };

  const displayUser = profile || user;
  const avatarUrl = displayUser?.profileImageUrl
    ? (displayUser.profileImageUrl.startsWith('data:') || displayUser.profileImageUrl.startsWith('http')
        ? displayUser.profileImageUrl
        : `http://localhost:8080${displayUser.profileImageUrl}`)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-500" />
          User Profile & Account
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account credentials, avatar, and view your role permissions within WorkforceHub.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-[#131d38] border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
          {/* Avatar Upload Area */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-blue-500/40 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg shadow-blue-500/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                displayUser?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>

            <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-semibold">
              <Camera className="w-5 h-5 mb-1 text-blue-400" />
              <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white">{displayUser?.firstName ? `${displayUser.firstName} ${displayUser.lastName || ''}` : displayUser?.username || 'User'}</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                @{displayUser?.username}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {displayUser?.email || 'user@workforcehub.com'}
            </p>

            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
              <label className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload Avatar</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Account Role
            </span>
            <p className="text-sm font-bold text-indigo-300 font-mono mt-1">{userRole || displayUser?.role}</p>
          </div>

          <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Building className="w-3.5 h-3.5 text-teal-400" />
              Department
            </span>
            <p className="text-sm font-bold text-slate-200 mt-1">{displayUser?.department || 'Engineering'}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            Member since 2026
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Award className="w-4 h-4" />
            Active Session Verified
          </span>
        </div>
      </div>
    </div>
  );
}
