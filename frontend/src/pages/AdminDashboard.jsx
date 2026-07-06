import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import GISMap from '../components/GISMap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, 
  FileText, 
  Wrench, 
  Receipt, 
  Download, 
  Megaphone,
  CheckCircle,
  XCircle,
  HelpCircle,
  Activity,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';

const AdminDashboard = () => {
  const { API_BASE_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Backend state
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [permits, setPermits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Form inputs
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('general');
  const [annAudience, setAnnAudience] = useState('all');
  const [annImage, setAnnImage] = useState('');

  // Request update state
  const [activeRequest, setActiveRequest] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');
  const [requestComment, setRequestComment] = useState('');

  // Permit status state
  const [activePermit, setActivePermit] = useState(null);
  const [permitStatus, setPermitStatus] = useState('');
  const [permitComment, setPermitComment] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // User Management State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  
  // Selected user for editing
  const [editUserId, setEditUserId] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('citizen');

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('citizen');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Submitting States
  const [submittingRequestStatus, setSubmittingRequestStatus] = useState(false);
  const [submittingPermitStatus, setSubmittingPermitStatus] = useState(false);
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
  const [submittingCreateUser, setSubmittingCreateUser] = useState(false);
  const [submittingEditUser, setSubmittingEditUser] = useState(false);
  const [submittingCreateBooking, setSubmittingCreateBooking] = useState(false);
  const [submittingEditBooking, setSubmittingEditBooking] = useState(false);
  const [submittingCreateTax, setSubmittingCreateTax] = useState(false);
  const [submittingEditTax, setSubmittingEditTax] = useState(false);
  const [submittingEditAnn, setSubmittingEditAnn] = useState(false);
  const [submittingCreateRequest, setSubmittingCreateRequest] = useState(false);
  const [submittingEditRequest, setSubmittingEditRequest] = useState(false);
  const [submittingCreatePermit, setSubmittingCreatePermit] = useState(false);
  const [submittingEditPermit, setSubmittingEditPermit] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resAnal, resUsers, resReq, resPermits, resBookings, resTaxes, resAnnouncements] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/analytics`, { headers }),
        fetch(`${API_BASE_URL}/admin/users`, { headers }),
        fetch(`${API_BASE_URL}/admin/requests`, { headers }),
        fetch(`${API_BASE_URL}/admin/permits`, { headers }),
        fetch(`${API_BASE_URL}/admin/bookings`, { headers }),
        fetch(`${API_BASE_URL}/admin/taxes`, { headers }),
        fetch(`${API_BASE_URL}/services/announcements`, { headers })
      ]);

      if (resAnal.ok) setAnalytics((await resAnal.json()).data);
      if (resUsers.ok) setUsers((await resUsers.json()).data);
      if (resReq.ok) setRequests((await resReq.json()).data);
      if (resPermits.ok) setPermits((await resPermits.json()).data);
      if (resBookings.ok) setBookings((await resBookings.json()).data);
      if (resTaxes.ok) setTaxes((await resTaxes.json()).data);
      if (resAnnouncements.ok) setAnnouncements((await resAnnouncements.json()).data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'citizen' : 'admin';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        showNotification('User role updated successfully.');
        fetchData();
      }
    } catch (err) {
      showNotification('Error updating role.', 'error');
    }
  };

  const handleUpdateRequestStatus = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    if (!requestStatus) {
      showNotification('Please select a status option first.', 'error');
      return;
    }
    setSubmittingRequestStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/requests/${activeRequest._id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: requestStatus, comment: requestComment })
      });

      if (response.ok) {
        showNotification('Service request updated successfully.');
        setActiveRequest(null);
        setRequestComment('');
        fetchData();
      }
    } catch (err) {
      showNotification('Error updating request.', 'error');
    } finally {
      setSubmittingRequestStatus(false);
    }
  };

  const handleUpdatePermitStatus = async (e) => {
    e.preventDefault();
    if (!activePermit) return;
    if (!permitStatus) {
      showNotification('Please select a decision outcome first.', 'error');
      return;
    }
    setSubmittingPermitStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/permits/${activePermit._id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: permitStatus, comments: permitComment })
      });

      if (response.ok) {
        showNotification(`Permit application set to ${permitStatus}.`);
        setActivePermit(null);
        setPermitComment('');
        fetchData();
      }
    } catch (err) {
      showNotification('Error processing permit status.', 'error');
    } finally {
      setSubmittingPermitStatus(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setSubmittingAnnouncement(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: annTitle, content: annContent, type: annType, targetAudience: annAudience, image: annImage || undefined })
      });

      if (response.ok) {
        showNotification('Announcement posted successfully.');
        setAnnTitle('');
        setAnnContent('');
        setAnnImage('');
        const fileInput = document.getElementById('announce-image-input');
        if (fileInput) fileInput.value = '';
        fetchData();
      }
    } catch (err) {
      showNotification('Error submitting announcement.', 'error');
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const downloadCSVReport = () => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE_URL}/admin/reports/csv?token=${token}`, '_blank');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmittingCreateUser(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole
        })
      });

      const resData = await response.json();
      if (response.ok) {
        showNotification('User created successfully.');
        setShowAddUserModal(false);
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('citizen');
        fetchData();
      } else {
        showNotification(resData.message || 'Error creating user', 'error');
      }
    } catch (err) {
      showNotification('Error creating user.', 'error');
    } finally {
      setSubmittingCreateUser(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setSubmittingEditUser(true);
    try {
      const token = localStorage.getItem('token');
      const body = {
        username: editUsername,
        email: editEmail,
        role: editRole
      };
      if (editPassword) {
        body.password = editPassword;
      }
      const response = await fetch(`${API_BASE_URL}/admin/users/${editUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const resData = await response.json();
      if (response.ok) {
        showNotification('User updated successfully.');
        setShowEditUserModal(false);
        setEditPassword('');
        fetchData();
      } else {
        showNotification(resData.message || 'Error updating user', 'error');
      }
    } catch (err) {
      showNotification('Error updating user.', 'error');
    } finally {
      setSubmittingEditUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (response.ok) {
        showNotification('User deleted successfully.');
        fetchData();
      } else {
        showNotification(resData.message || 'Error deleting user', 'error');
      }
    } catch (err) {
      showNotification('Error deleting user.', 'error');
    }
  };

  const handleViewUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();
      if (response.ok) {
        setSelectedUserDetail(resData.data);
        setShowUserDetailsModal(true);
      } else {
        showNotification('Error fetching user details.', 'error');
      }
    } catch (err) {
      showNotification('Error fetching user details.', 'error');
    }
  };

  // Service Request CRUD Handlers
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [newRequestCitizenId, setNewRequestCitizenId] = useState('');
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  const [newRequestCategory, setNewRequestCategory] = useState('Maintenance');
  const [newRequestPriority, setNewRequestPriority] = useState('medium');
  const [editRequestId, setEditRequestId] = useState('');
  const [editRequestTitle, setEditRequestTitle] = useState('');
  const [editRequestDescription, setEditRequestDescription] = useState('');
  const [editRequestCategory, setEditRequestCategory] = useState('Maintenance');
  const [editRequestPriority, setEditRequestPriority] = useState('medium');

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newRequestCitizenId) {
      showNotification('Please select a citizen.', 'error');
      return;
    }
    setSubmittingCreateRequest(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          citizenId: newRequestCitizenId,
          title: newRequestTitle,
          description: newRequestDescription,
          category: newRequestCategory,
          priority: newRequestPriority
        })
      });
      if (response.ok) {
        showNotification('Service request logged successfully.');
        setShowAddRequestModal(false);
        setNewRequestTitle('');
        setNewRequestDescription('');
        fetchData();
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error logging request', 'error');
      }
    } catch (err) {
      showNotification('Error logging request.', 'error');
    } finally {
      setSubmittingCreateRequest(false);
    }
  };

  const handleEditRequest = async (e) => {
    e.preventDefault();
    setSubmittingEditRequest(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/requests/${editRequestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editRequestTitle,
          description: editRequestDescription,
          category: editRequestCategory,
          priority: editRequestPriority
        })
      });
      if (response.ok) {
        showNotification('Service request updated successfully.');
        setShowEditRequestModal(false);
        fetchData();
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error updating request', 'error');
      }
    } catch (err) {
      showNotification('Error updating request.', 'error');
    } finally {
      setSubmittingEditRequest(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service request?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/requests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification('Service request deleted successfully.');
        fetchData();
      } else {
        showNotification('Error deleting request.', 'error');
      }
    } catch (err) {
      showNotification('Error deleting request.', 'error');
    }
  };

  // Permits CRUD Handlers
  const [showAddPermitModal, setShowAddPermitModal] = useState(false);
  const [showEditPermitModal, setShowEditPermitModal] = useState(false);
  const [newPermitCitizenId, setNewPermitCitizenId] = useState('');
  const [newPermitTitle, setNewPermitTitle] = useState('');
  const [newPermitDescription, setNewPermitDescription] = useState('');
  const [newPermitType, setNewPermitType] = useState('Building Permit');
  const [editPermitId, setEditPermitId] = useState('');
  const [editPermitTitle, setEditPermitTitle] = useState('');
  const [editPermitDescription, setEditPermitDescription] = useState('');
  const [editPermitType, setEditPermitType] = useState('Building Permit');
  const [editPermitStatus, setEditPermitStatus] = useState('');
  const [editPermitComments, setEditPermitComments] = useState('');

  const handleCreatePermit = async (e) => {
    e.preventDefault();
    if (!newPermitCitizenId) {
      showNotification('Please select a citizen.', 'error');
      return;
    }
    setSubmittingCreatePermit(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/permits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          citizenId: newPermitCitizenId,
          title: newPermitTitle,
          description: newPermitDescription,
          permitType: newPermitType
        })
      });
      if (response.ok) {
        showNotification('Permit application created successfully.');
        setShowAddPermitModal(false);
        setNewPermitTitle('');
        setNewPermitDescription('');
        fetchData();
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error creating permit', 'error');
      }
    } catch (err) {
      showNotification('Error creating permit.', 'error');
    } finally {
      setSubmittingCreatePermit(false);
    }
  };

  const handleEditPermit = async (e) => {
    e.preventDefault();
    if (!editPermitStatus) {
      showNotification('Please select a status option first.', 'error');
      return;
    }
    setSubmittingEditPermit(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/permits/${editPermitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editPermitTitle,
          description: editPermitDescription,
          permitType: editPermitType,
          status: editPermitStatus,
          comments: editPermitComments
        })
      });
      if (response.ok) {
        showNotification('Permit application updated successfully.');
        setShowEditPermitModal(false);
        fetchData();
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error updating permit', 'error');
      }
    } catch (err) {
      showNotification('Error updating permit.', 'error');
    } finally {
      setSubmittingEditPermit(false);
    }
  };

  const handleDeletePermit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this permit application?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/permits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification('Permit application deleted successfully.');
        fetchData();
      } else {
        showNotification('Error deleting permit.', 'error');
      }
    } catch (err) {
      showNotification('Error deleting permit.', 'error');
    }
  };

  // Event Bookings CRUD Handlers
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [newBookingCitizenId, setNewBookingCitizenId] = useState('');
  const [newBookingTitle, setNewBookingTitle] = useState('');
  const [newBookingDescription, setNewBookingDescription] = useState('');
  const [newBookingDate, setNewBookingDate] = useState('');
  const [newBookingTimeSlot, setNewBookingTimeSlot] = useState('09:00 - 12:00');
  const [newBookingVenue, setNewBookingVenue] = useState('Town Hall Center');
  const [newBookingTickets, setNewBookingTickets] = useState(1);
  const [editBookingId, setEditBookingId] = useState('');
  const [editBookingTitle, setEditBookingTitle] = useState('');
  const [editBookingDescription, setEditBookingDescription] = useState('');
  const [editBookingDate, setEditBookingDate] = useState('');
  const [editBookingTimeSlot, setEditBookingTimeSlot] = useState('09:00 - 12:00');
  const [editBookingVenue, setEditBookingVenue] = useState('Town Hall Center');
  const [editBookingStatus, setEditBookingStatus] = useState('');
  const [editBookingTickets, setEditBookingTickets] = useState(1);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!newBookingCitizenId) {
      showNotification('Please select a citizen.', 'error');
      return;
    }
    setSubmittingCreateBooking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          citizenId: newBookingCitizenId,
          title: newBookingTitle,
          description: newBookingDescription,
          date: newBookingDate,
          timeSlot: newBookingTimeSlot,
          venue: newBookingVenue,
          ticketsCount: Number(newBookingTickets)
        })
      });
      if (response.ok) {
        showNotification('Event booking logged successfully.');
        setShowAddBookingModal(false);
        setNewBookingTitle('');
        setNewBookingDescription('');
        setNewBookingDate('');
        fetchData();
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error booking event', 'error');
      }
    } catch (err) {
      showNotification('Error booking event.', 'error');
    } finally {
      setSubmittingCreateBooking(false);
    }
  };

  const handleEditBooking = async (e) => {
    e.preventDefault();
    if (!editBookingStatus) {
      showNotification('Please select a booking status first.', 'error');
      return;
    }
    setSubmittingEditBooking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/bookings/${editBookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editBookingTitle,
          description: editBookingDescription,
          date: editBookingDate,
          timeSlot: editBookingTimeSlot,
          venue: editBookingVenue,
          status: editBookingStatus,
          ticketsCount: Number(editBookingTickets)
        })
      });
      if (response.ok) {
        showNotification('Event booking updated successfully.');
        setShowEditBookingModal(false);
        fetchData();
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error updating booking', 'error');
      }
    } catch (err) {
      showNotification('Error updating booking.', 'error');
    } finally {
      setSubmittingEditBooking(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification('Event booking deleted successfully.');
        fetchData();
      } else {
        showNotification('Error deleting booking.', 'error');
      }
    } catch (err) {
      showNotification('Error deleting booking.', 'error');
    }
  };

  // Tax Billing CRUD Handlers
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);
  const [showEditTaxModal, setShowEditTaxModal] = useState(false);
  const [newTaxCitizenId, setNewTaxCitizenId] = useState('');
  const [newTaxAmount, setNewTaxAmount] = useState('');
  const [newTaxType, setNewTaxType] = useState('Property Tax');
  const [newTaxStatus, setNewTaxStatus] = useState('');
  const [newTaxBillingDate, setNewTaxBillingDate] = useState('');
  const [editTaxId, setEditTaxId] = useState('');
  const [editTaxAmount, setEditTaxAmount] = useState('');
  const [editTaxType, setEditTaxType] = useState('Property Tax');
  const [editTaxStatus, setEditTaxStatus] = useState('');
  const [editTaxBillingDate, setEditTaxBillingDate] = useState('');

  const handleCreateTax = async (e) => {
    e.preventDefault();
    if (!newTaxCitizenId) {
      showNotification('Please select a citizen.', 'error');
      return;
    }
    if (!newTaxStatus) {
      showNotification('Please select an initial status first.', 'error');
      return;
    }
    setSubmittingCreateTax(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/taxes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          citizenId: newTaxCitizenId,
          amount: Number(newTaxAmount),
          taxType: newTaxType,
          status: newTaxStatus,
          billingDate: newTaxBillingDate || undefined
        })
      });
      if (response.ok) {
        showNotification('Tax bill created successfully.');
        setShowAddTaxModal(false);
        setNewTaxAmount('');
        setNewTaxBillingDate('');
        fetchData();
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error billing resident', 'error');
      }
    } catch (err) {
      showNotification('Error billing resident.', 'error');
    } finally {
      setSubmittingCreateTax(false);
    }
  };

  const handleEditTax = async (e) => {
    e.preventDefault();
    if (!editTaxStatus) {
      showNotification('Please select a payment status first.', 'error');
      return;
    }
    setSubmittingEditTax(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/taxes/${editTaxId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(editTaxAmount),
          taxType: editTaxType,
          status: editTaxStatus,
          billingDate: editTaxBillingDate
        })
      });
      if (response.ok) {
        showNotification('Tax record updated successfully.');
        setShowEditTaxModal(false);
        fetchData();
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error updating tax record', 'error');
      }
    } catch (err) {
      showNotification('Error updating tax record.', 'error');
    } finally {
      setSubmittingEditTax(false);
    }
  };

  const handleDeleteTax = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tax bill?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/taxes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification('Tax record deleted successfully.');
        fetchData();
      } else {
        showNotification('Error deleting tax record.', 'error');
      }
    } catch (err) {
      showNotification('Error deleting tax record.', 'error');
    }
  };

  // Announcements CRUD Handlers
  const [showEditAnnModal, setShowEditAnnModal] = useState(false);
  const [editAnnId, setEditAnnId] = useState('');
  const [editAnnTitle, setEditAnnTitle] = useState('');
  const [editAnnContent, setEditAnnContent] = useState('');
  const [editAnnType, setEditAnnType] = useState('general');
  const [editAnnAudience, setEditAnnAudience] = useState('all');
  const [editAnnImage, setEditAnnImage] = useState('');

  const handleEditAnnouncement = async (e) => {
    e.preventDefault();
    setSubmittingEditAnn(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/announcements/${editAnnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editAnnTitle,
          content: editAnnContent,
          type: editAnnType,
          targetAudience: editAnnAudience,
          image: editAnnImage || undefined
        })
      });
      if (response.ok) {
        showNotification('Announcement updated successfully.');
        setShowEditAnnModal(false);
        setEditAnnImage('');
        fetchData();
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error updating announcement', 'error');
      }
    } catch (err) {
      showNotification('Error updating announcement.', 'error');
    } finally {
      setSubmittingEditAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showNotification('Announcement deleted successfully.');
        fetchData();
      } else {
        showNotification('Error deleting announcement.', 'error');
      }
    } catch (err) {
      showNotification('Error deleting announcement.', 'error');
    }
  };

  // Pie chart variables
  const COLORS = ['#10b981', '#ef4444'];
  const pieData = analytics ? [
    { name: 'Collected', value: analytics.summary.taxes.collected },
    { name: 'Outstanding', value: analytics.summary.taxes.pending }
  ] : [];

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="admin" />
      
      <main className="main-content">
        <Navbar />
        
        <div className="page-container">
          {/* Notifications */}
          {successMsg && (
            <div className="animated-fade" style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--success-light)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              ✓ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="animated-fade" style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-light)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 1: ANALYTICS & INSIGHTS              */}
          {/* ======================================== */}
          {activeTab === 'analytics' && analytics && (
            <div className="animated-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    Analytics & Governance Insights
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Visual reporting, administrative metrics, and database management exports.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={downloadCSVReport}>
                  <Download size={18} /> Export CSV Report
                </button>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Registered Citizens</span>
                    <Users size={18} />
                  </div>
                  <div className="stat-val">{analytics.summary.citizens}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>active resident portal accounts</span>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Pending Permits</span>
                    <FileText size={18} />
                  </div>
                  <div className="stat-val">{analytics.summary.pendingPermits}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>awaiting zoning/building approval</span>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Service Requests Resolve Rate</span>
                    <Wrench size={18} />
                  </div>
                  <div className="stat-val">
                    {analytics.summary.serviceRequests.total > 0 
                      ? Math.round((analytics.summary.serviceRequests.resolved / analytics.summary.serviceRequests.total) * 100)
                      : 0}%
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {analytics.summary.serviceRequests.resolved} resolved of {analytics.summary.serviceRequests.total} total
                  </span>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Taxes Collected</span>
                    <Receipt size={18} />
                  </div>
                  <div className="stat-val" style={{ color: 'var(--success)' }}>
                    ${analytics.summary.taxes.collected.toFixed(2)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    of ${analytics.summary.taxes.billed.toFixed(2)} billed (outstanding: ${analytics.summary.taxes.pending.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Recharts Grid */}
              <div className="dashboard-grid-12to1" style={{ marginTop: '2.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', minHeight: '350px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Service Requests by Category</h3>
                  <div style={{ width: '100%', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.requestsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                        <YAxis stroke="var(--text-secondary)" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="count" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Taxes Revenue Breakdown</h3>
                  <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px' }} />
                      <span>Collected: 78%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '3px' }} />
                      <span>Outstanding: 22%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 2: USER MANAGEMENT                   */}
          {/* ======================================== */}
          {activeTab === 'users' && (
            <div className="animated-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    User Portal Account Management
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Verify resident credentials, edit authority permissions, and manage administrator/citizen accounts.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
                  Add New User
                </button>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Email Address</th>
                      <th>Database ID</th>
                      <th>Current Role</th>
                      <th>Registered On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>{u.username}</td>
                        <td>{u.email}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{u._id}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-success'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleViewUserDetails(u._id)}>
                              View Details
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => {
                              setEditUserId(u._id);
                              setEditUsername(u.username);
                              setEditEmail(u.email);
                              setEditRole(u.role);
                              setShowEditUserModal(true);
                            }}>
                              Edit
                            </button>
                            <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => handleDeleteUser(u._id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 3: SERVICE REQUEST APPROVAL          */}
          {/* ======================================== */}
          {activeTab === 'requests' && (
            <div className="animated-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    Municipal Service Inquiries & Feedback
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Review, allocate maintenance teams, and add timeline comments to citizen utility reports.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                  setNewRequestCitizenId(users.filter(u => u.role === 'citizen')[0]?._id || '');
                  setShowAddRequestModal(true);
                }}>
                  Log Request on Behalf
                </button>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Citizen Name</th>
                      <th>Feedback Title</th>
                      <th>Dept Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Submission Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No reports filed.</td>
                      </tr>
                    ) : (
                      requests.map(req => (
                        <tr key={req._id}>
                          <td style={{ fontWeight: 600 }}>{req.citizenName}</td>
                          <td>{req.title}</td>
                          <td>{req.category}</td>
                          <td>
                            <span style={{ color: req.priority === 'high' ? 'var(--danger)' : 'inherit', fontWeight: req.priority === 'high' ? 700 : 'normal' }}>
                              {req.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${req.status === 'resolved' ? 'badge-success' : req.status === 'in-progress' ? 'badge-pending' : 'badge-danger'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td>{new Date(req.submittedAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => { setActiveRequest(req); setRequestStatus(''); }}>
                                Update Status
                              </button>
                              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => {
                                setEditRequestId(req._id);
                                setEditRequestTitle(req.title);
                                setEditRequestDescription(req.description);
                                setEditRequestCategory(req.category);
                                setEditRequestPriority(req.priority);
                                setShowEditRequestModal(true);
                              }}>
                                Edit
                              </button>
                              <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }} onClick={() => handleDeleteRequest(req._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 4: PERMITS APPROVAL                  */}
          {/* ======================================== */}
          {activeTab === 'permits' && (
            <div className="animated-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    Building & Trade Permits Review Board
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Review architectural zoning specifications and approve/reject resident applications.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                  setNewPermitCitizenId(users.filter(u => u.role === 'citizen')[0]?._id || '');
                  setShowAddPermitModal(true);
                }}>
                  Submit Permit on Behalf
                </button>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Citizen Name</th>
                      <th>Application Title</th>
                      <th>Permit Category</th>
                      <th>Submission Date</th>
                      <th>Status</th>
                      <th>Action Decisions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permits.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No permit applications found.</td>
                      </tr>
                    ) : (
                      permits.map(permit => (
                        <tr key={permit._id}>
                          <td style={{ fontWeight: 600 }}>{permit.citizenName}</td>
                          <td>{permit.title}</td>
                          <td>{permit.permitType}</td>
                          <td>{new Date(permit.submittedAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${permit.status === 'approved' ? 'badge-success' : permit.status === 'rejected' ? 'badge-danger' : 'badge-pending'}`}>
                              {permit.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {permit.status === 'pending' ? (
                               <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => { setActivePermit(permit); setPermitStatus(''); }}>
                                  Review & Decide
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', alignSelf: 'center' }}>Reviewed ✓</span>
                              )}
                              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => {
                                setEditPermitId(permit._id);
                                setEditPermitTitle(permit.title);
                                setEditPermitDescription(permit.description);
                                setEditPermitType(permit.permitType);
                                setEditPermitStatus('');
                                setEditPermitComments(permit.comments || '');
                                setShowEditPermitModal(true);
                              }}>
                                Edit
                              </button>
                              <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }} onClick={() => handleDeletePermit(permit._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 5: EVENT BOOKINGS                    */}
          {/* ======================================== */}
          {activeTab === 'bookings' && (
            <div className="animated-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    Event Bookings Board
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Track civic facility reservations and public attendance logs.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                  setNewBookingCitizenId(users.filter(u => u.role === 'citizen')[0]?._id || '');
                  setShowAddBookingModal(true);
                }}>
                  Log Booking on Behalf
                </button>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Citizen</th>
                      <th>Event Title</th>
                      <th>Venue</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Tickets</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No bookings registered.</td>
                      </tr>
                    ) : (
                      bookings.map(b => (
                        <tr key={b._id}>
                          <td style={{ fontWeight: 600 }}>{b.citizenName}</td>
                          <td>{b.title}</td>
                          <td>{b.venue}</td>
                          <td>{new Date(b.date).toLocaleDateString()}</td>
                          <td>{b.timeSlot}</td>
                          <td>{b.ticketsCount}</td>
                          <td>
                            <span className={`badge ${b.status === 'approved' ? 'badge-success' : b.status === 'cancelled' ? 'badge-danger' : 'badge-pending'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => {
                                setEditBookingId(b._id);
                                setEditBookingTitle(b.title);
                                setEditBookingDescription(b.description || '');
                                setEditBookingDate(b.date ? b.date.substring(0, 10) : '');
                                setEditBookingTimeSlot(b.timeSlot);
                                setEditBookingVenue(b.venue);
                                setEditBookingStatus('');
                                setEditBookingTickets(b.ticketsCount);
                                setShowEditBookingModal(true);
                              }}>
                                Edit
                              </button>
                              <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }} onClick={() => handleDeleteBooking(b._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 6: TAX BILLING                       */}
          {/* ======================================== */}
          {activeTab === 'taxes' && (
            <div className="animated-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    Tax Billing & Levies
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Issue annual rates, waste disposal charges, and track real-time payments.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                  setNewTaxCitizenId(users.filter(u => u.role === 'citizen')[0]?._id || '');
                  setShowAddTaxModal(true);
                }}>
                  Create Tax Bill
                </button>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Citizen</th>
                      <th>Tax / Levy Type</th>
                      <th>Billed Amount</th>
                      <th>Billing Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxes.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No tax records found.</td>
                      </tr>
                    ) : (
                      taxes.map(t => (
                        <tr key={t._id}>
                          <td style={{ fontWeight: 600 }}>{t.citizenName}</td>
                          <td>{t.taxType}</td>
                          <td>${t.amount.toFixed(2)}</td>
                          <td>{new Date(t.billingDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${t.status === 'paid' ? 'badge-success' : 'badge-pending'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => {
                                setEditTaxId(t._id);
                                setEditTaxAmount(t.amount);
                                setEditTaxType(t.taxType);
                                setEditTaxStatus('');
                                setEditTaxBillingDate(t.billingDate ? t.billingDate.substring(0, 10) : '');
                                setShowEditTaxModal(true);
                              }}>
                                Edit
                              </button>
                              <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }} onClick={() => handleDeleteTax(t._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 7: GIS TOWN PLANNING                 */}
          {/* ======================================== */}
          {activeTab === 'gis' && (
            <div className="animated-fade">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                GIS Town Planning Zoning Board
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Review spatial zone boundaries and allocate property plots inside local sectors.
              </p>
              <GISMap />
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 8: ANNOUNCEMENTS MANAGEMENT          */}
          {/* ======================================== */}
          {activeTab === 'announcements' && (
            <div className="animated-fade dashboard-grid-1to12">
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                  Post Announcements
                </h2>
                <div className="card">
                  <form onSubmit={handlePostAnnouncement}>
                    <div className="form-group">
                      <label className="form-label">Alert Header / Title</label>
                      <input type="text" className="form-input" required placeholder="e.g. Garbage collection delays" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Classification Type</label>
                        <select className="form-input" value={annType} onChange={(e) => setAnnType(e.target.value)}>
                          <option value="general">General Advisory</option>
                          <option value="event">Council Meeting / Event</option>
                          <option value="urgent">Urgent Notice (Emergency)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Target View Audience</label>
                        <select className="form-input" value={annAudience} onChange={(e) => setAnnAudience(e.target.value)}>
                          <option value="all">Publish to All Users</option>
                          <option value="citizens">Citizens Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Announcement Content Text</label>
                      <textarea className="form-input" style={{ minHeight: '120px' }} required placeholder="Describe full details of the notice..." value={annContent} onChange={(e) => setAnnContent(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Upload Announcement Image</label>
                      <input 
                        type="file" 
                        id="announce-image-input" 
                        accept="image/*" 
                        className="form-input" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAnnImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                      {annImage && (
                        <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                          <img src={annImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: 'var(--radius-sm)' }} />
                          <button 
                            type="button" 
                            className="btn btn-danger" 
                            style={{ position: 'absolute', top: '5px', right: '5px', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} 
                            onClick={() => {
                              setAnnImage('');
                              document.getElementById('announce-image-input').value = '';
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submittingAnnouncement}>
                      <Megaphone size={18} /> {submittingAnnouncement ? 'Publishing...' : 'Publish Announcement'}
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                  Manage Notices
                </h2>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Audience</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No announcements posted.</td>
                        </tr>
                      ) : (
                        announcements.map(ann => (
                          <tr key={ann._id}>
                            <td style={{ fontWeight: 600 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {ann.imageUrl && (
                                  <img 
                                    src={ann.imageUrl.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${ann.imageUrl}` : ann.imageUrl} 
                                    alt="Thumb" 
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-xs)', flexShrink: 0 }} 
                                  />
                                )}
                                <span>{ann.title}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${ann.type === 'urgent' ? 'badge-danger' : ann.type === 'event' ? 'badge-pending' : 'badge-success'}`}>
                                {ann.type}
                              </span>
                            </td>
                            <td>{ann.targetAudience}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => {
                                  setEditAnnId(ann._id);
                                  setEditAnnTitle(ann.title);
                                  setEditAnnContent(ann.content);
                                  setEditAnnType(ann.type);
                                  setEditAnnAudience(ann.targetAudience);
                                  setShowEditAnnModal(true);
                                }}>
                                  Edit
                                </button>
                                <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }} onClick={() => handleDeleteAnnouncement(ann._id)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Request Update Modal */}
      {activeRequest && (() => {
        const requestUser = users.find(u => u.username === activeRequest.citizenName || u._id === activeRequest.citizenId);
        const requestUserEmail = requestUser ? requestUser.email : 'N/A';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card animated-fade" style={{ width: '550px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Update Service Request</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Citizen Submitter</span>
                  <strong>{activeRequest.citizenName}</strong> {requestUserEmail !== 'N/A' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>{requestUserEmail}</span>}
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Category & Priority</span>
                  <strong>{activeRequest.category}</strong> / <span style={{ color: activeRequest.priority === 'high' ? 'var(--danger)' : 'inherit', fontWeight: activeRequest.priority === 'high' ? 700 : 'normal' }}>{activeRequest.priority}</span>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Request Title</span>
                  <strong style={{ fontSize: '0.9rem' }}>{activeRequest.title}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Detailed Description</span>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{activeRequest.description}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Date Submitted</span>
                  <span>{new Date(activeRequest.submittedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</span>
                  <span className={`badge ${activeRequest.status === 'resolved' ? 'badge-success' : activeRequest.status === 'in-progress' ? 'badge-pending' : 'badge-danger'}`} style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                    {activeRequest.status}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleUpdateRequestStatus}>
                <div className="form-group">
                  <label className="form-label">New Status Classification <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select className="form-input" required value={requestStatus} onChange={(e) => setRequestStatus(e.target.value)}>
                    <option value="">-- Select an Option --</option>
                    <option value="submitted">Submitted (Awaiting Action)</option>
                    <option value="in-progress">In-Progress (Team Dispatched)</option>
                    <option value="resolved">Resolved (Completed)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Timeline Comment / Update Details</label>
                  <textarea className="form-input" style={{ minHeight: '80px' }} required placeholder="e.g. Maintenance crew dispatched to fix pothole." value={requestComment} onChange={(e) => setRequestComment(e.target.value)} />
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveRequest(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingRequestStatus}>
                    {submittingRequestStatus ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Permit Review Modal */}
      {activePermit && (() => {
        const permitUser = users.find(u => u.username === activePermit.citizenName || u._id === activePermit.citizenId);
        const permitUserEmail = permitUser ? permitUser.email : 'N/A';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card animated-fade" style={{ width: '550px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Review Permit Application</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Citizen Submitter</span>
                  <strong>{activePermit.citizenName}</strong> {permitUserEmail !== 'N/A' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>{permitUserEmail}</span>}
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Permit Category / Type</span>
                  <strong>{activePermit.permitType}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Application Title</span>
                  <strong style={{ fontSize: '0.9rem' }}>{activePermit.title}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Description & Specifications</span>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{activePermit.description}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Date Submitted</span>
                  <span>{new Date(activePermit.submittedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</span>
                  <span className={`badge ${activePermit.status === 'approved' ? 'badge-success' : activePermit.status === 'rejected' ? 'badge-danger' : 'badge-pending'}`} style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                    {activePermit.status}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleUpdatePermitStatus}>
                <div className="form-group">
                  <label className="form-label">Decision Outcome <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select className="form-input" required value={permitStatus} onChange={(e) => setPermitStatus(e.target.value)}>
                    <option value="">-- Select an Option --</option>
                    <option value="approved">Approved (Issue License)</option>
                    <option value="rejected">Rejected (Decline Application)</option>
                    <option value="pending">Hold (Pending Updates)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Decision Notes / Comments</label>
                  <textarea className="form-input" style={{ minHeight: '80px' }} required placeholder="State spatial arguments or approval conditions..." value={permitComment} onChange={(e) => setPermitComment(e.target.value)} />
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setActivePermit(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingPermitStatus}>
                    {submittingPermitStatus ? 'Submitting...' : 'Submit Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
      {/* Add User Modal */}
      {showAddUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Add New User Account</h3>
            
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" required placeholder="e.g. Samuel Green" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" required placeholder="e.g. sam@towncouncil.gov" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    className="form-input" 
                    style={{ paddingRight: '2.5rem' }} 
                    required 
                    placeholder="Min 6 characters" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select className="form-input" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="citizen">Citizen (Resident Portal)</option>
                  <option value="admin">Administrator (Staff Portal)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingCreateUser}>
                  {submittingCreateUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Edit User Profile</h3>
            
            <form onSubmit={handleEditUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" required value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password (leave blank to keep current)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showEditPassword ? 'text' : 'password'} 
                    className="form-input" 
                    style={{ paddingRight: '2.5rem' }} 
                    placeholder="••••••••" 
                    value={editPassword} 
                    onChange={(e) => setEditPassword(e.target.value)} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                  >
                    {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select className="form-input" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  <option value="citizen">Citizen (Resident Portal)</option>
                  <option value="admin">Administrator (Staff Portal)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingEditUser}>
                  {submittingEditUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUserDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '650px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                  {selectedUserDetail.user.username}
                </h3>
                <span className={`badge ${selectedUserDetail.user.role === 'admin' ? 'badge-danger' : 'badge-success'}`}>
                  {selectedUserDetail.user.role}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>
                  Joined: {new Date(selectedUserDetail.user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }} onClick={() => setShowUserDetailsModal(false)}>
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                  Contact Information
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Email Address: <strong>{selectedUserDetail.user.email}</strong>
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                  Service Requests History ({selectedUserDetail.requests.length})
                </h4>
                {selectedUserDetail.requests.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No requests filed.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedUserDetail.requests.map(req => (
                      <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{req.title}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.75rem' }}>({req.category})</span>
                        </div>
                        <span className={`badge ${req.status === 'resolved' ? 'badge-success' : req.status === 'in-progress' ? 'badge-pending' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                  Permit Applications History ({selectedUserDetail.permits.length})
                </h4>
                {selectedUserDetail.permits.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No permit applications.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedUserDetail.permits.map(permit => (
                      <div key={permit._id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{permit.title}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.75rem' }}>({permit.permitType})</span>
                        </div>
                        <span className={`badge ${permit.status === 'approved' ? 'badge-success' : permit.status === 'rejected' ? 'badge-danger' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                          {permit.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                  Tax Payments Summary
                </h4>
                {selectedUserDetail.taxes.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No tax bills found.</p>
                ) : (
                  <div style={{ fontSize: '0.85rem' }}>
                    <p style={{ marginBottom: '0.5rem' }}>
                      Billed Amount: <strong>${selectedUserDetail.taxes.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</strong>
                    </p>
                    <p>
                      Paid Amount: <strong style={{ color: 'var(--success)' }}>${selectedUserDetail.taxes.filter(t => t.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Service Request Modal */}
      {showAddRequestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Log Request on Behalf</h3>
            <form onSubmit={handleCreateRequest}>
              <div className="form-group">
                <label className="form-label">Select Citizen</label>
                <select className="form-input" value={newRequestCitizenId} onChange={(e) => setNewRequestCitizenId(e.target.value)}>
                  {users.filter(u => u.role === 'citizen').map(c => (
                    <option key={c._id} value={c._id}>{c.username} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Request Title</label>
                <input type="text" className="form-input" required placeholder="e.g. Broken streetlight on 4th Ave" value={newRequestTitle} onChange={(e) => setNewRequestTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Department Category</label>
                <select className="form-input" value={newRequestCategory} onChange={(e) => setNewRequestCategory(e.target.value)}>
                  <option value="Maintenance">Maintenance & Infrastructure</option>
                  <option value="Sanitation">Sanitation & Waste</option>
                  <option value="Zoning">Zoning & Planning</option>
                  <option value="Other">Other / General Inquiry</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={newRequestPriority} onChange={(e) => setNewRequestPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea className="form-input" style={{ minHeight: '100px' }} required placeholder="Provide details about the issue..." value={newRequestDescription} onChange={(e) => setNewRequestDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddRequestModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingCreateRequest}>
                  {submittingCreateRequest ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Request Modal */}
      {showEditRequestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Edit Service Request</h3>
            <form onSubmit={handleEditRequest}>
              <div className="form-group">
                <label className="form-label">Request Title</label>
                <input type="text" className="form-input" required value={editRequestTitle} onChange={(e) => setEditRequestTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Department Category</label>
                <select className="form-input" value={editRequestCategory} onChange={(e) => setEditRequestCategory(e.target.value)}>
                  <option value="Maintenance">Maintenance & Infrastructure</option>
                  <option value="Sanitation">Sanitation & Waste</option>
                  <option value="Zoning">Zoning & Planning</option>
                  <option value="Other">Other / General Inquiry</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={editRequestPriority} onChange={(e) => setEditRequestPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea className="form-input" style={{ minHeight: '100px' }} required value={editRequestDescription} onChange={(e) => setEditRequestDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditRequestModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingEditRequest}>
                  {submittingEditRequest ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Permit Modal */}
      {showAddPermitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Submit Permit on Behalf</h3>
            <form onSubmit={handleCreatePermit}>
              <div className="form-group">
                <label className="form-label">Select Citizen</label>
                <select className="form-input" value={newPermitCitizenId} onChange={(e) => setNewPermitCitizenId(e.target.value)}>
                  {users.filter(u => u.role === 'citizen').map(c => (
                    <option key={c._id} value={c._id}>{c.username} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Application Title</label>
                <input type="text" className="form-input" required placeholder="e.g. Residential Extension Plan" value={newPermitTitle} onChange={(e) => setNewPermitTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Permit Category</label>
                <select className="form-input" value={newPermitType} onChange={(e) => setNewPermitType(e.target.value)}>
                  <option value="Building Permit">Building Permit</option>
                  <option value="Business License">Business License</option>
                  <option value="Zoning Variance">Zoning Variance</option>
                  <option value="Environmental Permit">Environmental Permit</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description / Specifications</label>
                <textarea className="form-input" style={{ minHeight: '100px' }} required placeholder="Outline architectural or business specifications..." value={newPermitDescription} onChange={(e) => setNewPermitDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddPermitModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingCreatePermit}>
                  {submittingCreatePermit ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permit Modal */}
      {showEditPermitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Edit Permit Application</h3>
            <form onSubmit={handleEditPermit}>
              <div className="form-group">
                <label className="form-label">Application Title</label>
                <input type="text" className="form-input" required value={editPermitTitle} onChange={(e) => setEditPermitTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Permit Category</label>
                <select className="form-input" value={editPermitType} onChange={(e) => setEditPermitType(e.target.value)}>
                  <option value="Building Permit">Building Permit</option>
                  <option value="Business License">Business License</option>
                  <option value="Zoning Variance">Zoning Variance</option>
                  <option value="Environmental Permit">Environmental Permit</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select className="form-input" required value={editPermitStatus} onChange={(e) => setEditPermitStatus(e.target.value)}>
                  <option value="">-- Select an Option --</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Internal Comments / Notes</label>
                <textarea className="form-input" style={{ minHeight: '80px' }} value={editPermitComments} onChange={(e) => setEditPermitComments(e.target.value)} placeholder="Zoning feedback or requirements..." />
              </div>
              <div className="form-group">
                <label className="form-label">Description / Specifications</label>
                <textarea className="form-input" style={{ minHeight: '100px' }} required value={editPermitDescription} onChange={(e) => setEditPermitDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditPermitModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingEditPermit}>
                  {submittingEditPermit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Log Booking on Behalf</h3>
            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label className="form-label">Select Citizen</label>
                <select className="form-input" value={newBookingCitizenId} onChange={(e) => setNewBookingCitizenId(e.target.value)}>
                  {users.filter(u => u.role === 'citizen').map(c => (
                    <option key={c._id} value={c._id}>{c.username} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Event / Purpose</label>
                <input type="text" className="form-input" required placeholder="e.g. Wedding Reception" value={newBookingTitle} onChange={(e) => setNewBookingTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Venue Location</label>
                <select className="form-input" value={newBookingVenue} onChange={(e) => setNewBookingVenue(e.target.value)}>
                  <option value="Town Hall Center">Town Hall Center</option>
                  <option value="Community Park Pavilion">Community Park Pavilion</option>
                  <option value="Civic Center Auditorium">Civic Center Auditorium</option>
                  <option value="Sports Complex Gym">Sports Complex Gym</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reservation Date</label>
                <input type="date" className="form-input" required value={newBookingDate} onChange={(e) => setNewBookingDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Time Slot</label>
                <select className="form-input" value={newBookingTimeSlot} onChange={(e) => setNewBookingTimeSlot(e.target.value)}>
                  <option value="09:00 - 12:00">Morning (09:00 - 12:00)</option>
                  <option value="13:00 - 17:00">Afternoon (13:00 - 17:00)</option>
                  <option value="18:00 - 22:00">Evening (18:00 - 22:00)</option>
                  <option value="09:00 - 22:00">Full Day (09:00 - 22:00)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tickets Count / Expected Attendees</label>
                <input type="number" className="form-input" required min="1" max="500" value={newBookingTickets} onChange={(e) => setNewBookingTickets(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Detailed Notes</label>
                <textarea className="form-input" style={{ minHeight: '80px' }} value={newBookingDescription} onChange={(e) => setNewBookingDescription(e.target.value)} placeholder="A/V setup or specific equipment needed..." />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddBookingModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingCreateBooking}>
                  {submittingCreateBooking ? 'Logging...' : 'Log Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditBookingModal && (() => {
        const bookingObj = bookings.find(x => x._id === editBookingId);
        const bookingUser = bookingObj ? users.find(u => u.username === bookingObj.citizenName || u._id === bookingObj.citizenId) : null;
        const bookingUserEmail = bookingUser ? bookingUser.email : 'N/A';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card animated-fade" style={{ width: '550px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Edit Event Booking</h3>
              
              {bookingObj && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Citizen Submitter</span>
                    <strong>{bookingObj.citizenName}</strong> {bookingUserEmail !== 'N/A' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>{bookingUserEmail}</span>}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</span>
                    <span className={`badge ${bookingObj.status === 'approved' ? 'badge-success' : bookingObj.status === 'cancelled' ? 'badge-danger' : 'badge-pending'}`} style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                      {bookingObj.status}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleEditBooking}>
                <div className="form-group">
                  <label className="form-label">Event / Purpose</label>
                  <input type="text" className="form-input" required value={editBookingTitle} onChange={(e) => setEditBookingTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Venue Location</label>
                  <select className="form-input" value={editBookingVenue} onChange={(e) => setEditBookingVenue(e.target.value)}>
                    <option value="Town Hall Center">Town Hall Center</option>
                    <option value="Community Park Pavilion">Community Park Pavilion</option>
                    <option value="Civic Center Auditorium">Civic Center Auditorium</option>
                    <option value="Sports Complex Gym">Sports Complex Gym</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reservation Date</label>
                  <input type="date" className="form-input" required value={editBookingDate} onChange={(e) => setEditBookingDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <select className="form-input" value={editBookingTimeSlot} onChange={(e) => setEditBookingTimeSlot(e.target.value)}>
                    <option value="09:00 - 12:00">Morning (09:00 - 12:00)</option>
                    <option value="13:00 - 17:00">Afternoon (13:00 - 17:00)</option>
                    <option value="18:00 - 22:00">Evening (18:00 - 22:00)</option>
                    <option value="09:00 - 22:00">Full Day (09:00 - 22:00)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tickets Count / Expected Attendees</label>
                  <input type="number" className="form-input" required min="1" max="500" value={editBookingTickets} onChange={(e) => setEditBookingTickets(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Booking Status <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select className="form-input" required value={editBookingStatus} onChange={(e) => setEditBookingStatus(e.target.value)}>
                    <option value="">-- Select an Option --</option>
                    <option value="pending">Pending approval</option>
                    <option value="approved">Approved</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Notes</label>
                  <textarea className="form-input" style={{ minHeight: '80px' }} value={editBookingDescription} onChange={(e) => setEditBookingDescription(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditBookingModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingEditBooking}>
                    {submittingEditBooking ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Add Tax Modal */}
      {showAddTaxModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Create Tax Bill</h3>
            <form onSubmit={handleCreateTax}>
              <div className="form-group">
                <label className="form-label">Select Citizen</label>
                <select className="form-input" value={newTaxCitizenId} onChange={(e) => setNewTaxCitizenId(e.target.value)}>
                  {users.filter(u => u.role === 'citizen').map(c => (
                    <option key={c._id} value={c._id}>{c.username} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tax / Levy Category</label>
                <select className="form-input" value={newTaxType} onChange={(e) => setNewTaxType(e.target.value)}>
                  <option value="Property Tax">Property Tax</option>
                  <option value="Waste Levy">Waste Levy</option>
                  <option value="Business Rate">Business Rate</option>
                  <option value="Utilities Bill">Utilities Bill</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Billing Amount ($)</label>
                <input type="number" className="form-input" required min="1" step="0.01" placeholder="e.g. 250.00" value={newTaxAmount} onChange={(e) => setNewTaxAmount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Status <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select className="form-input" required value={newTaxStatus} onChange={(e) => setNewTaxStatus(e.target.value)}>
                  <option value="">-- Select an Option --</option>
                  <option value="pending">Pending Payment</option>
                  <option value="paid">Pre-paid / Paid</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Billing Date (defaults to today)</label>
                <input type="date" className="form-input" value={newTaxBillingDate} onChange={(e) => setNewTaxBillingDate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddTaxModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingCreateTax}>
                  {submittingCreateTax ? 'Issuing...' : 'Issue Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tax Modal */}
      {showEditTaxModal && (() => {
        const taxObj = taxes.find(x => x._id === editTaxId);
        const taxUser = taxObj ? users.find(u => u.username === taxObj.citizenName || u._id === taxObj.citizenId) : null;
        const taxUserEmail = taxUser ? taxUser.email : 'N/A';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="card animated-fade" style={{ width: '550px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Edit Tax Record</h3>
              
              {taxObj && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Citizen Submitter</span>
                    <strong>{taxObj.citizenName}</strong> {taxUserEmail !== 'N/A' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>{taxUserEmail}</span>}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</span>
                    <span className={`badge ${taxObj.status === 'paid' ? 'badge-success' : 'badge-pending'}`} style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                      {taxObj.status}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleEditTax}>
                <div className="form-group">
                  <label className="form-label">Tax / Levy Category</label>
                  <select className="form-input" value={editTaxType} onChange={(e) => setEditTaxType(e.target.value)}>
                    <option value="Property Tax">Property Tax</option>
                    <option value="Waste Levy">Waste Levy</option>
                    <option value="Business Rate">Business Rate</option>
                    <option value="Utilities Bill">Utilities Bill</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Amount ($)</label>
                  <input type="number" className="form-input" required min="1" step="0.01" value={editTaxAmount} onChange={(e) => setEditTaxAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Status <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select className="form-input" required value={editTaxStatus} onChange={(e) => setEditTaxStatus(e.target.value)}>
                    <option value="">-- Select an Option --</option>
                    <option value="pending">Pending Payment</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Date</label>
                  <input type="date" className="form-input" required value={editTaxBillingDate} onChange={(e) => setEditTaxBillingDate(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditTaxModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingEditTax}>
                    {submittingEditTax ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Edit Announcement Modal */}
      {showEditAnnModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Edit Announcement Notice</h3>
            <form onSubmit={handleEditAnnouncement}>
              <div className="form-group">
                <label className="form-label">Alert Header / Title</label>
                <input type="text" className="form-input" required value={editAnnTitle} onChange={(e) => setEditAnnTitle(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Classification Type</label>
                  <select className="form-input" value={editAnnType} onChange={(e) => setEditAnnType(e.target.value)}>
                    <option value="general">General Advisory</option>
                    <option value="event">Council Meeting / Event</option>
                    <option value="urgent">Urgent Notice (Emergency)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target View Audience</label>
                  <select className="form-input" value={editAnnAudience} onChange={(e) => setEditAnnAudience(e.target.value)}>
                    <option value="all">Publish to All Users</option>
                    <option value="citizens">Citizens Only</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Announcement Content Text</label>
                <textarea className="form-input" style={{ minHeight: '120px' }} required value={editAnnContent} onChange={(e) => setEditAnnContent(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Update Announcement Image (or keep current)</label>
                <input 
                  type="file" 
                  id="edit-announce-image-input" 
                  accept="image/*" 
                  className="form-input" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditAnnImage(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
                {editAnnImage ? (
                  <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                    <img src={editAnnImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: 'var(--radius-sm)' }} />
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      style={{ position: 'absolute', top: '5px', right: '5px', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} 
                      onClick={() => {
                        setEditAnnImage('');
                        document.getElementById('edit-announce-image-input').value = '';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (() => {
                  const currentAnn = announcements.find(x => x._id === editAnnId);
                  if (currentAnn && currentAnn.imageUrl) {
                    return (
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Current Image:</span>
                        <img src={currentAnn.imageUrl.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${currentAnn.imageUrl}` : currentAnn.imageUrl} alt="Current" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: 'var(--radius-sm)' }} />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditAnnModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingEditAnn}>
                  {submittingEditAnn ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
