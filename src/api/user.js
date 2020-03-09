import request from '@/utils/request'

export function login(data) {
  /*var a = request({
    url: '/vue-element-admin/user/login',
    method: 'post',
    data
  })*/
  var result = {
    code: 20000,
    data: 'token'
  }
  return new Promise(resolve => {
    resolve(result)
  })
}

export function getInfo(token) {
  /*return request({
    url: '/vue-element-admin/user/info',
    method: 'get',
    params: { token }
  })*/
  var result = {
    data: {
      roles: ['admin'],
      introduction: 'I am a super administrator',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      name: 'Super Admin'
    }
  }
  return new Promise(resolve => {
    resolve(result)
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}
