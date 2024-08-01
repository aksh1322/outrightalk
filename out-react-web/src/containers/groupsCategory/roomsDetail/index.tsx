import React from 'react';

const LazyRoomsDetails = React.lazy(() =>
    import(/* webpackChunkName: "RoomsDetail" */ './roomsDetails')
);

const RoomsDetails = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Loading...</h1>}>
        <LazyRoomsDetails {...props} />
    </React.Suspense>
);

export default RoomsDetails