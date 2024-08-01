import React from 'react';

const LazyManageVideoMessage = React.lazy(() =>
  import(/* webpackChunkName: "ManageVideoMessage" */ './manageVideoMessage')
);

const ManageVideoMessage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyManageVideoMessage {...props} />
  </React.Suspense>
);

export default ManageVideoMessage