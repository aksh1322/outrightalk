import React from 'react';

const LazyMyRoom = React.lazy(() =>
  import(/* webpackChunkName: "MyRoom" */ './myRoom')
);

const MyRoom= (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyMyRoom {...props} />
  </React.Suspense>
);

export default MyRoom