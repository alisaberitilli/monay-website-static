import * as admin from 'firebase-admin';
import config from '../config';

const projectId = config.google.project_id;
admin.initializeApp({
    credential: admin.credential.cert(config.google.service_account_key),
    databaseURL: `https://${projectId}.firebaseio.com`,
});
export default {
    /**
     * Send notification to android
     * @param {object} data
     * @param {string} firebaseToken
     */
    async sendToAndroidUser(firebaseToken, requestData, unreadCount) {
        const options = {
            priority: 'high',
            timeToLive: 60 * 60 * 24
        };
        requestData = Object.assign({}, requestData, { badge: unreadCount.toString() });
        let defaultSound = 'default';

        const payload = {
            data: {
                sound: defaultSound,
                message: JSON.stringify(requestData)
            },
        };
        const result = admin.messaging().sendToDevice(firebaseToken, payload, options).then(notifyResponse => {
            // console.log(notifyResponse)
        }).catch(error => {
            // console.log(error)
        });
        return result;
    },
    /**
     * Send notification to android
     * @param {object} data
     * @param {string} firebaseToken
     */
    async sendToIosUser(firebaseToken, requestData, unreadCount) {
        const options = {
            priority: 'high',
            timeToLive: 60 * 60 * 24
        };
        requestData = Object.assign({}, requestData, { badge: unreadCount.toString() });
        let defaultSound = 'default';
        const payload = {
            notification: {
                title: ('title' in requestData) ? requestData.title.toString() : 'Monay',
                body: ('message' in requestData) ? requestData.message.toString() : '',
                badge: unreadCount.toString(),
                sound: defaultSound
            },
            data: {
                message: JSON.stringify(requestData)
            },
        };
        const result = admin.messaging().sendToDevice(firebaseToken, payload, options).then(notifyResponse => {
            // console.log(notifyResponse)
        }).catch(error => {
            // console.log(error)
        });
        return result;
    },
};