
import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationManager {
    static async requestPermissions() {
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
    }

    static async scheduleHappyHourAlert(businessName: string, discount: number) {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: 'Happy Hour Alert! 🍻',
                    body: `You are near ${businessName}! They have a ${discount}% discount right now.`,
                    id: Math.floor(Math.random() * 10000),
                    schedule: { at: new Date(Date.now() + 1000) }, // Nearly immediate for demo
                    sound: 'default',
                    attachments: [],
                    actionTypeId: '',
                    extra: null
                }
            ]
        });
    }

    static async scheduleEventReminder(eventTitle: string, startTime: string) {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: 'Upcoming Event! 🎭',
                    body: `Don't miss "${eventTitle}" starting at ${startTime} today!`,
                    id: Math.floor(Math.random() * 10000),
                    schedule: { at: new Date(Date.now() + 5000) }, // 5 seconds for demo
                    sound: 'default'
                }
            ]
        });
    }
}
