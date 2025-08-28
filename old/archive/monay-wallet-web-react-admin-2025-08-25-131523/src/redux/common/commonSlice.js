import { createSlice } from '@reduxjs/toolkit'
import { currentTimeStamp } from '../../utilities/common'

export const commonSlice = createSlice({
  name: 'common',
  initialState: {
    notification: {
      list: [],
      count: 0,
      recentlyFetchedAt: '',
      roles: [],
    }
  },
  reducers: {
    addNotificationsAction: (state, action) => {
      return (state = {
        ...state,
        notification: {
          list: action.payload.list,
          count: action.payload.count,
          recentlyFetchedAt: currentTimeStamp()
        }
      })
    },
    updateNotificationsCountAction: (state, action) => {
      return (state = {
        ...state,
        notification: {
          ...state.notification,
          count: action.payload.count
        }
      })
    },
    addUserRolesAction: (state, action) => {
      return (state = {
        ...state,
        userRoles: action.payload
      })
    },
    addRolesAction: (state, action) => {
      return (state = {
        ...state,
        roles: action.payload
      })
    }
  }
})

export const { addNotificationsAction, updateNotificationsCountAction, addRolesAction, addUserRolesAction } = commonSlice.actions

export const selectNotifications = (state) => state.common.notifications
export const selectRoles = (state) => state.common.roles
export const selectUserRoles = (state) => state.common.userRoles
export default commonSlice.reducer
