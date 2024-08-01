import React from 'react';

const LazySuccess = React.lazy(() =>
    import(/* webpackChunkName: "success" */ './success')
);

const RoomSubscriptionSuccess = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Please Wait... ! Don't Refresh the page.</h1>}>
        <LazySuccess {...props} />
    </React.Suspense>
);

export default RoomSubscriptionSuccess