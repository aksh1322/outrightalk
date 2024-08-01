import React from 'react';

const LazyManageChatHistory = React.lazy(() =>
  import(/* webpackChunkName: "ManageChatHistory" */ './manageChatHistory')
);

const ManageChatHistory = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyManageChatHistory {...props} />
  </React.Suspense>
);

export default ManageChatHistory