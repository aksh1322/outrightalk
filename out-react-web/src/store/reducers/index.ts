import { combineReducers } from 'redux';
import loaderReducer from './common/loaderReducer'
import userReducer from './user/userReducer'
import registrationReducer from './registration/registrationReducer'
import groupCategoryReducer from './groupCategory/groupCategoryReducer';
import videoMessageReducer from './videoMessage/videoMessageReducer';
import NotebookReducer from './notebook/notebookReducer';
import userPreferencesReducer from './userPreference/userPreferenceReducer';
import favouritesReducer from './favourites/favouritesReducer';
import NotificationReducer from './notification/notificationReducer';
import PmWindowReducer from './pmWindow/pmWindowReducer';
import amountReducer from './common/amountReducer';



const rootReducer = combineReducers({
  loader: loaderReducer,
  amount: amountReducer,
  user: userReducer,
  registration: registrationReducer,
  groupCategory: groupCategoryReducer,
  videoMessage: videoMessageReducer,
  notebook: NotebookReducer,
  userPreferences: userPreferencesReducer,
  favourites: favouritesReducer,
  notification: NotificationReducer,
  pmWindow: PmWindowReducer,
})

export default rootReducer