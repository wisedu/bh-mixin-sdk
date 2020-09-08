export const getType = (o) => {
  const type = Object.prototype.toString
    .call(o)
    .toLocaleLowerCase()
    .replace("[object ", "")
    .replace("]", "");
  if (type === "object" && o && o.hasOwnProperty("length")) {
    return "array";
  }
  return type;
};

export const isIphone = () => {
  return /iphone/.test(navigator.userAgent.toLowerCase());
};

// 曹建军提供，用与易班定位pai坐标转换
export const convertCoords = (coords) => {
  try {
    const X_PI = (Math.PI * 3000.0) / 180.0;
    const x = coords.longitude;
    const y = coords.latitude;
    const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
    const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
    const bd_lng = z * Math.cos(theta) + 0.0065;
    const bd_lat = z * Math.sin(theta) + 0.006;
    return { longitude: bd_lng, latitude: bd_lat };
  } catch (error) {
    console.log("convert coordinates error:" + error);
    return coords;
  }
};
