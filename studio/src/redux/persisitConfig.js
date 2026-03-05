import localforage from "localforage";
const persistConfig = {
  key: "root",
  storage: localforage,
};

export default persistConfig;
