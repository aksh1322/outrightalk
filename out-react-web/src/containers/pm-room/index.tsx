import React from 'react';

const LazyPmRoom = React.lazy(() =>
  import(/* webpackChunkName: "pmRoom" */ './pmRoom')
);

const PmRoom = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyPmRoom {...props} />
  </React.Suspense>
);

export default PmRoom