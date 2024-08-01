import React from 'react';
import {
    GoogleMap,
    withScriptjs,
    withGoogleMap,
    Marker,
    InfoWindow,
    Circle
} from 'react-google-maps';
import { compose, withProps } from "recompose";
import { getBooleanStatus, GOOGLE_MAP_API_KEY } from 'src/_config';

const MapComponent: any = compose(
    withProps({
        googleMapURL:
            `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&libraries=places,geometry`,
        loadingElement: <div style={{ height: "100%" }} />,
        containerElement: <div style={{ height: "100%" }} />,
        mapElement: <div style={{ height: "100%" }} />
    }),
    withScriptjs,
    withGoogleMap
)((props: any) => {
    var myStyles = [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
    ]
    const defaultMapOptions = {
        streetViewControl: false,
        styles: myStyles
    }
    // console.log(14 + (Math.log(2000 / props.range) / Math.log(2)))
    return (
        <GoogleMap
            defaultZoom={3}
            defaultCenter={{ lat: props.currentLat, lng: props.currentLng }}
            defaultOptions={defaultMapOptions}
        >
            <Circle
                center={{ lat: props.currentLat, lng: props.currentLng }}
                radius={props.range * 1609.34}
            />
            <Marker
                position={{ lat: props.currentLat, lng: props.currentLng }}
                icon={{
                    url: props.userDetails && props.userDetails.avatar && props.userDetails.avatar.thumb ? props.userDetails.avatar.thumb : "/images/map-pin.png",
                    scaledSize: { width: 35, height: 35 }
                }}
            />
            {
                props.usersList && props.usersList.length ? props.usersList.map((user: any) =>
                    <>
                        <Marker
                            key={user.id}
                            position={{ lat: parseFloat(user.curr_loc_lat), lng: parseFloat(user.curr_loc_lon) }}
                            icon={{
                                // url: user.avatar && user.avatar.thumb ? user.avatar.thumb : "/images/map-pin.png",
                                url: user && user.avatar && getBooleanStatus(user.avatar && user.avatar.visible_avatar ? user.avatar.visible_avatar : 0) && user.avatar.thumb ? user.avatar.thumb : "/images/map-pin.png",
                                scaledSize: { width: 35, height: 35 }
                            }}
                            onClick={() => { props.changeShowInfo(true); props.changeCurrentUser(user) }}
                        />
                    </>
                ) : null
            }
            {
                props.showInfo
                && <InfoWindow
                    position={{ lat: parseFloat(props.currentUser?.curr_loc_lat), lng: parseFloat(props.currentUser?.curr_loc_lon) }}
                    onCloseClick={() => props.changeShowInfo(false)}
                >
                    <>
                        <div style={{ cursor: "pointer" }} onClick={() => props.handleViewProfile(props.currentUser)}>View Profile</div>
                        <div style={{ cursor: "pointer" }} onClick={() => props.handleAddToContactList(props.currentUser)}>Add To Contact List</div>
                    </>
                </InfoWindow>}
        </GoogleMap>
    )
});

export default MapComponent;