import React from 'react';

const LazyForgotPassword = React.lazy(() =>
  import(/* webpackChunkName: "ForgotPassword" */ './forgotpassword')
);

const ForgotPassword = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyForgotPassword {...props} />
  </React.Suspense>
);

export default ForgotPassword