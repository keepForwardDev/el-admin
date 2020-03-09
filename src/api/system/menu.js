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

export function saveMenu(data) {
  const url = '/menu/save'
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function menuTree(parentId) {
  let url = '/menu/treeList'
  if (parentId) {
    url += '?parentId=' + parentId
  }
  return request({
    url: url,
    method: 'get'
  })
}

export function deleteById(ids) {
  const url = '/menu/delete/' + ids
  return request({
    url: url,
    method: 'get'
  })
}

export function menuInfo(id) {
  const url = '/menu/info/' + id
  return request({
    url: url,
    method: 'get'
  })
}
