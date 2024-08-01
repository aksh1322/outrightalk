import React from 'react';

const LazyNotebook = React.lazy(() =>
  import(/* webpackChunkName: "MyNotebook" */ './myNotebook')
);

const MyNotebook = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyNotebook {...props} />
  </React.Suspense>
);

export default MyNotebook