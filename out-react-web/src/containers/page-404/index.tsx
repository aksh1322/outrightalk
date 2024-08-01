import React from 'react';

const LazyPage404 = React.lazy(() =>
  import(/* webpackChunkName: "Page404" */ './page404')
);

const Page404 = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyPage404 {...props} />
  </React.Suspense>
);

export default Page404