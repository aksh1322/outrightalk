import React from 'react';

const LazyResetPassword = React.lazy(() =>
  import(/* webpackChunkName: "ResetPassword" */ './resetpassword')
);

const ResetPassword = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyResetPassword {...props} />
  </React.Suspense>
);

export default ResetPassword