import React, { Component, Fragment, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';


interface ScreenCaptureProps {
    onStartCapture: () => void;
    onEndCapture: () => void;
    children: any;
}

export default function ScreenCapture({ onStartCapture, onEndCapture, children }: ScreenCaptureProps) {

    const [on, setOn] = useState<boolean>(false)
    const [startX, setstartX] = useState<number>(0)
    const [startY, setstartY] = useState<number>(0)
    const [endX, setendX] = useState<number>(0)
    const [endY, setendY] = useState<number>(0)
    const [crossHairsTop, setcrossHairsTop] = useState<number>(0)
    const [crossHairsLeft, setcrossHairsLeft] = useState<number>(0)
    const [isMouseDown, setisMouseDown] = useState<boolean>(false)
    const [windowWidth, setwindowWidth] = useState<number>(0)
    const [windowHeight, setwindowHeight] = useState<number>(0)
    const [borderWidth, setborderWidth] = useState<any>(0)
    const [cropPositionTop, setcropPositionTop] = useState<number>(0)
    const [cropPositionLeft, setcropPositionLeft] = useState<number>(0)
    const [cropWidth, setcropWidth] = useState<number>(0)
    const [cropHeigth, setcropHeigth] = useState<number>(0)
    const [imageURL, setimageURL] = useState<string>('')

    // export default class ScreenCapture extends Component {
    //   static defaultProps = {
    //     onStartCapture: () => null,
    //     onEndCapture: () => null
    //   }

    useEffect(() => {
        handleWindowResize()
        window.addEventListener('resize', handleWindowResize)
    }, [])


    //   componentDidMount = () => {
    //     this.handleWindowResize()
    //     window.addEventListener('resize', this.handleWindowResize)
    //   }

    useEffect(() => {
        return (() => {
            window.removeEventListener('resize', handleWindowResize)
        })
    }, [])

    //   componentWillUnmount = () => {
    //     window.removeEventListener('resize', this.handleWindowResize)
    //   }

    const handleWindowResize = () => {
        const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        setwindowWidth(windowWidth)
        setwindowHeight(windowHeight)
    }

    const handStartCapture = () => {
        setOn(true)
    }

    const handleMouseMove = (e: any) => {
        const { isMouseDown, windowWidth, windowHeight, startX, startY, borderWidth } = this.state

        let cropPositionTop = startY
        let cropPositionLeft = startX
        const endX = e.clientX
        const endY = e.clientY
        const isStartTop = endY >= startY
        const isStartBottom = endY <= startY
        const isStartLeft = endX >= startX
        const isStartRight = endX <= startX
        const isStartTopLeft = isStartTop && isStartLeft
        const isStartTopRight = isStartTop && isStartRight
        const isStartBottomLeft = isStartBottom && isStartLeft
        const isStartBottomRight = isStartBottom && isStartRight
        let newBorderWidth = borderWidth
        let cropWidth = 0
        let cropHeigth = 0

        if (isMouseDown) {
            if (isStartTopLeft) {
                newBorderWidth = `${startY}px ${windowWidth - endX}px ${windowHeight - endY}px ${startX}px`
                cropWidth = endX - startX
                cropHeigth = endY - startY
            }

            if (isStartTopRight) {
                newBorderWidth = `${startY}px ${windowWidth - startX}px ${windowHeight - endY}px ${endX}px`
                cropWidth = startX - endX
                cropHeigth = endY - startY
                cropPositionLeft = endX
            }

            if (isStartBottomLeft) {
                newBorderWidth = `${endY}px ${windowWidth - endX}px ${windowHeight - startY}px ${startX}px`
                cropWidth = endX - startX
                cropHeigth = startY - endY
                cropPositionTop = endY
            }

            if (isStartBottomRight) {
                newBorderWidth = `${endY}px ${windowWidth - startX}px ${windowHeight - startY}px ${endX}px`
                cropWidth = startX - endX
                cropHeigth = startY - endY
                cropPositionLeft = endX
                cropPositionTop = endY
            }
        }
        setcrossHairsTop(e.clientY)
        setcrossHairsLeft(e.clientX)
        setborderWidth(newBorderWidth)
        setcropWidth(cropWidth)
        setcropHeigth(cropHeigth)
        setcropPositionTop(cropPositionTop)
        setcropPositionLeft(cropPositionLeft)
    }

    const handleMouseDown = (e: any) => {
        const startX = e.clientX
        const startY = e.clientY

        // this.setState((prevState) => ({
        //     startX,
        //     startY,
        //     cropPositionTop: startY,
        //     cropPositionLeft: startX,
        //     isMouseDown: true,
        //     borderWidth: `${prevState.windowWidth}px ${prevState.windowHeight}px`
        // }))
        setstartX(startX)
        setstartY(startY)
        setcropPositionTop(startY)
        setcropPositionLeft(startX)
        setisMouseDown(true)
        setborderWidth(`${windowWidth}px ${windowHeight}px`)
    }

    const handleMouseUp = (e: any) => {
        handleClickTakeScreenShot()
        // this.setState({
        //     on: false,
        //     isMouseDown: false,
        //     borderWidth: 0
        // })
        setOn(false)
        setisMouseDown(false)
        setborderWidth(0)
    }

    const handleClickTakeScreenShot = () => {
        // const { cropPositionTop, cropPositionLeft, cropWidth, cropHeigth } = this.state
        const body: any = document.querySelector('body')

        html2canvas(body).then(canvas => {
            let croppedCanvas = document.createElement('canvas')
            let croppedCanvasContext = croppedCanvas.getContext('2d')

            croppedCanvas.width = cropWidth;
            croppedCanvas.height = cropHeigth;

            croppedCanvasContext?.drawImage(canvas, cropPositionLeft, cropPositionTop, cropWidth, cropHeigth, 0, 0, cropWidth, cropHeigth);

            this.props.onEndCapture(croppedCanvas.toDataURL())
        });
    }

    const renderChild = () => {
        // const { children } = this.props

        const props = {
            onStartCapture: handStartCapture()
        }

        if (typeof children === 'function') return children(props)
        return children
    }

    const render = () => {
        // const {
        //     on,
        //     crossHairsTop,
        //     crossHairsLeft,
        //     borderWidth,
        //     isMouseDown,
        //     imageURL
        // } = this.state

        if (!on) return renderChild()

        return (
            <div
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                {renderChild()}
                <div
                    className={`overlay ${isMouseDown && 'highlighting'}`}
                    style={{ borderWidth }}
                />
                <div
                    className="crosshairs"
                    style={{ left: crossHairsLeft + 'px', top: crossHairsTop + 'px' }}
                />
            </div>
        )
    }
}
