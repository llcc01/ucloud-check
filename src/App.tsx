import "./App.css";

import { Button, Input, Layout, List, Modal, Toast } from "@douyinfe/semi-ui";
import { useEffect, useRef, useState } from "react";
import {
  getAttendanceEncryptionParam,
  getCheckoutBasic,
  getGoingSite,
  getStudentSiteList,
  getUserInfo,
  sign,
  type GoingSite,
  type Site,
  type UserInfo,
} from "./req";
import { base64Decode } from "./utils";
import { CheckCode } from "./CheckCode";

function App() {
  const { Header, Footer, Content } = Layout;

  const [loginVisible, setLoginVisible] = useState(false);
  const [qrcodeVisible, setQrcodeVisible] = useState(false);

  const [inputToken, setInputToken] = useState("");
  const [inputSiteId, setInputSiteId] = useState("");
  const [genCheckworkId, setGenCheckworkId] = useState("");
  const [genClassLessonId, setGenClassLessonId] = useState("");

  const [info, setInfo] = useState<UserInfo>();
  const [tokenExp, setTokenExp] = useState(0);
  const [siteList, setSiteList] = useState<Site[]>([]);
  const [goingSiteList, setGoingSiteList] = useState<GoingSite[]>([]);
  const [goingSiteIdList, setGoingSiteIdList] = useState<number[]>([]);

  const commonStyle = {
    minHeight: 64,
    lineHeight: "64px",
    background: "var(--semi-color-fill-0)",
  };

  const checkToken = () => {
    getUserInfo()
      .then((r) => {
        setInfo(r.data.data);
        const token = sessionStorage.getItem("Blade-Auth");
        const data = token?.split(".")[1] ?? "";
        const decodedData = base64Decode(data);
        const jwtPayload = JSON.parse(decodedData);
        // console.log(jwtPayload);
        setTokenExp(jwtPayload.exp);
        Toast.info("设置成功");
        setLoginVisible(false);

        updateSiteList();
      })
      .catch((e) => {
        console.log(e.response.data);
        Toast.error(e.response.data.message);
      });
  };

  const updateSiteList = () => {
    if (!info) return;
    getStudentSiteList(info.id)
      .then((r) => {
        setSiteList(r.data.data.records);
      })
      .catch((e) => {
        console.log(e.response.data);
        Toast.error(e.response.data.message);
      });
  };

  useEffect(() => {
    updateSiteList();
  }, [info]);

  const updateGoingList = () => {
    if (!siteList || siteList.length <= 0) return;
    getGoingSite(
      siteList.map((t) => {
        return t.id;
      })
    )
      .then((r) => {
        setGoingSiteList(r.data.data);
        setGoingSiteIdList(r.data.data.map((t: Site) => t.id));
      })
      .catch((e) => {
        console.log(e.response.data);
        Toast.error(e.response.data.message);
      });
  };

  useEffect(() => {
    updateGoingList();
  }, [siteList]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      checkToken();
    }
    return () => {
      console.log("de");
    };
  }, []);

  const autoSign = (siteId: string) => {
    if (!info?.id) return;
    getCheckoutBasic(siteId)
      .then((r) => {
        const attendanceId = r.data.data.attendanceBasicInfo.id;
        if (attendanceId <= 0) {
          Toast.error("未找到签到ID");
          return;
        }
        const classLessonId = r.data.data.attendanceSiteClassList[0].id;
        if (!classLessonId) {
          Toast.error("未找到课堂ID");
          return;
        }
        getAttendanceEncryptionParam().then((r) => {
          const clockV2 = r.data.data.data;
          sign(attendanceId, siteId, info.id, classLessonId, clockV2).then(
            () => {
              Toast.success("签到成功");
            }
          );
        });
      })
      .catch((e) => {
        console.log(e.response.data);
        Toast.error(e.response.data.message);
      });
  };

  return (
    <Layout>
      <Header style={commonStyle}>
        <div className="flex items-center">
          <Button
            className="m-2"
            onClick={() => {
              setLoginVisible(true);
            }}
          >
            设置令牌
          </Button>
          {info && <div>当前用户：{info.account}</div>}
          {tokenExp > 0 && (
            <div className="ml-2">
              令牌至：{new Date(tokenExp * 1000).toLocaleString()}
            </div>
          )}
          {info && (
            <Button
              className="m-2"
              onClick={() => {
                setQrcodeVisible(true);
              }}
            >
              生成码
            </Button>
          )}
        </div>
      </Header>
      <Content style={{ lineHeight: "300px" }}>
        <Modal
          title="设置令牌"
          visible={loginVisible}
          onOk={() => {
            // console.log(inputToken);
            sessionStorage.setItem("Blade-Auth", inputToken);
            checkToken();
          }}
          onCancel={() => {
            setLoginVisible(false);
          }}
          closeOnEsc={true}
        >
          请填写 Blade-Auth
          <Input
            className="mt-2"
            onChange={(v) => {
              setInputToken(v);
            }}
          ></Input>
        </Modal>

        <Modal
          title="生成"
          visible={qrcodeVisible}
          onOk={() => {
            setQrcodeVisible(false);
          }}
          onCancel={() => {
            setQrcodeVisible(false);
          }}
          footer={<></>}
          closeOnEsc={true}
        >
          <div className="m-2">请输入 SiteId</div>
          <Input
            className="m-2"
            placeholder="SiteId"
            defaultValue={inputSiteId}
            onChange={(v) => {
              setInputSiteId(v);
            }}
          ></Input>
          <Button
            className="m-2"
            onClick={() => {
              if (!inputSiteId) {
                Toast.error("SiteId 无效");
                return;
              }
              Toast.info("正在获取签到信息");
              getCheckoutBasic(inputSiteId)
                .then((r) => {
                  const classLessonId =
                    r.data.data.attendanceSiteClassList?.[0]?.id;
                  if (!classLessonId) {
                    Toast.error("未找到课堂ID");
                    return;
                  }
                  setGenClassLessonId(classLessonId);

                  const attendanceId = r.data.data.attendanceBasicInfo.id;
                  if (attendanceId <= 0) {
                    Toast.error("未找到签到ID");
                    setGenCheckworkId("");
                    return;
                  }
                  setGenCheckworkId(attendanceId);
                  Toast.info("获取成功");
                })
                .catch((e) => {
                  console.log(e.response.data);
                  Toast.error(e.response.data.message);
                });
            }}
          >
            生成
          </Button>
          {genCheckworkId && genClassLessonId && (
            <div className="m-2">
              <CheckCode
                checkworkId={genCheckworkId}
                siteId={inputSiteId}
                classLessonId={genClassLessonId}
              />
            </div>
          )}
        </Modal>

        <List
          dataSource={siteList}
          renderItem={(item) => (
            <List.Item
              main={
                <div>
                  <span
                    style={{
                      color: "var(--semi-color-text-0)",
                      fontWeight: 500,
                    }}
                  >
                    {item.siteName}
                  </span>
                </div>
              }
              extra={
                <Button
                  disabled={!(item.id in goingSiteIdList)}
                  onClick={() => {
                    const goingSite = goingSiteList.find((v) => {
                      if (v.siteId == item.id) {
                        return v;
                      }
                    });
                    if (!goingSite) {
                      Toast.error("未找到有效信息");
                      return;
                    }
                    autoSign(goingSite.siteId);
                  }}
                >
                  签到
                </Button>
              }
            />
          )}
        />
      </Content>
      <Footer style={commonStyle}>Footer</Footer>
    </Layout>
  );
}

export default App;
