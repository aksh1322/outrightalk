import React from 'react';

const LazyRoomsList = React.lazy(() =>
    import(/* webpackChunkName: "RoomsList" */ './roomsList')
);

const RoomsList = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Loading...</h1>}>
        <LazyRoomsList {...props} />
    </React.Suspense>
);

export default RoomsList