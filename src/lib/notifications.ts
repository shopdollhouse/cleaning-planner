/**
 * Browser notifications system for task reminders
 */

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private hasPermission: boolean = false;

  private constructor() {
    if ('Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (this.hasPermission) return true;

    const permission = await Notification.requestPermission();
    this.hasPermission = permission === 'granted';
    return this.hasPermission;
  }

  /**
   * Send a notification
   */
  async notify(options: NotificationOptions): Promise<Notification | null> {
    if (!this.hasPermission) {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge,
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
      });

      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }

  /**
   * Schedule a notification for a specific time
   */
  scheduleNotification(
    options: NotificationOptions,
    time: Date
  ): () => void {
    const now = new Date();
    const delay = time.getTime() - now.getTime();

    if (delay <= 0) {
      this.notify(options);
      return () => {};
    }

    const timeoutId = setTimeout(() => {
      this.notify(options);
    }, delay);

    // Return cancel function
    return () => clearTimeout(timeoutId);
  }

  /**
   * Send a task reminder notification
   */
  async sendTaskReminder(
    taskName: string,
    period: string,
    timePeriod: number = 5
  ): Promise<Notification | null> {
    return this.notify({
      title: 'Time to clean! 🧹',
      body: `Your ${period} task "${taskName}" is waiting. Starting in ${timePeriod} min?`,
      tag: 'task-reminder',
      requireInteraction: true,
    });
  }

  /**
   * Send a streak notification
   */
  async sendStreakNotification(streak: number): Promise<Notification | null> {
    return this.notify({
      title: '🔥 Streak Alive!',
      body: `You're on a ${streak}-day cleaning streak! Keep it going!`,
      tag: 'streak-notification',
    });
  }

  /**
   * Send a completion notification
   */
  async sendCompletionNotification(taskName: string): Promise<Notification | null> {
    return this.notify({
      title: '✨ Task Complete',
      body: `"${taskName}" — Heroic deed recorded!`,
      tag: 'completion-notification',
    });
  }
}

export function getNotificationManager(): NotificationManager {
  return NotificationManager.getInstance();
}
