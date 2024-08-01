import React from 'react';

const LazyRegistration = React.lazy(() =>
  import(/* webpackChunkName: "Login" */ './registration')
);

const Registration = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyRegistration {...props} />
  </React.Suspense>
);

export default Registration