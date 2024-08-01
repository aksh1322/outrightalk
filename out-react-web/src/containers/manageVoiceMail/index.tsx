import React from 'react';

const LazyManageVoiceMail = React.lazy(() =>
  import(/* webpackChunkName: "Home" */ './manageVoiceMail')
);

const ManageVoiceMail = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyManageVoiceMail {...props} />
  </React.Suspense>
);

export default ManageVoiceMail