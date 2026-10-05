import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit3, ArrowLeft, Trash2, Eye } from 'lucide-react';
import EventForm from '../../components/events/EventForm';
import Modal from '../../components/common/Modal';
import { eventService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventById(id);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (err) {
      showToast('Failed to load event details for editing', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setSubmitting(true);
      const res = await eventService.updateEvent(id, formData);
      if (res.data.success) {
        showToast('Event updated successfully!', 'success');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await eventService.deleteEvent(id);
      if (res.data.success) {
        showToast('Event deleted successfully', 'success');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      showToast('Failed to delete event', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading event data...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center glass-card rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <Link to="/admin/dashboard" className="btn-primary inline-flex">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Edit Event & Lifecycle
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/events/${id}`}
            className="btn-secondary !py-2 !px-3.5 !text-xs"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Public Page
          </Link>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="btn-danger !py-2 !px-3.5 !text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Controlled Form */}
      <EventForm
        initialValues={event}
        onSubmit={handleUpdate}
        isSubmitting={submitting}
        isEdit={true}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Event"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete <strong className="text-white">{event.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="btn-secondary !py-2 !px-4 !text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn-danger !py-2 !px-4 !text-xs"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditEventPage;
