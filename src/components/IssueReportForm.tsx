import React, { useState } from 'react';
import { Camera, MapPin, Send, Loader2, Megaphone } from 'lucide-react';
import { MapPicker } from './MapComponents';

const Input = ({ label, icon: Icon, readOnly, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-yellow-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />}
      <input
        {...props}
        readOnly={readOnly}
        className={`w-full ${readOnly ? 'bg-white/10 opacity-70 cursor-not-allowed' : 'bg-white/5'} border border-white/10 ${Icon ? 'pl-12' : 'px-4'} pr-4 py-4 rounded-2xl outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all text-white placeholder:text-slate-600`}
      />
    </div>
  </div>
);

export const IssueReportForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Roads',
    state: 'Select location on map',
    district: '',
    locality: '',
    latitude: 0,
    longitude: 0,
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert('Please select a location on the map first.');
      return;
    }
    if (!formData.title || !formData.description || !formData.category) {
      alert('Please fill in all the text fields.');
      return;
    }

    setLoading(true);
    const data = new FormData();
    const submissionData = {
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    };
    Object.entries(submissionData).forEach(([key, value]) => data.append(key, value.toString()));
    if (photo) data.append('photo', photo);

    try {
      const res = await fetch('/api/issues', { method: 'POST', body: data });
      if (res.ok) {
        const successMsg = document.createElement('div');
        successMsg.className =
          'fixed top-24 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.5)] border border-yellow-400 z-[100] font-bold animate-bounce';
        successMsg.innerText = '✓ Report Submitted Successfully!';
        document.body.appendChild(successMsg);

        setFormData({
          title: '', description: '', category: 'Roads',
          state: 'Andhra Pradesh', district: 'Visakhapatnam',
          locality: '', latitude: 0, longitude: 0,
        });
        setPhoto(null);
        onSuccess();

        setTimeout(() => {
          if (document.body.contains(successMsg)) document.body.removeChild(successMsg);
        }, 2000);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to submit report'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationDetails = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data?.address) {
        setFormData(prev => ({
          ...prev,
          state: data.address.state || prev.state,
          district: data.address.state_district || data.address.county || data.address.city_district || prev.district,
          locality: data.address.suburb || data.address.neighbourhood || data.address.village || data.address.town || data.address.city || prev.locality,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch location details', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="user-glow-card p-8 md:p-12 rounded-[2.5rem] space-y-10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <div className="relative z-10">
        <h2 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
            <Megaphone className="w-8 h-8 text-yellow-400" />
          </div>
          Report Issue
        </h2>
        <p className="text-slate-400 mt-3 text-lg">Help us identify and resolve community problems.</p>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            required
            label="Title"
            placeholder="e.g. Broken Street Light"
            value={formData.title}
            onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
          />
          <div className="space-y-2">
            <label className="text-xs font-bold text-yellow-500 uppercase tracking-widest ml-1">Category</label>
            <select
              className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-2xl outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all text-white appearance-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option className="bg-black">Roads</option>
              <option className="bg-black">Sanitation</option>
              <option className="bg-black">Water Supply</option>
              <option className="bg-black">Electricity</option>
              <option className="bg-black">Public Safety</option>
              <option className="bg-black">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-yellow-500 uppercase tracking-widest ml-1">Detailed Description</label>
          <textarea
            required
            rows={4}
            placeholder="Provide as much detail as possible..."
            className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-2xl outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all text-white placeholder:text-slate-600 resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input label="State (Auto)" value={formData.state} readOnly />
          <Input label="District (Auto)" value={formData.district} readOnly />
          <Input label="Locality (Auto)" value={formData.locality} readOnly />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-yellow-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Pinpoint Location
            </label>
            {formData.latitude !== 0 && (
              <span className="text-[10px] text-yellow-400 font-mono">
                COORD: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </span>
            )}
          </div>
          <MapPicker onLocationSelect={fetchLocationDetails} />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-yellow-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Camera className="w-4 h-4" /> Visual Evidence
          </label>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
            <div className="w-full py-12 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 group-hover:border-yellow-500/30 transition-all bg-white/5">
              <div className="p-4 bg-yellow-500/10 rounded-full">
                <Camera className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-slate-400 font-medium">{photo ? photo.name : 'Click or drag to upload photo'}</p>
              <p className="text-slate-600 text-xs uppercase tracking-widest">Max size: 10MB</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 relative z-10">
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-yellow-500 text-black py-5 rounded-[2rem] font-bold hover:bg-yellow-400 transition-all shadow-[0_0_40px_rgba(234,179,8,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 group"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Submit Report <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
