import Notification from './base-notification.js';
import userRepository from '../repositories/user-repository.js';
import accountRepository from '../repositories/account-repository.js';

export default {

    async sendTestNotification(device_id, payload) {
        await Notification.sendToIosUser(device_id, payload, 0).then(response => {
            return response;
        }).catch(error => {
            return error;
        });
    },

    async sendToNotificationUser(user_id, payload) {
        const userData = await accountRepository.getUserDeviceToken(user_id);
        let notificationUnreadCount = await userRepository.getUserNotificationCount(user_id);
        notificationUnreadCount += 1;
        if (userData && userData.firebaseToken) {
            if (userData.deviceType.toLowerCase() == 'ios') {
                return await Notification.sendToIosUser(
                    userData.firebaseToken ? userData.firebaseToken : '',
                    payload,
                    notificationUnreadCount,
                );
            } else {
                return await Notification.sendToAndroidUser(
                    userData.firebaseToken ? userData.firebaseToken : '',
                    payload,
                    notificationUnreadCount,
                );
            }

        }
    },
};
