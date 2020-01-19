import request from '@/utils/axiosRequest'

export function menuList(query) {
  const url = '/menu/list'
  return request({
    url: url,
    method: 'get',
    params: query
  })
}
export function childMenuList(parentId) {
  const url = '/menu/childMenu/' + parentId
  return request({
    url: url,
    method: 'get'
  })
}

export function saveMenu(params) {
  const url = '/menu/save'
  return request({
    url: url,
    method: 'post',
    params
  })
}
