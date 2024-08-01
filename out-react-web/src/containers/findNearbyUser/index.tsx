import React from 'react';

const LazyFindNearByUser = React.lazy(() =>
  import(/* webpackChunkName: "FindNearByUser" */ './findNearByUser')
);

const FindNearByUser= (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyFindNearByUser {...props} />
  </React.Suspense>
);

export default FindNearByUser