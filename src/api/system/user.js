import request from '@/utils/axiosRequest'

export function getList(query) {
  const url = '/user/list'
  return request({
    url: url,
    method: 'get',
    params: query
  })
}

export function saveFormData(data) {
  const url = '/user/save'
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function deleteData(id) {
  const url = '/user/delete/' + id
  return request({
    url: url,
    method: 'get'
  })
}
