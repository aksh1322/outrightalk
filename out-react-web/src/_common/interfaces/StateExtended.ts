import { DefaultRootState } from 'react-redux';
import { UserReducer } from '../../store/reducers/user/userReducer'
import { LoaderReducer } from '../../store/reducers/common/loaderReducer'
import { RegistrationReducer } from '../../store/reducers/registration/registrationReducer'
import { GroupCategoryReducer } from '../../store/reducers/groupCategory/groupCategoryReducer';
import { VideoMessageReducer } from 'src/store/reducers/videoMessage/videoMessageReducer';
import { NotebookReducer } from 'src/store/reducers/notebook/notebookReducer';
import { UserPreferencesReducer } from '../../store/reducers/userPreference/userPreferenceReducer';
import { FavouritesReducer } from 'src/store/reducers/favourites/favouritesReducer';
import { NotificationReducer } from 'src/store/reducers/notification/notificationReducer';
import { PmWindowReducer } from 'src/store/reducers/pmWindow/pmWindowReducer';
import { AmountReducer } from 'src/store/reducers/common/amountReducer';

export interface StateExtended extends DefaultRootState {
  user: UserReducer;
  amount: AmountReducer;
  loader: LoaderReducer;
  registration: RegistrationReducer;
  groupCategory: GroupCategoryReducer;
  videoMessage: VideoMessageReducer;
  notebook: NotebookReducer;
  userPreferences: UserPreferencesReducer;
  favourites: FavouritesReducer;
  notification: NotificationReducer;
  pmWindow: PmWindowReducer;
}