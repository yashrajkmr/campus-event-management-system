import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Sparkles } from 'lucide-react';
import EventForm from '../../components/events/EventForm';
import { eventService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (formData) => {
    try {
      setSubmitting(true);
      const res = await eventService.createEvent(formData);
      if (res.data.success) {
        showToast('Event created successfully!', 'success');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Create Campus Event
          </h1>
        </div>
      </div>

      {/* Form Component */}
      <EventForm onSubmit={handleCreate} isSubmitting={submitting} isEdit={false} />
    </div>
  );
};

export default CreateEventPage;
