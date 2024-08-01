import React from 'react';

const LazyLogin = React.lazy(() =>
  import(/* webpackChunkName: "Login" */ './login')
);

const Login = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyLogin {...props} />
  </React.Suspense>
);

export default Login