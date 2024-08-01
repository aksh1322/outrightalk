import { result } from "lodash";
import moment from "moment";
import { VISIBILITY_STATUS_TYPE, ROOM_TYPE, CHAT_DATE_TIME_FORMAT } from ".";
import { CMS_PAGE_TYPE } from "./site_statics";

export const generateDaysOption = (days: number) => {
  return new Array(days).fill(1).map((x, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));
};

export const createMarkup = (textString: string) => {
  return { __html: textString };
};

export const getChatTime = (postTime: any) => {
  var currentTime = moment();
  var postedTime = moment(postTime);
  // var postedTime = moment(postTime, 'DD-MMMM-YYYY hh:mm a').toDate();
  var timeDiff = currentTime.diff(postedTime, "minutes"); //minutes hours

  let result;
  switch (true) {
    case timeDiff <= 60 * 24:
      // result = moment(postTime, 'DD-MMMM-YYYY hh:mm a').format(CHAT_DATE_TIME_FORMAT.DISPLAY_DATE_WITH_TIME)  //12th July,2021 10:20PM
      result = moment(postTime).format(
        CHAT_DATE_TIME_FORMAT.DISPLAY_DATE_WITH_TIME
      ); //12th July,2021 10:20PM
      break;
    case timeDiff > 60 * 24:
      // result = moment(postTime, 'DD-MMMM-YYYY hh:mm a').format(CHAT_DATE_TIME_FORMAT.DISPLAY_DAY_TIME)  //monday 10:20PM
      result = moment(postTime).format(CHAT_DATE_TIME_FORMAT.DISPLAY_DAY_TIME); //monday 10:20PM
      break;
  }
  return result;
};

export const getChatTime_original = (postTime: any) => {
  var currentTime = moment();
  var postedTime = moment(postTime, "DD-MMMM-YYYY hh:mm a").toDate();
  var timeDiff = currentTime.diff(postedTime, "minutes"); //minutes hours

  let result;
  switch (true) {
    case timeDiff <= 60 * 24:
      result = moment(postTime, "DD-MMMM-YYYY hh:mm a").format(
        CHAT_DATE_TIME_FORMAT.DISPLAY_DATE_WITH_TIME
      ); //12th July,2021 10:20PM
      break;
    case timeDiff > 60 * 24:
      result = moment(postTime, "DD-MMMM-YYYY hh:mm a").format(
        CHAT_DATE_TIME_FORMAT.DISPLAY_DAY_TIME
      ); //monday 10:20PM
      break;
  }
  return result;
};

//Remove html element from string
export const stripHtml = (html: any) => {
  // Create a new div element
  var temporalDivElement = document.createElement("div");
  // Set the HTML content with the providen
  temporalDivElement.innerHTML = html;
  // Retrieve the text property of the element (cross-browser support)
  return temporalDivElement.textContent || temporalDivElement.innerText || "";
};

export const generateYearsOption = (
  numYears: number,
  ignoreLastYears: number
) => {
  return new Array(numYears).fill(1).map((y, i) => {
    let yt = moment()
      .subtract(i + ignoreLastYears, "year")
      .format("YYYY");
    return {
      value: parseInt(yt),
      label: yt,
    };
  });
};

// export const extractErrorMessage1 = (error: any, defaultMessage = 'Please try again') => {
//   if (typeof error === 'string') {
//     return error
//   } else {
//     if (error && error.data && error.data.errors && Object.keys(error.data.errors).length) {
//       return error.data.errors[Object.keys(error.data.errors)[0]];
//     } else if (error && error.data && error.data.msg) {
//       return error.data.msg
//     } else if (error && error.msg) {
//       return error.msg
//     } else {
//       return defaultMessage
//     }
//   }
// }

export const extractErrorMessage = (
  e: any,
  defaultMessage = "Please try again"
) => {
  if (e && e.data && e.data.length) {
    var err = e.data;
    var errArrays = Object.values(err[0].errors);
    var msg = "";
    errArrays.map((x) => {
      msg = msg + " " + x;
    });
    return msg;
  } else if (typeof e.data == "object") {
    var keys = Object.keys(e.data);
    var values = Object.values(e.data);
    var msg = "";
    if (values && values.length) {
      values.map((x: any, i: number) => {
        if (typeof x == "string") {
          msg = x;
          // return x;
        } else {
          let errorvalues = Object.values(x);
          if (errorvalues && errorvalues.length) {
            errorvalues.map((k: any, index: number) => {
              msg = msg + (index + 1) + " : " + k + "\n" + "\n";
            });
          }
        }
      });
      return msg;
    }
    return defaultMessage;
  } else if (typeof e === "string") {
    return e;
  } else {
    return defaultMessage;
  }
};

//Remove empty / undefined key from object/payload
export const removeEmptyObjectKey = (obj: any) => {
  Object.keys(obj).forEach(
    (k) => !obj[k] && obj[k] !== undefined && delete obj[k]
  );
  return obj;
};

// Get specific key Value from array of object
export const getValueFromArrayOfObject = (arr: any[], key: string) => {
  const resObject = arr.find((item) => item.key === key);
  if (resObject && Object.keys(resObject).length) {
    return resObject.value;
  } else {
    return null;
  }
};

export const generateLink = (link: string) => {
  return `${window.location.origin}${link}/`;
};

export const getRandomName = (prefix: string = "", suffix: string = "") => {
  let random = `${new Date().getTime()}_${Math.ceil(Math.random() * 1000)}`;
  return `${prefix}${random}${suffix}`;
};

export const extractHtmlString = (str: string) => {
  return str.replace(/<[^>]+>/g, "");
};

export const trimTo = (
  str: string,
  num: number,
  appendDots: boolean = false
) => {
  return str && str.length > num
    ? appendDots
      ? `${str.substr(0, num)}...`
      : str.substr(0, num)
    : str;
};

export const getYearString = (month: number) => {
  if (!month) {
    return "N/A";
  }
  let year = Math.floor(month / 12);
  let remMonth = month % 12;

  let str = "";
  if (year) {
    str += `${year} ${year > 1 ? "years" : "year"}`;
  }
  if (month) {
    if (str && str.length) {
      str += " and ";
    }
    str += `${remMonth} ${remMonth > 1 ? "months" : "month"}`;
  }
  return str;
};

export const getFileFromDataUrl = (dataUrl: string) => {
  if (!dataUrl) {
    return null;
  }
  let arr = dataUrl.split(",");
  let mime = null;
  if (arr && arr.length) {
    let parts = arr[0].match(/:(.*?);/);
    mime = parts && parts.length ? parts[1] : null;
  }
  if (!mime) {
    return null;
  }
  let bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], getRandomName("image", `.${mime.split("/")[1]}`), {
    type: mime,
  });
};

export const getVisibleData = (data: any[] | undefined, key: string) => {
  const result = data?.filter((x) => x.key == key);
  return result && result.length && result[0].value ? result[0].value : 0;
};

export const getNameInitials = (name: string | undefined | null) => {
  if (!name) {
    return "NA";
  }
  // return name.split(' ').map(x => x.charAt(0)).slice(0, 2).join('').toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export const getRoomcategoryInitials = (name: string | undefined | null) => {
  if (!name) {
    return "NA";
  }
  return name
    .split(" ")
    .map((x) => x.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const getBooleanStatus = (value: number | null | undefined) => {
  if (value == 0) {
    return false;
  } else if (value == 1) {
    return true;
  } else {
    return false;
  }
};

export const getDisableStatus = (value: number | null) => {
  if (value == 0) {
    return true;
  } else if (value == 1) {
    return false;
  } else {
    return true;
  }
};

export const getBooleanToValueStatus = (value: boolean | undefined) => {
  if (value == true) {
    return 1;
  } else {
    return 0;
  }
};

export const getStaticColor = (value: string) => {
  let result = "#ffffff";
  switch (value) {
    case "A":
    case "a":
      result = "#c80000";
      break;
    case "G":
    case "g":
      result = "#60ae60";
      break;
    case "R":
    case "r":
      result = "#cbc100";
      break;
    default:
      result = "#ffffff";
      break;
  }
  return result;
};

// program to convert first letter of a string to uppercase
export const capitalizeFirstLetter = (str: string) => {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
};

// Replace Comma(,) with space in the string value
export const replaceCommaSeparator = (str: string) => {
  const toReplace = str.trim().replace(",", " ");
  return toReplace;
};

// Get Singular plural string based on count, like : 1 => user, 2 => users
export const getSingularPluralString = (count: number, str: string) => {
  let result: string;
  if (count > 1) {
    result = count + " " + str + "s";
  } else if (count <= 1) {
    result = count + " " + str;
  } else {
    result = "0 " + str;
  }
  return result;
};

//1 => Available, 2 => Away, 3 => DND, 4 => Invisible
export const getStatusColor = (value: any) => {
  let result;
  switch (value) {
    case 1:
    case "1":
      result = "#00C800";
      break;
    case 2:
    case "2":
      result = "#f1b44c";
      break;
    case 3:
    case "3":
      result = "#ca2a2a";
      break;
    case 4:
    case "4":
      result = "#ccc";
      break;
    default:
      result = "#ffffff";
      break;
  }
  return result;
};

export const userIdentificationSymbol = (value: any) => {
  let image: string = "";
  switch (value) {
    case 1:
    case "1":
    case 2:
    case "2":
      image = "/img/hat-icon.png";
      break;
    case 3:
    case "3":
      image = "/img/crown-icon.png";
      break;
    default:
      break;
  }
  return image;
};

// Function for check isAdmin status based on 0 or 1
export const isAdmin = (value: any) => {
  let status: boolean = false;
  switch (value) {
    case 1:
    case "1":
      status = true;
      break;
    case 2:
    case "2":
      status = true;
      break;
    case 3:
    case "3":
      status = true;
      break;
    default:
      break;
  }
  return status;
};

export const getAvailabiltyStatusText = (value: any, forFav = false) => {
  let status: string = "--";
  switch (value) {
    case 1:
    case "1":
      status = VISIBILITY_STATUS_TYPE.AVAILABLE;
      break;
    case 2:
    case "2":
      status = VISIBILITY_STATUS_TYPE.AWAY;
      break;
    case 3:
    case "3":
      status = VISIBILITY_STATUS_TYPE.DND;
      break;
    case 4:
    case "4":
      status = forFav
        ? VISIBILITY_STATUS_TYPE.OFFLINE
        : VISIBILITY_STATUS_TYPE.INVISIBLE;
      break;
    case 0:
    case "0":
      status = VISIBILITY_STATUS_TYPE.OFFLINE;
      break;
    default:
      break;
  }
  return status;
};

// Function for sorting any array of object based on any object property
// Primer means => parseInt or parseFloat etc..
export const sort_by = (field: string, reverse: any, primer: any) => {
  const key = primer
    ? function (x: any) {
        return primer(x[field]);
      }
    : function (x: any) {
        return x[field];
      };

  reverse = !reverse ? 1 : -1;

  return function (a: any, b: any) {
    return (a = key(a)), (b = key(b)), reverse * (<any>(a > b) - <any>(b > a));
  };
};

// Function for show video option or not based on status
export const getRoomTypeValidation = (type: string) => {
  let status: boolean = false;
  switch (type) {
    case ROOM_TYPE.TEXT_AUDIO_VIDEO:
      status = true;
      break;
    case ROOM_TYPE.TEXT_VIDEO:
      status = true;
      break;
    case ROOM_TYPE.TEXT_AUDIO:
      status = false;
      break;
    case ROOM_TYPE.TEXT:
      status = false;
      break;
    default:
      break;
  }
  return status;
};

export const getRoomTypeValidationForTextOnly = (type: string) => {
  let status: boolean = false;
  switch (type) {
    case ROOM_TYPE.TEXT_AUDIO_VIDEO:
      status = true;
      break;
    case ROOM_TYPE.TEXT_AUDIO:
      status = true;
      break;
    case ROOM_TYPE.TEXT:
      status = false;
      break;
    default:
      break;
  }
  return status;
};

export const OpenTokErrorMessage = (error: {
  code: number;
  message: string;
  name: string;
}) => {
  let message: string = error.message;
  switch (error.code) {
    case 1004:
      message = `${error.name}: Authentication error`;
      break;
    case 1005:
      message = `${error.name}: Invalid Session ID`;
      break;
    case 1006:
      message = `${error.name}: Connect Failed`;
      break;
    case 1007:
      message = `${error.name}: Connect Rejected`;
      break;
    case 1008:
      message = `${error.name}: Connect Time-out`;
      break;
    case 1009:
      message = `${error.name}: Security Error`;
      break;
    case 1010:
      message = `${error.name}: Not Connected`;
      break;
    case 1011:
      message = `${error.name}: Invalid Parameter`;
      break;
    case 1013:
      message = `${error.name}: Connection Failed`;
      break;
    case 1014:
      message = `${error.name}: API Response Failure`;
      break;
    case 1026:
      message = `${error.name}: Terms of Service Violation: Export Compliance`;
      break;
    case 1500:
      message = `${error.name}: Unable to Publish`;
      break;
    case 1520:
      message = `${error.name}: Unable to Force Disconnect`;
      break;
    case 1530:
      message = `${error.name}: Unable to Force Unpublish`;
      break;
    case 1535:
      message = `${error.name}: Force Unpublish on Invalid Stream`;
      break;
    case 2000:
      message = `${error.name}: Internal Error`;
      break;
    case 2010:
      message = `${error.name}: Report Issue Failure`;
      break;
    default:
      break;
  }
  return message;
};

export const calculateMinTime = (date: any) => {
  let isToday = moment(date).isSame(moment(), "day");
  if (isToday) {
    let nowAddOneHour = moment(new Date()).add({ minutes: 5 }).toDate();
    return nowAddOneHour;
  }
  return moment().startOf("day").toDate();
};

export const getCmsTypebasedOnPage = (page: string) => {
  let type: number = 0;
  switch (page) {
    case CMS_PAGE_TYPE.DEFAULT:
      type = 0;
      break;
    case CMS_PAGE_TYPE.PM:
      type = 1;
      break;
    case CMS_PAGE_TYPE.GROUPS:
      type = 2;
      break;
    default:
      break;
  }
  return type;
};

//Generate typing string
// export const typingStringGenerate = (typing: any[]) => {
//   console.log(typing,"typing generate");
  
//   let text =
//     typing && typing.length ? typing?.map((x: any) => x.userInfo) : null;
//   const tempString = text
//     ? text.toString().trim().split(",").join(" & ")
//     : null;
//   return tempString;
// };

export const typingStringGenerate = (typing: any[]): string => {
  if (!Array.isArray(typing) || typing.length === 0) {
    return "";
  }
  const userInfoArray = typing.map((x: any) => x.userInfo);
  const tempString = userInfoArray.join(" & ").trim();

  return tempString;
};

//subscription model type generate
export const getSubscriptionType = (type: string) => {
  let result
  const PREDEFINE_TYPE_LIST = {
    WEEKLY:"weekly",
    MONTHLY: "monthly",
    QUARTERLY: "quaterly",
    HALF_YEARLY: "halfyearly",
    YEARLY: "yearly",
  };

  switch (type) {
    case PREDEFINE_TYPE_LIST.WEEKLY:
      result = "Weekly";
      break;
    case PREDEFINE_TYPE_LIST.MONTHLY:
      result = "Monthly";
      break;
    case PREDEFINE_TYPE_LIST.QUARTERLY:
      result = "Quaterly";
      break;
    case PREDEFINE_TYPE_LIST.HALF_YEARLY:
      result = "Half-Yearly";
      break;
    case PREDEFINE_TYPE_LIST.YEARLY:
      result = "Yearly";
      break;
    default:
      break;
  }
  return result;
};

export const getSubscriptionColor_original_backup = (data: any) => {
  let color: any = "#fff";
  if (data && data.subscription_info && data.subscription_info.plan_info) {
    color = data.subscription_info.plan_info.color_code;
  } else if (data && data.is_subscribed && data.is_subscribed.plan_info) {
    color = data.is_subscribed.plan_info.color_code;
  } else {
    color = "#fff";
  }
  return color;
};

export const getSubscriptionColor = (data: any) => {
  let color: any = "#fff";
  if (data && data.subscription_info && data.subscription_info.plan_info) {
    // color = data.subscription_info.plan_info.color_code
    if (
      data.subscription_info.additional_color_code &&
      data.subscription_info.additional_color_code != ""
    ) {
      color = data.subscription_info.additional_color_code;
    } else {
      color = data.subscription_info.plan_info.color_code;
    }
  } else if (data && data.is_subscribed && data.is_subscribed.plan_info) {
    if (
      data.is_subscribed.additional_color_code &&
      data.is_subscribed.additional_color_code != ""
    ) {
      color = data.is_subscribed.additional_color_code;
    } else {
      color = data.is_subscribed.plan_info.color_code;
    }
    // color = data.is_subscribed.plan_info.color_code
  } else {
    color = "#fff";
  }
  return color;
};
export const getSubscriptionColorInRoom = (senderId: string, data: any) => {
    let color = '#fff';
    if(data?.length){
      data.forEach((item: any) => {
        if (item.user_info && item?.user_info?.id == senderId && item.user_info.is_subscribed?.plan_info) {
          color = item.user_info.is_subscribed?.plan_info?.color_code;
        }
        if(item.details && item.details.id == senderId && item.details.is_subscribed?.plan_info){
          color = item.details.is_subscribed?.plan_info?.color_code;
        }
      });
    }
    return color
  // }
};
export const getRoomSubscriptionTitle = (data: any) => {
  let title: any = "--";
  if (data && data.subscription_info && data.subscription_info.plan_info) {
    title = data.subscription_info.plan_info.title;
  } else {
    title = "--";
  }
  return title;
};
export const getSubscriptionNewEndDate = (data: any) => {
  let date: any = "--";
  if (data && data.type) {
    switch (data.type) {
      case "monthly":
        date = moment().add(1, "M").format("DD-MMMM-YYYY");
        break;
      case "quaterly":
        date = moment().add(3, "M").format("DD-MMMM-YYYY");
        break;
      case "halfyearly":
        date = moment().add(6, "M").format("DD-MMMM-YYYY");
        break;
      case "yearly":
        date = moment().add(11, "M").format("DD-MMMM-YYYY");
        break;
      default:
    }
  } else {
    date = "--";
  }
  return date;
};

export const getNewSubscriptionPlanName = (data: any, selectedPlanId: any) => {
  let planName: any = "--";
  if (data && data.length) {
    var found = data.filter((x: any) => x.id == selectedPlanId);
    if (found && found.length) {
      planName = found[0].title;
    } else {
      planName = "--";
    }
  } else {
    planName = "--";
  }
  return planName;
};

//Storage limit is based on subscription, which comes from api
export const getVoiceVideoMessageStorageLimit = (
  featureArr: any[],
  type: string
) => {
  const STATIC_TYPE = {
    AUDIO: {
      key: "save_voice_mail",
      value: "audio",
    },
    VIDEO: {
      key: "save_video_msg",
      value: "video",
    },
  };
  let limitValue: number = 0;
  let found: any[] = [];

  if (type === STATIC_TYPE.AUDIO.value) {
    found = featureArr.filter((x: any) => x.type === STATIC_TYPE.AUDIO.key);
    if (found && found.length) {
      limitValue = found[0].value;
    }
  } else if (type === STATIC_TYPE.VIDEO.value) {
    found = featureArr.filter((x: any) => x.type === STATIC_TYPE.VIDEO.key);
    if (found && found.length) {
      limitValue = found[0].value;
    }
  } else {
    limitValue = 0;
  }
  return limitValue;
};

//Detact Webcam & access allow or not
export const detectVideoDevice = (callback: any) => {
  let md = navigator.mediaDevices;
  if (!md || !md.enumerateDevices) return callback(false);
  md.enumerateDevices().then((devices) => {
    callback(
      devices.some((device) => "videoinput" === device.kind && device.label)
    );
  });
};

//Detect Microphone & access allow or not
export const detectAudioDevice = (callback: any) => {
  let md = navigator.mediaDevices;
  if (!md || !md.enumerateDevices) return callback(false);
  md.enumerateDevices().then((devices) => {
    callback(
      devices.some((device) => "audioinput" === device.kind && device.label)
    );
  });
};
