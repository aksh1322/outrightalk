import React from 'react';

const LazyBuyCreditSuccess = React.lazy(() =>
    import(/* webpackChunkName: "Success" */ './buyCreditSuccess')
);

const BuyCreditSuccess = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Please Wait... ! Don't Refresh the page.</h1>}>
        <LazyBuyCreditSuccess {...props} />
    </React.Suspense>
);

export default BuyCreditSuccess