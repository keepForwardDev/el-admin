import request from '@/utils/axiosRequest'

export function getList(query) {
  const url = '/resource/list'
  return request({
    url: url,
    method: 'get',
    params: query
  })
}

export function saveFormData(data) {
  const url = '/resource/save'
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function deleteData(id) {
  const url = '/resource/delete/' + id
  return request({
    url: url,
    method: 'get'
  })
}

export function menuResource(menuId) {
  let url = '/resource/menuResource/'
  if (menuId) {
    url += menuId
  }
  return request({
    url: url,
    method: 'get'
  })
}
