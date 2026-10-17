'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Zap, Car, ShowerHead, AlertCircle, Loader2 } from 'lucide-react';
import { Venue, CreateVenueDto, SportType } from '../../types';

interface VenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateVenueDto) => Promise<void>;
  initialData?: Venue | null;
}

const GPS_PRESETS = [
  { label: 'Select a location preset (optional)...', lat: 0, lng: 0, city: '', district: '', province: '' },
  { label: 'Colombo 07 — Racecourse Grounds', lat: 6.9038, lng: 79.8631, city: 'Colombo', district: 'Colombo', province: 'Western Province' },
  { label: 'Colombo 07 — CR & FC Indoor Arena', lat: 6.9072, lng: 79.8665, city: 'Colombo', district: 'Colombo', province: 'Western Province' },
  { label: 'Moratuwa — Tyronne Fernando Stadium', lat: 6.7725, lng: 79.8833, city: 'Moratuwa', district: 'Colombo', province: 'Western Province' },
  { label: 'Colombo 07 — Otters Athletic Club', lat: 6.8920, lng: 79.8650, city: 'Colombo', district: 'Colombo', province: 'Western Province' },
  { label: 'Kandy — Asgiriya International Ground', lat: 7.2985, lng: 80.6358, city: 'Kandy', district: 'Kandy', province: 'Central Province' },
  { label: 'Galle — Galle International Stadium', lat: 6.0329, lng: 80.2168, city: 'Galle', district: 'Galle', province: 'Southern Province' },
  { label: 'Negombo — Kadirana Sports Complex', lat: 7.2083, lng: 79.8756, city: 'Negombo', district: 'Gampaha', province: 'Western Province' },
];

export const VenueModal: React.FC<VenueModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [venueName, setVenueName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Colombo');
  const [district, setDistrict] = useState('Colombo');
  const [province, setProvince] = useState('Western Province');
  const [contactPhone, setContactPhone] = useState('');
  const [latitude, setLatitude] = useState('6.9038');
  const [longitude, setLongitude] = useState('79.8631');
  const [hourlyBaseRate, setHourlyBaseRate] = useState('3500');

  // Facilities
  const [selectedSports, setSelectedSports] = useState<SportType[]>(['CRICKET']);
  const [hasFloodlights, setHasFloodlights] = useState(true);
  const [hasParking, setHasParking] = useState(true);
  const [hasChangingRooms, setHasChangingRooms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setVenueName(initialData.venueName || '');
      setAddressLine(initialData.addressLine || '');
      setCity(initialData.city || 'Colombo');
      setDistrict(initialData.district || 'Colombo');
      setProvince(initialData.province || 'Western Province');
      setContactPhone(initialData.contactPhone || '');
      setLatitude(initialData.latitude?.toString() || '6.9038');
      setLongitude(initialData.longitude?.toString() || '79.8631');
      setHourlyBaseRate(initialData.hourlyBaseRate?.toString() || '3500');

      if (initialData.facilities && initialData.facilities.length > 0) {
        setSelectedSports(initialData.facilities.map((f) => f.sportType));
        setHasFloodlights(initialData.facilities.some((f) => f.hasFloodlights));
        setHasParking(initialData.facilities.some((f) => f.hasParking));
        setHasChangingRooms(initialData.facilities.some((f) => f.hasChangingRooms));
      }
    } else {
      setVenueName('');
      setAddressLine('');
      setCity('Colombo');
      setDistrict('Colombo');
      setProvince('Western Province');
      setContactPhone('');
      setLatitude('6.9038');
      setLongitude('79.8631');
      setHourlyBaseRate('3500');
      setSelectedSports(['CRICKET']);
      setHasFloodlights(true);
      setHasParking(true);
      setHasChangingRooms(true);
    }
    setErrorMessage(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (idx > 0 && GPS_PRESETS[idx]) {
      const p = GPS_PRESETS[idx];
      setLatitude(p.lat.toString());
      setLongitude(p.lng.toString());
      if (p.city) setCity(p.city);
      if (p.district) setDistrict(p.district);
      if (p.province) setProvince(p.province);
    }
  };

  const toggleSport = (sport: SportType) => {
    if (selectedSports.includes(sport)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter((s) => s !== sport));
      }
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const rateNum = parseFloat(hourlyBaseRate);

    if (!venueName.trim()) {
      setErrorMessage('Venue name is required');
      return;
    }
    if (!addressLine.trim()) {
      setErrorMessage('Address line is required');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('City is required');
      return;
    }
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setErrorMessage('Latitude must be a valid number between -90 and 90');
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setErrorMessage('Longitude must be a valid number between -180 and 180');
      return;
    }

    const facilitiesPayload = selectedSports.map((sport) => ({
      sportType: sport,
      courtOrPitchCount: 1,
      hasFloodlights,
      hasParking,
      hasChangingRooms,
    }));

    const payload: CreateVenueDto = {
      venueName: venueName.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      district: district.trim() || undefined,
      province: province.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      latitude: latNum,
      longitude: lngNum,
      hourlyBaseRate: isNaN(rateNum) ? 0 : rateNum,
      facilities: facilitiesPayload,
    };

    try {
      setLoading(true);
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save venue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {initialData ? 'Edit Sports Ground' : 'Add New Sports Ground'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configures spatial GPS location & facilities for tournament scheduling
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Preset Selector */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
            <label className="block text-xs font-bold text-emerald-900 mb-1.5">
              ⚡ Quick Location Preset (Sri Lanka)
            </label>
            <select
              onChange={handleApplyPreset}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-emerald-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {GPS_PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Row: Name & Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Colombo Racecourse Grounds"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Hourly Rate (LKR)
              </label>
              <input
                type="number"
                placeholder="3500"
                value={hourlyBaseRate}
                onChange={(e) => setHourlyBaseRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Row: Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Address Line *
            </label>
            <input
              type="text"
              placeholder="e.g. Reid Avenue, Colombo 07"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Row: City, District, Province */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+94 11 269 1234"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Spatial Coordinates (MySQL POINT SRID 4326) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Spatial GPS Coordinates (Used for Mobile Nearby Radius Search)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Latitude (° N)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Longitude (° E)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Sports Supported */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Sports Facilities Supported
            </label>
            <div className="flex flex-wrap gap-2">
              {(['CRICKET', 'FUTSAL', 'BADMINTON', 'BASKETBALL'] as SportType[]).map((sport) => {
                const isSelected = selectedSports.includes(sport);
                const emoji = sport === 'CRICKET' ? '🏏' : sport === 'FUTSAL' ? '⚽' : sport === 'BADMINTON' ? '🏸' : '🏀';
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{sport}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amenities & Facilities Checkboxes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Amenities & Equipment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFloodlights}
                  onChange={(e) => setHasFloodlights(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Floodlights
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasParking}
                  onChange={(e) => setHasParking(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-blue-500" />
                  Parking Area
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasChangingRooms}
                  onChange={(e) => setHasChangingRooms(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ShowerHead className="w-3.5 h-3.5 text-purple-500" />
                  Changing Rooms
                </span>
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{initialData ? 'Save Changes' : 'Create Ground'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
