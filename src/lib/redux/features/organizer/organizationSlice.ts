import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { IInitialState } from "./organizationTypes";

const initialState: IInitialState = {
  id: "",
  roleId: "",
  roleName: "",
  organizationName: "",
  organizationId: null,
  isInitialized: false,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setOrganization: (state, action) => {
      state.id = action.payload.id;
      state.roleId = action.payload.roleId;
      state.roleName = action.payload.roleName;
      state.organizationId = action.payload.organizationId;
      state.organizationName = action.payload.organizationName;
      state.isInitialized = true;
    },
    markAsInitialized: (state) => {
      state.isInitialized = true;
    },
    clearOrganization: (state) => {
      state.id = "";
      state.roleName = "";
      state.roleId = "";
      state.organizationName = "";
      state.organizationId = null;
      state.isInitialized = true;
      Cookies.remove("organizationData");
    },
  },
});

export const { setOrganization, clearOrganization, markAsInitialized } =
  organizationSlice.actions;
export default organizationSlice.reducer;
