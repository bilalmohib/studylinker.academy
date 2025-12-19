"use client";

import { useState, useEffect } from "react";
import Container from "@/components/common/Container";
import { BsEnvelope, BsEye, BsCheckCircle, BsX, BsClock } from "react-icons/bs";
import toast from "react-hot-toast";
import { getAllContactSubmissions, getContactSubmission } from "@/actions/contacts/actions";
import { useRealtimeContacts } from "@/hooks/useRealtime";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string | null;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  response: string | null;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  // Realtime subscription for contacts
  useRealtimeContacts(
    (contact) => {
      // Update the contacts list when a new contact is created or updated
      setContacts((prev) => {
        const existingIndex = prev.findIndex((c) => c.id === contact.id);
        if (existingIndex >= 0) {
          // Update existing contact
          const updated = [...prev];
          updated[existingIndex] = { ...prev[existingIndex], ...contact };
          return updated;
        } else {
          // Add new contact at the beginning
          return [contact, ...prev];
        }
      });
      toast.success("New contact submission received!");
    },
    true
  );

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const result = await getAllContactSubmissions();
      if (result.success && "data" in result && result.data) {
        let filtered = result.data;
        if (statusFilter) {
          filtered = filtered.filter((c: any) => c.status === statusFilter);
        }
        setContacts(filtered);
      } else {
        toast.error("Failed to load contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: any; label: string }> = {
      NEW: { color: "bg-yellow-100 text-yellow-700", icon: BsClock, label: "New" },
      READ: { color: "bg-blue-100 text-blue-700", icon: BsEye, label: "Read" },
      IN_PROGRESS: { color: "bg-purple-100 text-purple-700", icon: BsClock, label: "In Progress" },
      RESOLVED: { color: "bg-green-100 text-green-700", icon: BsCheckCircle, label: "Resolved" },
      ARCHIVED: { color: "bg-gray-100 text-gray-700", icon: BsX, label: "Archived" },
    };

    const config = statusMap[status] || statusMap.NEW;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Contact Submissions
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Manage contact form submissions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="READ">Read</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <BsEnvelope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No contact submissions found</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                      {getStatusBadge(contact.status)}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        {contact.subject}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {contact.message}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                      {contact.phone && <span>Phone: {contact.phone}</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContact(contact);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <BsEye className="w-4 h-4 inline mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Details Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <BsX className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Name</h3>
                  <p className="text-gray-700">{selectedContact.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-700">{selectedContact.email}</p>
                </div>
                {selectedContact.phone && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                    <p className="text-gray-700">{selectedContact.phone}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Subject</h3>
                  <p className="text-gray-700">{selectedContact.subject}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                  {getStatusBadge(selectedContact.status)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Submitted</h3>
                  <p className="text-gray-700">
                    {new Date(selectedContact.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedContact.response && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Response</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.response}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

