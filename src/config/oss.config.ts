const productConfig = {
  accessKeyId: 'LTAI5t73VBMgvZ93w2XYJmoL',
  accessKeySecret: 'N7pb3sGWANxN0mSD0ceQATfp21S4Vz',
  /**域名*/
  endpoint: 'oss-cn-beijing.aliyuncs.com',
  /***Bucket名称*/
  bucket: 'admin2',
  /**填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。*/
  region: 'oss-cn-beijing',
  accountId: '1363839880516693', // 添加账户 ID
  roleName: 'ram-oss',   // 添加角色名称
};

const localConfig = {
  accessKeyId: 'LTAI5t73VBMgvZ93w2XYJmoL',
  accessKeySecret: 'N7pb3sGWANxN0mSD0ceQATfp21S4Vz',
  /**域名*/
  endpoint: 'oss-cn-beijing.aliyuncs.com',
  /***Bucket名称*/
  bucket: 'admin2',
  /**填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。*/
  region: 'oss-cn-beijing',
  accountId: '1363839880516693', // 添加账户 ID
  roleName: 'ram-oss',   // 添加角色名称
};

// 本地运行是没有 process.env.NODE_ENV 的，借此来区分[开发环境]和[生产环境]
const ossConfig = process.env.NODE_ENV ? productConfig : localConfig;

export default ossConfig;