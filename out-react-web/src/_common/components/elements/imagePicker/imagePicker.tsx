import React, { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg, getRandomName, getRotatedImage, PROFILE_IMAGE_ASPECT_RATIO } from '../../../../_config'
import { getOrientation } from 'get-orientation/browser'
import SliderInput from '../../form-elements/sliderInput/SliderInput'
import { Modal } from 'react-bootstrap'

import './imagePicker.css'

const ORIENTATION_TO_ANGLE: any = {
  '3': 180,
  '6': 90,
  '8': -90,
}
const defaultCropValue = { x: 0, y: 0 }

interface ImagePickerProps {
  onUploadImage: (...args: any) => void;
  fieldName?: string;
  shape: 'rect' | 'round';
  disabled?:boolean;
}

function ImagePicker({
  onUploadImage,
  fieldName,
  shape,
  disabled
}: ImagePickerProps) {
  /**
   * const
   */
  const inputElemRef = useRef<any>(null)
  const [imageSrc, setImageSrc] = useState<any>(null)
  const [crop, setCrop] = useState(defaultCropValue)
  const [shouldShowCropper, setShouldShowCropper] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  /**
   * effects
   */
  useEffect(() => {
    if (selectedFile) {
      fileChanged()
    }
  }, [selectedFile])
  /**
   * functions
   */
  const closeCropperModal = () => {
    setShouldShowCropper(false)
    setSelectedFile(null)
    inputElemRef.current.value = ''
  }
  const onFileSelected = (evt: any) => {
    if (evt.target.files && evt.target.files.length) {
      setSelectedFile(evt.target.files[0])
    }
  }
  const fileChanged = async () => {
    if (!selectedFile) {
      return
    }
    let imageDataUrl = await readFile(selectedFile)
    const orientation = await getOrientation(selectedFile)
    const rotation = ORIENTATION_TO_ANGLE[orientation]
    if (rotation) {
      imageDataUrl = await getRotatedImage(imageDataUrl, rotation)
    }

    setImageSrc(imageDataUrl)
    setShouldShowCropper(true)
  }
  const readFile = (file: any) => {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.addEventListener('load', () => resolve(reader.result), false)
      reader.readAsDataURL(file)
    })
  }
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])
  const uploadImage = async () => {
    const croppedImage: any = await getCroppedImg(
      imageSrc,
      croppedAreaPixels,
      rotation
    )
    let fd = new FormData();
    fd.append(fieldName || 'avatar', croppedImage.file, getRandomName('image_', '.jpg'))
    onUploadImage(fd, () => {
      closeCropperModal()
    }, () => {
      closeCropperModal()
    })
  }
  /**
   * render functions
   */
  return (
    <React.Fragment>
      {/* <input type="file" accept="image/*" ref={inputElemRef} className="text-center center-block file-upload" onChange={onFileSelected} /> */}
      <div className={disabled?"input_f marg disabled-link":" input_f marg"} >
      <span >Upload Photo</span>
      <input type="file" accept="image/*" ref={inputElemRef} className="text-center center-block file-upload" disabled={disabled} onChange={onFileSelected} />
      </div>
      <Modal
        show={shouldShowCropper}
        backdrop="static"
        keyboard={false}
        className="ne-modal-wrapper"
      >
        <Modal.Header>
          <h5 className="modal-title">
            Crop Image
          </h5>
          <button type="button" className="close" onClick={closeCropperModal}>
            <img src="/images/close-btn-icon.png" alt="" />
          </button>
        </Modal.Header>
        <Modal.Body>
          <div className="image-upload-modal-body">
            <div className="profile-image-modal-crop-area">
              <Cropper
                image={imageSrc}
                crop={crop}
                cropShape={shape}
                rotation={rotation}
                zoom={zoom}
                aspect={PROFILE_IMAGE_ASPECT_RATIO}
                onCropChange={setCrop}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="profile-image-modal-slider-container">
              <div className="profile-image-modal-slider">
                <SliderInput value={rotation} step={10} min={0} max={360} onChange={(val: any) => setRotation(val)} />
                <p>Rotate</p>
              </div>
              <div className="profile-image-modal-slider">
                <SliderInput value={zoom} step={0.1} min={1} max={5} onChange={(val: any) => setZoom(val)} />
                <p>Zoom</p>
              </div>
            </div>
            <div className="profile-image-modal-bottom-actions">
              <button onClick={closeCropperModal} className="btn theme-btn btn-danger waves-effect">Cancel</button>
              <button onClick={uploadImage} className="btn theme-btn btn-primary waves-effect waves-light">Crop &amp; Upload</button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  )
}

export default ImagePicker
