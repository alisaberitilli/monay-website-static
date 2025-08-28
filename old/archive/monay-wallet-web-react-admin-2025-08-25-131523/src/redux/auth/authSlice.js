import { createSlice } from '@reduxjs/toolkit'
import { checkUserPermission } from '../../utilities/common'

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
    userData: {}
  },
  reducers: {
    loginAction: (state, action) => {
      return (state = {
        ...state,
        isLoggedIn: true,
        userData: action.payload
      })
    },
    logoutAction: (state) => {
      return (state = {
        ...state,
        isLoggedIn: false,
        userData: {}
      })
    },
    updateUserDataAction: (state, action) => {
      return (state = {
        ...state,
        userData: {
          ...state.userData,
          ...action.payload
        }
      })
    }
  }
})

export const {
  loginAction,
  updateUserDataAction,
  logoutAction
} = authSlice.actions

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn

export const selectUserData = (state) => {
  if (selectIsLoggedIn(state) && Object.keys(state.auth.userData).length) {
    return state.auth.userData
  }
  return {}
}

export const selectUserToken = (state) => {
  if (selectIsLoggedIn(state) && Object.keys(state.auth.userData).length) {
    return state.auth.userData.token
  }
  return false
}
export const getUserPermission = (moduleKey) => (state) => {
  if (selectIsLoggedIn && Object.keys(state.auth.userData).length) {
    let userData = state.auth.userData;
    return checkUserPermission(userData, moduleKey);
  }
}

export default authSlice.reducer
