import { createSlice } from '@reduxjs/toolkit'

export const cmsSlice = createSlice({
  name: 'cms',
  initialState: {
    cmsData: []
  },
  reducers: {
    updateCmsDataAction: (state, action) => {
      return (state = {
        ...state,
        cmsData: action.payload
      })
    },
    singleUpdateCmsDataAction: (state, action) => {
      return {
        ...state,
        cmsData: state.cmsData.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d)
      }
    }
  }
})

export const { updateCmsDataAction, singleUpdateCmsDataAction } = cmsSlice.actions

export default cmsSlice.reducer
