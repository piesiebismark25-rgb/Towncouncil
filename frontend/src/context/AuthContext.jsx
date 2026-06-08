import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

// ==========================================
// Frontend Persistence Mock Fallback Layer
// ==========================================

const initialAnnouncements = [
  {
    _id: 'ann-1',
    title: 'Town Hall Meeting on City Budget',
    content: 'Join the annual town hall meeting to discuss budget allocations for the 2026 fiscal year. Your input matters!',
    type: 'event',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: 'all'
  },
  {
    _id: 'ann-2',
    title: 'Road Maintenance Schedule',
    content: 'Main Street road resurfacing will start next Monday. Expect temporary delays and alternate route detours.',
    type: 'general',
    date: new Date().toISOString(),
    targetAudience: 'all'
  },
  {
    _id: 'ann-3',
    title: 'Urgent: Water Pipe Repair',
    content: 'Emergency water maintenance on Maple Avenue. Services will be offline from 2 PM to 5 PM today.',
    type: 'urgent',
    date: new Date().toISOString(),
    targetAudience: 'all'
  }
];

const initialUsers = [
  {
    _id: 'user-admin',
    username: 'System Admin',
    email: 'admin@towncouncil.gov',
    password: 'password123',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'user-citizen',
    username: 'John Doe',
    email: 'citizen@gmail.com',
    password: 'password123',
    role: 'citizen',
    createdAt: new Date().toISOString()
  }
];

const initialTaxes = [
  {
    _id: 'tax-1',
    citizenId: 'user-citizen',
    citizenName: 'John Doe',
    amount: 350.00,
    taxType: 'Property Tax (Q1 2026)',
    status: 'pending',
    billingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'tax-2',
    citizenId: 'user-citizen',
    citizenName: 'John Doe',
    amount: 45.00,
    taxType: 'Waste Disposal Fee',
    status: 'paid',
    billingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    paymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    receiptNumber: 'REC-2026-9871A'
  }
];

const initialRequests = [
  {
    _id: 'req-1',
    citizenId: 'user-citizen',
    citizenName: 'John Doe',
    title: 'Street Light Out on Elm St',
    description: 'The street light outside house #42 has been completely out for the last 3 days. It is dark and unsafe at night.',
    category: 'Lighting',
    priority: 'medium',
    status: 'in-progress',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updates: [
      {
        status: 'submitted',
        comment: 'Request registered successfully.',
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'in-progress',
        comment: 'Maintenance crew scheduled to inspect on Friday.',
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

const initialPermits = [
  {
    _id: 'permit-1',
    citizenId: 'user-citizen',
    citizenName: 'John Doe',
    title: 'Residential Rooftop Solar Installation',
    description: 'Installation of 12 rooftop solar panels on the main residential dwelling.',
    permitType: 'Building',
    status: 'approved',
    submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    comments: 'Zoning clearance approved. Build must comply with standard roof load regulations.'
  },
  {
    _id: 'permit-2',
    citizenId: 'user-citizen',
    citizenName: 'John Doe',
    title: 'Driveway Widening Access',
    description: 'Requesting permission to widen the existing curb cut by 1.5 meters to allow dual driveway access.',
    permitType: 'Other',
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialBookings = [
  {
    _id: 'booking-1',
    citizenId: 'user-citizen',
    citizenName: 'John Doe',
    title: 'Family Reunion Gathering',
    description: 'Private family banquet booking.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timeSlot: '14:00 - 18:00',
    venue: 'Community Assembly Hall',
    ticketsCount: 1,
    status: 'approved',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initMockDB = () => {
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem('mock_taxes')) {
    localStorage.setItem('mock_taxes', JSON.stringify(initialTaxes));
  }
  if (!localStorage.getItem('mock_announcements')) {
    localStorage.setItem('mock_announcements', JSON.stringify(initialAnnouncements));
  }
  if (!localStorage.getItem('mock_permits')) {
    localStorage.setItem('mock_permits', JSON.stringify(initialPermits));
  }
  if (!localStorage.getItem('mock_requests')) {
    localStorage.setItem('mock_requests', JSON.stringify(initialRequests));
  }
  if (!localStorage.getItem('mock_bookings')) {
    localStorage.setItem('mock_bookings', JSON.stringify(initialBookings));
  }
};

const handleMockRequest = (url, options = {}) => {
  initMockDB();
  const method = (options.method || 'GET').toUpperCase();
  
  // Parse headers safely
  let headers = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else {
      headers = options.headers;
    }
  }
  
  let body = {};
  if (options.body) {
    try {
      body = JSON.parse(options.body);
    } catch (e) {}
  }

  // Get current user from token in headers
  const authHeader = headers['Authorization'] || headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '') || localStorage.getItem('token') || '';
  const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
  const currentUser = mockUsers.find(u => u._id === token || u.email === token) || null;

  // Resolve url path
  let pathString = url;
  if (url.startsWith('http')) {
    try {
      pathString = new URL(url).pathname;
    } catch (e) {}
  }

  let responseData = { status: 'error', message: 'Route not found' };
  let statusCode = 404;

  // 1. Auth routes
  if (pathString.endsWith('/auth/login') && method === 'POST') {
    const userFound = mockUsers.find(u => u.email === body.email && u.password === body.password);
    if (userFound) {
      responseData = {
        status: 'success',
        data: {
          id: userFound._id,
          _id: userFound._id,
          username: userFound.username,
          email: userFound.email,
          role: userFound.role,
          token: userFound._id
        }
      };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Invalid credentials. Use password123.' };
      statusCode = 401;
    }
  } 
  else if (pathString.endsWith('/auth/register') && method === 'POST') {
    const emailExists = mockUsers.some(u => u.email === body.email);
    if (emailExists) {
      responseData = { status: 'error', message: 'Email already registered' };
      statusCode = 400;
    } else {
      const newUser = {
        _id: 'user-' + Math.random().toString(36).substr(2, 9),
        username: body.username,
        email: body.email,
        password: body.password || 'password123',
        role: body.role || 'citizen',
        createdAt: new Date().toISOString()
      };
      mockUsers.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      responseData = {
        status: 'success',
        data: {
          id: newUser._id,
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          token: newUser._id
        }
      };
      statusCode = 200;
    }
  } 
  else if (pathString.endsWith('/auth/me') && method === 'GET') {
    if (currentUser) {
      responseData = {
        status: 'success',
        data: {
          id: currentUser._id,
          _id: currentUser._id,
          username: currentUser.username,
          email: currentUser.email,
          role: currentUser.role
        }
      };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  // 2. Services routes (Citizen)
  else if (pathString.endsWith('/services/taxes') && method === 'GET') {
    if (currentUser) {
      const mockTaxes = JSON.parse(localStorage.getItem('mock_taxes') || '[]');
      const userTaxes = mockTaxes.filter(t => t.citizenId === currentUser._id);
      responseData = { status: 'success', data: userTaxes };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.match(/\/services\/taxes\/([^\/]+)\/pay$/) && method === 'POST') {
    const match = pathString.match(/\/services\/taxes\/([^\/]+)\/pay$/);
    const taxId = match[1];
    const mockTaxes = JSON.parse(localStorage.getItem('mock_taxes') || '[]');
    const taxIndex = mockTaxes.findIndex(t => t._id === taxId);
    if (taxIndex !== -1) {
      mockTaxes[taxIndex].status = 'paid';
      mockTaxes[taxIndex].paymentDate = new Date().toISOString();
      mockTaxes[taxIndex].receiptNumber = 'REC-2026-' + Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem('mock_taxes', JSON.stringify(mockTaxes));
      responseData = { status: 'success', message: 'Payment processed successfully', data: mockTaxes[taxIndex] };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Tax bill not found' };
      statusCode = 404;
    }
  }
  else if (pathString.endsWith('/services/permits') && method === 'GET') {
    if (currentUser) {
      const mockPermits = JSON.parse(localStorage.getItem('mock_permits') || '[]');
      const userPermits = mockPermits.filter(p => p.citizenId === currentUser._id);
      responseData = { status: 'success', data: userPermits };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/services/permits') && method === 'POST') {
    if (currentUser) {
      const mockPermits = JSON.parse(localStorage.getItem('mock_permits') || '[]');
      const newPermit = {
        _id: 'permit-' + Math.random().toString(36).substr(2, 9),
        citizenId: currentUser._id,
        citizenName: currentUser.username,
        title: body.title,
        description: body.description,
        permitType: body.permitType,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      mockPermits.push(newPermit);
      localStorage.setItem('mock_permits', JSON.stringify(mockPermits));
      responseData = { status: 'success', data: newPermit };
      statusCode = 201;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/services/bookings') && method === 'GET') {
    if (currentUser) {
      const mockBookings = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
      const userBookings = mockBookings.filter(b => b.citizenId === currentUser._id);
      responseData = { status: 'success', data: userBookings };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/services/bookings') && method === 'POST') {
    if (currentUser) {
      const mockBookings = JSON.parse(localStorage.getItem('mock_bookings') || '[]');
      const newBooking = {
        _id: 'booking-' + Math.random().toString(36).substr(2, 9),
        citizenId: currentUser._id,
        citizenName: currentUser.username,
        title: body.title,
        description: body.description || '',
        date: body.date,
        timeSlot: body.timeSlot,
        venue: body.venue,
        ticketsCount: body.ticketsCount || 1,
        status: 'approved',
        createdAt: new Date().toISOString()
      };
      mockBookings.push(newBooking);
      localStorage.setItem('mock_bookings', JSON.stringify(mockBookings));
      responseData = { status: 'success', data: newBooking };
      statusCode = 201;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/services/requests') && method === 'GET') {
    if (currentUser) {
      const mockRequests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
      const userRequests = mockRequests.filter(r => r.citizenId === currentUser._id);
      responseData = { status: 'success', data: userRequests };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/services/requests') && method === 'POST') {
    if (currentUser) {
      const mockRequests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
      const newRequest = {
        _id: 'req-' + Math.random().toString(36).substr(2, 9),
        citizenId: currentUser._id,
        citizenName: currentUser.username,
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority || 'medium',
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        updates: [{
          status: 'submitted',
          comment: 'Request registered successfully.',
          updatedAt: new Date().toISOString()
        }]
      };
      mockRequests.push(newRequest);
      localStorage.setItem('mock_requests', JSON.stringify(mockRequests));
      responseData = { status: 'success', data: newRequest };
      statusCode = 201;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/services/announcements') && method === 'GET') {
    const mockAnnouncements = JSON.parse(localStorage.getItem('mock_announcements') || '[]');
    responseData = { status: 'success', data: mockAnnouncements };
    statusCode = 200;
  }
  // 3. Admin routes
  else if (pathString.endsWith('/admin/analytics') && method === 'GET') {
    if (currentUser && currentUser.role === 'admin') {
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const mockTaxes = JSON.parse(localStorage.getItem('mock_taxes') || '[]');
      const mockPermits = JSON.parse(localStorage.getItem('mock_permits') || '[]');
      const mockRequests = JSON.parse(localStorage.getItem('mock_requests') || '[]');

      const billed = mockTaxes.reduce((sum, t) => sum + t.amount, 0);
      const collected = mockTaxes.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
      const pendingTaxes = billed - collected;

      const categories = ['Waste', 'Road', 'Lighting', 'Water', 'Other'];
      const requestsByCategory = categories.map(cat => ({
        name: cat,
        count: mockRequests.filter(r => r.category === cat).length
      }));

      responseData = {
        status: 'success',
        data: {
          summary: {
            citizens: mockUsers.filter(u => u.role === 'citizen').length,
            pendingPermits: mockPermits.filter(p => p.status === 'pending').length,
            serviceRequests: {
              total: mockRequests.length,
              resolved: mockRequests.filter(r => r.status === 'resolved').length
            },
            taxes: {
              billed,
              collected,
              pending: pendingTaxes
            }
          },
          requestsByCategory
        }
      };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/admin/users') && method === 'GET') {
    if (currentUser && currentUser.role === 'admin') {
      responseData = { status: 'success', data: mockUsers };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.match(/\/admin\/users\/([^\/]+)\/role$/) && method === 'POST') {
    const match = pathString.match(/\/admin\/users\/([^\/]+)\/role$/);
    const userId = match[1];
    if (currentUser && currentUser.role === 'admin') {
      const userIdx = mockUsers.findIndex(u => u._id === userId);
      if (userIdx !== -1) {
        mockUsers[userIdx].role = body.role;
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        responseData = { status: 'success', message: 'Role updated successfully' };
        statusCode = 200;
      } else {
        responseData = { status: 'error', message: 'User not found' };
        statusCode = 404;
      }
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/admin/requests') && method === 'GET') {
    if (currentUser && currentUser.role === 'admin') {
      const mockRequests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
      responseData = { status: 'success', data: mockRequests };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.match(/\/admin\/requests\/([^\/]+)\/update$/) && method === 'POST') {
    const match = pathString.match(/\/admin\/requests\/([^\/]+)\/update$/);
    const reqId = match[1];
    if (currentUser && currentUser.role === 'admin') {
      const mockRequests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
      const reqIdx = mockRequests.findIndex(r => r._id === reqId);
      if (reqIdx !== -1) {
        mockRequests[reqIdx].status = body.status;
        if (!mockRequests[reqIdx].updates) mockRequests[reqIdx].updates = [];
        mockRequests[reqIdx].updates.push({
          status: body.status,
          comment: body.comment,
          updatedAt: new Date().toISOString()
        });
        localStorage.setItem('mock_requests', JSON.stringify(mockRequests));
        responseData = { status: 'success', data: mockRequests[reqIdx] };
        statusCode = 200;
      } else {
        responseData = { status: 'error', message: 'Request not found' };
        statusCode = 404;
      }
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/admin/permits') && method === 'GET') {
    if (currentUser && currentUser.role === 'admin') {
      const mockPermits = JSON.parse(localStorage.getItem('mock_permits') || '[]');
      responseData = { status: 'success', data: mockPermits };
      statusCode = 200;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.match(/\/admin\/permits\/([^\/]+)\/status$/) && method === 'POST') {
    const match = pathString.match(/\/admin\/permits\/([^\/]+)\/status$/);
    const permitId = match[1];
    if (currentUser && currentUser.role === 'admin') {
      const mockPermits = JSON.parse(localStorage.getItem('mock_permits') || '[]');
      const permitIdx = mockPermits.findIndex(p => p._id === permitId);
      if (permitIdx !== -1) {
        mockPermits[permitIdx].status = body.status;
        mockPermits[permitIdx].comments = body.comments;
        localStorage.setItem('mock_permits', JSON.stringify(mockPermits));
        responseData = { status: 'success', data: mockPermits[permitIdx] };
        statusCode = 200;
      } else {
        responseData = { status: 'error', message: 'Permit not found' };
        statusCode = 404;
      }
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }
  else if (pathString.endsWith('/admin/announcements') && method === 'POST') {
    if (currentUser && currentUser.role === 'admin') {
      const mockAnnouncements = JSON.parse(localStorage.getItem('mock_announcements') || '[]');
      const newAnnounce = {
        _id: 'ann-' + Math.random().toString(36).substr(2, 9),
        title: body.title,
        content: body.content,
        type: body.type || 'general',
        targetAudience: body.targetAudience || 'all',
        date: new Date().toISOString()
      };
      mockAnnouncements.push(newAnnounce);
      localStorage.setItem('mock_announcements', JSON.stringify(mockAnnouncements));
      responseData = { status: 'success', data: newAnnounce };
      statusCode = 201;
    } else {
      responseData = { status: 'error', message: 'Unauthorized' };
      statusCode = 401;
    }
  }

  // Build standard Response object
  return new Response(JSON.stringify(responseData), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
};

const originalFetch = window.fetch;
window.fetch = async function (url, options) {
  let urlString = url;
  if (url instanceof Request) {
    urlString = url.url;
  }
  if (typeof urlString === 'string' && urlString.includes('http://localhost:5000/api')) {
    try {
      const response = await originalFetch(url, options);
      return response;
    } catch (error) {
      console.warn('API connection failed. Falling back to frontend localStorage simulation.', error);
      return handleMockRequest(urlString, options);
    }
  }
  return originalFetch(url, options);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session on load
  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const resData = await response.json();
        if (response.ok && resData.status === 'success') {
          // Keep token, attach full details
          const userData = resData.data;
          setUser({ ...userData, token });
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Session validation error:', err);
        // Do not remove token on network failure, just hold user as offline
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Login failed');
      }

      const userData = resData.data;
      localStorage.setItem('token', userData.token);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register handler
  const register = async (username, email, password, role = 'citizen') => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, role })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Registration failed');
      }

      const userData = resData.data;
      localStorage.setItem('token', userData.token);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
