'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { GOAL_CATEGORIES, PERFORMANCE_SECTIONS, PERIOD_OPTIONS } from '@/constants/appraisal';
import { useAppraisal } from '@/contexts/AppraisalContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppraisalGoal, AppraisalTemplate } from '@/types/appraisal.types';
import {
    faClipboardList,
    faEye,
    faPlus,
    faSearch,
    faTimes,
    faTrash,
    faUpload
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

export default function AppraisalsPage() {
  const { user } = useAuth();
  const {
    getTemplatesForUser,
    createTemplate,
    publishTemplate,
    deleteTemplate,
    getSubmissionsForTemplate,
  } = useAppraisal();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'closed'>('all');

  const templates = user ? getTemplatesForUser(user) : [];
  
  const filtered = useMemo(
    () =>
      templates
        .filter((t) => filterStatus === 'all' || t.status === filterStatus)
        .filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.period.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    [templates, filterStatus, searchQuery],
  );

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appraisal Templates</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage performance appraisal templates</p>
        </div>
        <Button icon={faPlus} onClick={() => setShowCreateModal(true)}>
          Create Template
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'draft', 'published', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                filterStatus === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <FontAwesomeIcon icon={faClipboardList} className="text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No templates found</p>
          <p className="text-gray-400 text-sm mt-1">Create your first appraisal template to get started</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              submissionCount={getSubmissionsForTemplate(template.id).length}
              onPublish={() => publishTemplate(template.id)}
              onDelete={() => deleteTemplate(template.id)}
              onView={() => router.push(`/dashboard/appraisals/${template.id}`)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTemplateModal
          user={user}
          onCreate={(data) => {
            createTemplate(data);
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function TemplateCard({
  template,
  submissionCount,
  onPublish,
  onDelete,
  onView,
}: {
  template: AppraisalTemplate;
  submissionCount: number;
  onPublish: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const statusColor = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  }[template.status];

  return (
    <Card className="hover:shadow-xl transition-shadow !p-5">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusColor}`}>
          {template.status}
        </span>
        <span className="text-xs text-gray-400">{template.period}</span>
      </div>
      <h3 className="font-bold text-gray-900 mb-1 text-base">{template.title}</h3>
      <p className="text-gray-500 text-xs mb-4 line-clamp-2">{template.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {template.goals.slice(0, 3).map((g) => (
          <span key={g.id} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
            {g.category}
          </span>
        ))}
        {template.goals.length > 3 && (
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            +{template.goals.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>{template.goals.length} goals</span>
        <span>{template.assignedTo.length} assigned</span>
        <span>{submissionCount} submitted</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition"
        >
          <FontAwesomeIcon icon={faEye} /> View
        </button>
        {template.status === 'draft' && (
          <button
            onClick={onPublish}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition"
          >
            <FontAwesomeIcon icon={faUpload} /> Publish
          </button>
        )}
        {template.status === 'draft' && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>
    </Card>
  );
}

function CreateTemplateModal({
  user,
  onCreate,
  onClose,
}: {
  user: { id: string; name: string; role: 'admin' | 'manager' | 'employee' };
  onCreate: (data: Omit<AppraisalTemplate, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const { employees, isLoadingEmployees, loadEmployees } = useAppraisal();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0] as string);
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [goals, setGoals] = useState<AppraisalGoal[]>([]);
  const [newGoal, setNewGoal] = useState<Partial<AppraisalGoal>>({
    title: '',
    description: '',
    category: GOAL_CATEGORIES[0],
    section: PERFORMANCE_SECTIONS.TASKS,
    weightage: 25,
  });

  React.useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const addGoal = () => {
    if (!newGoal.title || !newGoal.description) return;
    setGoals((prev) => [
      ...prev,
      { ...newGoal, id: `g-${Date.now()}` } as AppraisalGoal,
    ]);
    setNewGoal({ 
      title: '', 
      description: '', 
      category: GOAL_CATEGORIES[0], 
      section: PERFORMANCE_SECTIONS.TASKS,
      weightage: 25 
    });
  };

  const removeGoal = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id));

  const totalWeight = goals.reduce((s, g) => s + g.weightage, 0);
  const taskGoals = goals.filter(g => g.section === PERFORMANCE_SECTIONS.TASKS);
  const competencyGoals = goals.filter(g => g.section === PERFORMANCE_SECTIONS.COMPETENCIES);
  const hasValidSectionDistribution = taskGoals.length > 0 || competencyGoals.length > 0;

  const toggleAssignee = (id: string) => {
    setAssignedTo((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const canSubmit = title && description && deadline && goals.length > 0 && assignedTo.length > 0 && totalWeight === 100 && hasValidSectionDistribution;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onCreate({
      title,
      description,
      period,
      createdBy: user.id,
      createdByName: user.name,
      createdByRole: user.role as 'admin' | 'manager',
      assignedTo,
      goals,
      status: 'draft',
      deadline: new Date(deadline).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">Create Appraisal Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q1 2026 Performance Appraisal"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Describe the purpose and scope of this appraisal..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Assign Employees</label>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Assign All Employees</span>
                  <span className="text-xs text-gray-500">
                    ({isLoadingEmployees ? 'Loading...' : `${employees.length} employees`})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (assignedTo.length === employees.length) {
                      setAssignedTo([]);
                    } else {
                      setAssignedTo(employees.map(emp => emp.id));
                    }
                  }}
                  disabled={isLoadingEmployees}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                    assignedTo.length === employees.length
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                  } ${isLoadingEmployees ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {assignedTo.length === employees.length ? 'Unassign All' : 'Assign All'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Or select individually:</span>
                  <select
                    value=""
                    onChange={(e) => {
                      const employeeId = e.target.value;
                      if (employeeId && !assignedTo.includes(employeeId)) {
                        toggleAssignee(employeeId);
                      }
                    }}
                    disabled={isLoadingEmployees}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingEmployees ? 'Loading employees...' : 'Select an employee...'}
                    </option>
                    {!isLoadingEmployees && employees.filter(emp => !assignedTo.includes(emp.id)).map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.department} ({emp.position})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {assignedTo.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Selected Employees ({assignedTo.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setAssignedTo([])}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {assignedTo.map((empId) => {
                      const employee = employees.find(emp => emp.id === empId);
                      if (!employee) return null;
                      
                      return (
                        <div
                          key={empId}
                          className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-purple-900">{employee.name}</p>
                            <p className="text-xs text-purple-600 truncate">
                              {employee.department} • {employee.position}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleAssignee(empId)}
                            className="text-purple-400 hover:text-purple-600 transition ml-2"
                            title="Remove employee"
                          >
                            <FontAwesomeIcon icon={faTimes} className="text-xs" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {assignedTo.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No employees assigned yet. Use "Assign All" or select individual employees.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Goals / KPIs{' '}
                <span className={`text-xs ${totalWeight === 100 ? 'text-green-600' : 'text-red-500'}`}>
                  (Total weight: {totalWeight}%{totalWeight === 100 ? ' ✓' : ' — must equal 100%'})
                </span>
              </label>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500">
                Distribution: {taskGoals.length} Task{taskGoals.length === 1 ? '' : 's'}, {competencyGoals.length} Competenc{competencyGoals.length === 1 ? 'y' : 'ies'}
              </div>
              {!hasValidSectionDistribution && (
                <span className="text-xs text-red-500">⚠ At least one goal required in tasks or competencies</span>
              )}
            </div>

            {goals.length > 0 && (
              <div className="space-y-2 mb-4">
                {goals.map((g, idx) => (
                  <div key={g.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs font-bold text-purple-600 mt-0.5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{g.title}</p>
                      <p className="text-xs text-gray-500 truncate">{g.description}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{g.category}</span>
                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">{g.section}</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{g.weightage}%</span>
                      </div>
                    </div>
                    <button onClick={() => removeGoal(g.id)} className="text-red-400 hover:text-red-600 transition">
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={newGoal.title || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Goal title"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <select
                  value={newGoal.category || GOAL_CATEGORIES[0]}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  {GOAL_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <select
                    value={newGoal.section || PERFORMANCE_SECTIONS.TASKS}
                    onChange={(e) => setNewGoal({ ...newGoal, section: e.target.value as any })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value={PERFORMANCE_SECTIONS.TASKS}>Tasks</option>
                    <option value={PERFORMANCE_SECTIONS.COMPETENCIES}>Competencies</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newGoal.weightage || 25}
                    onChange={(e) => setNewGoal({ ...newGoal, weightage: Number(e.target.value) })}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="%"
                  />
                </div>
              </div>
              <textarea
                value={newGoal.description || ''}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Describe what the employee should achieve..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              />
              <Button
                onClick={addGoal}
                icon={faPlus}
                variant="outline"
                className="!py-2 !text-xs"
                disabled={!newGoal.title || !newGoal.description}
              >
                Add Goal
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t sticky bottom-0 bg-white rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Create Template
          </Button>
        </div>
      </div>
    </div>
  );
}
