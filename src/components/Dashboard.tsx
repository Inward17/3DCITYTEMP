import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Map, Loader2, Trash2, X, Eye, Edit3, MoreVertical, Calendar, Filter, Search, Grid, List, Building, Briefcase, Layers, Edit2 } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { format } from 'date-fns';
import { DarkModeToggle } from './DarkModeToggle';

type SortOption = 'name' | 'date' | 'type';
type ViewMode = 'grid' | 'list';

export function Dashboard() {
  const { projects, loading, fetchProjects, deleteProject, updateProject } = useProjectStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterType, setFilterType] = useState<'all' | 'planning' | 'corporate'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingProject && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingProject]);

  const handleDelete = async (projectId: string) => {
    setDeleteLoading(true);
    setError('');
    try {
      await deleteProject(projectId);
      setSuccess('Project deleted successfully');
      setDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditStart = (project: any) => {
    setEditingProject(project.id);
    setEditingName(project.name);
  };

  const handleEditSave = async () => {
    if (!editingProject || !editingName.trim()) return;
    
    try {
      await updateProject(editingProject, {
        name: editingName.trim(),
        updated_at: new Date().toISOString()
      });
      setEditingProject(null);
      setEditingName('');
      setSuccess('Project name updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update project name');
    }
  };

  const handleEditCancel = () => {
    setEditingProject(null);
    setEditingName('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || project.model_type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.model_type.localeCompare(b.model_type);
        case 'date':
        default:
          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      }
    });

  const ProjectCard = ({ project, isListView = false, index = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDropdownOpen = openDropdown === project.id;
    const isEditing = editingProject === project.id;

    return (
      <div 
        className={`group relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:border-gray-300/70 dark:hover:border-gray-600/70 hover:shadow-xl dark:hover:shadow-gray-900/30 hover:-translate-y-2 hover:bg-white/90 dark:hover:bg-gray-800/90 ${
          isListView ? 'flex items-center p-4' : 'p-6'
        } animate-fade-slide-in`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          animationDelay: `${index * 100}ms`,
          animationFillMode: 'both'
        }}
      >
        <div className={`${isListView ? 'flex items-center flex-1 gap-4' : ''}`}>
          {/* Project Icon */}
          <div className={`${isListView ? 'flex-shrink-0' : 'mb-4'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
              {project.model_type === 'planning' ? (
                <Building className="h-6 w-6 text-white" />
              ) : (
                <Briefcase className="h-6 w-6 text-white" />
              )}
            </div>
          </div>

          {/* Project Info */}
          <div className={`${isListView ? 'flex-1 min-w-0' : ''}`}>
            <div className={`${isListView ? 'flex items-start justify-between' : ''}`}>
              <div className={`${isListView ? 'min-w-0 flex-1' : ''}`}>
                {/* Editable Title */}
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleEditSave}
                    onKeyDown={handleEditKeyDown}
                    className={`font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-white ${
                      isListView ? 'text-lg mb-1 w-full' : 'text-xl mb-2 w-full'
                    }`}
                  />
                ) : (
                  <h3 
                    className={`font-semibold text-gray-900 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer ${
                      isListView ? 'text-lg truncate mb-1' : 'text-xl mb-2'
                    }`}
                    onDoubleClick={() => handleEditStart(project)}
                    title="Double-click to edit"
                  >
                    {project.name}
                  </h3>
                )}
                
                {/* Project Type Badge & Metadata */}
                <div className={`${isListView ? 'flex items-center gap-3 mb-1' : 'mb-3'}`}>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    project.model_type === 'planning' 
                      ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 backdrop-blur-sm' 
                      : 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 backdrop-blur-sm'
                  }`}>
                    {project.model_type === 'planning' ? 'City Planning' : 'Corporate Campus'}
                  </span>
                  
                  {/* Sectors indicator */}
                  {project.sectors && project.sectors.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {project.sectors.length} sector{project.sectors.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {isListView && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(project.updated_at || project.created_at), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>

                {/* Description */}
                {project.description && (
                  <p className={`text-gray-600 dark:text-gray-300 ${
                    isListView ? 'text-sm truncate' : 'text-sm mb-4 line-clamp-2'
                  }`}>
                    {project.description}
                  </p>
                )}

                {/* Grid View Footer */}
                {!isListView && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    Last updated {format(new Date(project.updated_at || project.created_at), 'MMMM d, yyyy')}
                  </div>
                )}
              </div>

              {/* Actions - Always visible on list view, hover on grid view */}
              <div className={`${
                isListView 
                  ? 'flex items-center gap-1 ml-4' 
                  : `absolute top-4 right-4 flex items-center gap-1 transition-all duration-300 ${
                      isHovered || isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`
              }`}>
                {/* Quick Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    to={`/project/${project.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg backdrop-blur-sm bg-gray-50/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-blue-50/80 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                    title="View Project"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleEditStart(project)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg backdrop-blur-sm bg-gray-50/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-all duration-200 hover:scale-110"
                    title="Edit Project Name"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <Link
                    to={`/edit/${project.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg backdrop-blur-sm bg-gray-50/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-all duration-200 hover:scale-110"
                    title="Edit Project Settings"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  
                  {/* More Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg backdrop-blur-sm bg-gray-50/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-all duration-200 hover:scale-110"
                      title="More actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-xl dark:shadow-gray-900/30 border border-gray-200/50 dark:border-gray-700/50 py-1 z-20 animate-scale-in">
                        <button
                          onClick={() => {
                            setDeleteConfirm(project.id);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-3" />
                          Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid View Primary Action */}
            {!isListView && (
              <div className="flex items-center justify-between">
                <Link
                  to={`/project/${project.id}`}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Project
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors relative">
      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Floating Action Button */}
      <Link
        to="/create"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white rounded-full shadow-2xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 group backdrop-blur-sm"
        title="Create New Project"
      >
        <Plus className="h-7 w-7 transition-transform duration-200 group-hover:rotate-90" />
      </Link>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Projects</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Manage and organize your city planning projects</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <DarkModeToggle />
            {/* Secondary CTA for desktop */}
            <Link
              to="/create"
              className="hidden sm:inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 backdrop-blur-md bg-red-50/90 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-between animate-slide-down shadow-lg">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 backdrop-blur-md bg-green-50/90 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/50 text-green-700 dark:text-green-300 rounded-xl flex items-center justify-between animate-slide-down shadow-lg">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300/50 dark:border-gray-600/50 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-3 py-2 backdrop-blur-sm bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="planning">City Planning</option>
                  <option value="corporate">Corporate Campus</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-3 py-2 backdrop-blur-sm bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="date">Last Edited</option>
                <option value="name">A–Z</option>
                <option value="type">Type</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center backdrop-blur-sm bg-gray-100/80 dark:bg-gray-700/80 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredAndSortedProjects.length === 0 ? (
          <div className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-16 text-center shadow-lg animate-fade-in">
            {/* Enhanced Empty State Illustration */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-800/50 dark:to-indigo-800/50 rounded-full"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-blue-300 to-indigo-300 dark:from-blue-700/70 dark:to-indigo-700/70 rounded-full flex items-center justify-center">
                <Map className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              {searchTerm || filterType !== 'all' ? 'No projects found' : 'You haven\'t created any projects yet'}
            </h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for'
                : 'Start your urban planning journey by creating your first project. Design cities, manage corporate campuses, and bring your vision to life.'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <Link
                to="/create"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Project
              </Link>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredAndSortedProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                isListView={viewMode === 'list'}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="backdrop-blur-md bg-white/95 dark:bg-gray-800/95 rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-scale-in">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100/80 dark:bg-red-900/40 rounded-full flex items-center justify-center mr-3">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Project</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this project? This action cannot be undone and all project data will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 backdrop-blur-sm bg-gray-100/80 dark:bg-gray-700/80 rounded-lg hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 rounded-lg hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 transition-colors flex items-center backdrop-blur-sm"
                  disabled={deleteLoading}
                >
                  {deleteLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-slide-in {
          animation: fade-slide-in 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}