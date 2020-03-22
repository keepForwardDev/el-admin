import request from '@/utils/axiosRequest'

export function getList(query) {
  const url = '/role/list'
  return request({
    url: url,
    method: 'get',
    params: query
  })
}

export function saveFormData(data) {
  const url = '/role/save'
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function deleteRole(id) {
  const url = '/role/delete/' + id
  return request({
    url: url,
    method: 'get'
  })
}

export function roleLabelNodes() {
  const url = '/role/labelNodes/'
  return request({
    url: url,
    method: 'get'
  })
}
