'use client';

import React, { useState } from 'react';
import {
  X,
  Shield,
  MapPin,
  Calendar,
  Users,
  Trophy,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { Team, SquadMember } from '../data/mockData';

interface TeamDetailModalProps {
  team: Team | null;
  onClose: () => void;
  onOpenSuspension: (team: Team) => void;
  onReactivateTeam: (teamId: string) => void;
  onRemoveMember?: (teamId: string, memberId: string) => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  team,
  onClose,
  onOpenSuspension,
  onReactivateTeam,
  onRemoveMember,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'info'>('roster');

  if (!team) return null;

  const winRate =
    team.matchesPlayed > 0 ? Math.round((team.winsCount / team.matchesPlayed) * 100) : 0;

  const getRoleBadge = (role: SquadMember['role']) => {
    switch (role) {
      case 'Captain':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Vice-Captain':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Goalkeeper':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Forward':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Midfielder':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Defender':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-[#D7FB38] font-black text-xl flex items-center justify-center border-2 border-lime-300 shadow-md">
              {team.initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-zinc-900">{team.name}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                  {team.sport}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                    team.status === 'Active'
                      ? 'bg-emerald-100/70 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100/70 text-rose-800 border border-rose-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      team.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {team.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {team.location}, Sri Lanka
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Registered: {team.createdAt}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-zinc-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suspension Banner (if suspended) */}
        {team.status === 'Suspended' && team.suspensionDetails && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 px-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-rose-900">
              <span className="font-bold block text-sm">Team is Currently Suspended</span>
              <p className="mt-0.5">
                <strong>Reason:</strong> {team.suspensionDetails.reason} (
                {team.suspensionDetails.duration})
              </p>
              {team.suspensionDetails.notes && (
                <p className="text-rose-700 mt-1">
                  <strong>Notes:</strong> {team.suspensionDetails.notes}
                </p>
              )}
              <p className="text-[11px] text-rose-600 mt-1">
                Suspended on {team.suspensionDetails.suspendedAt} by{' '}
                {team.suspensionDetails.suspendedBy}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onReactivateTeam(team.id)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reactivate Team
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 border-b border-gray-100 bg-white">
          <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
              <Users className="w-4 h-4 text-gray-400" />
              <span>Squad Size</span>
            </div>
            <p className="text-xl font-bold text-zinc-900 mt-1">
              {team.squad ? team.squad.length : team.membersCount}
              <span className="text-xs font-normal text-gray-400 ml-1">players</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
              <Trophy className="w-4 h-4 text-gray-400" />
              <span>Matches</span>
            </div>
            <p className="text-xl font-bold text-zinc-900 mt-1">
              {team.matchesPlayed}
              <span className="text-xs font-normal text-gray-400 ml-1">played</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Wins</span>
            </div>
            <p className="text-xl font-bold text-zinc-900 mt-1">
              {team.winsCount}
              <span className="text-xs font-normal text-gray-400 ml-1">wins</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
              <Shield className="w-4 h-4 text-[#C6F526]" />
              <span>Win Ratio</span>
            </div>
            <p className="text-xl font-bold text-zinc-900 mt-1">{winRate}%</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-6 border-b border-gray-200 flex gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'roster'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-gray-400 hover:text-zinc-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Squad Roster ({team.squad ? team.squad.length : 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'info'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-gray-400 hover:text-zinc-600'
            }`}
          >
            <Shield className="w-4 h-4" />
            Manager & Bio
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'roster' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Verified Team Members</h3>
                  <p className="text-xs text-gray-500">
                    Official players registered in this squad roster.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                  {team.squad ? team.squad.length : 0} / 15 Maximum
                </span>
              </div>

              {team.squad && team.squad.length > 0 ? (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Player</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Jersey</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Moderation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {team.squad.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-800 font-bold text-[10px] flex items-center justify-center border border-gray-200">
                                {member.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-zinc-900 block text-xs">
                                  {member.fullName}
                                </span>
                                <span className="text-[10px] text-gray-400">{member.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getRoleBadge(
                                member.role
                              )}`}
                            >
                              {member.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {member.jerseyNumber ? (
                              <span className="font-mono font-bold text-zinc-800 bg-gray-100 px-1.5 py-0.5 rounded">
                                #{member.jerseyNumber}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-500">{member.joinedDate}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              {member.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {member.role !== 'Captain' && onRemoveMember && (
                              <button
                                type="button"
                                onClick={() => onRemoveMember(team.id, member.id)}
                                className="text-[11px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-md font-medium transition-colors"
                                title="Remove ineligible player from roster"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No roster members registered yet for this team.
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Manager Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Designated Team Manager
                </h4>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-[#D7FB38] font-bold text-xs flex items-center justify-center">
                      MGR
                    </div>
                    <div>
                      <h5 className="font-bold text-zinc-900 text-sm">{team.manager.name}</h5>
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                        Verified Team Manager
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {team.manager.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {team.manager.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Team Bio & Description
                </h4>
                <p className="text-xs text-zinc-700 leading-relaxed">{team.bio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 px-6 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            {team.status === 'Active' ? (
              <button
                type="button"
                onClick={() => onOpenSuspension(team)}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                Suspend Team
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReactivateTeam(team.id)}
                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reactivate Team
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
