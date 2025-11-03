import axios from "axios";

axios.defaults.baseURL = "https://apiucloud.bupt.edu.cn";

axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("Blade-Auth");
    if (token) {
      config.headers.set("Blade-Auth", token);
    }
    config.headers.set("Authorization", "Basic c3dvcmQ6c3dvcmRfc2VjcmV0");
    return config;
  },
  () => {}
);

export const getUserInfo = () => {
  return axios.get("/ykt-basics/info");
};

export const getStudentSiteList = (userId: string) => {
  return axios.get("/ykt-site/site/list/student/current", {
    params: {
      userId: userId,
      siteRoleCode: 2,
      current: 1,
      size: 9999,
    },
  });
};

export const getGoingSite = (siteIds: string[]) => {
  return axios.post(
    "/blade-chat/web/chat/myCourse",
    {},
    {
      params: {
        siteIds: siteIds.join(),
      },
    }
  );
};

export const getAttendanceEncryptionParam = () => {
  return axios.get("/ykt-site/common/v2/clock");
};

export const getCheckoutBasic = (siteId: string, groupId: string) => {
  return axios.post("/ykt-site/attendancebasicinfo/basic", {
    siteId: siteId,
    groupId: groupId
  });
};

export const sign = (
  attendanceId: string,
  siteId: string,
  userId: string,
  classLessonId: string,
  qrCodeCreateTime: string
) => {
  return axios.post("/ykt-site/attendancedetailinfo/sign", {
    attendanceDetailInfo: {
      attendanceId: attendanceId,
      siteId: siteId,
      userId: userId,
      classLessonId: classLessonId,
    },
    qrCodeCreateTime: qrCodeCreateTime,
  });
};

/**
 * ApifoxModel
 */
export interface UserInfo {
  account: string;
  avatar: string;
  birthday: string;
  code: string;
  createTime: string;
  deptId: string;
  deptName: string;
  email: string;
  id: string;
  joinTime: string;
  major: string;
  name: string;
  phone: string;
  postId: string;
  postName: string;
  professional: string;
  qq: string;
  realName: string;
  roleId: string;
  roleName: string;
  sex: number;
  sexName: string;
  status: number;
  tenantId: string;
  tenantName: string;
}

/**
 * Current
 */
export interface Site {
  baseCourseId: string;
  briefIntroduction: string;
  certificationType: string;
  cloneCode: string;
  courseCode: string;
  courseType: string;
  createTime: string;
  department: string;
  departmentId: string;
  departmentName: string;
  deptCode: string;
  domainId: string;
  domainName: string;
  grade: string;
  id: string;
  isApproval: number;
  isBenchmark: number;
  isDelete: number;
  isExcellent: boolean;
  isPublic: number;
  isStickTop: boolean;
  isSync: number;
  kclb: string;
  kcsx: string;
  picUrl: string;
  primaryTeacherIdList: string[];
  primaryTeachers: string;
  siteName: string;
  specialty: string;
  studentNo: number;
  teacherId: string;
  teachers: Teacher[];
  termId: string;
  termName: string;
  updateTime: string;
}

export interface GoingSite {
  siteId: string;
  groupId: string;
}

export interface Teacher {
  account?: string;
  avatar?: string;
  birthday?: string;
  code?: string;
  createTime?: string;
  deptId?: string;
  deptName?: string;
  email?: string;
  id?: string;
  joinTime?: string;
  major?: string;
  name?: string;
  phone?: string;
  postId?: string;
  postName?: string;
  professional?: string;
  qq?: string;
  realName?: string;
  roleId?: string;
  roleName?: string;
  sex?: number;
  sexName?: string;
  status?: number;
  tenantId?: string;
  tenantName?: string;
}
