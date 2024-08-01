import React from 'react';

const LazyForgotPasswordOtp = React.lazy(() =>
  import(/* webpackChunkName: "ForgotPassword" */ './forgotPasswordOtp')
);

const ForgotPasswordOtp = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyForgotPasswordOtp {...props} />
  </React.Suspense>
);

export default ForgotPasswordOtp