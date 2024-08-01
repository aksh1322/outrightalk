import React from 'react';

const LazyProfile = React.lazy(() =>
  import(/* webpackChunkName: "MyProfile" */ './myProfile')
);

const MyProfile = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyProfile {...props} />
  </React.Suspense>
);

export default MyProfile