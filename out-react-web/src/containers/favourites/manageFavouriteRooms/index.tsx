import React from 'react';

const LazyManageFavouriteRooms = React.lazy(() =>
  import(/* webpackChunkName: "ManageFavouriteRooms" */ './manageFavouriteRooms')
);

const ManageFavouriteRooms= (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyManageFavouriteRooms {...props} />
  </React.Suspense>
);

export default ManageFavouriteRooms