import React from 'react';

const LazyHome = React.lazy(() =>
  import(/* webpackChunkName: "Home" */ './dashboard')
);

const Home = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyHome {...props} />
  </React.Suspense>
);

export default Home