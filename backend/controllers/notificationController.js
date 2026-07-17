import { Notification } from '../models/dbFactory.js';

const sortNewestFirst = (items) => {
  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const isVisibleToUser = (notification, user) => {
  if (notification.recipientRole !== user.role) return false;
  if (!notification.recipientId) return true;
  return notification.recipientId.toString() === user.id.toString();
};

export const createNotification = async ({
  recipientRole,
  recipientId,
  actorRole = 'system',
  actorId,
  actorName,
  title,
  message,
  category = 'general',
  linkTarget = ''
}) => {
  if (!recipientRole || !title || !message) return null;

  return Notification.create({
    recipientRole,
    recipientId,
    actorRole,
    actorId,
    actorName,
    title,
    message,
    category,
    linkTarget,
    readBy: [],
    createdAt: new Date()
  });
};

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({});
    const visible = sortNewestFirst(
      notifications
        .map((notification) => (notification.toObject ? notification.toObject() : notification))
        .filter((notification) => isVisibleToUser(notification, req.user))
        .map((notification) => ({
          ...notification,
          isRead: Array.isArray(notification.readBy) && notification.readBy.includes(req.user.id.toString())
        }))
    );

    res.status(200).json({
      status: 'success',
      data: visible
    });
  } catch (err) {
    console.error('Fetch Notifications Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching notifications' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || !isVisibleToUser(notification, req.user)) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' });
    }

    const readBy = Array.isArray(notification.readBy) ? notification.readBy : [];
    if (!readBy.includes(req.user.id.toString())) {
      readBy.push(req.user.id.toString());
    }

    const updated = await Notification.findByIdAndUpdate(req.params.id, { readBy }, { new: true });
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    console.error('Mark Notification Read Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating notification' });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const notifications = await Notification.find({});
    const visible = notifications.filter((notification) => isVisibleToUser(notification, req.user));

    await Promise.all(visible.map((notification) => {
      const readBy = Array.isArray(notification.readBy) ? notification.readBy : [];
      if (!readBy.includes(req.user.id.toString())) {
        readBy.push(req.user.id.toString());
      }
      return Notification.findByIdAndUpdate(notification._id, { readBy }, { new: true });
    }));

    res.status(200).json({ status: 'success', message: 'Notifications marked as read' });
  } catch (err) {
    console.error('Mark All Notifications Read Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating notifications' });
  }
};
