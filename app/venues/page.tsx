'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { venuesApi } from '../services/api';
import { Venue, CreateVenueDto } from '../types';
import { VenueModal } from './components/VenueModal';
import { DeleteModal } from './components/DeleteModal';
import {
  Plus,
  Search,
  MapPin,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  Car,
  ShowerHead,
} from 'lucide-react';

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch real venues directly from NestJS backend
  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await venuesApi.getAll(selectedSport, selectedCity);
      setVenues(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Backend fetch error:', err.message);
      setError(err.message || 'Failed to connect to backend API');
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSport, selectedCity]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // 2. Create venue
  const handleCreateVenue = async (payload: CreateVenueDto) => {
    await venuesApi.create(payload);
    showToast(`Venue "${payload.venueName}" created successfully in MySQL!`);
    await fetchVenues();
  };

  // 3. Edit venue
  const handleUpdateVenue = async (payload: CreateVenueDto) => {
    if (!editingVenue) return;
    await venuesApi.update(editingVenue.id, payload);
    showToast(`Venue "${payload.venueName}" updated successfully!`);
    setEditingVenue(null);
    await fetchVenues();
  };

  // 4. Toggle Active Status
  const handleToggleStatus = async (venue: Venue) => {
    const currentActive = typeof venue.isActive === 'number' ? venue.isActive === 1 : !!venue.isActive;
    const newStatus = !currentActive;
    try {
      await venuesApi.toggleStatus(venue.id, newStatus);
      showToast(`Ground "${venue.venueName}" is now ${newStatus ? 'Active' : 'Inactive'}`);
      await fetchVenues();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // 5. Delete Venue
  const handleDeleteConfirm = async () => {
    if (!deletingVenue) return;
    try {
      await venuesApi.delete(deletingVenue.id);
      showToast(`Ground "${deletingVenue.venueName}" deactivated`);
      await fetchVenues();
    } catch (err: any) {
      alert(`Failed to delete venue: ${err.message}`);
    }
  };

  // Client-side search filtering
  const filteredVenues = venues.filter((v) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      v.venueName.toLowerCase().includes(term) ||
      v.city.toLowerCase().includes(term) ||
      (v.addressLine && v.addressLine.toLowerCase().includes(term)) ||
      (v.district && v.district.toLowerCase().includes(term));
    return matchesSearch;
  });

  // Calculate dynamic stats
  const totalCount = venues.length;
  const activeCount = venues.filter((v) => (typeof v.isActive === 'number' ? v.isActive === 1 : !!v.isActive)).length;
  const uniqueCities = Array.from(new Set(venues.map((v) => v.city).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <Header
        title="Venues"
        subtitle="Manage sports grounds, GPS spatial coordinates, pricing, and facilities"
        actionButton={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Venue
          </button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              ✕
            </button>
          </div>
        )}

        {/* Backend Error Alert if offline */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Backend API Notice: <strong>{error}</strong>. Ensure your NestJS backend is running on <code>http://localhost:3000</code>.
              </span>
            </div>
            <button
              onClick={fetchVenues}
              className="px-3 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 font-bold text-amber-900 text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Grounds</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
            <p className="text-xs text-slate-500 mt-1">Stored in MySQL with Spatial SRID 4326</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active in Catalog</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
            <p className="text-xs text-slate-500 mt-1">Discoverable by mobile players & organizers</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cities Covered</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{uniqueCities.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {uniqueCities.length > 0 ? uniqueCities.slice(0, 3).join(', ') : 'No cities registered'}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by venue name, city, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Sport Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Sports</option>
              <option value="CRICKET">🏏 Cricket</option>
              <option value="FUTSAL">⚽ Futsal</option>
              <option value="BADMINTON">🏸 Badminton</option>
              <option value="BASKETBALL">🏀 Basketball</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Cities</option>
              {uniqueCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchVenues}
              title="Refresh from backend"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Venues Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Registered Sports Grounds</h2>
              <p className="text-xs text-slate-400 font-medium">Real data from MySQL <code>venues</code> table</p>
            </div>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
              {filteredVenues.length} {filteredVenues.length === 1 ? 'ground' : 'grounds'}
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Loading venues from backend...</p>
              <p className="text-xs text-slate-400 mt-1">Querying MySQL spatial coordinates & facilities</p>
            </div>
          ) : filteredVenues.length === 0 ? (
            /* Clean Empty State when no mock data is entered */
            <div className="p-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-1">
                No sports grounds registered yet
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                No grounds were found in your MySQL database. Click the button below to add your first ground with GPS coordinates and facilities.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Your First Venue
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Venue Name</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Spatial GPS</th>
                    <th className="px-6 py-3.5">Sports & Facilities</th>
                    <th className="px-6 py-3.5">Hourly Rate</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredVenues.map((v) => {
                    const isActive = typeof v.isActive === 'number' ? v.isActive === 1 : !!v.isActive;
                    const hasFloodlights = v.facilities?.some((f) => f.hasFloodlights);
                    const hasParking = v.facilities?.some((f) => f.hasParking);
                    const hasChanging = v.facilities?.some((f) => f.hasChangingRooms);

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name & Contact */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">{v.venueName}</p>
                          {v.contactPhone && (
                            <p className="text-xs text-slate-400 mt-0.5">📞 {v.contactPhone}</p>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-slate-800">{v.city}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{v.addressLine}</p>
                        </td>

                        {/* GPS Coordinates */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            {Number(v.latitude).toFixed(4)}°, {Number(v.longitude).toFixed(4)}°
                          </span>
                        </td>

                        {/* Facilities */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {v.facilities?.map((f, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700"
                              >
                                {f.sportType}
                              </span>
                            ))}
                            {hasFloodlights && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700" title="Floodlights">
                                ⚡ Lights
                              </span>
                            )}
                            {hasParking && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700" title="Parking">
                                🚗 Parking
                              </span>
                            )}
                            {hasChanging && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700" title="Changing Rooms">
                                🚿 Changing
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Hourly Base Rate */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 text-xs">
                            LKR {Number(v.hourlyBaseRate || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/ hour</span>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(v)}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingVenue(v)}
                              title="Edit Venue"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingVenue(v)}
                              title="Deactivate / Delete"
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <VenueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateVenue}
      />

      {/* Edit Modal */}
      <VenueModal
        isOpen={!!editingVenue}
        onClose={() => setEditingVenue(null)}
        onSave={handleUpdateVenue}
        initialData={editingVenue}
      />

      {/* Delete / Deactivate Confirm Modal */}
      <DeleteModal
        venue={deletingVenue}
        onClose={() => setDeletingVenue(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
