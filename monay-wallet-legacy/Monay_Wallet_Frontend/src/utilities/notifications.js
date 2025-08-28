import { notification, message } from 'antd'

const modalNotification = ({ type, message, description, duration }) => {
  notification[type]({
    message,
    description,
    duration: duration || 5,
    style: {
      textTransform: 'capitalize'
    }
  })
}

export default modalNotification

export const shortMessage = ({ type, content, duration }) => {
  message[type]({
    content,
    duration: duration || 5,
    style: {
      textTransform: 'capitalize'
    }
  })
}
