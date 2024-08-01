import React from 'react';

const LazyCms = React.lazy(() =>
  import(/* webpackChunkName: "Cms" */ './cms')
);

const Cms = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCms {...props} />
  </React.Suspense>
);

export default Cms