import request from '@/utils/axiosRequest'

export function getList(query) {
  const url = '/department/list'
  return request({
    url: url,
    method: 'get',
    params: query
  })
}

export function saveFormData(data) {
  const url = '/department/save'
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function deleteData(data) {
  const url = '/department/delete'
  return request({
    url: url,
    method: 'post',
    data
  })
}

export function treeList() {
  const url = '/department/tree'
  return request({
    url: url,
    method: 'get'
  })
}

export function departmentInfo(id) {
  const url = '/department/info/' + id
  return request({
    url: url,
    method: 'get'
  })
}
