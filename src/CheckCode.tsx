import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getAttendanceEncryptionParam } from "./req";
import { Progress } from "@douyinfe/semi-ui";

export const CheckCode = (props: {
  checkworkId: string;
  siteId: string;
  classLessonId: string;
}) => {
  const [genClockV2, setGenClockV2] = useState("");

  const updateGenClockV2 = () => {
    getAttendanceEncryptionParam().then((r) => {
      const clockV2 = r.data.data.data;
      setGenClockV2(clockV2);
    });
  };

  const countDownMax = 5;
  const [countDown, setCountDown] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (props.checkworkId && props.siteId && props.classLessonId) {
        setCountDown((prevCount) => {
          if (prevCount <= 0) {
            updateGenClockV2();
            return countDownMax;
          }
          return prevCount - 1;
        });
      }
    }, 1000);
    console.log("setInterval");
    return () => {
      console.log("clearInterval");
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <div className="m-2">
        <QRCodeSVG
          value={`checkwork|id=${props.checkworkId}&siteId=${props.siteId}&createTime=${genClockV2}&classLessonId=${props.classLessonId}`}
          // size={200}
          fgColor="#000000"
          style={{ margin: "auto" }}
        />
      </div>
      <Progress
        percent={(countDown * 100) / countDownMax}
        aria-label="progress"
      />
    </>
  );
};
