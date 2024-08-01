import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useCommonApi } from 'src/_common/hooks/actions/commonApiCall/appCommonApiCallHook';
import { toast } from 'react-toastify';
import { API_BASE_URL, LOGIN_STORAGE } from 'src/_config';

interface PointsToCashProps {
    onClose: (success: any) => void;
    // onCancel: (success: any) => void;
    shouldShow: boolean;
}

export default function PointsToCashModal({ onClose, shouldShow }: PointsToCashProps) {

    
    const commonApi = useCommonApi()
    const [badges, setBadges] = useState<any>([])
    const [points, setPoints] = useState<number>(0)
    const [walletBalance, setWalletBalance] = useState<number>(0)
    const [cash, setCash] = useState<number>(0)
    const [newCash, setNewCash] = useState<number>(0)
    const [redeemable, setRedeemable] = useState<number>(0)
  
    useEffect(() => {
        getWalletDetails()
    }, [])

    const getWalletDetails = () => {
        let params = {}
        commonApi.callGetWalletDetails(params, (message: string, resp: any) => {

            setPoints(resp.points.current_balance)
            setWalletBalance(resp.wallet_details.current_balance)

        }, (message: string) => {
            toast.error(message)
        })
    
    }

    const handlePointChnage = async(e:any) => {
        toast.dismiss()    
        setRedeemable(e.target.value)

        if(e.target.value < 10000){
            setCash(0)
            toast.dismiss()    
            toast.error('Points must be atleast 10000') 
        }
        else if(e.target.value > points){
            setCash(0)
            toast.dismiss()    
            toast.error('Please select points less than available') 
        }
        else{
            setCash(Number((e.target.value/1000).toFixed(2)))
        }
    }

    const handleProceed = (e:any) => {

        let params = {
            points:redeemable,
            cash:cash   
        }

        commonApi.callRedeemPoints(params, (message: string, resp: any) => {

            setRedeemable(0)
            setCash(0)
            getWalletDetails()
            toast.success(resp.message)
            
        }, (message: string) => {
            toast.error(message)
        })

    }

    const handleAmountChange = (e: any) => {

        if (+e.target.value > +walletBalance) {
            setNewCash(0)
            toast.error('Please select less than available') 
        }
        else{
            setNewCash(e.target.value)
        }
    }


    const handleWithdraw = async () => {
      try {
        const formData: FormData = new FormData();

        formData.append("amount", String(newCash));

        const url = API_BASE_URL + "wallet/withdraw-money";

        const token = JSON.parse(
          localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_TOKEN) as string
        );

        const resp = await fetch(url, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            authorization: `Bearer ${token}`,
          },
        });

        const data = await resp.json();
        toast.success(data?.message);
          getWalletDetails();
          setNewCash(0)
      } catch (error) {
        console.log(error);
      }
    };

    return (
      <React.Fragment>
        <Modal
          show={shouldShow}
          backdrop="static"
          onHide={() => onClose(false)}
          keyboard={false}
          className="theme-custom-modal"
          dialogClassName="modal-dialog-scrollable"
          size={"lg"}
          centered
          contentClassName="custom-modal"
        >
          <Modal.Header>
            <h2>Points to Cash</h2>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => onClose(true)}
            >
              <i className="modal-close" />
            </button>
          </Modal.Header>
          <Modal.Body
            bsPrefix={"upgrade-nickname-subscription"}
            className="modal-body pl-0 pr-0"
          >
            <div className="manage-video-message-panel">
              <div className="row">
                <div className="col-md-12">
                  <div className="inner_wrap">
                    <div className="d-flex justify-content-between">
                      <div className="total-points d-flex align-items-center">
                        <h3 className="mr-2">Total Points accumulated:</h3>
                        <span>{points}</span>
                      </div>
                      <div className="total-points d-flex align-items-center">
                        <h3 className="mr-2">My Wallet:</h3>
                        <span>{walletBalance} $</span>
                      </div>
                    </div>
                    <div className="total-points reedem">
                      <h3>Points you want to redeem:</h3>
                      <input
                        type="number"
                        className="form-control mt-2"
                        value={redeemable}
                        step={500}
                        min={0}
                        max={10000000}
                        onChange={(e) => handlePointChnage(e)}
                        id="exampleFormControlInput1"
                        placeholder="Enter Points"
                      ></input>
                    </div>
                    <div className="total-points d-flex align-items-center">
                      <h3 className="mr-2">Cash Redeemable:</h3>
                      <span>{cash} $</span>
                    </div>
                    <div className="d-flex">
                      <button
                        type="button"
                        className="reedem-btn btn btn-primary mt-3"
                        onClick={(e) => handleProceed(e)}
                      >
                        Proceed
                      </button>
                    </div>
                    <div className="payment-type">
                      <h4>Withdraw Wallet Money </h4>

                      <div className="d-flex justify-content-between">
                        <div className="d-flex align-items-center">
                          <div className="payment">
                            <svg
                              width="83"
                              height="22"
                              viewBox="0 0 83 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M31.0418 5.42065H26.4504C26.2984 5.42056 26.1514 5.47456 26.0358 5.57293C25.9202 5.6713 25.8437 5.80756 25.82 5.95717L23.9631 17.689C23.9545 17.7435 23.958 17.7991 23.9731 17.8521C23.9882 17.9051 24.0146 17.9542 24.0506 17.996C24.0866 18.0379 24.1313 18.0714 24.1815 18.0944C24.2318 18.1174 24.2864 18.1293 24.3417 18.1292H26.5337C26.6858 18.1293 26.8329 18.0752 26.9485 17.9767C27.0641 17.8782 27.1405 17.7417 27.1641 17.592L27.6649 14.4278C27.6884 14.2781 27.7648 14.1418 27.8802 14.0433C27.9957 13.9448 28.1426 13.8907 28.2946 13.8906H29.7481C32.7725 13.8906 34.518 12.4322 34.9739 9.54222C35.1793 8.27785 34.9826 7.28442 34.3884 6.58869C33.7359 5.82472 32.5785 5.42065 31.0418 5.42065V5.42065ZM31.5715 9.70545C31.3204 11.3471 30.0616 11.3471 28.8445 11.3471H28.1516L28.6377 8.2812C28.6519 8.1915 28.6978 8.10981 28.7671 8.05082C28.8364 7.99183 28.9245 7.95942 29.0156 7.95942H29.3332C30.1623 7.95942 30.9444 7.95942 31.3486 8.43038C31.5896 8.71135 31.6634 9.12879 31.5715 9.70545V9.70545ZM44.7661 9.6526H42.5675C42.4763 9.6526 42.3882 9.68501 42.3189 9.744C42.2496 9.80299 42.2037 9.88468 42.1895 9.97438L42.0922 10.5872L41.9384 10.3651C41.4624 9.67668 40.401 9.44655 39.3416 9.44655C36.912 9.44655 34.8369 11.2802 34.4328 13.8524C34.2226 15.1355 34.5214 16.3624 35.2518 17.2181C35.9218 18.0048 36.8805 18.3326 38.0211 18.3326C39.9788 18.3326 41.0643 17.0782 41.0643 17.0782L40.9663 17.687C40.9576 17.7414 40.9608 17.7971 40.9757 17.8502C40.9907 17.9032 41.017 17.9525 41.0528 17.9944C41.0887 18.0364 41.1333 18.0701 41.1835 18.0933C41.2336 18.1164 41.2883 18.1284 41.3436 18.1285H43.3241C43.4762 18.1286 43.6233 18.0745 43.7389 17.976C43.8545 17.8775 43.9309 17.7411 43.9545 17.5913L45.1428 10.0928C45.1515 10.0385 45.1483 9.98293 45.1334 9.92997C45.1185 9.87701 45.0922 9.82791 45.0564 9.78605C45.0206 9.7442 44.9761 9.71059 44.926 9.68755C44.8759 9.66451 44.8213 9.65258 44.7661 9.6526V9.6526ZM41.7014 13.9167C41.4893 15.1683 40.4923 16.0085 39.2208 16.0085C38.5824 16.0085 38.0721 15.8045 37.7445 15.4178C37.4196 15.0338 37.296 14.4873 37.3994 13.8785C37.5975 12.6376 38.6112 11.7699 39.8633 11.7699C40.4876 11.7699 40.9952 11.9766 41.3295 12.3666C41.6645 12.7607 41.7974 13.3106 41.7014 13.9167V13.9167ZM56.4758 9.6526H54.2664C54.1622 9.65276 54.0596 9.67826 53.9675 9.72687C53.8755 9.77548 53.7967 9.84574 53.738 9.93156L50.6908 14.4043L49.3991 10.1062C49.3595 9.97507 49.2785 9.86018 49.1682 9.77849C49.058 9.69681 48.9242 9.65267 48.7868 9.6526H46.6157C46.5547 9.65244 46.4947 9.66678 46.4404 9.69444C46.3861 9.7221 46.3393 9.76228 46.3038 9.81162C46.2682 9.86096 46.245 9.91805 46.2361 9.97812C46.2272 10.0382 46.2328 10.0995 46.2525 10.157L48.6861 17.2736L46.3982 20.492C46.3575 20.5491 46.3334 20.6162 46.3285 20.686C46.3235 20.7558 46.338 20.8256 46.3702 20.8878C46.4025 20.95 46.4512 21.0021 46.5112 21.0385C46.5712 21.0749 46.6401 21.0941 46.7104 21.0941H48.9171C49.0201 21.0942 49.1216 21.0695 49.213 21.0219C49.3043 20.9744 49.3827 20.9055 49.4414 20.8212L56.79 10.2513C56.8298 10.1941 56.8532 10.1272 56.8575 10.0577C56.8619 9.98824 56.8471 9.91891 56.8147 9.85722C56.7823 9.79554 56.7336 9.74386 56.6739 9.70779C56.6141 9.67172 56.5456 9.65263 56.4758 9.6526V9.6526Z"
                                fill="#253B80"
                              />
                              <path
                                d="M63.7904 5.42059H59.1984C59.0465 5.42065 58.8996 5.47473 58.7842 5.57308C58.6688 5.67143 58.5923 5.80761 58.5687 5.95711L56.7117 17.6889C56.7031 17.7433 56.7064 17.7988 56.7214 17.8518C56.7364 17.9048 56.7627 17.9539 56.7986 17.9957C56.8344 18.0375 56.879 18.0711 56.9291 18.0942C56.9792 18.1172 57.0338 18.1291 57.089 18.1291H59.4455C59.5518 18.129 59.6545 18.091 59.7353 18.0221C59.816 17.9532 59.8694 17.8578 59.8859 17.7532L60.4129 14.4277C60.4364 14.2781 60.5128 14.1417 60.6282 14.0432C60.7437 13.9447 60.8906 13.8906 61.0426 13.8905H62.4954C65.5205 13.8905 67.2653 12.4321 67.7218 9.54215C67.9279 8.27779 67.7299 7.28436 67.1357 6.58862C66.4839 5.82465 65.3271 5.42059 63.7904 5.42059V5.42059ZM64.3201 9.70538C64.0697 11.347 62.8109 11.347 61.5931 11.347H60.9009L61.3877 8.28113C61.4016 8.19143 61.4473 8.10967 61.5165 8.05065C61.5858 7.99163 61.6739 7.95924 61.765 7.95935H62.0825C62.911 7.95935 63.6937 7.95935 64.0979 8.43031C64.3389 8.71128 64.4121 9.12872 64.3201 9.70538V9.70538ZM77.5141 9.65253H75.3168C75.2257 9.65228 75.1375 9.68462 75.0682 9.74367C74.999 9.80271 74.9533 9.88455 74.9395 9.97431L74.8421 10.5871L74.6877 10.365C74.2118 9.67661 73.151 9.44649 72.0916 9.44649C69.662 9.44649 67.5876 11.2801 67.1834 13.8524C66.974 15.1355 67.2714 16.3624 68.0018 17.218C68.6731 18.0047 69.6305 18.3325 70.7711 18.3325C72.7287 18.3325 73.8143 17.0782 73.8143 17.0782L73.7163 17.6869C73.7075 17.7415 73.7108 17.7973 73.7258 17.8504C73.7408 17.9036 73.7672 17.9529 73.8032 17.9949C73.8393 18.0369 73.884 18.0705 73.9344 18.0936C73.9847 18.1167 74.0395 18.1286 74.0949 18.1285H76.0747C76.2267 18.1284 76.3737 18.0742 76.4891 17.9757C76.6046 17.8772 76.6809 17.7409 76.7045 17.5913L77.8934 10.0927C77.9019 10.0382 77.8983 9.98259 77.8832 9.92959C77.868 9.87659 77.8414 9.82749 77.8054 9.78567C77.7694 9.74385 77.7247 9.7103 77.6744 9.68731C77.6241 9.66433 77.5694 9.65247 77.5141 9.65253V9.65253ZM74.4494 13.9166C74.2386 15.1682 73.2403 16.0085 71.9688 16.0085C71.3317 16.0085 70.8201 15.8044 70.4925 15.4178C70.1676 15.0338 70.0454 14.4872 70.1474 13.8785C70.3468 12.6375 71.3592 11.7698 72.6113 11.7698C73.2356 11.7698 73.7432 11.9766 74.0775 12.3666C74.4138 12.7606 74.5468 13.3105 74.4494 13.9166V13.9166ZM80.1062 5.74237L78.2217 17.6889C78.2131 17.7433 78.2164 17.7988 78.2314 17.8518C78.2463 17.9048 78.2727 17.9539 78.3085 17.9957C78.3444 18.0375 78.3889 18.0711 78.4391 18.0942C78.4892 18.1172 78.5438 18.1291 78.599 18.1291H80.4936C80.8084 18.1291 81.0756 17.9017 81.1239 17.5919L82.9822 5.86078C82.9909 5.8064 82.9876 5.7508 82.9726 5.69781C82.9576 5.64482 82.9313 5.5957 82.8954 5.55381C82.8596 5.51192 82.8151 5.47826 82.7649 5.45515C82.7148 5.43204 82.6602 5.42002 82.6049 5.41992H80.4835C80.3924 5.42024 80.3044 5.45287 80.2353 5.51195C80.1661 5.57104 80.1204 5.65272 80.1062 5.74237V5.74237Z"
                                fill="#179BD7"
                              />
                              <path
                                d="M4.89618 20.4091L5.2473 18.1868L4.46518 18.1687H0.730469L3.3259 1.77011C3.33363 1.72 3.35916 1.67433 3.39786 1.64142C3.43655 1.60851 3.48583 1.59056 3.5367 1.59082H9.83394C11.9245 1.59082 13.3672 2.02432 14.1205 2.87994C14.4736 3.28133 14.6985 3.70078 14.8073 4.16237C14.9214 4.64671 14.9234 5.22537 14.812 5.93114L14.8039 5.98266V6.43488L15.1571 6.63424C15.4266 6.77033 15.669 6.95444 15.872 7.17745C16.1741 7.52063 16.3695 7.95681 16.4521 8.47392C16.5373 9.00576 16.5092 9.63861 16.3695 10.3551C16.2084 11.1793 15.9479 11.8971 15.5961 12.4844C15.2857 13.0106 14.8684 13.4663 14.3709 13.8224C13.9037 14.1529 13.3484 14.4037 12.7207 14.5643C12.1125 14.7222 11.419 14.8018 10.6584 14.8018H10.1683C9.81783 14.8018 9.47746 14.9275 9.21026 15.153C8.94344 15.3808 8.76644 15.6957 8.71078 16.0414L8.67385 16.2414L8.05353 20.1583L8.02533 20.3021C8.01795 20.3476 8.00519 20.3703 7.98639 20.3857C7.96818 20.4006 7.94547 20.4088 7.92194 20.4091H4.89618Z"
                                fill="#253B80"
                              />
                              <path
                                d="M15.491 6.03467C15.4722 6.15441 15.4508 6.27684 15.4266 6.4026C14.5961 10.6513 11.755 12.119 8.12636 12.119H6.27881C5.83505 12.119 5.46111 12.4401 5.39196 12.8763L4.44604 18.8543L4.17817 20.5488C4.1675 20.616 4.17157 20.6847 4.19011 20.7502C4.20865 20.8157 4.24121 20.8764 4.28555 20.9282C4.3299 20.9799 4.38497 21.0215 4.44698 21.05C4.50899 21.0785 4.57646 21.0933 4.64475 21.0933H7.9216C8.30964 21.0933 8.63927 20.8123 8.70036 20.431L8.73259 20.2651L9.34956 16.3637L9.38917 16.1496C9.44959 15.7669 9.77989 15.486 10.1679 15.486H10.658C13.8328 15.486 16.3181 14.2015 17.0445 10.4847C17.348 8.932 17.1909 7.63553 16.388 6.72371C16.1335 6.44165 15.8295 6.20815 15.491 6.03467V6.03467Z"
                                fill="#179BD7"
                              />
                              <path
                                d="M14.6225 5.6896C14.3573 5.61316 14.0875 5.5535 13.8148 5.51098C13.2759 5.42846 12.7313 5.38886 12.1861 5.39257H7.25038C7.06254 5.39243 6.88085 5.45925 6.73814 5.58096C6.59544 5.70267 6.50114 5.87124 6.47229 6.0562L5.4223 12.6831L5.39209 12.8764C5.4248 12.6655 5.5322 12.4731 5.69487 12.3342C5.85753 12.1953 6.06472 12.119 6.27894 12.1191H8.12649C11.7551 12.1191 14.5963 10.6507 15.4267 6.40273C15.4516 6.27696 15.4724 6.15454 15.4912 6.03479C15.272 5.92028 15.0437 5.82428 14.8084 5.7478C14.7467 5.72741 14.6847 5.70801 14.6225 5.6896V5.6896Z"
                                fill="#222D65"
                              />
                              <path
                                d="M6.47235 6.05621C6.50096 5.87121 6.59521 5.70256 6.73798 5.58091C6.88076 5.45926 7.06259 5.39268 7.25045 5.39326H12.1862C12.7709 5.39326 13.3168 5.43139 13.8149 5.51167C14.152 5.56446 14.4844 5.64341 14.8092 5.74782C15.0542 5.82876 15.2818 5.92443 15.4919 6.03481C15.739 4.46472 15.4899 3.39569 14.638 2.42768C13.6988 1.362 12.0036 0.905762 9.83447 0.905762H3.53722C3.09413 0.905762 2.71616 1.22687 2.64768 1.66371L0.0247193 18.2309C0.012502 18.3078 0.0171502 18.3865 0.0383443 18.4614C0.0595384 18.5364 0.0967754 18.6059 0.147494 18.6651C0.198212 18.7244 0.261208 18.772 0.332148 18.8047C0.403089 18.8373 0.48029 18.8543 0.558442 18.8544H4.44622L5.42236 12.6831L6.47235 6.05621Z"
                                fill="#253B80"
                              />
                            </svg>
                          </div>
                          <div className="select-amount">
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              value={newCash}
                              onChange={handleAmountChange}
                            >
                              <option selected value="0">
                                Select Amount
                              </option>
                              <option value="20">20$</option>
                              <option value="30">30$</option>
                              <option value="40">40$</option>
                              <option value="50">50$</option>
                              <option value="60">60$</option>
                              <option value="70">70$</option>
                              <option value="50">80$</option>
                              <option value="60">90$</option>
                              <option value="70">100$</option>
                            </select>
                          </div>
                          {/* withdraw btn */}
                          <button
                            type="button"
                            onClick={handleWithdraw}
                            className="ml-2 btn-primary"
                            style={{ height: "40px", width: "150px", borderRadius: "5px" }}
                            disabled={!(newCash > 0 && walletBalance > newCash)}
                          >
                            Withdraw
                          </button>
                          
                        </div>

                        <div className="bottm-bttns">
                          <button
                            type="button"
                            className="reedem-btn btn outlyn btn-primary mt-3 mr-2"
                            data-dismiss="modal"
                            aria-label="Close"
                            onClick={() => onClose(true)}
                          >
                            Upgrade
                          </button>
                          <button
                            type="button"
                            className="reedem-btn btn btn-primary mt-3"
                            data-dismiss="modal"
                            aria-label="Close"
                            onClick={() => onClose(true)}
                          >
                            Products
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="modal-footer">
            {/* <div className="d-flex justify-content-between">
                        <button type="button" className="btn theme-btn btn-danger waves-effect mr-2"
                            data-dismiss="modal" aria-label="Close"
                            onClick={() => onClose(true)}
                        >
                            Go Back
                        </button>
                    </div> */}
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );


}