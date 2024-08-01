import React from 'react';

const LazyFindAndJoinRoom = React.lazy(() =>
    import(/* webpackChunkName: "findAndJoinRoom" */ './findAndJoinRoom')
);

const FindAndJoinRoom = (props: Record<string, any>) => (
    <React.Suspense fallback={<h1>Loading...</h1>}>
        <LazyFindAndJoinRoom {...props} />
    </React.Suspense>
);

export default FindAndJoinRoom